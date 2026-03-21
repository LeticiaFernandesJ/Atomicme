import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";
import type { Badge } from "@prisma/client";

// ── Fetch ALL badge data in exactly 2 DB queries ──────────────────
async function fetchBadgeData(userId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const start14 = new Date(today); start14.setDate(today.getDate() - 13);

  const [allBadges, user] = await Promise.all([
    prisma.badge.findMany(),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        badges: { include: { badge: { select: { slug: true, id: true } } } },
        habits: {
          where: { active: true },
          select: {
            id: true,
            streak: true,
            logs: {
              orderBy: { date: "asc" },
              select: { date: true, done: true, habitId: true },
            },
          },
        },
        identities: { select: { id: true } },
        stacks: {
          include: {
            items: {
              select: {
                habitId: true,
                habit: {
                  select: {
                    logs: {
                      where: { date: { gte: start14 }, done: true },
                      select: { date: true, habitId: true },
                    },
                  },
                },
              },
            },
          },
        },
        emotionalLogs:      { orderBy: { date: "asc" }, select: { date: true } },
        thoughtRecords:     { where: { completed: true }, select: { id: true } },
        emotionalSchemas:   { select: { id: true } },
        habitEmotionLinks:  { select: { id: true } },
      },
    }),
  ]);

  return { allBadges, user, today, tomorrow, start14 };
}

// ── All metrics computed in JS — zero extra DB queries ────────────
function deriveMetrics(
  user: NonNullable<Awaited<ReturnType<typeof fetchBadgeData>>["user"]>,
  today: Date,
  tomorrow: Date,
) {
  const activeHabits = user.habits;
  const maxStreak = activeHabits.length > 0 ? Math.max(...activeHabits.map((h) => h.streak)) : 0;

  // All habits done today
  const todayMs    = today.getTime();
  const tomorrowMs = tomorrow.getTime();
  const allDoneToday =
    activeHabits.length > 0 &&
    activeHabits.every((h) =>
      h.logs.some((l) => {
        const t = new Date(l.date).getTime();
        return l.done && t >= todayMs && t < tomorrowMs;
      }),
    );

  // Stack 14-day consistency
  const start14 = new Date(today); start14.setDate(today.getDate() - 13);
  let stackConsistency = 0;
  for (const stack of user.stacks) {
    if (stack.items.length === 0) continue;
    const habitIds = new Set(stack.items.map((i) => i.habitId));
    const allLogs = stack.items.flatMap((item) =>
      item.habit.logs.map((l) => ({ date: l.date, habitId: item.habitId })),
    );
    let complete = 0;
    for (let d = 0; d < 14; d++) {
      const day     = new Date(start14); day.setDate(start14.getDate() + d);
      const nextDay = new Date(day);     nextDay.setDate(day.getDate() + 1);
      const dMs = day.getTime(), nMs = nextDay.getTime();
      const dayLogs = allLogs.filter((l) => {
        const t = new Date(l.date).getTime();
        return t >= dMs && t < nMs;
      });
      if (new Set(dayLogs.map((l) => l.habitId)).size === habitIds.size) complete++;
    }
    stackConsistency = Math.max(stackConsistency, complete);
  }

  // Recoveries: missed one day, done the next
  let recoveries = 0;
  for (const habit of activeHabits) {
    for (let i = 1; i < habit.logs.length; i++) {
      const prev = new Date(habit.logs[i - 1].date); prev.setHours(0, 0, 0, 0);
      const curr = new Date(habit.logs[i].date);     curr.setHours(0, 0, 0, 0);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (!habit.logs[i - 1].done && habit.logs[i].done && diff === 1) recoveries++;
    }
  }

  // Check-in streak
  let checkinStreak = 0;
  if (user.emotionalLogs.length > 0) {
    const days = Array.from(
      new Set(user.emotionalLogs.map((l) => {
        const d = new Date(l.date); d.setHours(0, 0, 0, 0); return d.toISOString();
      })),
    ).sort();
    let streak = 1, maxS = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round(
        (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000,
      );
      streak = diff === 1 ? streak + 1 : 1;
      maxS = Math.max(maxS, streak);
    }
    checkinStreak = maxS;
  }

  return {
    activeHabits,
    maxStreak,
    allDoneToday,
    stackConsistency,
    recoveries,
    checkinStreak,
    thoughtCount: user.thoughtRecords.length,
    schemaCount:  user.emotionalSchemas.length,
    linkCount:    user.habitEmotionLinks.length,
  };
}

// ── Award badges ──────────────────────────────────────────────────
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const { allBadges, user, today, tomorrow } = await fetchBadgeData(userId);
  if (!user) return [];

  const metrics = deriveMetrics(user, today, tomorrow);
  const {
    activeHabits, maxStreak, allDoneToday, stackConsistency,
    recoveries, checkinStreak, thoughtCount, schemaCount, linkCount,
  } = metrics;

  const newBadges: Badge[] = [];
  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug));

  async function award(slug: string) {
    if (earnedSlugs.has(slug)) return;
    const badge = allBadges.find((b) => b.slug === slug);
    if (!badge) return;
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    await addXpToUser(userId, XP_RULES.BADGE_UNLOCKED);
    newBadges.push(badge);
    earnedSlugs.add(slug);
  }

  // Build list of slugs to award, then run sequentially
  const toAward: string[] = [];

  for (const { slug, days } of [
    { slug: "3-days",   days: 3   },
    { slug: "7-days",   days: 7   },
    { slug: "21-days",  days: 21  },
    { slug: "30-days",  days: 30  },
    { slug: "66-days",  days: 66  },
    { slug: "100-days", days: 100 },
  ]) {
    if (maxStreak >= days) toAward.push(slug);
  }

  if (activeHabits.length >= 1) toAward.push("first-habit");
  if (activeHabits.length >= 3) toAward.push("3-habits");
  if (activeHabits.length >= 5) toAward.push("5-habits");
  if (allDoneToday)              toAward.push("all-done");

  if (user.identities.length >= 4) toAward.push("multi-identity");

  if (user.level >= 5)  toAward.push("level-5");
  if (user.level >= 10) toAward.push("level-10");
  if (user.xp   >= 500)  toAward.push("xp-500");
  if (user.xp   >= 1000) toAward.push("xp-1000");

  if (user.stacks.length >= 1)                         toAward.push("first-stack");
  if (user.stacks.some((s) => s.items.length >= 5))    toAward.push("stack-5");
  if (stackConsistency >= 14)                          toAward.push("full-stack");

  if (recoveries >= 5)                  toAward.push("no-miss-twice");
  if (user.emotionalLogs.length >= 1)   toAward.push("first-checkin");
  if (checkinStreak >= 7)               toAward.push("7-checkins");
  if (schemaCount >= 1)                 toAward.push("first-schema");
  if (thoughtCount >= 5)                toAward.push("5-thoughts");
  if (linkCount >= 3)                   toAward.push("emotion-habit");

  for (const slug of toAward) await award(slug);

  return newBadges;
}

// ── Get progress for every badge ──────────────────────────────────
export async function getBadgeProgress(
  userId: string,
): Promise<{ badge: Badge; progress: number; total: number; earned: boolean; label: string }[]> {
  const { allBadges, user, today, tomorrow } = await fetchBadgeData(userId);
  if (!user) return [];

  const metrics = deriveMetrics(user, today, tomorrow);
  const { activeHabits, maxStreak, stackConsistency, recoveries, checkinStreak, thoughtCount, schemaCount, linkCount } = metrics;

  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug));

  function get(slug: string): { progress: number; total: number; label: string } {
    const earned = earnedSlugs.has(slug);

    // Streak
    const streakMap: Record<string, number> = {
      "3-days": 3, "7-days": 7, "21-days": 21, "30-days": 30,
      "66-days": 66, "100-days": 100, "early-bird": 30, "reader": 20,
    };
    if (slug in streakMap) {
      const total    = streakMap[slug];
      const progress = earned ? total : Math.min(maxStreak, total);
      return { progress, total, label: earned ? "Conquistado" : `${progress}/${total} dias` };
    }

    // Habits
    if (slug === "first-habit") {
      const progress = Math.min(activeHabits.length, 1);
      return { progress, total: 1, label: earned ? "Conquistado" : `${activeHabits.length}/1 hábito` };
    }
    if (slug === "3-habits") {
      const progress = Math.min(activeHabits.length, 3);
      return { progress, total: 3, label: earned ? "Conquistado" : `${activeHabits.length}/3 hábitos` };
    }
    if (slug === "5-habits") {
      const progress = Math.min(activeHabits.length, 5);
      return { progress, total: 5, label: earned ? "Conquistado" : `${activeHabits.length}/5 hábitos` };
    }
    if (slug === "all-done") {
      return { progress: earned ? 1 : 0, total: 1, label: earned ? "Conquistado" : "Complete todos hoje" };
    }

    // Identity
    if (slug === "multi-identity") {
      const progress = Math.min(user.identities.length, 4);
      return { progress, total: 4, label: earned ? "Conquistado" : `${user.identities.length}/4 identidades` };
    }

    // Level
    if (slug === "level-5") {
      const progress = Math.min(user.level, 5);
      return { progress, total: 5, label: earned ? "Conquistado" : `Nível ${user.level}/5` };
    }
    if (slug === "level-10") {
      const progress = Math.min(user.level, 10);
      return { progress, total: 10, label: earned ? "Conquistado" : `Nível ${user.level}/10` };
    }

    // XP
    if (slug === "xp-500") {
      const progress = Math.min(user.xp, 500);
      return { progress, total: 500, label: earned ? "Conquistado" : `${user.xp}/500 XP` };
    }
    if (slug === "xp-1000") {
      const progress = Math.min(user.xp, 1000);
      return { progress, total: 1000, label: earned ? "Conquistado" : `${user.xp}/1000 XP` };
    }

    // Stacks
    if (slug === "first-stack") {
      const progress = Math.min(user.stacks.length, 1);
      return { progress, total: 1, label: earned ? "Conquistado" : `${user.stacks.length}/1 corrente` };
    }
    if (slug === "stack-5") {
      const max      = user.stacks.length > 0 ? Math.max(...user.stacks.map((s) => s.items.length)) : 0;
      const progress = Math.min(max, 5);
      return { progress, total: 5, label: earned ? "Conquistado" : `${max}/5 hábitos na corrente` };
    }
    if (slug === "full-stack") {
      const progress = Math.min(stackConsistency, 14);
      return { progress, total: 14, label: earned ? "Conquistado" : `${stackConsistency}/14 dias completos` };
    }

    // Recovery
    if (slug === "no-miss-twice") {
      const progress = Math.min(recoveries, 5);
      return { progress, total: 5, label: earned ? "Conquistado" : `${recoveries}/5 recuperações` };
    }

    // Emotional
    if (slug === "first-checkin") {
      const progress = Math.min(user.emotionalLogs.length, 1);
      return { progress, total: 1, label: earned ? "Conquistado" : "Faça um check-in" };
    }
    if (slug === "7-checkins") {
      const progress = Math.min(checkinStreak, 7);
      return { progress, total: 7, label: earned ? "Conquistado" : `${checkinStreak}/7 dias consecutivos` };
    }
    if (slug === "first-schema") {
      const progress = Math.min(schemaCount, 1);
      return { progress, total: 1, label: earned ? "Conquistado" : "Complete o quiz" };
    }
    if (slug === "5-thoughts") {
      const progress = Math.min(thoughtCount, 5);
      return { progress, total: 5, label: earned ? "Conquistado" : `${thoughtCount}/5 registros` };
    }
    if (slug === "10-strategies") {
      return { progress: 0, total: 10, label: "Em breve" };
    }
    if (slug === "emotion-habit") {
      const progress = Math.min(linkCount, 3);
      return { progress, total: 3, label: earned ? "Conquistado" : `${linkCount}/3 hábitos vinculados` };
    }

    return { progress: earned ? 1 : 0, total: 1, label: earned ? "Conquistado" : "Em progresso" };
  }

  return allBadges.map((badge) => {
    const earned = earnedSlugs.has(badge.slug);
    const { progress, total, label } = get(badge.slug);
    return { badge, progress, total, earned, label };
  });
}

import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";
import type { Badge } from "@prisma/client";

// ── Award badges ──────────────────────────────────────────────────
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const newBadges: Badge[] = [];

  const [user, allBadges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        habits: {
          include: {
            logs: { where: { done: true }, orderBy: { date: "desc" } },
            stackItems: true,
          },
        },
        badges:     { include: { badge: true } },
        identities: true,
        stacks:     { include: { items: true } },
      },
    }),
    prisma.badge.findMany(),
  ]);

  if (!user) return [];

  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug));
  const activeHabits = user.habits.filter((h) => h.active);
  const maxStreak = Math.max(...activeHabits.map((h) => h.streak), 0);

  async function award(slug: string) {
    if (earnedSlugs.has(slug)) return;
    const badge = allBadges.find((b) => b.slug === slug);
    if (!badge) return;
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    await addXpToUser(userId, XP_RULES.BADGE_UNLOCKED);
    newBadges.push(badge);
    earnedSlugs.add(slug);
  }

  // ── Streak badges ──
  const streakMap = [
    { slug: "3-days",   days: 3   },
    { slug: "7-days",   days: 7   },
    { slug: "21-days",  days: 21  },
    { slug: "30-days",  days: 30  },
    { slug: "66-days",  days: 66  },
    { slug: "100-days", days: 100 },
  ];
  for (const { slug, days } of streakMap) {
    if (maxStreak >= days) await award(slug);
  }

  // ── Habit count badges ──
  if (activeHabits.length >= 1) await award("first-habit");
  if (activeHabits.length >= 3) await award("3-habits");
  if (activeHabits.length >= 5) await award("5-habits");

  // ── All done today ──
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (activeHabits.length > 0) {
    const todayLogs = await prisma.habitLog.findMany({
      where: { habitId: { in: activeHabits.map((h) => h.id) }, date: { gte: today, lt: tomorrow }, done: true },
    });
    const uniqueDone = new Set(todayLogs.map((l) => l.habitId));
    if (uniqueDone.size === activeHabits.length) await award("all-done");
  }

  // ── Identity count ──
  if (user.identities.length >= 4) await award("multi-identity");

  // ── Level badges ──
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { level: true, xp: true } });
  if (dbUser) {
    if (dbUser.level >= 5)  await award("level-5");
    if (dbUser.level >= 10) await award("level-10");
    if (dbUser.xp  >= 500)  await award("xp-500");
    if (dbUser.xp  >= 1000) await award("xp-1000");
  }

  // ── Stack badges ──
  if (user.stacks.length >= 1) await award("first-stack");
  if (user.stacks.some((s) => s.items.length >= 5)) await award("stack-5");

  // ── Stacking 14-day consistency ──
  if (!earnedSlugs.has("full-stack") && user.stacks.length > 0) {
    for (const stack of user.stacks) {
      if (stack.items.length === 0) continue;
      const habitIds = stack.items.map((i) => i.habitId);
      let completeDays = 0;
      const start = new Date(today); start.setDate(today.getDate() - 13);
      for (let d = 0; d < 14; d++) {
        const day = new Date(start); day.setDate(start.getDate() + d);
        const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
        const logs = await prisma.habitLog.findMany({
          where: { habitId: { in: habitIds }, date: { gte: day, lt: nextDay }, done: true },
        });
        if (new Set(logs.map((l) => l.habitId)).size === habitIds.length) completeDays++;
      }
      if (completeDays >= 14) { await award("full-stack"); break; }
    }
  }

  // ── Never miss twice ──
  if (!earnedSlugs.has("no-miss-twice")) {
    const recoveries = await countRecoveries(userId);
    if (recoveries >= 5) await award("no-miss-twice");
  }

  // ── Emotional badges ──
  const emotionalLogs = await prisma.emotionalLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
  if (emotionalLogs.length >= 1) await award("first-checkin");

  // 7 consecutive days of check-in
  if (!earnedSlugs.has("7-checkins") && emotionalLogs.length >= 7) {
    const days = new Set(emotionalLogs.map((l) => {
      const d = new Date(l.date); d.setHours(0,0,0,0); return d.toISOString();
    }));
    const sorted = Array.from(days).sort();
    let streak = 1, maxS = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1]);
      const curr = new Date(sorted[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      streak = diff === 1 ? streak + 1 : 1;
      maxS = Math.max(maxS, streak);
    }
    if (maxS >= 7) await award("7-checkins");
  }

  const schemaCount = await prisma.emotionalSchema.count({ where: { userId } });
  if (schemaCount >= 1) await award("first-schema");

  const thoughtCount = await prisma.thoughtRecord.count({ where: { userId, completed: true } });
  if (thoughtCount >= 5) await award("5-thoughts");

  // emotion-habit: habit with emotion link >= 3
  const linkCount = await prisma.habitEmotionLink.count({
    where: { habit: { userId } },
  });
  if (linkCount >= 3) await award("emotion-habit");

  return newBadges;
}

// ── Count recoveries ──────────────────────────────────────────────
async function countRecoveries(userId: string): Promise<number> {
  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: { logs: { orderBy: { date: "asc" } } },
  });
  let recoveries = 0;
  for (const habit of habits) {
    for (let i = 1; i < habit.logs.length; i++) {
      const prev = new Date(habit.logs[i - 1].date); prev.setHours(0,0,0,0);
      const curr = new Date(habit.logs[i].date);     curr.setHours(0,0,0,0);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (!habit.logs[i-1].done && habit.logs[i].done && diff === 1) recoveries++;
    }
  }
  return recoveries;
}

// ── Get progress for every badge ─────────────────────────────────
export async function getBadgeProgress(
  userId: string
): Promise<{ badge: Badge; progress: number; total: number; earned: boolean; label: string }[]> {

  const [allBadges, userBadges, activeHabits, user, identities, stacks, emotionalLogs, thoughtCount, schemaCount, linkCount] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.habit.findMany({ where: { userId, active: true }, select: { streak: true, id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } }),
    prisma.identity.findMany({ where: { userId }, select: { id: true } }),
    prisma.stack.findMany({ where: { userId }, include: { items: true } }),
    prisma.emotionalLog.findMany({ where: { userId }, orderBy: { date: "asc" }, select: { date: true } }),
    prisma.thoughtRecord.count({ where: { userId, completed: true } }),
    prisma.emotionalSchema.count({ where: { userId } }),
    prisma.habitEmotionLink.count({ where: { habit: { userId } } }),
  ]);

  const earnedSlugs = new Set(userBadges.map((ub) => ub.badge.slug));
  const maxStreak = Math.max(...activeHabits.map((h) => h.streak), 0);

  // Compute check-in streak
  let checkinStreak = 0;
  if (emotionalLogs.length > 0) {
    const days = Array.from(new Set(emotionalLogs.map((l) => {
      const d = new Date(l.date); d.setHours(0,0,0,0); return d.toISOString();
    }))).sort();
    let streak = 1, maxS = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((new Date(days[i]).getTime() - new Date(days[i-1]).getTime()) / 86400000);
      streak = diff === 1 ? streak + 1 : 1;
      maxS = Math.max(maxS, streak);
    }
    checkinStreak = maxS;
  }

  // Stacking 14-day consistency (quick estimate — max items stack)
  let stackConsistency = 0;
  for (const stack of stacks) {
    if (stack.items.length === 0) continue;
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(today); start.setDate(today.getDate() - 13);
    let complete = 0;
    const habitIds = stack.items.map((i) => i.habitId);
    // We'll do a simplified count based on unique done logs in last 14 days
    const logs = await prisma.habitLog.findMany({
      where: { habitId: { in: habitIds }, date: { gte: start }, done: true },
    });
    for (let d = 0; d < 14; d++) {
      const day = new Date(start); day.setDate(start.getDate() + d);
      const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
      const dayLogs = logs.filter((l) => new Date(l.date) >= day && new Date(l.date) < nextDay);
      if (new Set(dayLogs.map((l) => l.habitId)).size === habitIds.length) complete++;
    }
    stackConsistency = Math.max(stackConsistency, complete);
  }

  // Recoveries count
  const recoveries = await countRecoveries(userId);

  function get(slug: string): { progress: number; total: number; label: string } {
    const earned = earnedSlugs.has(slug);

    // Streak-based
    const streakMap: Record<string, number> = {
      "3-days": 3, "7-days": 7, "21-days": 21, "30-days": 30, "66-days": 66, "100-days": 100,
      "early-bird": 30, "reader": 20,
    };
    if (streakMap[slug]) {
      const total = streakMap[slug];
      const progress = earned ? total : Math.min(maxStreak, total);
      return { progress, total, label: `${progress}/${total} dias` };
    }

    // Habit count
    if (slug === "first-habit") return { progress: Math.min(activeHabits.length, 1), total: 1, label: `${activeHabits.length}/1 hábito` };
    if (slug === "3-habits")    return { progress: Math.min(activeHabits.length, 3), total: 3, label: `${activeHabits.length}/3 hábitos` };
    if (slug === "5-habits")    return { progress: Math.min(activeHabits.length, 5), total: 5, label: `${activeHabits.length}/5 hábitos` };

    // All done today — binary
    if (slug === "all-done") return { progress: earned ? 1 : 0, total: 1, label: earned ? "Conquistado" : "Complete todos hoje" };

    // Identity
    if (slug === "multi-identity") return { progress: Math.min(identities.length, 4), total: 4, label: `${identities.length}/4 identidades` };

    // Level
    if (slug === "level-5")  return { progress: Math.min(user?.level ?? 0, 5),  total: 5,  label: `Nível ${user?.level ?? 0}/5` };
    if (slug === "level-10") return { progress: Math.min(user?.level ?? 0, 10), total: 10, label: `Nível ${user?.level ?? 0}/10` };

    // XP
    if (slug === "xp-500")  return { progress: Math.min(user?.xp ?? 0, 500),  total: 500,  label: `${user?.xp ?? 0}/500 XP` };
    if (slug === "xp-1000") return { progress: Math.min(user?.xp ?? 0, 1000), total: 1000, label: `${user?.xp ?? 0}/1000 XP` };

    // Stacking
    if (slug === "first-stack") return { progress: Math.min(stacks.length, 1), total: 1, label: `${stacks.length}/1 corrente` };
    if (slug === "stack-5") {
      const max = Math.max(...stacks.map((s) => s.items.length), 0);
      return { progress: Math.min(max, 5), total: 5, label: `${max}/5 hábitos na corrente` };
    }
    if (slug === "full-stack") return { progress: Math.min(stackConsistency, 14), total: 14, label: `${stackConsistency}/14 dias completos` };

    // No miss twice
    if (slug === "no-miss-twice") return { progress: Math.min(recoveries, 5), total: 5, label: `${recoveries}/5 recuperações` };

    // Emotional
    if (slug === "first-checkin") return { progress: Math.min(emotionalLogs.length, 1), total: 1, label: emotionalLogs.length >= 1 ? "Conquistado" : "Faça um check-in" };
    if (slug === "7-checkins")    return { progress: Math.min(checkinStreak, 7), total: 7, label: `${checkinStreak}/7 dias consecutivos` };
    if (slug === "first-schema")  return { progress: Math.min(schemaCount, 1), total: 1, label: schemaCount >= 1 ? "Conquistado" : "Complete o quiz" };
    if (slug === "5-thoughts")    return { progress: Math.min(thoughtCount, 5), total: 5, label: `${thoughtCount}/5 registros` };
    if (slug === "10-strategies") return { progress: 0, total: 10, label: "Em breve" };
    if (slug === "emotion-habit") return { progress: Math.min(linkCount, 3), total: 3, label: `${linkCount}/3 hábitos vinculados` };

    // Fallback
    return { progress: earned ? 1 : 0, total: 1, label: earned ? "Conquistado" : "Em progresso" };
  }

  return allBadges.map((badge) => {
    const earned = earnedSlugs.has(badge.slug);
    const { progress, total, label } = get(badge.slug);
    return { badge, progress, total, earned, label };
  });
}

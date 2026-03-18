import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";
import type { Badge } from "@prisma/client";

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const newBadges: Badge[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      habits: {
        where: { active: true },
        include: { logs: { where: { done: true }, orderBy: { date: "desc" } } },
      },
      badges: { include: { badge: true } },
      identities: true,
    },
  });

  if (!user) return [];

  const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug));
  const allBadges = await prisma.badge.findMany();

  // Helper: check if a habit has N consecutive days of streak
  const maxStreakAcrossHabits = Math.max(
    ...user.habits.map((h) => h.streak),
    0
  );

  // Streak badges
  const streakBadgeSlugs: { slug: string; days: number }[] = [
    { slug: "7-days", days: 7 },
    { slug: "21-days", days: 21 },
    { slug: "66-days", days: 66 },
    { slug: "100-days", days: 100 },
  ];

  for (const { slug, days } of streakBadgeSlugs) {
    if (!earnedSlugs.has(slug) && maxStreakAcrossHabits >= days) {
      const badge = allBadges.find((b) => b.slug === slug);
      if (badge) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        await addXpToUser(userId, XP_RULES.BADGE_UNLOCKED);
        newBadges.push(badge);
        earnedSlugs.add(slug);
      }
    }
  }

  // Multi-identity badge
  if (!earnedSlugs.has("multi-identity") && user.identities.length >= 4) {
    const badge = allBadges.find((b) => b.slug === "multi-identity");
    if (badge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      await addXpToUser(userId, XP_RULES.BADGE_UNLOCKED);
      newBadges.push(badge);
    }
  }

  // Never-miss-twice badge: check if user recovered after a gap 5 times
  if (!earnedSlugs.has("no-miss-twice")) {
    const recoveries = await countRecoveries(userId);
    if (recoveries >= 5) {
      const badge = allBadges.find((b) => b.slug === "no-miss-twice");
      if (badge) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        await addXpToUser(userId, XP_RULES.BADGE_UNLOCKED);
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
}

async function countRecoveries(userId: string): Promise<number> {
  // A recovery = done=false one day, done=true the next day (same habit)
  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: { orderBy: { date: "asc" } },
    },
  });

  let recoveries = 0;

  for (const habit of habits) {
    const logs = habit.logs;
    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      const prevDate = new Date(prev.date);
      const currDate = new Date(curr.date);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!prev.done && curr.done && diffDays === 1) {
        recoveries++;
      }
    }
  }

  return recoveries;
}

export async function getBadgeProgress(
  userId: string
): Promise<
  { badge: Badge; progress: number; total: number; earned: boolean }[]
> {
  const allBadges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  const earnedSlugs = new Set(userBadges.map((ub) => ub.badge.slug));

  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
  });
  const maxStreak = Math.max(...habits.map((h) => h.streak), 0);

  return allBadges.map((badge) => {
    const earned = earnedSlugs.has(badge.slug);
    let progress = 0;
    let total = badge.daysRequired ?? 100;

    if (badge.daysRequired) {
      progress = Math.min(maxStreak, badge.daysRequired);
      total = badge.daysRequired;
    } else {
      progress = earned ? total : 0;
    }

    return { badge, progress, total, earned };
  });
}

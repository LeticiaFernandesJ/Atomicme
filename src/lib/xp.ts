import { prisma } from "@/lib/prisma";

export const XP_RULES = {
  HABIT_DONE: 10,
  ALL_HABITS_DONE: 20,
  STREAK_BONUS: 5,
  BADGE_UNLOCKED: 50,
  HABIT_CREATED: 15,
  STACK_COMPLETE: 25,
} as const;

export function calculateLevel(xp: number): number {
  // Level up every 200 XP, increasing threshold by 50 each level
  // Level 1: 0-199, Level 2: 200-449, Level 3: 450-749...
  let level = 1;
  let threshold = 200;
  let accumulated = 0;

  while (xp >= accumulated + threshold) {
    accumulated += threshold;
    level++;
    threshold += 50;
  }

  return level;
}

export function xpForNextLevel(currentXp: number): {
  current: number;
  required: number;
  progress: number;
} {
  let level = 1;
  let threshold = 200;
  let accumulated = 0;

  while (currentXp >= accumulated + threshold) {
    accumulated += threshold;
    level++;
    threshold += 50;
  }

  const current = currentXp - accumulated;
  const required = threshold;
  const progress = Math.round((current / required) * 100);

  return { current, required, progress };
}

export async function addXpToUser(
  userId: string,
  amount: number
): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const newXp = user.xp + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > user.level;

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });

  return { xp: newXp, level: newLevel, leveledUp };
}

export function streakBonusXp(streak: number): number {
  const weeks = Math.floor(streak / 7);
  return XP_RULES.STREAK_BONUS * weeks;
}

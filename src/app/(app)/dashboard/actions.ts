"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateStreak } from "@/lib/streak";
import { addXpToUser, XP_RULES, streakBonusXp } from "@/lib/xp";
import { checkAndAwardBadges } from "@/lib/badges";

export async function toggleHabitLog(
  habitId: string,
  done: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  const userId = session.user.id;

  // Verify the habit belongs to this user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!habit) {
    return { success: false, error: "Hábito não encontrado" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check existing log for today
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date: { gte: today, lt: tomorrow },
    },
  });

  if (existingLog) {
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: { done },
    });
  } else {
    await prisma.habitLog.create({
      data: { habitId, done, date: today },
    });
  }

  // Recalculate streak
  const newStreak = await recalculateStreak(habitId);
  await prisma.habit.update({
    where: { id: habitId },
    data: { streak: newStreak },
  });

  // Award XP only when marking as done (not undoing)
  if (done) {
    const baseXp = XP_RULES.HABIT_DONE;
    const bonusXp = streakBonusXp(newStreak);
    await addXpToUser(userId, baseXp + bonusXp);

    // Check if all habits done today → bonus XP
    const allHabits = await prisma.habit.findMany({
      where: { userId, active: true },
    });

    const todayLogs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: allHabits.map((h) => h.id) },
        date: { gte: today, lt: tomorrow },
        done: true,
      },
    });

    if (todayLogs.length === allHabits.length && allHabits.length > 0) {
      await addXpToUser(userId, XP_RULES.ALL_HABITS_DONE);
    }

    // Check badges
    await checkAndAwardBadges(userId);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

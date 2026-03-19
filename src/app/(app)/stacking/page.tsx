export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { StackingClient } from "@/components/stacking/StackingClient";

async function StackingContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [stacks, habits] = await Promise.all([
    prisma.stack.findMany({
      where: { userId },
      include: {
        items: {
          include: { habit: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.habit.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Habits completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayLogs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: habits.map((h) => h.id) },
      date: { gte: today, lt: tomorrow },
      done: true,
    },
  });

  const todayCompletedHabitIds = new Set(todayLogs.map((l) => l.habitId));

  // Completion rate for each stack — last 14 days
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 13);

  const stackCompletionRates: Record<string, number> = {};

  for (const stack of stacks) {
    if (stack.items.length === 0) {
      stackCompletionRates[stack.id] = 0;
      continue;
    }

    const habitIds = stack.items.map((i) => i.habitId);
    let completeDays = 0;

    for (let d = 0; d < 14; d++) {
      const day = new Date(fourteenDaysAgo);
      day.setDate(fourteenDaysAgo.getDate() + d);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const logs = await prisma.habitLog.findMany({
        where: {
          habitId: { in: habitIds },
          date: { gte: day, lt: nextDay },
          done: true,
        },
      });

      const uniqueDone = new Set(logs.map((l) => l.habitId));
      if (uniqueDone.size === habitIds.length) completeDays++;
    }

    stackCompletionRates[stack.id] = Math.round((completeDays / 14) * 100);
  }

  return (
    <StackingClient
      stacks={stacks.map((s) => ({
        id: s.id,
        name: s.name,
        items: s.items.map((i) => ({
          id: i.id,
          order: i.order,
          habit: {
            id: i.habit.id,
            name: i.habit.name,
            trigger: i.habit.trigger,
            streak: i.habit.streak,
          },
        })),
      }))}
      allHabits={habits.map((h) => ({
        id: h.id,
        name: h.name,
        trigger: h.trigger,
        streak: h.streak,
      }))}
      todayCompletedHabitIds={todayCompletedHabitIds}
      stackCompletionRates={stackCompletionRates}
    />
  );
}

function StackingSkeleton() {
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <Skeleton height="h-14" rounded="rounded-[12px]" />
      <Skeleton height="h-10" rounded="rounded-[12px]" />
      {[1, 2].map((i) => (
        <Skeleton key={i} height="h-48" rounded="rounded-[12px]" />
      ))}
    </div>
  );
}

export default function StackingPage() {
  return (
    <>
      <AppBar title="Habit Stacking" dark />
      <Suspense fallback={<StackingSkeleton />}>
        <StackingContent />
      </Suspense>
    </>
  );
}

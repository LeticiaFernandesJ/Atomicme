import { prisma } from "@/lib/prisma";

export async function recalculateStreak(habitId: string): Promise<number> {
  const logs = await prisma.habitLog.findMany({
    where: { habitId, done: true },
    orderBy: { date: "desc" },
  });

  if (logs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Deduplicate by date (day only)
  const uniqueDays = new Set<string>();
  for (const log of logs) {
    const d = new Date(log.date);
    d.setHours(0, 0, 0, 0);
    uniqueDays.add(d.toISOString());
  }

  const sortedDays = Array.from(uniqueDays)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Streak must start from today or yesterday
  const mostRecent = sortedDays[0];
  const mostRecentTime = mostRecent.getTime();
  const todayTime = today.getTime();
  const yesterdayTime = yesterday.getTime();

  if (mostRecentTime !== todayTime && mostRecentTime !== yesterdayTime) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getStreakStatus(streak: number): {
  label: string;
  emoji: string;
} {
  if (streak >= 100) return { label: "Lendário", emoji: "🏆" };
  if (streak >= 66) return { label: "Automático", emoji: "⚡" };
  if (streak >= 21) return { label: "Hábito formado", emoji: "🔥" };
  if (streak >= 7) return { label: "Primeira semana", emoji: "⭐" };
  if (streak >= 3) return { label: "Em construção", emoji: "🌱" };
  return { label: "Começando", emoji: "✨" };
}

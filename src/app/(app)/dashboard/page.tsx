import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { IdentityHero } from "@/components/dashboard/IdentityHero";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { HabitRow } from "@/components/habits/HabitRow";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(" ")[0];
  if (hour < 12) return `Olá, ${first}.`;
  if (hour < 18) return `Olá, ${first}.`;
  return `Olá, ${first}.`;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      identities: { take: 1, orderBy: { xp: "desc" } },
      habits: {
        where: { active: true },
        include: {
          identity: { select: { name: true } },
          logs: { orderBy: { date: "desc" }, take: 30 },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const habitsDoneToday = new Set(
    user.habits
      .filter((h) => h.logs.some((l) => l.done && new Date(l.date) >= today && new Date(l.date) < tomorrow))
      .map((h) => h.id)
  );

  const maxStreak = Math.max(...user.habits.map((h) => h.streak), 0);

  let doneInWeek = 0, totalInWeek = 0;
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today); day.setDate(today.getDate() - i);
    const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
    for (const habit of user.habits) {
      totalInWeek++;
      if (habit.logs.some((l) => l.done && new Date(l.date) >= day && new Date(l.date) < nextDay)) doneInWeek++;
    }
  }
  const weeklyRate = totalInWeek > 0 ? Math.round((doneInWeek / totalInWeek) * 100) : 0;

  const heatmapStart = new Date(today); heatmapStart.setDate(today.getDate() - 20);
  const heatmapData = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(heatmapStart); d.setDate(heatmapStart.getDate() + i);
    const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
    const dateStr = d.toISOString().split("T")[0];
    const count = user.habits.filter((h) =>
      h.logs.some((l) => l.done && new Date(l.date) >= d && new Date(l.date) < nextD)
    ).length;
    return { date: dateStr, count, total: user.habits.length };
  });

  const primaryIdentity = user.identities[0];
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const missedYesterdayCount = user.habits.filter((h) => {
    const didYesterday = h.logs.some((l) => l.done && new Date(l.date) >= yesterday && new Date(l.date) < today);
    return !didYesterday && h.streak === 0;
  }).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-medium" style={{ color: "var(--text-dark)" }}>
            {getGreeting(user.name)}
          </h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: "var(--text-muted)" }}>
            {getTodayLabel()}
            {maxStreak > 0 && (
              <span style={{ color: "var(--caramel)" }}> · 🔥 {maxStreak}d</span>
            )}
          </p>
        </div>
        <Link href="/habitos/novo"
          className="shrink-0 text-sm font-medium px-3 py-2 rounded-[10px] transition-all hover:opacity-90"
          style={{ background: "var(--navy)", color: "var(--caramel-pale)" }}>
          + Novo
        </Link>
      </div>

      {/* Never miss twice alert */}
      {missedYesterdayCount > 0 && (
        <div className="rounded-[12px] p-4 flex items-start gap-3"
          style={{ background: "var(--caramel-pale)", border: "0.5px solid var(--caramel-muted)" }}>
          <span className="text-lg shrink-0">⚡</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--brown)" }}>Não perca dois dias seguidos</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-mid)" }}>
              Você perdeu ontem. Retome hoje para manter seu padrão de identidade.
            </p>
          </div>
        </div>
      )}

      {/* Identity hero + metrics — empilhados no mobile, grid no desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <IdentityHero
            identityName={primaryIdentity?.name ?? null}
            userName={user.name}
            xp={user.xp}
            level={user.level}
            streak={maxStreak}
          />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
          <MetricCard value={`${habitsDoneToday.size}/${user.habits.length}`} label="hoje" />
          <MetricCard value={maxStreak} suffix="d" label="sequência" highlight={maxStreak > 0} />
          <MetricCard value={weeklyRate} suffix="%" label="esta semana" highlight={weeklyRate >= 70} />
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap data={heatmapData} />

      {/* Habits list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Hábitos de hoje — {habitsDoneToday.size}/{user.habits.length}
          </p>
          <Link href="/habitos" className="text-xs" style={{ color: "var(--caramel)" }}>
            Ver todos →
          </Link>
        </div>

        {user.habits.length === 0 ? (
          <div className="rounded-[12px] p-8 flex flex-col items-center gap-3 text-center"
            style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
            <p className="text-3xl">🌱</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nenhum hábito ainda</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Crie seu primeiro hábito e comece a construir sua identidade.
            </p>
            <Link href="/habitos/novo" className="text-sm font-medium mt-1" style={{ color: "var(--caramel)" }}>
              Criar primeiro hábito →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {user.habits.map((habit) => (
              <HabitRow
                key={habit.id}
                id={habit.id}
                name={habit.name}
                trigger={habit.trigger}
                streak={habit.streak}
                doneToday={habitsDoneToday.has(habit.id)}
                identityName={habit.identity?.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

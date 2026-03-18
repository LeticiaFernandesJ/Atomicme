import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { BookQuote } from "@/components/ui/BookQuote";
import { HabitLogCalendar } from "@/components/habits/HabitLogCalendar";
import { EditHabitForm } from "@/components/habits/EditHabitForm";
import { Skeleton } from "@/components/ui/Skeleton";

interface HabitDetailPageProps {
  params: { id: string };
  searchParams: { edit?: string };
}

async function HabitDetailContent({ params, searchParams }: HabitDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isEditing = searchParams.edit === "1";

  const habit = await prisma.habit.findFirst({
    where: { id: params.id, userId },
    include: {
      identity: true,
      logs: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!habit) notFound();

  const identities = await prisma.identity.findMany({
    where: { userId },
    orderBy: { xp: "desc" },
  });

  // Stats
  const totalLogs = habit.logs.filter((l) => l.done).length;
  const last7 = habit.logs.filter((l) => {
    const d = new Date(l.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff && l.done;
  }).length;
  const completionRate = habit.logs.length > 0
    ? Math.round((habit.logs.filter((l) => l.done).length / habit.logs.length) * 100)
    : 0;

  if (isEditing) {
    return (
      <>
        <AppBar
          title="Editar hábito"
          leftContent={
            <Link href={`/habitos/${habit.id}`} className="flex items-center justify-center w-8 h-8 -ml-1"
              style={{ color: "var(--text-muted)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          }
        />
        <div className="pt-4">
          <EditHabitForm
            habit={{
              id: habit.id,
              name: habit.name,
              trigger: habit.trigger,
              motivation: habit.motivation,
              minVersion: habit.minVersion,
              reward: habit.reward,
              active: habit.active,
              identityId: habit.identityId,
            }}
            identities={identities}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <AppBar
        leftContent={
          <Link href="/habitos" className="flex items-center justify-center w-8 h-8 -ml-1"
            style={{ color: "var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        }
        rightContent={
          <Link href={`/habitos/${habit.id}?edit=1`}
            className="text-xs font-medium px-3 py-1.5 rounded-[8px]"
            style={{ background: "var(--offwhite-2)", color: "var(--text-mid)", border: "0.5px solid var(--border)" }}>
            Editar
          </Link>
        }
      />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* Hero */}
        <div
          className="rounded-[12px] p-5"
          style={{ background: "var(--navy-deep)" }}
        >
          {!habit.active && (
            <div className="mb-3">
              <span
                className="text-[10px] font-medium uppercase tracking-wide px-2 py-1 rounded-[6px]"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
              >
                Arquivado
              </span>
            </div>
          )}

          <p className="text-lg font-medium" style={{ color: "var(--offwhite)" }}>
            {habit.name}
          </p>

          {habit.identity && (
            <p className="text-xs mt-1 italic" style={{ color: "var(--caramel-muted)" }}>
              &ldquo;Sou uma pessoa que {habit.identity.name}&rdquo;
            </p>
          )}

          {/* Streak */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-medium" style={{ color: "var(--caramel)" }}>
                {habit.streak}
              </span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                sequência atual
              </span>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-medium" style={{ color: "var(--offwhite)" }}>
                {totalLogs}
              </span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                total feitos
              </span>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-medium" style={{ color: "var(--offwhite)" }}>
                {completionRate}%
              </span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                taxa 30 dias
              </span>
            </div>
          </div>
        </div>

        {/* 4 Laws summary */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            As 4 leis
          </p>

          {[
            { number: "1", label: "Gatilho (óbvio)", value: habit.trigger },
            { number: "2", label: "Motivação (atrativo)", value: habit.motivation },
            { number: "3", label: "Versão mínima (fácil)", value: habit.minVersion },
            { number: "4", label: "Recompensa (satisfatório)", value: habit.reward },
          ].map(({ number, label, value }) => (
            <div
              key={number}
              className="rounded-[12px] p-3 flex items-start gap-3"
              style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}
            >
              <div
                className="shrink-0 w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-medium"
                style={{ background: "var(--navy)", color: "var(--caramel-pale)" }}
              >
                {number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-dark)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <BookQuote eyebrow="Hábitos Atômicos">
          Cada ação que você realiza é um voto para o tipo de pessoa que deseja se tornar.
        </BookQuote>

        {/* Calendar */}
        <HabitLogCalendar logs={habit.logs.map((l) => ({ date: l.date, done: l.done }))} />

        {/* This week stat */}
        <div
          className="rounded-[12px] p-4 flex items-center justify-between"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Esta semana</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Últimos 7 dias</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-medium" style={{ color: "var(--caramel)" }}>{last7}</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>/7</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HabitDetailPage({ params, searchParams }: HabitDetailPageProps) {
  return (
    <Suspense fallback={
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton height="h-32" rounded="rounded-[12px]" />
        <Skeleton height="h-24" rounded="rounded-[12px]" />
        <Skeleton height="h-48" rounded="rounded-[12px]" />
      </div>
    }>
      <HabitDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

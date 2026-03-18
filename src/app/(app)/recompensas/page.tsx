import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { BookQuote } from "@/components/ui/BookQuote";
import { Skeleton } from "@/components/ui/Skeleton";
import { RecompensasClient } from "@/components/recompensas/RecompensasClient";

async function RecompensasContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [rewards, habits] = await Promise.all([
    prisma.reward.findMany({
      where: { userId },
      orderBy: { daysRequired: "asc" },
    }),
    prisma.habit.findMany({
      where: { userId, active: true },
      select: { streak: true },
    }),
  ]);

  const maxStreak = Math.max(...habits.map((h) => h.streak), 0);

  return (
    <>
      <AppBar title="Recompensas" dark />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <BookQuote eyebrow="Hábitos Atômicos">
          O que é satisfatório é repetido. Dê a si mesmo uma recompensa imediata quando completar seu hábito.
        </BookQuote>

        {/* Current streak */}
        <div className="rounded-[12px] p-4 flex items-center justify-between"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Sua melhor sequência
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Usada para desbloquear recompensas
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "var(--caramel)" }}>🔥</span>
            <span className="text-2xl font-medium" style={{ color: "var(--caramel)" }}>{maxStreak}</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>dias</span>
          </div>
        </div>

        <RecompensasClient
          rewards={rewards.map((r) => ({ id: r.id, name: r.name, daysRequired: r.daysRequired }))}
          maxStreak={maxStreak}
        />
      </div>
    </>
  );
}

export default function RecompensasPage() {
  return (
    <Suspense fallback={
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton height="h-16" rounded="rounded-[12px]" />
        <Skeleton height="h-14" rounded="rounded-[12px]" />
        {[1, 2, 3].map(i => <Skeleton key={i} height="h-16" rounded="rounded-[12px]" />)}
      </div>
    }>
      <RecompensasContent />
    </Suspense>
  );
}

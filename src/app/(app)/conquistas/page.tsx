export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { BookQuote } from "@/components/ui/BookQuote";
import { Skeleton } from "@/components/ui/Skeleton";
import { getBadgeProgress } from "@/lib/badges";
import { xpForNextLevel } from "@/lib/xp";

const BADGE_ICONS: Record<string, string> = {
  "7-days": "🌱",
  "21-days": "🔥",
  "66-days": "⚡",
  "100-days": "🏆",
  "early-bird": "🌅",
  "reader": "📖",
  "no-miss-twice": "💪",
  "full-stack": "🔗",
  "multi-identity": "🎭",
};

async function ConquistasContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { identities: { take: 1, orderBy: { xp: "desc" } } },
  });

  const badgeProgress = await getBadgeProgress(userId);
  const earned = badgeProgress.filter((b) => b.earned);
  const inProgress = badgeProgress.filter((b) => !b.earned);
  const { progress: xpProgress } = xpForNextLevel(user.xp);

  return (
    <>
      <AppBar title="Conquistas" dark />
      <div className="flex flex-col gap-5 px-4 pt-4 pb-8">

        <div className="rounded-[12px] p-5 flex flex-col gap-3" style={{ background: "var(--navy-deep)" }}>
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--caramel)" }}>
            Sua identidade
          </p>
          {user.identities[0] ? (
            <p className="text-base italic leading-snug" style={{ color: "var(--offwhite)" }}>
              &ldquo;Sou uma pessoa que <span style={{ color: "var(--caramel-light)" }}>{user.identities[0].name}</span>.&rdquo;
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
              Defina sua identidade em Perfil.
            </p>
          )}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Nível {user.level}</span>
              <span className="text-[10px]" style={{ color: "var(--caramel)" }}>{xpProgress}%</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="flex-1 rounded-full" style={{
                  height: "3px",
                  background: (i + 1) / 20 <= xpProgress / 100 ? "var(--caramel)" : "rgba(255,255,255,0.08)",
                }} />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-medium" style={{ color: "var(--caramel)" }}>{earned.length}</span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>conquistadas</span>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-medium" style={{ color: "var(--offwhite)" }}>{badgeProgress.length}</span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>total</span>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-lg font-medium" style={{ color: "var(--offwhite)" }}>{user.xp}</span>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>xp total</span>
            </div>
          </div>
        </div>

        <BookQuote eyebrow="Hábitos Atômicos">
          Cada pequena vitória é uma prova de que você é o tipo de pessoa que faz isso.
        </BookQuote>

        {earned.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Conquistadas — {earned.length}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {earned.map(({ badge }) => (
                <div key={badge.id} className="rounded-[12px] p-3 flex flex-col items-center gap-2 text-center"
                  style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                    style={{ background: "var(--caramel-pale)", border: "1.5px solid var(--caramel)" }}>
                    {BADGE_ICONS[badge.slug] ?? "✦"}
                  </div>
                  <div>
                    <p className="text-xs font-medium leading-tight" style={{ color: "var(--text-dark)" }}>{badge.name}</p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {inProgress.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Em progresso — {inProgress.length}
            </p>
            <div className="flex flex-col gap-2">
              {inProgress.map(({ badge, progress, total }) => (
                <div key={badge.id} className="rounded-[12px] p-4 flex items-center gap-3"
                  style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)", opacity: 0.75 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)" }}>
                    {BADGE_ICONS[badge.slug] ?? "✦"}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{badge.name}</p>
                      <p className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{progress}/{total}</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{badge.description}</p>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "var(--border-light)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${total > 0 ? Math.min((progress / total) * 100, 100) : 0}%`, background: "var(--caramel)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {earned.length === 0 && inProgress.length === 0 && (
          <div className="rounded-[12px] p-6 text-center flex flex-col items-center gap-2"
            style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
            <p className="text-2xl">🌱</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Comece a construir</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Crie hábitos e mantenha streaks para desbloquear conquistas.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default function ConquistasPage() {
  return (
    <Suspense fallback={
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton height="h-40" rounded="rounded-[12px]" />
        <Skeleton height="h-14" rounded="rounded-[12px]" />
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height="h-28" rounded="rounded-[12px]" />)}
        </div>
      </div>
    }>
      <ConquistasContent />
    </Suspense>
  );
}
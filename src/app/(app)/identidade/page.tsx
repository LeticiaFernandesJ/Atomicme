
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { BookQuote } from "@/components/ui/BookQuote";
import { Skeleton } from "@/components/ui/Skeleton";
import { IdentityCard } from "@/components/identidade/IdentityCard";
import { CreateIdentityForm } from "@/components/identidade/CreateIdentityForm";
import { xpForNextLevel } from "@/lib/xp";

async function IdentidadeContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      identities: {
        include: {
          habits: { select: { id: true, name: true, streak: true, active: true } },
        },
        orderBy: { xp: "desc" },
      },
    },
  });

  const { current, required, progress } = xpForNextLevel(user.xp);

  return (
    <>
      <AppBar title="Identidade" dark />
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* Level card */}
        <div className="rounded-[12px] p-5 flex flex-col gap-3" style={{ background: "var(--navy-deep)" }}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--caramel)" }}>
                Seu nível
              </p>
              <p className="text-3xl font-medium mt-1" style={{ color: "var(--offwhite)" }}>
                {user.level}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.xp} XP total</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--caramel-muted)" }}>
                {current}/{required} para nível {user.level + 1}
              </p>
            </div>
          </div>

          {/* XP bar segmentada */}
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }, (_, i) => {
              const filled = (i + 1) / 10 <= progress / 100;
              const partial = !filled && i / 10 < progress / 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: "4px",
                    background: filled
                      ? "var(--caramel)"
                      : partial
                      ? "var(--caramel-muted)"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--caramel)" }} />
              <span className="text-xs" style={{ color: "var(--caramel-muted)" }}>
                {user.identities.length} {user.identities.length === 1 ? "identidade" : "identidades"} ativas
              </span>
            </div>
          </div>
        </div>

        <BookQuote eyebrow="Hábitos Atômicos">
          A mudança verdadeira é uma mudança de identidade. Você não busca um livro; você se torna um leitor.
        </BookQuote>

        {/* Identities */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Suas identidades — {user.identities.length}
          </p>

          {user.identities.map((identity) => (
            <IdentityCard
              key={identity.id}
              identity={{
                id: identity.id,
                name: identity.name,
                xp: identity.xp,
                habits: identity.habits,
              }}
            />
          ))}

          <CreateIdentityForm />
        </div>

        {/* XP history hint */}
        <div className="rounded-[12px] p-4 flex flex-col gap-2"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Como ganhar XP
          </p>
          {[
            { action: "Marcar hábito feito", xp: "+10 XP" },
            { action: "Completar todos hoje", xp: "+20 XP bônus" },
            { action: "Criar hábito completo", xp: "+15 XP" },
            { action: "Completar corrente", xp: "+25 XP" },
            { action: "Desbloquear conquista", xp: "+50 XP" },
            { action: "Bônus por semanas de streak", xp: "+5 XP/semana" },
          ].map(({ action, xp }) => (
            <div key={action} className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--text-mid)" }}>{action}</p>
              <p className="text-xs font-medium" style={{ color: "var(--caramel)" }}>{xp}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function IdentidadePage() {
  return (
    <Suspense fallback={
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton height="h-36" rounded="rounded-[12px]" />
        <Skeleton height="h-16" rounded="rounded-[12px]" />
        {[1, 2].map((i) => <Skeleton key={i} height="h-32" rounded="rounded-[12px]" />)}
      </div>
    }>
      <IdentidadeContent />
    </Suspense>
  );
}

import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { Skeleton } from "@/components/ui/Skeleton";

async function HabitosContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { identity: { select: { name: true } } },
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });

  const active = habits.filter((h) => h.active);
  const archived = habits.filter((h) => !h.active);

  return (
    <>
      <AppBar
        title="Meus hábitos"
        rightContent={
          <Link
            href="/habitos/novo"
            className="text-xs font-medium px-3 py-1.5 rounded-[8px]"
            style={{ background: "var(--navy)", color: "var(--caramel-pale)" }}
          >
            + Novo
          </Link>
        }
      />
      <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Ativos — {active.length}
          </p>
          {active.length === 0 ? (
            <div className="rounded-[12px] p-6 flex flex-col items-center gap-2 text-center"
              style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum hábito ativo ainda.</p>
              <Link href="/habitos/novo" className="text-sm font-medium" style={{ color: "var(--caramel)" }}>
                Criar primeiro hábito →
              </Link>
            </div>
          ) : (
            active.map((habit) => (
              <Link key={habit.id} href={`/habitos/${habit.id}`}>
                <div className="rounded-[12px] p-4 flex items-center gap-3 active:opacity-70 transition-opacity"
                  style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium"
                    style={habit.streak > 0
                      ? { background: "var(--navy)", color: "var(--caramel)" }
                      : { background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}>
                    {habit.streak > 0 ? `${habit.streak}` : "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-dark)" }}>{habit.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{habit.trigger}</p>
                    {habit.identity && (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--caramel)" }}>{habit.identity.name}</p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--border)", flexShrink: 0 }}>
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </section>
        {archived.length > 0 && (
          <section className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Arquivados — {archived.length}
            </p>
            {archived.map((habit) => (
              <Link key={habit.id} href={`/habitos/${habit.id}`}>
                <div className="rounded-[12px] p-4 flex items-center gap-3 opacity-50"
                  style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}>—</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>{habit.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </>
  );
}

function HabitosSkeleton() {
  return (
    <>
      <div className="h-14 px-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid var(--border-light)" }}>
        <Skeleton height="h-4" width="w-28" />
        <Skeleton height="h-7" width="w-16" rounded="rounded-[8px]" />
      </div>
      <div className="px-4 pt-4 flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[12px] p-4 flex items-center gap-3"
            style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
            <Skeleton height="h-10" width="w-10" rounded="rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton height="h-3.5" width="w-2/3" />
              <Skeleton height="h-2.5" width="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function HabitosPage() {
  return (
    <Suspense fallback={<HabitosSkeleton />}>
      <HabitosContent />
    </Suspense>
  );
}

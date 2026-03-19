import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true, level: true, xp: true },
  });

  const userName  = user?.name  ?? session.user.name  ?? "Usuário";
  const userImage = user?.image ?? session.user.image ?? null;
  const userLevel = user?.level ?? 1;
  const userXp    = user?.xp    ?? 0;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--offwhite)" }}>

      {/* Sidebar — visível só no desktop */}
      <div className="hidden lg:flex">
        <Sidebar
          userName={userName}
          userImage={userImage}
          userLevel={userLevel}
          userXp={userXp}
        />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 sticky top-0 z-30"
          style={{ background: "var(--offwhite)", borderBottom: "0.5px solid var(--border-light)" }}>
          <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "var(--navy)" }}>
            atomicme
          </span>
          <div className="flex items-center gap-2">
            {userImage ? (
              <img src={userImage} alt={userName} className="w-7 h-7 rounded-full object-cover"
                style={{ border: "1.5px solid var(--caramel)" }} />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ background: "var(--navy)", color: "var(--caramel)", border: "1.5px solid var(--caramel)" }}>
                {userName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 py-4 pb-24 lg:px-8 lg:py-8 lg:pb-8 max-w-3xl lg:mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav — visível só no mobile */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

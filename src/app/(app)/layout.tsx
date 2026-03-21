import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { InstallPrompt } from "@/components/InstallPrompt";

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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--offwhite)" }}>

      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          userName={userName}
          userImage={userImage}
          userLevel={userLevel}
          userXp={userXp}
        />
      </div>

      {/* Right side — header + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">

        {/* Mobile header — fixed at top */}
        <div className="lg:hidden shrink-0">
          <MobileHeader
            userName={userName}
            userImage={userImage}
            userLevel={userLevel}
            userXp={userXp}
          />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 pb-8 lg:px-8 lg:py-8 max-w-3xl lg:mx-auto">
            {children}
          </div>
        </main>
      </div>

      <InstallPrompt />
    </div>
  );
}

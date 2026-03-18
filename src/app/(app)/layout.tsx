import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true, level: true, xp: true },
  });

  return (
    <div className="flex min-h-screen" style={{ background: "var(--offwhite)" }}>
      {/* Sidebar */}
      <Sidebar
        userName={user?.name ?? session.user.name ?? "Usuário"}
        userImage={user?.image ?? session.user.image}
        userLevel={user?.level ?? 1}
        userXp={user?.xp ?? 0}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

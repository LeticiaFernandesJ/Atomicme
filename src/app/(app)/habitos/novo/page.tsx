export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppBar } from "@/components/layout/AppBar";
import { HabitForm } from "@/components/habits/HabitForm";

export default async function NovoHabitoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const identities = await prisma.identity.findMany({
    where: { userId: session.user.id },
    orderBy: { xp: "desc" },
  });

  return (
    <>
      <AppBar
        title="Novo hábito"
        leftContent={
          <Link
            href="/habitos"
            className="flex items-center justify-center w-8 h-8 -ml-1"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        }
      />
      <HabitForm identities={identities} />
    </>
  );
}

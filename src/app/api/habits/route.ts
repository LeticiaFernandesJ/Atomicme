import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, active: true },
    include: { identity: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ habits });
}

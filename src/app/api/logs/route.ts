export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LogSchema = z.object({
  habitId: z.string().cuid(),
  done: z.boolean(),
  date: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body: unknown = await request.json();
  const parsed = LogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { habitId, done, date } = parsed.data;
  const userId = session.user.id;
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) {
    return NextResponse.json({ error: "Hábito não encontrado" }, { status: 404 });
  }
  const logDate = date ? new Date(date) : new Date();
  logDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(logDate);
  nextDay.setDate(logDate.getDate() + 1);
  const existing = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: logDate, lt: nextDay } },
  });
  const log = existing
    ? await prisma.habitLog.update({ where: { id: existing.id }, data: { done } })
    : await prisma.habitLog.create({ data: { habitId, done, date: logDate } });
  return NextResponse.json({ log });
}
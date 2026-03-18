"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";

const CreateStackSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
  habitIds: z.array(z.string().cuid()).min(2, "Adicione pelo menos 2 hábitos"),
});

const AddToStackSchema = z.object({
  stackId: z.string().cuid(),
  habitId: z.string().cuid(),
});

const ReorderSchema = z.object({
  stackId: z.string().cuid(),
  orderedIds: z.array(z.string().cuid()),
});

export async function createStack(
  data: z.infer<typeof CreateStackSchema>
): Promise<{ success: boolean; error?: string; stackId?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = CreateStackSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const userId = session.user.id;

  // Verify all habits belong to user
  const habits = await prisma.habit.findMany({
    where: { id: { in: parsed.data.habitIds }, userId, active: true },
  });
  if (habits.length !== parsed.data.habitIds.length) {
    return { success: false, error: "Um ou mais hábitos não encontrados" };
  }

  const stack = await prisma.stack.create({
    data: {
      name: parsed.data.name,
      userId,
      items: {
        create: parsed.data.habitIds.map((habitId, i) => ({
          habitId,
          order: i,
        })),
      },
    },
  });

  revalidatePath("/stacking");
  return { success: true, stackId: stack.id };
}

export async function deleteStack(
  stackId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const userId = session.user.id;
  const stack = await prisma.stack.findFirst({ where: { id: stackId, userId } });
  if (!stack) return { success: false, error: "Corrente não encontrada" };

  await prisma.stack.delete({ where: { id: stackId } });
  revalidatePath("/stacking");
  return { success: true };
}

export async function addHabitToStack(
  data: z.infer<typeof AddToStackSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = AddToStackSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const userId = session.user.id;

  const stack = await prisma.stack.findFirst({
    where: { id: parsed.data.stackId, userId },
    include: { items: true },
  });
  if (!stack) return { success: false, error: "Corrente não encontrada" };

  const habit = await prisma.habit.findFirst({
    where: { id: parsed.data.habitId, userId, active: true },
  });
  if (!habit) return { success: false, error: "Hábito não encontrado" };

  // Prevent duplicates
  const alreadyIn = stack.items.some((item) => item.habitId === parsed.data.habitId);
  if (alreadyIn) return { success: false, error: "Hábito já está nesta corrente" };

  const maxOrder = stack.items.reduce((max, item) => Math.max(max, item.order), -1);

  await prisma.stackItem.create({
    data: {
      stackId: parsed.data.stackId,
      habitId: parsed.data.habitId,
      order: maxOrder + 1,
    },
  });

  revalidatePath("/stacking");
  return { success: true };
}

export async function removeHabitFromStack(
  stackItemId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const userId = session.user.id;

  const item = await prisma.stackItem.findFirst({
    where: { id: stackItemId },
    include: { stack: true },
  });

  if (!item || item.stack.userId !== userId) {
    return { success: false, error: "Item não encontrado" };
  }

  await prisma.stackItem.delete({ where: { id: stackItemId } });
  revalidatePath("/stacking");
  return { success: true };
}

export async function reorderStackItems(
  data: z.infer<typeof ReorderSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = ReorderSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const userId = session.user.id;
  const stack = await prisma.stack.findFirst({
    where: { id: parsed.data.stackId, userId },
  });
  if (!stack) return { success: false, error: "Corrente não encontrada" };

  await Promise.all(
    parsed.data.orderedIds.map((id, index) =>
      prisma.stackItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/stacking");
  return { success: true };
}

export async function completeStack(
  stackId: string
): Promise<{ success: boolean; error?: string; xpGained?: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const userId = session.user.id;

  const stack = await prisma.stack.findFirst({
    where: { id: stackId, userId },
    include: { items: { include: { habit: true } } },
  });
  if (!stack) return { success: false, error: "Corrente não encontrada" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Mark all habits done
  for (const item of stack.items) {
    const existing = await prisma.habitLog.findFirst({
      where: { habitId: item.habitId, date: { gte: today, lt: tomorrow } },
    });
    if (existing) {
      await prisma.habitLog.update({ where: { id: existing.id }, data: { done: true } });
    } else {
      await prisma.habitLog.create({ data: { habitId: item.habitId, done: true, date: today } });
    }
  }

  // Award stack XP
  await addXpToUser(userId, XP_RULES.STACK_COMPLETE);

  revalidatePath("/stacking");
  revalidatePath("/dashboard");
  return { success: true, xpGained: XP_RULES.STACK_COMPLETE };
}

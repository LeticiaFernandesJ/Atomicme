"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";

const HabitSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
  trigger: z.string().min(3, "Descreva o gatilho").max(200),
  motivation: z.string().min(3, "Descreva a motivação").max(200),
  minVersion: z.string().min(3, "Descreva a versão mínima").max(200),
  reward: z.string().min(2, "Descreva a recompensa").max(200),
  identityId: z.string().optional(),
  newIdentityName: z.string().optional(),
});

const UpdateHabitSchema = HabitSchema.extend({
  id: z.string().cuid(),
  active: z.boolean().optional(),
});

export async function createHabit(
  formData: z.infer<typeof HabitSchema>
): Promise<{ success: boolean; error?: string; habitId?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = HabitSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const userId = session.user.id;
  const { name, trigger, motivation, minVersion, reward, identityId, newIdentityName } = parsed.data;

  let resolvedIdentityId: string | undefined = identityId;

  // Create new identity if requested
  if (newIdentityName && newIdentityName.trim().length > 0) {
    const identity = await prisma.identity.create({
      data: { name: newIdentityName.trim(), userId },
    });
    resolvedIdentityId = identity.id;
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      trigger,
      motivation,
      minVersion,
      reward,
      userId,
      identityId: resolvedIdentityId ?? null,
    },
  });

  // Award XP for creating a habit with all 4 laws filled
  await addXpToUser(userId, XP_RULES.HABIT_CREATED);

  revalidatePath("/habitos");
  revalidatePath("/dashboard");

  return { success: true, habitId: habit.id };
}

export async function updateHabit(
  formData: z.infer<typeof UpdateHabitSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = UpdateHabitSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const userId = session.user.id;
  const { id, name, trigger, motivation, minVersion, reward, identityId, newIdentityName, active } = parsed.data;

  const existing = await prisma.habit.findFirst({ where: { id, userId } });
  if (!existing) return { success: false, error: "Hábito não encontrado" };

  let resolvedIdentityId: string | null = identityId ?? null;

  if (newIdentityName && newIdentityName.trim().length > 0) {
    const identity = await prisma.identity.create({
      data: { name: newIdentityName.trim(), userId },
    });
    resolvedIdentityId = identity.id;
  }

  await prisma.habit.update({
    where: { id },
    data: {
      name,
      trigger,
      motivation,
      minVersion,
      reward,
      identityId: resolvedIdentityId,
      ...(active !== undefined ? { active } : {}),
    },
  });

  revalidatePath("/habitos");
  revalidatePath(`/habitos/${id}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function archiveHabit(
  habitId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const userId = session.user.id;
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return { success: false, error: "Hábito não encontrado" };

  await prisma.habit.update({
    where: { id: habitId },
    data: { active: false },
  });

  revalidatePath("/habitos");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteHabit(
  habitId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const userId = session.user.id;
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return { success: false, error: "Hábito não encontrado" };

  await prisma.habit.delete({ where: { id: habitId } });

  revalidatePath("/habitos");
  revalidatePath("/dashboard");

  redirect("/habitos");
}

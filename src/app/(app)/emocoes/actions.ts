"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addXpToUser, XP_RULES } from "@/lib/xp";

// ── Emotional Log (check-in) ──
const EmotionalLogSchema = z.object({
  emotion:   z.string().min(1),
  intensity: z.number().int().min(1).max(10),
  situation: z.string().optional(),
  thought:   z.string().optional(),
  note:      z.string().optional(),
});

export async function createEmotionalLog(
  data: z.infer<typeof EmotionalLogSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = EmotionalLogSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const userId = session.user.id;

  // Check if already did check-in today
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.emotionalLog.findFirst({
    where: { userId, date: { gte: today, lt: tomorrow } },
  });

  await prisma.emotionalLog.create({
    data: { ...parsed.data, userId },
  });

  // XP only for first check-in of the day
  if (!existing) {
    await addXpToUser(userId, 10);
  }

  revalidatePath("/emocoes");
  revalidatePath("/dashboard");
  return { success: true };
}

// ── Emotional Schema Quiz ──
const SchemaQuizSchema = z.object({
  scores: z.record(z.string(), z.number()),
});

export async function saveEmotionalSchema(
  data: z.infer<typeof SchemaQuizSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = SchemaQuizSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos" };

  const userId = session.user.id;

  await prisma.emotionalSchema.create({
    data: { userId, scores: JSON.stringify(parsed.data.scores) },
  });

  // First time bonus
  const count = await prisma.emotionalSchema.count({ where: { userId } });
  if (count === 1) await addXpToUser(userId, 50);

  revalidatePath("/emocoes/quiz");
  return { success: true };
}

// ── Thought Record ──
const ThoughtRecordSchema = z.object({
  situation:          z.string().min(3),
  emotion:            z.string().min(1),
  intensityBefore:    z.number().int().min(0).max(100),
  intensityAfter:     z.number().int().min(0).max(100).optional(),
  autoThought:        z.string().min(3),
  evidenceFor:        z.string().optional(),
  evidenceAgainst:    z.string().optional(),
  alternativeThought: z.string().optional(),
  completed:          z.boolean().optional(),
});

export async function createThoughtRecord(
  data: z.infer<typeof ThoughtRecordSchema>
): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = ThoughtRecordSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const record = await prisma.thoughtRecord.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  if (parsed.data.completed) {
    await addXpToUser(session.user.id, XP_RULES.HABIT_CREATED); // +15 XP
    const count = await prisma.thoughtRecord.count({
      where: { userId: session.user.id, completed: true },
    });
    if (count === 5) await addXpToUser(session.user.id, 75); // Pensador Crítico badge bonus
  }

  revalidatePath("/emocoes/thought");
  return { success: true, id: record.id };
}

// ── Habit Emotion Link ──
const HabitEmotionSchema = z.object({
  habitId:    z.string().cuid(),
  emotion:    z.string().min(1),
  strategies: z.array(z.string()),
});

export async function saveHabitEmotionLink(
  data: z.infer<typeof HabitEmotionSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = HabitEmotionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos" };

  const habit = await prisma.habit.findFirst({
    where: { id: parsed.data.habitId, userId: session.user.id },
  });
  if (!habit) return { success: false, error: "Hábito não encontrado" };

  await prisma.habitEmotionLink.upsert({
    where: { habitId: parsed.data.habitId },
    update: { emotion: parsed.data.emotion, strategies: JSON.stringify(parsed.data.strategies) },
    create: {
      habitId:    parsed.data.habitId,
      emotion:    parsed.data.emotion,
      strategies: JSON.stringify(parsed.data.strategies),
    },
  });

  revalidatePath(`/habitos/${parsed.data.habitId}`);
  return { success: true };
}

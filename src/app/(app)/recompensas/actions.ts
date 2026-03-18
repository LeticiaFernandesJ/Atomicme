"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateRewardSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120),
  daysRequired: z.number().int().min(0).max(365),
});

export async function createReward(
  data: z.infer<typeof CreateRewardSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = CreateRewardSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.reward.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/recompensas");
  return { success: true };
}

export async function deleteReward(
  rewardId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, userId: session.user.id },
  });
  if (!reward) return { success: false, error: "Recompensa não encontrada" };

  await prisma.reward.delete({ where: { id: rewardId } });
  revalidatePath("/recompensas");
  return { success: true };
}

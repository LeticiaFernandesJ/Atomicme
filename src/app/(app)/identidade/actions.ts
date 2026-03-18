"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateIdentitySchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120),
});

const UpdateIdentitySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2, "Nome muito curto").max(120),
});

export async function createIdentity(
  data: z.infer<typeof CreateIdentitySchema>
): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = CreateIdentitySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const identity = await prisma.identity.create({
    data: { name: parsed.data.name, userId: session.user.id },
  });

  revalidatePath("/identidade");
  return { success: true, id: identity.id };
}

export async function updateIdentity(
  data: z.infer<typeof UpdateIdentitySchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const parsed = UpdateIdentitySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const existing = await prisma.identity.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Identidade não encontrada" };

  await prisma.identity.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/identidade");
  return { success: true };
}

export async function deleteIdentity(
  identityId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  const existing = await prisma.identity.findFirst({
    where: { id: identityId, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Identidade não encontrada" };

  // Unlink habits
  await prisma.habit.updateMany({
    where: { identityId },
    data: { identityId: null },
  });

  await prisma.identity.delete({ where: { id: identityId } });
  revalidatePath("/identidade");
  return { success: true };
}

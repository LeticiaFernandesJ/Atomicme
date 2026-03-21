import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThoughtClient } from "@/components/emocoes/ThoughtClient";
import { Skeleton } from "@/components/ui/Skeleton";

async function ThoughtContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const records = await prisma.thoughtRecord.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <ThoughtClient
      records={records.map((r) => ({
        id: r.id,
        date: r.date,
        situation: r.situation,
        emotion: r.emotion,
        intensityBefore: r.intensityBefore,
        intensityAfter: r.intensityAfter,
        autoThought: r.autoThought,
        alternativeThought: r.alternativeThought,
        completed: r.completed,
      }))}
    />
  );
}

export default function ThoughtPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-48" rounded="rounded-[12px]" />
      </div>
    }>
      <ThoughtContent />
    </Suspense>
  );
}

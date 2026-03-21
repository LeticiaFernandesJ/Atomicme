import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizClient } from "@/components/emocoes/QuizClient";
import { Skeleton } from "@/components/ui/Skeleton";

async function QuizContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const history = await prisma.emotionalSchema.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <QuizClient
      history={history.map((h) => ({
        id: h.id,
        date: h.date,
        scores: JSON.parse(h.scores) as Record<string, number>,
      }))}
    />
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-48" rounded="rounded-[12px]" />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}

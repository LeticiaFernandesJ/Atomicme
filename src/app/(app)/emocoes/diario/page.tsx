import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmotionalDiary } from "@/components/emocoes/EmotionalDiary";
import { Skeleton } from "@/components/ui/Skeleton";

async function DiaryContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.emotionalLog.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/emocoes" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#a78bfa" }}>
              ← Mente &amp; Emoções
            </Link>
          </div>
          <h1 className="text-xl font-medium mt-1" style={{ color: "var(--text-dark)" }}>Diário Emocional</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Últimos 30 dias · {entries.length} entradas</p>
        </div>
      </div>
      <EmotionalDiary entries={entries.map((e) => ({
        id: e.id, date: e.date, emotion: e.emotion,
        intensity: e.intensity, situation: e.situation, thought: e.thought,
      }))} />
    </div>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-3"><Skeleton height="h-8" width="w-48" /><Skeleton height="h-48" rounded="rounded-[12px]" /></div>}>
      <DiaryContent />
    </Suspense>
  );
}

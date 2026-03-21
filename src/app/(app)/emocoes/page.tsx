import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmotionThermometer } from "@/components/emocoes/EmotionThermometer";
import { EMOTIONS } from "@/lib/emotions";
import { Skeleton } from "@/components/ui/Skeleton";

async function EmotionsContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 6);

  const [todayLog, recentLogs] = await Promise.all([
    prisma.emotionalLog.findFirst({ where: { userId, date: { gte: today, lt: tomorrow } }, orderBy: { date: "desc" } }),
    prisma.emotionalLog.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
      take: 30,
    }),
  ]);

  // Build 7-day chart data
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const log = recentLogs.find((l) => {
      const ld = new Date(l.date); ld.setHours(0,0,0,0);
      return ld.getTime() === d.getTime();
    });
    return { date: dateStr, intensity: log?.intensity ?? null, emotion: log?.emotion ?? null };
  });

  const thoughtCount = await prisma.thoughtRecord.count({ where: { userId, completed: true } });
  const schemaCount = await prisma.emotionalSchema.count({ where: { userId } });

  return (
  

      {/* Thermometer */}
      <EmotionThermometer
        checkedInToday={!!todayLog}
        todayEmotion={todayLog?.emotion}
        todayIntensity={todayLog?.intensity}
      />

      {/* 7-day chart */}
      {recentLogs.length > 0 && (
        <div className="rounded-[12px] p-4"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <p className="text-xs font-medium uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
            Humor dos últimos 7 dias
          </p>
          <div className="flex items-end gap-2 h-20">
            {chartDays.map((day, i) => {
              const emotion = EMOTIONS.find((e) => e.key === day.emotion);
              const height = day.intensity ? `${(day.intensity / 10) * 100}%` : "8px";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-[4px] transition-all"
                    style={{
                      height: day.intensity ? `${(day.intensity / 10) * 64}px` : "4px",
                      background: emotion?.color ?? "var(--border-light)",
                      opacity: day.intensity ? 1 : 0.3,
                      minHeight: "4px",
                    }}
                    title={day.emotion ? `${day.emotion} — ${day.intensity}/10` : "Sem registro"}
                  />
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{day.date}</span>
                  {day.emotion && <span className="text-[10px]">{emotion?.emoji}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick access cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/emocoes/diario",      emoji: "📓", label: "Diário Emocional",    desc: "Registre situações e pensamentos",  color: "#7c3aed" },
          { href: "/emocoes/estrategias", emoji: "🧰", label: "Estratégias",          desc: "15 técnicas baseadas em TCC",       color: "#0891b2" },
          { href: "/emocoes/quiz",        emoji: "🧭", label: "Quiz de Esquemas",     desc: `${schemaCount} vez${schemaCount !== 1 ? "es" : ""} realizado`, color: "#059669" },
          { href: "/emocoes/thought",     emoji: "💭", label: "Desafio de Pensamento",desc: `${thoughtCount} registro${thoughtCount !== 1 ? "s" : ""}`, color: "#d97706" },
        ].map(({ href, emoji, label, desc, color }) => (
          <Link key={href} href={href}>
            <div className="rounded-[12px] p-4 flex flex-col gap-2 h-full transition-all hover:opacity-80"
              style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium leading-tight" style={{ color: "var(--text-dark)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Leahy quote */}
      <div className="rounded-[12px] p-4"
        style={{ background: "rgba(167,139,250,0.06)", borderLeft: "2px solid #a78bfa" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: "#a78bfa" }}>
          Robert L. Leahy
        </p>
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-mid)" }}>
          &ldquo;Suas emoções não são fatos — são informações. Aprender a ouvi-las sem obedecer cegamente é a base da inteligência emocional.&rdquo;
        </p>
      </div>
    </div>
  );
}

export default function EmotionsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-40" rounded="rounded-[12px]" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} height="h-28" rounded="rounded-[12px]" />)}
        </div>
      </div>
    }>
      <EmotionsContent />
    </Suspense>
  );
}

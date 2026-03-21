import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookQuote } from "@/components/ui/BookQuote";
import { Skeleton } from "@/components/ui/Skeleton";
import { getBadgeProgress, checkAndAwardBadges } from "@/lib/badges";
import { xpForNextLevel } from "@/lib/xp";

const BADGE_ICONS: Record<string, string> = {
  "3-days": "✨", "7-days": "🌱", "21-days": "🔥", "30-days": "📅",
  "66-days": "⚡", "100-days": "🏆", "early-bird": "🌅", "reader": "📖",
  "no-miss-twice": "💪", "full-stack": "🔗", "multi-identity": "🎭",
  "first-habit": "🌟", "3-habits": "🎯", "5-habits": "⚙️", "all-done": "✅",
  "level-5": "🚀", "level-10": "💎", "xp-500": "🪙", "xp-1000": "👑",
  "first-checkin": "🧠", "7-checkins": "📓", "first-schema": "🧭",
  "5-thoughts": "💭", "10-strategies": "🧰", "emotion-habit": "🤝",
  "first-stack": "🔗", "stack-5": "⛓️",
};

const BADGE_CATEGORIES: Record<string, string> = {
  "3-days": "streak", "7-days": "streak", "21-days": "streak",
  "30-days": "streak", "66-days": "streak", "100-days": "streak",
  "early-bird": "streak", "reader": "streak", "no-miss-twice": "streak",
  "full-stack": "stacking", "first-stack": "stacking", "stack-5": "stacking",
  "multi-identity": "identidade", "first-habit": "habitos", "3-habits": "habitos",
  "5-habits": "habitos", "all-done": "habitos",
  "level-5": "xp", "level-10": "xp", "xp-500": "xp", "xp-1000": "xp",
  "first-checkin": "emocoes", "7-checkins": "emocoes", "first-schema": "emocoes",
  "5-thoughts": "emocoes", "10-strategies": "emocoes", "emotion-habit": "emocoes",
};

const CATEGORY_INFO: Record<string, { label: string; color: string; bg: string; accent: string }> = {
  streak:     { label: "Consistência",  color: "var(--caramel)",  bg: "var(--caramel-pale)",       accent: "#c4884a" },
  habitos:    { label: "Hábitos",       color: "var(--navy)",     bg: "rgba(27,43,75,0.08)",        accent: "#1b2b4b" },
  stacking:   { label: "Stacking",      color: "#0891b2",         bg: "rgba(8,145,178,0.08)",       accent: "#0891b2" },
  identidade: { label: "Identidade",    color: "#059669",         bg: "rgba(5,150,105,0.08)",       accent: "#059669" },
  xp:         { label: "XP & Nível",    color: "#d97706",         bg: "rgba(217,119,6,0.08)",       accent: "#d97706" },
  emocoes:    { label: "Mente",         color: "#7c3aed",         bg: "rgba(124,58,237,0.08)",      accent: "#7c3aed" },
};

const CATEGORY_ORDER = ["streak", "habitos", "stacking", "identidade", "xp", "emocoes"];

async function ConquistasContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { identities: { take: 1, orderBy: { xp: "desc" } } },
  });

  // Award any newly unlocked badges first, then fetch fresh progress
  // Wrapped in try/catch so errors here never crash the page or drop the session
  try { await checkAndAwardBadges(userId); } catch (e) { console.error("[checkAndAwardBadges]", e); }
  const badgeProgress = await getBadgeProgress(userId);
  const earned = badgeProgress.filter((b) => b.earned);
  const inProgress = badgeProgress.filter((b) => !b.earned);
  const { progress: xpProgress } = xpForNextLevel(user.xp);

  // Group in-progress by category, ordered
  const inProgressByCategory: Record<string, typeof inProgress> = {};
  CATEGORY_ORDER.forEach((cat) => { inProgressByCategory[cat] = []; });
  inProgress.forEach((b) => {
    const cat = BADGE_CATEGORIES[b.badge.slug] ?? "habitos";
    if (!inProgressByCategory[cat]) inProgressByCategory[cat] = [];
    inProgressByCategory[cat].push(b);
  });

  // Group earned by category
  const earnedByCategory: Record<string, typeof earned> = {};
  earned.forEach((b) => {
    const cat = BADGE_CATEGORIES[b.badge.slug] ?? "habitos";
    if (!earnedByCategory[cat]) earnedByCategory[cat] = [];
    earnedByCategory[cat].push(b);
  });

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* Hero */}
      <div className="rounded-[12px] p-5 flex flex-col gap-3" style={{ background: "var(--navy-deep)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--caramel)" }}>
          Sua identidade
        </p>
        {user.identities[0] ? (
          <p className="text-base italic leading-snug" style={{ color: "var(--offwhite)" }}>
            &ldquo;Sou uma pessoa que{" "}
            <span style={{ color: "var(--caramel-light)" }}>{user.identities[0].name}</span>.&rdquo;
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            Defina sua identidade em Perfil.
          </p>
        )}

        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Nível {user.level}</span>
            <span className="text-[10px]" style={{ color: "var(--caramel)" }}>{xpProgress}%</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flex-1 rounded-full"
                style={{ height: "3px", background: (i + 1) / 20 <= xpProgress / 100 ? "var(--caramel)" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-medium" style={{ color: "var(--caramel)" }}>{earned.length}</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>conquistadas</span>
          </div>
          <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-medium" style={{ color: "var(--offwhite)" }}>{badgeProgress.length}</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>total</span>
          </div>
          <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-medium" style={{ color: "var(--offwhite)" }}>{user.xp}</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>xp total</span>
          </div>
        </div>
      </div>

      <BookQuote eyebrow="Hábitos Atômicos">
        Cada pequena vitória é uma prova de que você é o tipo de pessoa que faz isso.
      </BookQuote>

      {/* In progress — by category */}
      {inProgress.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Em progresso — {inProgress.length}
          </p>

          {CATEGORY_ORDER.map((cat) => {
            const items = inProgressByCategory[cat];
            if (!items || items.length === 0) return null;
            const catInfo = CATEGORY_INFO[cat];
            return (
              <div key={cat} className="flex flex-col gap-2">
                <span className="text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                  style={{ background: catInfo.bg, color: catInfo.color }}>
                  {catInfo.label}
                </span>
                <div className="flex flex-col gap-2">
                  {items.map(({ badge, progress, total, label }) => {
                    const pct = total > 0 ? Math.min((progress / total) * 100, 100) : 0;
                    return (
                      <div key={badge.id} className="rounded-[12px] p-4 flex items-center gap-3"
                        style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ background: catInfo.bg, border: `1px solid ${catInfo.accent}30` }}>
                          {BADGE_ICONS[badge.slug] ?? "✦"}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
                              {badge.name}
                            </p>
                            <p className="text-xs font-medium shrink-0" style={{ color: catInfo.color }}>
                              {label}
                            </p>
                          </div>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{badge.description}</p>
                          <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "var(--border-light)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: catInfo.accent }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Earned — by category */}
      {earned.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Conquistadas — {earned.length}
          </p>

          {CATEGORY_ORDER.map((cat) => {
            const items = earnedByCategory[cat];
            if (!items || items.length === 0) return null;
            const catInfo = CATEGORY_INFO[cat];
            return (
              <div key={cat} className="flex flex-col gap-2">
                <span className="text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                  style={{ background: catInfo.bg, color: catInfo.color }}>
                  {catInfo.label}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {items.map(({ badge, label }) => (
                    <div key={badge.id} className="rounded-[12px] p-3 flex flex-col items-center gap-2 text-center"
                      style={{ background: catInfo.bg, border: `0.5px solid ${catInfo.accent}40` }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                        style={{ background: "var(--offwhite)", border: `1.5px solid ${catInfo.accent}` }}>
                        {BADGE_ICONS[badge.slug] ?? "✦"}
                      </div>
                      <div>
                        <p className="text-xs font-medium leading-tight" style={{ color: "var(--text-dark)" }}>
                          {badge.name}
                        </p>
                        <p className="text-[10px] mt-0.5 leading-tight font-medium" style={{ color: catInfo.color }}>
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {earned.length === 0 && inProgress.length === 0 && (
        <div className="rounded-[12px] p-6 text-center flex flex-col items-center gap-2"
          style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
          <p className="text-2xl">🌱</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Comece a construir</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Crie hábitos e mantenha streaks para desbloquear conquistas.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ConquistasPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-3">
        <Skeleton height="h-40" rounded="rounded-[12px]" />
        <Skeleton height="h-14" rounded="rounded-[12px]" />
        {[1,2,3].map(i => <Skeleton key={i} height="h-20" rounded="rounded-[12px]" />)}
      </div>
    }>
      <ConquistasContent />
    </Suspense>
  );
}

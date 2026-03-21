"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MobileHeaderProps {
  userName: string;
  userImage?: string | null;
  userLevel: number;
  userXp: number;
}

const habitosItems = [
  { href: "/dashboard",   label: "Início",      emoji: "🏠" },
  { href: "/habitos",     label: "Hábitos",     emoji: "✅" },
  { href: "/stacking",    label: "Stacking",    emoji: "🔗" },
  { href: "/conquistas",  label: "Conquistas",  emoji: "⭐" },
  { href: "/identidade",  label: "Identidade",  emoji: "🧠" },
  { href: "/recompensas", label: "Recompensas", emoji: "🎁" },
];

const menteItems = [
  { href: "/emocoes",              label: "Termômetro",    emoji: "🌡️" },
  { href: "/emocoes/diario",       label: "Diário",        emoji: "📓" },
  { href: "/emocoes/estrategias",  label: "Estratégias",   emoji: "🧰" },
  { href: "/emocoes/quiz",         label: "Quiz",          emoji: "🧭" },
  { href: "/emocoes/thought",      label: "Pensamentos",   emoji: "💭" },
];

export function MobileHeader({ userName, userImage, userLevel, userXp }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const firstName = userName.split(" ")[0];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
        style={{ background: "var(--offwhite)", borderBottom: "0.5px solid var(--border-light)" }}>

        {/* Hamburger */}
        <button onClick={() => setOpen(true)}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 hover:opacity-60 transition-opacity"
          aria-label="Abrir menu">
          <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--navy)" }} />
          <span className="block w-4 h-0.5 rounded-full" style={{ background: "var(--navy)" }} />
          <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--navy)" }} />
        </button>

        {/* Wordmark */}
        <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "var(--navy)" }}>
          atomicme
        </span>

        {/* Avatar */}
        {userImage ? (
          <img src={userImage} alt={userName} className="w-7 h-7 rounded-full object-cover"
            style={{ border: "1.5px solid var(--caramel)" }} />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "var(--navy)", color: "var(--caramel)", border: "1.5px solid var(--caramel)" }}>
            {firstName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ background: "var(--navy-deep)" }}>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "var(--caramel)" }}>
                atomicme
              </span>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-60 transition-opacity"
                style={{ color: "var(--text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 flex items-center gap-3"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              {userImage ? (
                <img src={userImage} alt={userName} className="w-10 h-10 rounded-full object-cover"
                  style={{ border: "1.5px solid var(--caramel)" }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ background: "var(--navy)", color: "var(--caramel)", border: "1.5px solid var(--caramel)" }}>
                  {firstName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--offwhite)" }}>{userName}</p>
                <p className="text-xs" style={{ color: "var(--caramel)" }}>Nível {userLevel} · {userXp} XP</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {/* Hábitos */}
              <p className="text-[10px] uppercase tracking-widest px-3 py-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                Hábitos
              </p>
              {habitosItems.map(({ href, label, emoji }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm mb-0.5 transition-all"
                    style={{
                      background: active ? "rgba(196,136,74,0.12)" : "transparent",
                      color: active ? "var(--caramel)" : "var(--text-muted)",
                    }}>
                    <span className="text-base w-6 text-center">{emoji}</span>
                    <span className="font-medium">{label}</span>
                    {active && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "var(--caramel)" }} />}
                  </Link>
                );
              })}

              {/* Mente */}
              <p className="text-[10px] uppercase tracking-widest px-3 py-2 mt-3"
                style={{ color: "rgba(167,139,250,0.5)" }}>
                Mente &amp; Emoções
              </p>
              {menteItems.map(({ href, label, emoji }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm mb-0.5 transition-all"
                    style={{
                      background: active ? "rgba(167,139,250,0.12)" : "transparent",
                      color: active ? "#a78bfa" : "var(--text-muted)",
                    }}>
                    <span className="text-base w-6 text-center">{emoji}</span>
                    <span className="font-medium">{label}</span>
                    {active && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "#a78bfa" }} />}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 pt-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] hover:opacity-70 transition-all text-sm"
                style={{ color: "var(--text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

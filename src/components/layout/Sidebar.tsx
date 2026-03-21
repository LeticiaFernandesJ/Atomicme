"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface SidebarProps {
  userName: string;
  userImage?: string | null;
  userLevel: number;
  userXp: number;
}

// ── Icons ──
function IconHome({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.15" : "0"} /></svg>;
}
function IconHabits({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /><path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconStacking({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /><rect x="3" y="10" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /><rect x="3" y="16" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /></svg>;
}
function IconAchievements({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.85 8.77L22 9.27L16.82 13.97L18.47 21L12 17.27L5.53 21L7.18 13.97L2 9.27L9.15 8.77L12 2Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.15" : "0"} /></svg>;
}
function IconIdentity({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /><path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" /></svg>;
}
function IconRewards({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 12V22H4V12" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.1" : "0"} /><path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22V7" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" /><path d="M12 7H7.5C6.12 7 5 5.88 5 4.5C5 3.12 6.12 2 7.5 2C10 2 12 7 12 7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7H16.5C17.88 7 19 5.88 19 4.5C19 3.12 17.88 2 16.5 2C14 2 12 7 12 7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconMind({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.5 2 6 4.5 6 7.5C6 9.5 7 11.3 8.5 12.5C7 13 6 14.5 6 16C6 18.8 8.2 21 11 21H13C15.8 21 18 18.8 18 16C18 14.5 17 13 15.5 12.5C17 11.3 18 9.5 18 7.5C18 4.5 15.5 2 12 2Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} /><path d="M9 9H15M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconMore() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></svg>;
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const habitosItems = [
  { href: "/dashboard",   label: "Início",      Icon: IconHome },
  { href: "/habitos",     label: "Hábitos",     Icon: IconHabits },
  { href: "/stacking",    label: "Stacking",    Icon: IconStacking },
  { href: "/conquistas",  label: "Conquistas",  Icon: IconAchievements },
  { href: "/identidade",  label: "Identidade",  Icon: IconIdentity },
  { href: "/recompensas", label: "Recompensas", Icon: IconRewards },
];

const menteItems = [
  { href: "/emocoes",           label: "Termômetro",   Icon: IconMind },
  { href: "/emocoes/diario",    label: "Diário",       Icon: IconMind },
  { href: "/emocoes/quiz",      label: "Quiz",         Icon: IconMind },
  { href: "/emocoes/thought",   label: "Pensamentos",  Icon: IconMind },
  { href: "/emocoes/estrategias", label: "Estratégias", Icon: IconMind },
];

const mobileMainItems = [
  { href: "/dashboard",  label: "Início",    Icon: IconHome },
  { href: "/habitos",    label: "Hábitos",   Icon: IconHabits },
  { href: "/emocoes",    label: "Mente",     Icon: IconMind,  purple: true },
  { href: "/conquistas", label: "Conquistas",Icon: IconAchievements },
];

function NavItem({ href, label, Icon, active, purple = false }: {
  href: string; label: string; Icon: React.ComponentType<{active: boolean}>;
  active: boolean; purple?: boolean;
}) {
  const color = active ? (purple ? "#a78bfa" : "var(--caramel)") : "var(--text-muted)";
  const bg = active ? (purple ? "rgba(167,139,250,0.12)" : "rgba(196,136,74,0.12)") : "transparent";
  const dot = active ? (purple ? "#a78bfa" : "var(--caramel)") : "transparent";

  return (
    <Link href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-150"
      style={{ background: bg, color }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon active={active} />
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: dot }} />}
    </Link>
  );
}

// ── Desktop Sidebar ──
export function Sidebar({ userName, userImage, userLevel, userXp }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  const firstName = userName.split(" ")[0];

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: "var(--navy-deep)", borderRight: "0.5px solid rgba(255,255,255,0.06)" }}>

      <div className="px-6 py-6 shrink-0">
        <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "var(--caramel)" }}>
          atomicme
        </span>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto pb-2">
        {/* Hábitos section */}
        <p className="text-[10px] uppercase tracking-widest px-3 pb-1 pt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
          Hábitos
        </p>
        {habitosItems.map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}

        {/* Mente section */}
        <div className="mt-3 mb-1">
          <p className="text-[10px] uppercase tracking-widest px-3 pb-1" style={{ color: "rgba(167,139,250,0.5)" }}>
            Mente &amp; Emoções
          </p>
        </div>
        {menteItems.map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} purple />
        ))}
      </nav>

      <div className="px-3 pb-4 shrink-0">
        <div className="rounded-[12px] p-3 flex flex-col gap-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            {userImage ? (
              <img src={userImage} alt={userName} className="w-8 h-8 rounded-full object-cover"
                style={{ border: "1.5px solid var(--caramel)" }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{ background: "var(--navy)", color: "var(--caramel)", border: "1.5px solid var(--caramel)" }}>
                {firstName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--offwhite)" }}>{firstName}</p>
              <p className="text-[11px]" style={{ color: "var(--caramel)" }}>Nível {userLevel} · {userXp} XP</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-all hover:opacity-70 flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}>
            <IconLogout />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile Bottom Nav ──
export function MobileNav({ userName, userImage, userLevel, userXp }: SidebarProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  const firstName = userName.split(" ")[0];

  const moreItems = [
    { href: "/stacking",         label: "Stacking",    Icon: IconStacking,     purple: false },
    { href: "/conquistas",       label: "Conquistas",  Icon: IconAchievements, purple: false },
    { href: "/identidade",       label: "Identidade",  Icon: IconIdentity,     purple: false },
    { href: "/recompensas",      label: "Recompensas", Icon: IconRewards,      purple: false },
    { href: "/emocoes/diario",   label: "Diário",      Icon: IconMind,         purple: true  },
    { href: "/emocoes/quiz",     label: "Quiz",        Icon: IconMind,         purple: true  },
    { href: "/emocoes/thought",  label: "Pensamentos", Icon: IconMind,         purple: true  },
    { href: "/emocoes/estrategias", label: "Estratégias", Icon: IconMind,      purple: true  },
  ];

  const isMoreActive = moreItems.some((i) => isActive(i.href));

  return (
    <>
      {showMore && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-[60px] left-0 right-0 z-50 rounded-t-[16px] overflow-hidden"
            style={{ background: "var(--offwhite)", border: "0.5px solid var(--border-light)", boxShadow: "0 -4px 24px rgba(0,0,0,0.08)" }}>

            <div className="px-4 py-4 flex items-center gap-3"
              style={{ borderBottom: "0.5px solid var(--border-light)" }}>
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
                <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{userName}</p>
                <p className="text-xs" style={{ color: "var(--caramel)" }}>Nível {userLevel} · {userXp} XP</p>
              </div>
            </div>

            <div className="px-3 py-2 grid grid-cols-2 gap-1">
              {moreItems.map(({ href, label, Icon, purple }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} onClick={() => setShowMore(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all"
                    style={{
                      color: active ? (purple ? "#a78bfa" : "var(--caramel)") : "var(--text-dark)",
                      background: active ? (purple ? "rgba(167,139,250,0.1)" : "var(--caramel-pale)") : "var(--offwhite-2)",
                    }}>
                    <Icon active={active} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-3 pb-4 pt-1" style={{ borderTop: "0.5px solid var(--border-light)" }}>
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] hover:opacity-70 transition-all"
                style={{ color: "var(--text-muted)" }}>
                <IconLogout />
                <span className="text-sm font-medium">Sair da conta</span>
              </button>
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
        style={{ background: "var(--offwhite)", borderTop: "0.5px solid var(--border-light)", height: "60px" }}>
        {mobileMainItems.map(({ href, label, Icon, purple }) => {
          const active = isActive(href);
          const color = active ? (purple ? "#a78bfa" : "var(--caramel)") : "var(--text-muted)";
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 relative"
              style={{ color }}>
              <Icon active={active} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: color }} />}
            </Link>
          );
        })}
        <button onClick={() => setShowMore(!showMore)}
          className="flex flex-col items-center gap-0.5 flex-1 py-2"
          style={{ color: isMoreActive || showMore ? "var(--caramel)" : "var(--text-muted)" }}>
          <IconMore />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </nav>
    </>
  );
}

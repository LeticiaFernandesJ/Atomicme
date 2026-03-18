"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName: string;
  userImage?: string | null;
  userLevel: number;
  userXp: number;
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.15" : "0"} />
    </svg>
  );
}
function IconHabits({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconStacking({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <rect x="3" y="10" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <rect x="3" y="16" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
    </svg>
  );
}
function IconAchievements({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.85 8.77L22 9.27L16.82 13.97L18.47 21L12 17.27L5.53 21L7.18 13.97L2 9.27L9.15 8.77L12 2Z"
        stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinejoin="round"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.15" : "0"} />
    </svg>
  );
}
function IconIdentity({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" />
    </svg>
  );
}
function IconRewards({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.1" : "0"} />
      <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 22V7" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" />
      <path d="M12 7H7.5C6.12 7 5 5.88 5 4.5C5 3.12 6.12 2 7.5 2C10 2 12 7 12 7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7H16.5C17.88 7 19 5.88 19 4.5C19 3.12 17.88 2 16.5 2C14 2 12 7 12 7Z" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { href: "/dashboard",   label: "Início",      Icon: IconHome },
  { href: "/habitos",     label: "Hábitos",     Icon: IconHabits },
  { href: "/stacking",    label: "Stacking",    Icon: IconStacking },
  { href: "/conquistas",  label: "Conquistas",  Icon: IconAchievements },
  { href: "/identidade",  label: "Identidade",  Icon: IconIdentity },
  { href: "/recompensas", label: "Recompensas", Icon: IconRewards },
];

export function Sidebar({ userName, userImage, userLevel, userXp }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const firstName = userName.split(" ")[0];

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: "var(--navy-deep)", borderRight: "0.5px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 shrink-0">
        <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "var(--caramel)" }}>
          atomicme
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-150 group"
              style={{
                background: active ? "rgba(196,136,74,0.12)" : "transparent",
                color: active ? "var(--caramel)" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon active={active} />
              <span className="font-medium">{label}</span>
              {active && (
                <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "var(--caramel)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4 shrink-0">
        <div
          className="rounded-[12px] p-3 flex flex-col gap-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)" }}
        >
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

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-xs py-1.5 px-2 rounded-[8px] transition-all hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

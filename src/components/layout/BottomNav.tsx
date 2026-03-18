"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.15" : "0"}
      />
    </svg>
  );
}

function IconHabits({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.12" : "0"}
      />
      <path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStacking({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <rect x="3" y="10" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <rect x="3" y="16" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
    </svg>
  );
}

function IconAchievements({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.85 8.77L22 9.27L16.82 13.97L18.47 21L12 17.27L5.53 21L7.18 13.97L2 9.27L9.15 8.77L12 2Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.15" : "0"}
      />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} fill={active ? "currentColor" : "none"} fillOpacity={active ? "0.12" : "0"} />
      <path d="M4 20C4 17 7.58172 14 12 14C16.4183 14 20 17 20 20" stroke="currentColor" strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: null },
  { href: "/habitos", label: "Hábitos", icon: null },
  { href: "/stacking", label: "Stacking", icon: null },
  { href: "/conquistas", label: "Conquistas", icon: null },
  { href: "/identidade", label: "Perfil", icon: null },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
      style={{
        background: "var(--offwhite)",
        borderTop: "0.5px solid var(--border-light)",
        height: "64px",
      }}
    >
      {navItems.map((item, i) => {
        const active = isActive(item.href);
        const icons = [IconHome, IconHabits, IconStacking, IconAchievements, IconProfile];
        const IconComponent = icons[i];

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 flex-1 py-2 relative"
            style={{ color: active ? "var(--caramel)" : "var(--text-muted)" }}
          >
            <IconComponent active={active} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {active && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: "var(--caramel)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

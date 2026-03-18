import type { ReactNode } from "react";

interface AppBarProps {
  title?: string;
  dark?: boolean;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  children?: ReactNode;
}

export function AppBar({ title, dark = false, leftContent, rightContent, children }: AppBarProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 mb-6"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leftContent}
        {title && (
          <h1
            className="text-xl font-medium"
            style={{ color: "var(--text-dark)" }}
          >
            {title}
          </h1>
        )}
        {children}
      </div>
      {rightContent && (
        <div className="flex items-center gap-2 shrink-0">{rightContent}</div>
      )}
    </div>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="text-xs font-medium tracking-[0.2em] uppercase"
      style={{ color: dark ? "var(--caramel-pale)" : "var(--navy)" }}
    >
      atomicme
    </span>
  );
}

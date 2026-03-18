import type { ReactNode } from "react";

interface BookQuoteProps {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function BookQuote({ eyebrow, children, className = "" }: BookQuoteProps) {
  return (
    <div
      className={[
        "rounded-[8px] px-4 py-3",
        "border-l-2",
        className,
      ].join(" ")}
      style={{
        background: "var(--caramel-pale)",
        borderLeftColor: "var(--caramel)",
      }}
    >
      {eyebrow && (
        <p
          className="text-[10px] font-medium uppercase tracking-widest mb-1"
          style={{ color: "var(--caramel)" }}
        >
          {eyebrow}
        </p>
      )}
      <p
        className="text-sm italic leading-relaxed"
        style={{ color: "var(--brown)" }}
      >
        {children}
      </p>
    </div>
  );
}

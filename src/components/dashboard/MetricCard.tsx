interface MetricCardProps {
  value: string | number;
  label: string;
  suffix?: string;
  highlight?: boolean;
}

export function MetricCard({ value, label, suffix, highlight = false }: MetricCardProps) {
  return (
    <div
      className="rounded-[12px] p-3 flex flex-col gap-1"
      style={{
        background: "var(--offwhite-2)",
        border: "0.5px solid var(--border-light)",
      }}
    >
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-xl font-medium leading-none"
          style={{ color: highlight ? "var(--caramel)" : "var(--text-dark)" }}
        >
          {value}
        </span>
        {suffix && (
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {suffix}
          </span>
        )}
      </div>
      <span
        className="text-[11px] leading-tight"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

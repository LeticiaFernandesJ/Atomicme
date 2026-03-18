interface HeatmapProps {
  data: { date: string; count: number; total: number }[];
}

const INTENSITY_COLORS = [
  "var(--border-light)",   // 0 — none
  "var(--caramel-pale)",   // 1 — low
  "var(--caramel-muted)",  // 2 — medium
  "var(--caramel-light)",  // 3 — high
  "var(--brown)",          // 4 — full
];

function getIntensity(count: number, total: number): number {
  if (total === 0 || count === 0) return 0;
  const ratio = count / total;
  if (ratio >= 1) return 4;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function Heatmap({ data }: HeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 21 day cells (oldest first)
  const cells = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (20 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayData = data.find((d) => d.date === dateStr);
    const count = dayData?.count ?? 0;
    const total = dayData?.total ?? 0;
    const intensity = getIntensity(count, total);
    const isToday = i === 20;
    return { dateStr, count, total, intensity, isToday };
  });

  // Day labels (week days, abbreviated)
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 20);
  const startDayOfWeek = startDay.getDay();

  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background: "var(--offwhite-2)",
        border: "0.5px solid var(--border-light)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Últimos 21 dias
        </p>
        <div className="flex items-center gap-1">
          {INTENSITY_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-[3px]"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(21, 1fr)" }}>
        {cells.map((cell) => (
          <div
            key={cell.dateStr}
            className="aspect-square rounded-[3px] relative group"
            style={{
              background: INTENSITY_COLORS[cell.intensity],
              outline: cell.isToday ? "1.5px solid var(--caramel)" : "none",
              outlineOffset: "1px",
            }}
            title={`${formatDate(cell.dateStr)}: ${cell.count}/${cell.total} hábitos`}
          />
        ))}
      </div>

      {/* Week labels */}
      <div className="flex justify-between mt-2 px-0.5">
        {["3 sem", "2 sem", "1 sem", "hoje"].map((label) => (
          <span
            key={label}
            className="text-[9px]"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface HabitLogCalendarProps {
  logs: { date: Date; done: boolean }[];
}

export function HabitLogCalendar({ logs }: HabitLogCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const log = logs.find((l) => {
      const d = new Date(l.date);
      return d >= date && d < nextDate;
    });

    const isToday = i === 29;
    const isFuture = date > today;

    return {
      date,
      done: log?.done ?? false,
      logged: !!log,
      isToday,
      isFuture,
    };
  });

  return (
    <div
      className="rounded-[12px] p-4"
      style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}
    >
      <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
        Histórico — últimos 30 dias
      </p>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className="aspect-square rounded-[4px] relative"
            style={{
              background: cell.done
                ? "var(--caramel)"
                : cell.logged
                ? "rgba(180,160,140,0.3)"
                : "var(--border-light)",
              outline: cell.isToday ? "1.5px solid var(--caramel)" : "none",
              outlineOffset: "1px",
            }}
            title={`${cell.date.toLocaleDateString("pt-BR")}: ${cell.done ? "feito ✓" : cell.logged ? "não feito" : "sem registro"}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "var(--caramel)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>feito</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "rgba(180,160,140,0.3)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>não feito</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "var(--border-light)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>sem registro</span>
        </div>
      </div>
    </div>
  );
}

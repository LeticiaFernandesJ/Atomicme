"use client";

import { useTransition } from "react";
import { toggleHabitLog } from "@/app/(app)/dashboard/actions";

interface HabitRowProps {
  id: string;
  name: string;
  trigger: string;
  streak: number;
  doneToday: boolean;
  identityName?: string | null;
}

export function HabitRow({
  id,
  name,
  trigger,
  streak,
  doneToday,
  identityName,
}: HabitRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleHabitLog(id, !doneToday);
    });
  }

  return (
    <div
      className="rounded-[12px] p-4 flex items-center gap-3 transition-opacity"
      style={{
        background: "var(--offwhite-2)",
        border: "0.5px solid var(--border-light)",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {/* Ring button */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={doneToday ? "Desmarcar hábito" : "Marcar hábito como feito"}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={
          doneToday
            ? { background: "var(--navy)", border: "none" }
            : {
                background: "transparent",
                border: "1.5px solid var(--border)",
              }
        }
      >
        {doneToday && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 6.5L5.5 9.5L10.5 4"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: doneToday ? "var(--text-muted)" : "var(--text-dark)",
            textDecoration: doneToday ? "line-through" : "none",
          }}
        >
          {name}
        </p>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {trigger}
        </p>
        {identityName && (
          <p
            className="text-[10px] mt-0.5 truncate"
            style={{ color: "var(--caramel)" }}
          >
            {identityName}
          </p>
        )}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs" style={{ color: "var(--caramel)" }}>
            🔥
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--caramel)" }}
          >
            {streak}
          </span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  removeHabitFromStack,
  reorderStackItems,
  completeStack,
  addHabitToStack,
} from "@/app/(app)/stacking/actions";

interface StackItem {
  id: string;
  order: number;
  habit: {
    id: string;
    name: string;
    trigger: string;
    streak: number;
  };
}

interface AvailableHabit {
  id: string;
  name: string;
  trigger: string;
}

interface StackChainProps {
  stack: {
    id: string;
    name: string;
    items: StackItem[];
  };
  availableHabits: AvailableHabit[];
  completionRate: number;
  completedToday: boolean;
}

export function StackChain({
  stack,
  availableHabits,
  completionRate,
  completedToday,
}: StackChainProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [xpFlash, setXpFlash] = useState(false);

  const sorted = [...stack.items].sort((a, b) => a.order - b.order);

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const newOrder = [...sorted];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    startTransition(async () => {
      await reorderStackItems({
        stackId: stack.id,
        orderedIds: newOrder.map((i) => i.id),
      });
    });
  }

  function handleMoveDown(index: number) {
    if (index === sorted.length - 1) return;
    const newOrder = [...sorted];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    startTransition(async () => {
      await reorderStackItems({
        stackId: stack.id,
        orderedIds: newOrder.map((i) => i.id),
      });
    });
  }

  function handleRemove(stackItemId: string) {
    startTransition(async () => {
      await removeHabitFromStack(stackItemId);
    });
  }

  function handleAddHabit(habitId: string) {
    setShowAddPicker(false);
    startTransition(async () => {
      await addHabitToStack({ stackId: stack.id, habitId });
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeStack(stack.id);
      if (result.success) {
        setXpFlash(true);
        setTimeout(() => setXpFlash(false), 2000);
      }
    });
  }

  const notInStack = availableHabits.filter(
    (h) => !stack.items.some((item) => item.habit.id === h.id)
  );

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        border: "0.5px solid var(--border-light)",
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Stack header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--navy)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--offwhite)" }}>
          {stack.name}
        </p>
        <div className="flex items-center gap-2">
          {xpFlash && (
            <span
              className="text-xs font-medium animate-bounce"
              style={{ color: "var(--caramel)" }}
            >
              +25 XP ✨
            </span>
          )}
          {completedToday ? (
            <span
              className="text-[10px] font-medium px-2 py-1 rounded-full"
              style={{ background: "var(--caramel)", color: "var(--navy-deep)" }}
            >
              Feito hoje ✓
            </span>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isPending || sorted.length === 0}
              className="text-[10px] font-medium px-2 py-1 rounded-full transition-all hover:opacity-80"
              style={{ background: "var(--caramel)", color: "var(--navy-deep)" }}
            >
              Completar tudo
            </button>
          )}
        </div>
      </div>

      {/* Formula card */}
      {sorted.length >= 2 && (
        <div
          className="px-4 py-3"
          style={{ background: "rgba(196,136,74,0.06)", borderBottom: "0.5px solid var(--border-light)" }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: "var(--caramel)" }}>
            Fórmula
          </p>
          <p className="text-xs italic leading-relaxed" style={{ color: "var(--text-mid)" }}>
            &ldquo;Depois de{" "}
            <span style={{ color: "var(--caramel)", fontStyle: "normal" }} className="font-medium">
              {sorted[0].habit.name}
            </span>
            , vou fazer{" "}
            <span style={{ color: "var(--caramel)", fontStyle: "normal" }} className="font-medium">
              {sorted[1].habit.name}
            </span>
            {sorted.length > 2 && (
              <>
                {" "}e mais{" "}
                <span style={{ color: "var(--caramel)", fontStyle: "normal" }} className="font-medium">
                  {sorted.length - 2} {sorted.length - 2 === 1 ? "hábito" : "hábitos"}
                </span>
              </>
            )}.&rdquo;
          </p>
        </div>
      )}

      {/* Chain nodes */}
      <div className="flex flex-col" style={{ background: "var(--offwhite)" }}>
        {sorted.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nenhum hábito nesta corrente ainda.
            </p>
          </div>
        ) : (
          sorted.map((item, index) => (
            <div key={item.id}>
              {/* Node */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Dot */}
                <div className="flex flex-col items-center shrink-0" style={{ width: "20px" }}>
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: "var(--caramel)" }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
                    {item.habit.name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {item.habit.trigger}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isPending}
                    className="w-6 h-6 flex items-center justify-center rounded-[6px] disabled:opacity-20 transition-opacity hover:opacity-60"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sorted.length - 1 || isPending}
                    className="w-6 h-6 flex items-center justify-center rounded-[6px] disabled:opacity-20 transition-opacity hover:opacity-60"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isPending}
                    className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:opacity-60 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Connector line + "então..." label */}
              {index < sorted.length - 1 && (
                <div className="flex items-center gap-3 px-4 py-1">
                  <div className="flex flex-col items-center shrink-0" style={{ width: "20px" }}>
                    <div className="w-px flex-1" style={{ height: "20px", background: "var(--border)" }} />
                  </div>
                  <span
                    className="text-[11px] italic"
                    style={{ color: "var(--text-muted)" }}
                  >
                    então...
                  </span>
                </div>
              )}
            </div>
          ))
        )}

        {/* Add habit button */}
        <div className="px-4 pb-4 pt-2">
          {!showAddPicker ? (
            <button
              onClick={() => setShowAddPicker(true)}
              disabled={notInStack.length === 0}
              className="w-full rounded-[10px] py-2.5 text-sm transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                border: "0.5px dashed var(--border)",
                color: "var(--text-muted)",
                background: "transparent",
              }}
            >
              {notInStack.length === 0 ? "Todos os hábitos já estão nesta corrente" : "+ Adicionar à corrente"}
            </button>
          ) : (
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ border: "0.5px solid var(--border)" }}
            >
              <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ background: "var(--offwhite-2)", borderBottom: "0.5px solid var(--border-light)" }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--text-mid)" }}>
                  Escolha um hábito
                </p>
                <button
                  onClick={() => setShowAddPicker(false)}
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancelar
                </button>
              </div>
              {notInStack.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => handleAddHabit(habit.id)}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-2 hover:opacity-70 transition-opacity"
                  style={{ borderBottom: "0.5px solid var(--border-light)", background: "var(--offwhite)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--caramel)" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: "var(--text-dark)" }}>{habit.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{habit.trigger}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consistency bar */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: "var(--offwhite-2)", borderTop: "0.5px solid var(--border-light)" }}
      >
        <p className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
          Consistência
        </p>
        <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: "var(--border-light)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%`, background: "var(--caramel)" }}
          />
        </div>
        <p
          className="text-xs font-medium shrink-0"
          style={{ color: completionRate >= 70 ? "var(--caramel)" : "var(--navy)" }}
        >
          {completionRate}%
        </p>
      </div>
    </div>
  );
}

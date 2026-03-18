"use client";

import { useState } from "react";
import { CreateStackForm } from "@/components/stacking/CreateStackForm";
import { StackChain } from "@/components/stacking/StackChain";
import { DeleteStackButton } from "@/components/stacking/DeleteStackButton";
import { BookQuote } from "@/components/ui/BookQuote";

interface Habit {
  id: string;
  name: string;
  trigger: string;
  streak: number;
}

interface StackItem {
  id: string;
  order: number;
  habit: Habit;
}

interface Stack {
  id: string;
  name: string;
  items: StackItem[];
}

interface StackingClientProps {
  stacks: Stack[];
  allHabits: Habit[];
  todayCompletedHabitIds: Set<string>;
  stackCompletionRates: Record<string, number>;
}

export function StackingClient({
  stacks,
  allHabits,
  todayCompletedHabitIds,
  stackCompletionRates,
}: StackingClientProps) {
  const [showCreate, setShowCreate] = useState(false);

  function isStackCompletedToday(stack: Stack): boolean {
    return (
      stack.items.length > 0 &&
      stack.items.every((item) => todayCompletedHabitIds.has(item.habit.id))
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
      {/* Book quote */}
      <BookQuote eyebrow="Habit Stacking">
        &ldquo;Depois de [hábito atual], vou fazer [novo hábito].&rdquo;
      </BookQuote>

      {/* Create new stack */}
      {showCreate ? (
        <CreateStackForm
          habits={allHabits}
          onDone={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full rounded-[12px] py-3 text-sm font-medium transition-all hover:opacity-80"
          style={{
            border: "0.5px dashed var(--border)",
            color: "var(--text-muted)",
            background: "transparent",
          }}
        >
          + Nova corrente
        </button>
      )}

      {/* Stack list */}
      {stacks.length === 0 && !showCreate ? (
        <div
          className="rounded-[12px] p-6 flex flex-col items-center gap-2 text-center"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}
        >
          <p className="text-2xl">🔗</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
            Nenhuma corrente ainda
          </p>
          <p className="text-xs max-w-[220px]" style={{ color: "var(--text-muted)" }}>
            Encadeie hábitos para criar rotinas automáticas.
          </p>
        </div>
      ) : (
        stacks.map((stack) => (
          <div key={stack.id} className="flex flex-col gap-1">
            <StackChain
              stack={stack}
              availableHabits={allHabits}
              completionRate={stackCompletionRates[stack.id] ?? 0}
              completedToday={isStackCompletedToday(stack)}
            />
            <div className="flex justify-end px-1">
              <DeleteStackButton stackId={stack.id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

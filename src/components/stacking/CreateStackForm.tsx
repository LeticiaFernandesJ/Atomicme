"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createStack } from "@/app/(app)/stacking/actions";

interface AvailableHabit {
  id: string;
  name: string;
  trigger: string;
}

interface CreateStackFormProps {
  habits: AvailableHabit[];
  onDone: () => void;
  onCancel: () => void;
}

export function CreateStackForm({ habits, onDone, onCancel }: CreateStackFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggleHabit(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (name.trim().length < 2) { setError("Dê um nome à corrente"); return; }
    if (selected.length < 2) { setError("Selecione pelo menos 2 hábitos"); return; }
    setError("");

    startTransition(async () => {
      const result = await createStack({ name: name.trim(), habitIds: selected });
      if (result.success) {
        onDone();
      } else {
        setError(result.error ?? "Erro ao criar corrente");
      }
    });
  }

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ border: "0.5px solid var(--border-light)", background: "var(--offwhite)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--navy-deep)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--offwhite)" }}>
          Nova corrente
        </p>
        <button onClick={onCancel} style={{ color: "var(--text-muted)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <Input
          label="Nome da corrente"
          placeholder="Ex: Rotina matinal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
            Hábitos na corrente
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            A ordem de seleção define a sequência.
          </p>

          {habits.length === 0 ? (
            <p className="text-sm py-3 text-center" style={{ color: "var(--text-muted)" }}>
              Crie hábitos primeiro para montar uma corrente.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {habits.map((habit, i) => {
                const selIdx = selected.indexOf(habit.id);
                const isSelected = selIdx !== -1;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="w-full text-left rounded-[10px] p-3 flex items-center gap-3 transition-all"
                    style={{
                      background: isSelected ? "var(--navy-deep)" : "var(--offwhite-2)",
                      border: isSelected ? "0.5px solid var(--caramel)" : "0.5px solid var(--border-light)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 transition-all"
                      style={
                        isSelected
                          ? { background: "var(--caramel)", color: "var(--navy-deep)" }
                          : { background: "var(--border-light)", color: "var(--text-muted)" }
                      }
                    >
                      {isSelected ? selIdx + 1 : ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: isSelected ? "var(--offwhite)" : "var(--text-dark)" }}
                      >
                        {habit.name}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: isSelected ? "var(--caramel-muted)" : "var(--text-muted)" }}
                      >
                        {habit.trigger}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected.length >= 2 && (
          <div
            className="rounded-[10px] p-3"
            style={{ background: "rgba(196,136,74,0.06)", border: "0.5px solid var(--caramel-muted)" }}
          >
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: "var(--caramel)" }}>
              Pré-visualização
            </p>
            <p className="text-xs italic" style={{ color: "var(--text-mid)" }}>
              &ldquo;Depois de{" "}
              <span style={{ color: "var(--caramel)", fontStyle: "normal" }} className="font-medium">
                {habits.find((h) => h.id === selected[0])?.name}
              </span>
              , vou fazer{" "}
              <span style={{ color: "var(--caramel)", fontStyle: "normal" }} className="font-medium">
                {habits.find((h) => h.id === selected[1])?.name}
              </span>
              .&rdquo;
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isPending} disabled={habits.length === 0} className="flex-1">
            Criar corrente
          </Button>
        </div>
      </div>
    </div>
  );
}

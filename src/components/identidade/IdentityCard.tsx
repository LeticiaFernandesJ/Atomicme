"use client";

import { useState, useTransition } from "react";
import { updateIdentity, deleteIdentity } from "@/app/(app)/identidade/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface IdentityCardProps {
  identity: {
    id: string;
    name: string;
    xp: number;
    habits: { id: string; name: string; streak: number; active: boolean }[];
  };
}

export function IdentityCard({ identity }: IdentityCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(identity.name);
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    if (name.trim().length < 2) { setError("Nome muito curto"); return; }
    setError("");
    startTransition(async () => {
      const result = await updateIdentity({ id: identity.id, name: name.trim() });
      if (result.success) setIsEditing(false);
      else setError(result.error ?? "Erro ao salvar");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteIdentity(identity.id);
    });
  }

  const activeHabits = identity.habits.filter((h) => h.active);

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ border: "0.5px solid var(--border-light)" }}
    >
      {/* Header */}
      <div className="p-4 flex flex-col gap-3" style={{ background: "var(--navy-deep)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--caramel)" }}>
          Sou uma pessoa que
        </p>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b text-base italic outline-none"
              style={{ color: "var(--offwhite)", borderColor: "var(--caramel)" }}
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(false); setName(identity.name); }}
                className="text-xs" style={{ color: "var(--text-muted)" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isPending}
                className="text-xs font-medium" style={{ color: "var(--caramel)" }}>
                {isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-base italic leading-snug flex-1" style={{ color: "var(--offwhite)" }}>
              {identity.name}
            </p>
            <button onClick={() => setIsEditing(true)} className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity"
              style={{ color: "var(--caramel-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* XP */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--caramel)" }}>✦</span>
          <span className="text-xs" style={{ color: "var(--caramel-muted)" }}>{identity.xp} XP nesta identidade</span>
        </div>
      </div>

      {/* Habits linked */}
      <div className="p-3 flex flex-col gap-2" style={{ background: "var(--offwhite-2)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Hábitos vinculados — {activeHabits.length}
        </p>
        {activeHabits.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nenhum hábito vinculado ainda.</p>
        ) : (
          activeHabits.map((h) => (
            <div key={h.id} className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--text-dark)" }}>{h.name}</p>
              {h.streak > 0 && (
                <span className="text-xs" style={{ color: "var(--caramel)" }}>🔥 {h.streak}</span>
              )}
            </div>
          ))
        )}

        {/* Delete */}
        <div className="flex justify-end pt-1">
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Excluir identidade
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Confirmar?</span>
              <button onClick={() => setShowDelete(false)} className="text-[10px]" style={{ color: "var(--text-muted)" }}>Não</button>
              <button onClick={handleDelete} disabled={isPending} className="text-[10px] font-medium" style={{ color: "#ef4444" }}>
                {isPending ? "..." : "Sim, excluir"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

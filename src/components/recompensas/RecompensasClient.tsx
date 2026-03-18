"use client";

import { useState, useTransition } from "react";
import { createReward, deleteReward } from "@/app/(app)/recompensas/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Reward {
  id: string;
  name: string;
  daysRequired: number;
}

interface RecompensasClientProps {
  rewards: Reward[];
  maxStreak: number;
}

export function RecompensasClient({ rewards, maxStreak }: RecompensasClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState("7");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    if (name.trim().length < 2) { setError("Dê um nome à recompensa"); return; }
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 0) { setError("Dias inválidos"); return; }
    setError("");

    startTransition(async () => {
      const result = await createReward({ name: name.trim(), daysRequired: daysNum });
      if (result.success) { setName(""); setDays("7"); setShowForm(false); }
      else setError(result.error ?? "Erro");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteReward(id);
    });
  }

  const unlocked = rewards.filter((r) => maxStreak >= r.daysRequired);
  const locked = rewards.filter((r) => maxStreak < r.daysRequired);

  return (
    <div className="flex flex-col gap-4">
      {/* Create form */}
      {showForm ? (
        <div className="rounded-[12px] p-4 flex flex-col gap-3"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nova recompensa</p>
          <Input
            label="Descrição"
            placeholder="Ex: Assistir um filme sem culpa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Dias de streak necessários"
            type="number"
            min="0"
            max="365"
            placeholder="7"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setShowForm(false); setError(""); }} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCreate} loading={isPending} className="flex-1">
              Criar
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-[12px] py-3 text-sm transition-all hover:opacity-80"
          style={{ border: "0.5px dashed var(--border)", color: "var(--text-muted)", background: "transparent" }}
        >
          + Nova recompensa
        </button>
      )}

      {rewards.length === 0 && !showForm && (
        <div className="rounded-[12px] p-6 text-center flex flex-col items-center gap-2"
          style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
          <p className="text-2xl">🎁</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nenhuma recompensa ainda</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Crie recompensas vinculadas a dias de streak.
          </p>
        </div>
      )}

      {/* Unlocked rewards */}
      {unlocked.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Disponíveis — {unlocked.length}
          </p>
          {unlocked.map((reward) => (
            <RewardItem
              key={reward.id}
              reward={reward}
              unlocked
              maxStreak={maxStreak}
              onDelete={() => handleDelete(reward.id)}
              isPending={isPending}
            />
          ))}
        </section>
      )}

      {/* Locked rewards */}
      {locked.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Bloqueadas — {locked.length}
          </p>
          {locked.map((reward) => (
            <RewardItem
              key={reward.id}
              reward={reward}
              unlocked={false}
              maxStreak={maxStreak}
              onDelete={() => handleDelete(reward.id)}
              isPending={isPending}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RewardItem({
  reward,
  unlocked,
  maxStreak,
  onDelete,
  isPending,
}: {
  reward: Reward;
  unlocked: boolean;
  maxStreak: number;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const progress = reward.daysRequired > 0
    ? Math.min((maxStreak / reward.daysRequired) * 100, 100)
    : 100;

  return (
    <div
      className="rounded-[12px] p-4 flex flex-col gap-2 transition-opacity"
      style={{
        background: unlocked ? "var(--caramel-pale)" : "var(--offwhite-2)",
        border: unlocked ? "0.5px solid var(--caramel-muted)" : "0.5px solid var(--border-light)",
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style={{ background: unlocked ? "var(--caramel)" : "var(--border)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: unlocked ? "var(--brown)" : "var(--text-dark)" }}>
              {reward.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: unlocked ? "var(--caramel)" : "var(--text-muted)" }}>
              {reward.daysRequired === 0 ? "Disponível sempre" : `${reward.daysRequired} dias de streak`}
              {unlocked && reward.daysRequired > 0 && " ✓"}
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)} className="shrink-0 hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4H12M5 4V2H9V4M6 7V11M8 7V11M3 4L4 12H10L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setShowConfirm(false)} className="text-[10px]" style={{ color: "var(--text-muted)" }}>Não</button>
            <button onClick={onDelete} disabled={isPending} className="text-[10px] font-medium" style={{ color: "#ef4444" }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for locked */}
      {!unlocked && reward.daysRequired > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: "2px", background: "var(--border-light)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--caramel-muted)" }} />
          </div>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {maxStreak}/{reward.daysRequired}d
          </span>
        </div>
      )}
    </div>
  );
}

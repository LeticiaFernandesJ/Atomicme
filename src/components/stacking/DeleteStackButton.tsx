"use client";

import { useTransition, useState } from "react";
import { deleteStack } from "@/app/(app)/stacking/actions";

export function DeleteStackButton({ stackId }: { stackId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteStack(stackId);
    });
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-[10px] hover:opacity-60 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        Excluir
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Confirmar?</span>
      <button onClick={() => setConfirm(false)} className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        Não
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-[10px] font-medium"
        style={{ color: "#ef4444" }}
      >
        {isPending ? "..." : "Sim"}
      </button>
    </div>
  );
}

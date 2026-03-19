"use client";

import { useState, useTransition } from "react";
import { createIdentity } from "@/app/(app)/identidade/actions";

export function CreateIdentityForm() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit() {
    if (name.trim().length < 2) { setError("Escreva a identidade"); return; }
    setError("");
    startTransition(async () => {
      const result = await createIdentity({ name: name.trim() });
      if (result.success) { setName(""); setShow(false); }
      else setError(result.error ?? "Erro");
    });
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full rounded-[12px] py-3 text-sm transition-all hover:opacity-80"
        style={{ border: "0.5px dashed var(--border)", color: "var(--text-muted)", background: "transparent" }}
      >
        + Nova identidade
      </button>
    );
  }

  return (
    <div
      className="rounded-[12px] p-4 flex flex-col gap-3"
      style={{ background: "var(--navy-deep)", border: "0.5px solid var(--border-light)" }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-widest"
        style={{ color: "var(--caramel)" }}
      >
        Sou uma pessoa que
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="pratica exercícios regularmente"
        className="w-full bg-transparent border-b text-base italic outline-none placeholder:text-[var(--text-muted)] placeholder:not-italic"
        style={{ color: "var(--offwhite)", borderColor: "var(--caramel)" }}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      {name.length > 0 && (
        <p className="text-xs italic" style={{ color: "var(--caramel-muted)" }}>
          &ldquo;Sou uma pessoa que {name}&rdquo;
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => { setShow(false); setName(""); }}
          className="text-xs flex-1 py-2 rounded-[8px]"
          style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="text-xs font-medium flex-1 py-2 rounded-[8px]"
          style={{ background: "var(--caramel)", color: "var(--navy-deep)" }}
        >
          {isPending ? "Criando..." : "Criar identidade"}
        </button>
      </div>
    </div>
  );
}

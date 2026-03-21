"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { EMOTIONS } from "@/lib/emotions";
import { createThoughtRecord } from "@/app/(app)/emocoes/actions";

const STEPS = [
  { title: "Situação",            subtitle: "O que aconteceu?"                             },
  { title: "Emoção",              subtitle: "O que você sentiu?"                           },
  { title: "Pensamento automático",subtitle: "O que passou pela sua cabeça?"               },
  { title: "Evidências",          subtitle: "O que apoia ou contradiz esse pensamento?"    },
  { title: "Perspectiva alternativa", subtitle: "Como você pode ver isso de forma mais equilibrada?" },
];

interface ThoughtRecord {
  id: string;
  date: Date;
  situation: string;
  emotion: string;
  intensityBefore: number;
  intensityAfter: number | null;
  autoThought: string;
  alternativeThought: string | null;
  completed: boolean;
}

export default function ThoughtPage() {
  const [view, setView] = useState<"list" | "new">("list");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/emocoes" className="text-sm hover:opacity-70" style={{ color: "#a78bfa" }}>← Mente &amp; Emoções</Link>
          <h1 className="text-xl font-medium mt-1" style={{ color: "var(--text-dark)" }}>Desafio de Pensamento</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Reestruturação cognitiva em 5 etapas</p>
        </div>
        {view === "list" && (
          <button onClick={() => setView("new")}
            className="px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: "#7c3aed", color: "white" }}>
            + Novo
          </button>
        )}
      </div>

      {view === "new" ? (
        <ThoughtWizard onDone={() => setView("list")} onCancel={() => setView("list")} />
      ) : (
        <ThoughtList />
      )}
    </div>
  );
}

function ThoughtWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [situation, setSituation]               = useState("");
  const [emotion, setEmotion]                   = useState("");
  const [intensityBefore, setIntensityBefore]   = useState(50);
  const [autoThought, setAutoThought]           = useState("");
  const [evidenceFor, setEvidenceFor]           = useState("");
  const [evidenceAgainst, setEvidenceAgainst]   = useState("");
  const [alternative, setAlternative]           = useState("");
  const [intensityAfter, setIntensityAfter]     = useState(50);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  function canAdvance() {
    if (step === 0) return situation.trim().length >= 3;
    if (step === 1) return emotion.length > 0;
    if (step === 2) return autoThought.trim().length >= 3;
    if (step === 3) return true;
    return alternative.trim().length >= 3;
  }

  function handleFinish() {
    startTransition(async () => {
      await createThoughtRecord({
        situation, emotion, intensityBefore, intensityAfter,
        autoThought, evidenceFor: evidenceFor || undefined,
        evidenceAgainst: evidenceAgainst || undefined,
        alternativeThought: alternative, completed: true,
      });
      onDone();
    });
  }

  const selectedEmotion = EMOTIONS.find((e) => e.key === emotion);

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Etapa {step + 1} de {STEPS.length}</p>
          <p className="text-xs font-medium" style={{ color: "#a78bfa" }}>{progress}%</p>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 rounded-full transition-all"
              style={{ height: "3px", background: i <= step ? "#7c3aed" : "var(--border-light)" }} />
          ))}
        </div>
        <p className="text-base font-medium" style={{ color: "var(--text-dark)" }}>{STEPS[step].title}</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{STEPS[step].subtitle}</p>
      </div>

      {/* Step content */}
      <div className="rounded-[12px] p-4 flex flex-col gap-4"
        style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>

        {step === 0 && (
          <textarea placeholder="Descreva o que aconteceu de forma objetiva..." value={situation}
            onChange={(e) => setSituation(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none"
            style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {EMOTIONS.map((em) => (
                <button key={em.key} onClick={() => setEmotion(em.key)}
                  className="flex flex-col items-center gap-1 p-3 rounded-[10px] transition-all"
                  style={{
                    background: emotion === em.key ? em.bg : "var(--offwhite)",
                    border: emotion === em.key ? `1px solid ${em.color}` : "0.5px solid var(--border-light)",
                  }}>
                  <span className="text-2xl">{em.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: emotion === em.key ? em.color : "var(--text-muted)" }}>
                    {em.label}
                  </span>
                </button>
              ))}
            </div>
            {emotion && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Intensidade agora</p>
                  <span className="text-sm font-medium" style={{ color: selectedEmotion?.color }}>{intensityBefore}%</span>
                </div>
                <input type="range" min="0" max="100" value={intensityBefore}
                  onChange={(e) => setIntensityBefore(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: selectedEmotion?.color ?? "#7c3aed" }}
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <textarea placeholder="Ex: 'Vou falhar. Ninguém se importa. Não sou bom o suficiente.'"
            value={autoThought} onChange={(e) => setAutoThought(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none"
            style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>
                O que apoia esse pensamento?
              </label>
              <textarea placeholder="Fatos reais que sustentam o pensamento..." value={evidenceFor}
                onChange={(e) => setEvidenceFor(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none"
                style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>
                O que contradiz esse pensamento?
              </label>
              <textarea placeholder="Evidências que vão contra o pensamento..." value={evidenceAgainst}
                onChange={(e) => setEvidenceAgainst(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none"
                style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[10px] p-3" style={{ background: "rgba(124,58,237,0.06)", border: "0.5px solid rgba(124,58,237,0.2)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#a78bfa" }}>Pensamento original</p>
              <p className="text-sm italic" style={{ color: "var(--text-mid)" }}>&ldquo;{autoThought}&rdquo;</p>
            </div>
            <textarea placeholder="Como você pode ver essa situação de forma mais equilibrada e realista?"
              value={alternative} onChange={(e) => setAlternative(e.target.value)} rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none"
              style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            {alternative.length > 10 && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Intensidade emocional agora</p>
                  <span className="text-sm font-medium" style={{ color: "#10b981" }}>{intensityAfter}%</span>
                </div>
                <input type="range" min="0" max="100" value={intensityAfter}
                  onChange={(e) => setIntensityAfter(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "#10b981" }}
                />
                {intensityAfter < intensityBefore && (
                  <p className="text-xs" style={{ color: "#10b981" }}>
                    ✓ Redução de {intensityBefore - intensityAfter}% na intensidade emocional
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button onClick={step === 0 ? onCancel : () => setStep(step - 1)}
          className="flex-1 py-2.5 rounded-[10px] text-sm transition-all hover:opacity-70"
          style={{ background: "var(--offwhite-2)", color: "var(--text-muted)", border: "0.5px solid var(--border)" }}>
          {step === 0 ? "Cancelar" : "← Voltar"}
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canAdvance()}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#7c3aed", color: "white" }}>
            Continuar →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!canAdvance() || isPending}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#7c3aed", color: "white" }}>
            {isPending ? "Salvando..." : "Concluir (+25 XP)"}
          </button>
        )}
      </div>
    </div>
  );
}

function ThoughtList() {
  return (
    <div className="rounded-[12px] p-6 text-center flex flex-col items-center gap-3"
      style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
      <p className="text-2xl">💭</p>
      <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nenhum registro ainda</p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Clique em &ldquo;+ Novo&rdquo; para iniciar sua primeira reestruturação cognitiva.
      </p>
    </div>
  );
}

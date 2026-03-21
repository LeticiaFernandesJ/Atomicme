"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SCHEMA_DIMENSIONS } from "@/lib/emotions";
import { saveEmotionalSchema } from "@/app/(app)/emocoes/actions";

const QUIZ_QUESTIONS = SCHEMA_DIMENSIONS.flatMap((dim, i) => [
  { id: `${dim.key}_1`, dimension: dim.key, label: dim.label, text: dim.description },
  { id: `${dim.key}_2`, dimension: dim.key, label: dim.label, text: `Consigo lidar bem com "${dim.description.toLowerCase()}"` },
]);

export default function QuizPage() {
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const question = QUIZ_QUESTIONS[current];
  const total = QUIZ_QUESTIONS.length;
  const progress = Math.round((current / total) * 100);

  function handleAnswer(value: number) {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      // Calculate scores per dimension
      const scores: Record<string, number> = {};
      SCHEMA_DIMENSIONS.forEach((dim) => {
        const q1 = newAnswers[`${dim.key}_1`] ?? 3;
        const q2 = newAnswers[`${dim.key}_2`] ?? 3;
        scores[dim.key] = Math.round(((q1 + q2) / 2) * 10) / 10;
      });

      setAnswers(newAnswers);
      startTransition(async () => {
        await saveEmotionalSchema({ scores });
        setSaved(true);
      });
      setStep("result");
    }
  }

  // Compute final scores for result view
  const scores: Record<string, number> = {};
  SCHEMA_DIMENSIONS.forEach((dim) => {
    const q1 = answers[`${dim.key}_1`] ?? 3;
    const q2 = answers[`${dim.key}_2`] ?? 3;
    scores[dim.key] = Math.round(((q1 + q2) / 2) * 10) / 10;
  });

  const sorted = [...SCHEMA_DIMENSIONS].sort((a, b) => scores[b.key] - scores[a.key]);
  const strengths = sorted.slice(0, 3);
  const attention = sorted.slice(-3).reverse();

  if (step === "intro") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link href="/emocoes" className="text-sm hover:opacity-70" style={{ color: "#a78bfa" }}>← Mente &amp; Emoções</Link>
          <h1 className="text-xl font-medium mt-1" style={{ color: "var(--text-dark)" }}>Quiz de Esquemas Emocionais</h1>
        </div>
        <div className="rounded-[12px] p-5" style={{ background: "rgba(167,139,250,0.08)", borderLeft: "2px solid #a78bfa" }}>
          <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "#a78bfa" }}>Robert L. Leahy</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-mid)" }}>
            &ldquo;Esquemas emocionais são as crenças que temos sobre nossas próprias emoções — se são aceitáveis, controláveis e compartilhadas.&rdquo;
          </p>
        </div>
        <div className="rounded-[12px] p-4 flex flex-col gap-3" style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Como funciona</p>
          {["28 afirmações sobre como você vive suas emoções", "Escala de 1 a 5 para cada afirmação", "Resultado em radar com 14 dimensões", "Pode ser refeito mensalmente", "Leva cerca de 5 minutos"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#a78bfa" }} />
              <p className="text-sm" style={{ color: "var(--text-mid)" }}>{item}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setStep("quiz")}
          className="w-full py-3 rounded-[10px] text-sm font-medium hover:opacity-90 transition-all"
          style={{ background: "#7c3aed", color: "white" }}>
          Começar quiz (+50 XP na primeira vez)
        </button>
      </div>
    );
  }

  if (step === "quiz") {
    const dim = SCHEMA_DIMENSIONS.find((d) => d.key === question.dimension);
    return (
      <div className="flex flex-col gap-6">
        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{current + 1} de {total}</p>
            <p className="text-xs font-medium" style={{ color: "#a78bfa" }}>{progress}%</p>
          </div>
          <div className="w-full rounded-full" style={{ height: "3px", background: "var(--border-light)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#7c3aed" }} />
          </div>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>{dim?.label}</p>
        </div>

        {/* Question */}
        <div className="rounded-[12px] p-5" style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <p className="text-base font-medium leading-relaxed" style={{ color: "var(--text-dark)" }}>
            &ldquo;{question.text}&rdquo;
          </p>
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Discordo totalmente</span>
            <span>Concordo totalmente</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => handleAnswer(v)}
                className="flex-1 py-4 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "0.5px solid rgba(124,58,237,0.2)",
                  color: "#7c3aed",
                }}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs px-1" style={{ color: "var(--text-muted)" }}>
            {["1", "2", "3", "4", "5"].map((n) => <span key={n}>{n}</span>)}
          </div>
        </div>

        {current > 0 && (
          <button onClick={() => setCurrent(current - 1)}
            className="text-xs self-start hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
            ← Voltar
          </button>
        )}
      </div>
    );
  }

  // Result
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-medium" style={{ color: "var(--text-dark)" }}>Seus esquemas emocionais</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {saved ? "Salvo com sucesso! " : ""}Baseado nas suas respostas
        </p>
      </div>

      {/* Strengths */}
      <div className="rounded-[12px] p-4 flex flex-col gap-3" style={{ background: "rgba(16,185,129,0.06)", border: "0.5px solid rgba(16,185,129,0.2)" }}>
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#10b981" }}>Pontos fortes</p>
        {strengths.map((dim) => (
          <div key={dim.key} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{dim.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{dim.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-medium" style={{ color: "#10b981" }}>{scores[dim.key]}/5</span>
            </div>
          </div>
        ))}
      </div>

      {/* Areas of attention */}
      <div className="rounded-[12px] p-4 flex flex-col gap-3" style={{ background: "rgba(239,68,68,0.04)", border: "0.5px solid rgba(239,68,68,0.15)" }}>
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#ef4444" }}>Áreas de atenção</p>
        {attention.map((dim) => (
          <div key={dim.key} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{dim.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{dim.description}</p>
            </div>
            <span className="text-sm font-medium shrink-0" style={{ color: "#ef4444" }}>{scores[dim.key]}/5</span>
          </div>
        ))}
      </div>

      {/* All scores */}
      <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Todas as dimensões</p>
        {SCHEMA_DIMENSIONS.map((dim) => {
          const score = scores[dim.key];
          const pct = (score / 5) * 100;
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <p className="text-xs w-32 shrink-0" style={{ color: "var(--text-mid)" }}>{dim.label}</p>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: "var(--border-light)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#7c3aed" }} />
              </div>
              <span className="text-xs w-6 text-right shrink-0" style={{ color: "#7c3aed" }}>{score}</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Link href="/emocoes/estrategias"
          className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-center transition-all hover:opacity-80"
          style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "0.5px solid rgba(124,58,237,0.2)" }}>
          Ver estratégias
        </Link>
        <button onClick={() => { setStep("intro"); setAnswers({}); setCurrent(0); }}
          className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "var(--offwhite-2)", color: "var(--text-muted)", border: "0.5px solid var(--border)" }}>
          Refazer quiz
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SCHEMA_DIMENSIONS } from "@/lib/emotions";
import { saveEmotionalSchema } from "@/app/(app)/emocoes/actions";

interface QuizHistory {
  id: string;
  date: Date;
  scores: Record<string, number>;
}

interface QuizClientProps {
  history: QuizHistory[];
}

const QUIZ_QUESTIONS = SCHEMA_DIMENSIONS.flatMap((dim) => [
  { id: `${dim.key}_1`, dimension: dim.key, label: dim.label, text: dim.description },
  {
    id: `${dim.key}_2`,
    dimension: dim.key,
    label: dim.label,
    text: `Consigo lidar bem com a seguinte situação: "${dim.description.toLowerCase()}"`,
  },
]);

function computeScores(answers: Record<string, number>): Record<string, number> {
  const scores: Record<string, number> = {};
  SCHEMA_DIMENSIONS.forEach((dim) => {
    const q1 = answers[`${dim.key}_1`] ?? 3;
    const q2 = answers[`${dim.key}_2`] ?? 3;
    scores[dim.key] = Math.round(((q1 + q2) / 2) * 10) / 10;
  });
  return scores;
}

export function QuizClient({ history: initialHistory }: QuizClientProps) {
  const [view, setView] = useState<"list" | "quiz">("list");
  const [history, setHistory] = useState<QuizHistory[]>(initialHistory);

  function handleSaved(entry: QuizHistory) {
    setHistory((prev) => [entry, ...prev]);
    setView("list");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/emocoes" className="text-sm hover:opacity-70" style={{ color: "#a78bfa" }}>
            ← Mente &amp; Emoções
          </Link>
          <h1 className="text-xl font-medium mt-1" style={{ color: "var(--text-dark)" }}>
            Quiz de Esquemas Emocionais
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {history.length === 0 ? "Nunca realizado" : `${history.length} ${history.length === 1 ? "vez realizado" : "vezes realizado"}`}
          </p>
        </div>
        {view === "list" && (
          <button onClick={() => setView("quiz")}
            className="px-4 py-2 rounded-[10px] text-sm font-medium hover:opacity-90 transition-all shrink-0"
            style={{ background: "#7c3aed", color: "white" }}>
            {history.length === 0 ? "Começar" : "Refazer"}
          </button>
        )}
      </div>

      {view === "quiz" ? (
        <QuizWizard onSaved={handleSaved} onCancel={() => setView("list")} />
      ) : (
        <>
          {/* Intro card */}
          <div className="rounded-[12px] p-5"
            style={{ background: "rgba(167,139,250,0.08)", borderLeft: "2px solid #a78bfa" }}>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: "#a78bfa" }}>
              Robert L. Leahy
            </p>
            <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-mid)" }}>
              &ldquo;Esquemas emocionais são as crenças que temos sobre nossas próprias emoções — se são aceitáveis, controláveis e compartilhadas.&rdquo;
            </p>
          </div>

          {history.length === 0 ? (
            <div className="rounded-[12px] p-8 text-center flex flex-col items-center gap-3"
              style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
              <p className="text-3xl">🧭</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nenhum quiz realizado ainda</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                O quiz avalia 14 dimensões emocionais em ~5 minutos. Ganhe +50 XP na primeira vez!
              </p>
              <button onClick={() => setView("quiz")}
                className="mt-2 px-6 py-2.5 rounded-[10px] text-sm font-medium hover:opacity-90 transition-all"
                style={{ background: "#7c3aed", color: "white" }}>
                Fazer agora (+50 XP)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((entry, idx) => {
                const scores = entry.scores;
                const sorted = [...SCHEMA_DIMENSIONS].sort((a, b) => scores[b.key] - scores[a.key]);
                const strengths = sorted.slice(0, 3);
                const attention = sorted.slice(-3).reverse();

                return (
                  <div key={entry.id} className="rounded-[12px] overflow-hidden"
                    style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>

                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: "0.5px solid var(--border-light)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
                          {idx === 0 ? "Resultado mais recente" : `Resultado de ${new Date(entry.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(entry.date).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {idx === 0 && (
                        <span className="text-[10px] px-2 py-1 rounded-full font-medium"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                          Atual
                        </span>
                      )}
                    </div>

                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#10b981" }}>
                          ✓ Pontos fortes
                        </p>
                        {strengths.map((dim) => (
                          <div key={dim.key} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: "var(--text-dark)" }}>{dim.label}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 rounded-full overflow-hidden" style={{ height: "3px", background: "var(--border-light)" }}>
                                <div className="h-full rounded-full" style={{ width: `${(scores[dim.key] / 5) * 100}%`, background: "#10b981" }} />
                              </div>
                              <span className="text-xs font-medium w-5 text-right" style={{ color: "#10b981" }}>
                                {scores[dim.key]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Attention */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#f59e0b" }}>
                          ⚠ Áreas de atenção
                        </p>
                        {attention.map((dim) => (
                          <div key={dim.key} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: "var(--text-dark)" }}>{dim.label}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 rounded-full overflow-hidden" style={{ height: "3px", background: "var(--border-light)" }}>
                                <div className="h-full rounded-full" style={{ width: `${(scores[dim.key] / 5) * 100}%`, background: "#f59e0b" }} />
                              </div>
                              <span className="text-xs font-medium w-5 text-right" style={{ color: "#f59e0b" }}>
                                {scores[dim.key]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* All scores mini bars */}
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {SCHEMA_DIMENSIONS.map((dim) => (
                          <div key={dim.key} className="flex items-center gap-2">
                            <p className="text-[10px] w-24 shrink-0 truncate" style={{ color: "var(--text-muted)" }}>
                              {dim.label}
                            </p>
                            <div className="flex-1 rounded-full overflow-hidden" style={{ height: "3px", background: "var(--border-light)" }}>
                              <div className="h-full rounded-full" style={{ width: `${(scores[dim.key] / 5) * 100}%`, background: "#7c3aed" }} />
                            </div>
                            <span className="text-[10px] w-4 text-right shrink-0" style={{ color: "#7c3aed" }}>
                              {scores[dim.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Quiz Wizard ──
function QuizWizard({
  onSaved,
  onCancel,
}: {
  onSaved: (entry: QuizHistory) => void;
  onCancel: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[current];
  const progress = Math.round((current / total) * 100);
  const dim = SCHEMA_DIMENSIONS.find((d) => d.key === question.dimension);

  function handleAnswer(value: number) {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      const scores = computeScores(newAnswers);
      startTransition(async () => {
        const result = await saveEmotionalSchema({ scores });
        if (result.success) {
          onSaved({
            id: Date.now().toString(),
            date: new Date(),
            scores,
          });
        }
      });
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Salvando resultado...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {current + 1} de {total}
          </p>
          <p className="text-xs font-medium" style={{ color: "#a78bfa" }}>{progress}%</p>
        </div>
        <div className="w-full rounded-full" style={{ height: "3px", background: "var(--border-light)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#7c3aed" }} />
        </div>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>
          {dim?.label}
        </p>
      </div>

      {/* Question */}
      <div className="rounded-[12px] p-5"
        style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
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
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>

      {/* Back / cancel */}
      <div className="flex items-center justify-between">
        {current > 0 ? (
          <button onClick={() => setCurrent(current - 1)}
            className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
            ← Voltar
          </button>
        ) : (
          <button onClick={onCancel}
            className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>
            Cancelar
          </button>
        )}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Clique em um número para responder
        </p>
      </div>
    </div>
  );
}

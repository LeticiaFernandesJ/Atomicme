"use client";

import { useState, useTransition } from "react";
import { EMOTIONS, EMOTION_TIPS } from "@/lib/emotions";
import type { EmotionType } from "@/lib/emotions";
import { createEmotionalLog } from "@/app/(app)/emocoes/actions";

interface DiaryEntry {
  id: string;
  date: Date;
  emotion: string;
  intensity: number;
  situation: string | null;
  thought: string | null;
}

interface EmotionalDiaryProps {
  entries: DiaryEntry[];
}

export function EmotionalDiary({ entries }: EmotionalDiaryProps) {
  const [showForm, setShowForm] = useState(false);
  const [emotion, setEmotion]       = useState<EmotionType | null>(null);
  const [intensity, setIntensity]   = useState(5);
  const [situation, setSituation]   = useState("");
  const [thought, setThought]       = useState("");
  const [filterEmotion, setFilter]  = useState<string>("all");
  const [savedTip, setSavedTip]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState("");

  function handleSave() {
    if (!emotion) { setError("Selecione uma emoção"); return; }
    setError("");
    startTransition(async () => {
      const result = await createEmotionalLog({ emotion, intensity, situation: situation.trim() || undefined, thought: thought.trim() || undefined });
      if (result.success) {
        setSavedTip(EMOTION_TIPS[emotion]);
        setShowForm(false);
        setEmotion(null);
        setSituation("");
        setThought("");
      }
    });
  }

  const selectedEmotion = EMOTIONS.find((e) => e.key === emotion);
  const filtered = filterEmotion === "all" ? entries : entries.filter((e) => e.emotion === filterEmotion);

  return (
    <div className="flex flex-col gap-5">
      {/* Tip after save */}
      {savedTip && (
        <div className="rounded-[12px] p-4 flex flex-col gap-2"
          style={{ background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.3)" }}>
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "#a78bfa" }}>Insight do Leahy</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-mid)" }}>{savedTip}</p>
          <button onClick={() => setSavedTip(null)} className="text-xs self-end" style={{ color: "#a78bfa" }}>Fechar</button>
        </div>
      )}

      {/* New entry button */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-[12px] text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "#7c3aed", color: "white" }}>
          + Nova entrada no diário
        </button>
      ) : (
        <div className="rounded-[12px] p-4 flex flex-col gap-4"
          style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nova entrada</p>
            <button onClick={() => setShowForm(false)} style={{ color: "var(--text-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Emotion picker */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>O que senti</p>
            <div className="grid grid-cols-3 gap-2">
              {EMOTIONS.map((e) => (
                <button key={e.key} onClick={() => setEmotion(e.key)}
                  className="flex items-center gap-2 px-2 py-2 rounded-[8px] text-xs font-medium transition-all"
                  style={{
                    background: emotion === e.key ? e.bg : "var(--offwhite)",
                    border: emotion === e.key ? `1px solid ${e.color}` : "0.5px solid var(--border-light)",
                    color: emotion === e.key ? e.color : "var(--text-muted)",
                  }}>
                  <span>{e.emoji}</span> {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          {emotion && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>Intensidade</p>
                <span className="text-xs font-medium" style={{ color: selectedEmotion?.color }}>{intensity}/10</span>
              </div>
              <input type="range" min="1" max="10" value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: selectedEmotion?.color }}
              />
            </div>
          )}

          {/* Situation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>
              O que aconteceu? <span style={{ color: "var(--text-muted)", textTransform: "none" }}>(opcional)</span>
            </label>
            <textarea
              placeholder="Descreva brevemente a situação..."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none transition-colors"
              style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Thought */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-mid)" }}>
              O que pensei? <span style={{ color: "var(--text-muted)", textTransform: "none" }}>(opcional)</span>
            </label>
            <textarea
              placeholder="Que pensamentos automáticos surgiram?"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-[8px] resize-none outline-none transition-colors"
              style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-[10px] text-sm transition-all"
              style={{ background: "var(--offwhite)", border: "0.5px solid var(--border)", color: "var(--text-muted)" }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={isPending || !emotion}
              className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "#7c3aed", color: "white" }}>
              {isPending ? "Salvando..." : "Salvar entrada"}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      {entries.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter("all")}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{ background: filterEmotion === "all" ? "#7c3aed" : "var(--offwhite-2)", color: filterEmotion === "all" ? "white" : "var(--text-muted)", border: "0.5px solid var(--border-light)" }}>
            Todas
          </button>
          {EMOTIONS.filter((e) => entries.some((en) => en.emotion === e.key)).map((e) => (
            <button key={e.key} onClick={() => setFilter(e.key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterEmotion === e.key ? e.bg : "var(--offwhite-2)",
                color: filterEmotion === e.key ? e.color : "var(--text-muted)",
                border: filterEmotion === e.key ? `1px solid ${e.color}` : "0.5px solid var(--border-light)",
              }}>
              {e.emoji} {e.label}
            </button>
          ))}
        </div>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="rounded-[12px] p-8 text-center"
          style={{ background: "var(--offwhite-2)", border: "0.5px dashed var(--border)" }}>
          <p className="text-2xl mb-2">📓</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>Nenhuma entrada ainda</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Registre como você está se sentindo hoje.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => {
            const em = EMOTIONS.find((e) => e.key === entry.emotion);
            return (
              <div key={entry.id} className="rounded-[12px] p-4"
                style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{em?.emoji ?? "🌡️"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: em?.color ?? "var(--text-dark)" }}>
                          {em?.label ?? entry.emotion}
                        </p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: em?.bg, color: em?.color }}>
                          {entry.intensity}/10
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(entry.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
                {entry.situation && (
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-mid)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Situação: </span>{entry.situation}
                  </p>
                )}
                {entry.thought && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-mid)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Pensamento: </span>{entry.thought}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

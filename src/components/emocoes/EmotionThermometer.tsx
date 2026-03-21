"use client";

import { useState, useTransition } from "react";
import { EMOTIONS, EMOTION_TIPS } from "@/lib/emotions";
import type { EmotionType } from "@/lib/emotions";
import { createEmotionalLog } from "@/app/(app)/emocoes/actions";

interface EmotionThermometerProps {
  checkedInToday: boolean;
  todayEmotion?: string | null;
  todayIntensity?: number | null;
}

export function EmotionThermometer({ checkedInToday, todayEmotion, todayIntensity }: EmotionThermometerProps) {
  const [selected, setSelected] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [done, setDone] = useState(checkedInToday);
  const [showTip, setShowTip] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selected) return;
    startTransition(async () => {
      const result = await createEmotionalLog({ emotion: selected, intensity });
      if (result.success) {
        setDone(true);
        setShowTip(true);
      }
    });
  }

  const selectedEmotion = EMOTIONS.find((e) => e.key === selected);

  if (done && !showTip) {
    const emotion = EMOTIONS.find((e) => e.key === todayEmotion) ?? EMOTIONS.find((e) => e.key === selected);
    return (
      <div className="rounded-[12px] p-4"
        style={{ background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.2)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>
          Check-in emocional
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emotion?.emoji ?? "🌡️"}</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
              {emotion?.label ?? todayEmotion} — {todayIntensity ?? intensity}/10
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Check-in de hoje realizado ✓</p>
          </div>
        </div>
      </div>
    );
  }

  if (showTip && selected) {
    return (
      <div className="rounded-[12px] p-4 flex flex-col gap-3"
        style={{ background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.2)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "#a78bfa" }}>
            Insight do dia
          </p>
          <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>+10 XP ✨</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xl shrink-0">{selectedEmotion?.emoji}</span>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
            {EMOTION_TIPS[selected]}
          </p>
        </div>
        <button onClick={() => setShowTip(false)}
          className="text-xs self-end hover:opacity-70 transition-opacity"
          style={{ color: "#a78bfa" }}>
          Fechar →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] p-4 flex flex-col gap-4"
      style={{ background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.2)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "#a78bfa" }}>
          Como você está agora?
        </p>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>+10 XP</span>
      </div>

      {/* Emotion grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {EMOTIONS.map((emotion) => (
          <button key={emotion.key} onClick={() => setSelected(emotion.key)}
            className="flex flex-col items-center gap-1 p-2 rounded-[10px] transition-all"
            style={{
              background: selected === emotion.key ? emotion.bg : "var(--offwhite-2)",
              border: selected === emotion.key ? `1px solid ${emotion.color}` : "0.5px solid var(--border-light)",
            }}>
            <span className="text-xl">{emotion.emoji}</span>
            <span className="text-[10px] font-medium" style={{ color: selected === emotion.key ? emotion.color : "var(--text-muted)" }}>
              {emotion.label}
            </span>
          </button>
        ))}
      </div>

      {/* Intensity slider */}
      {selected && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Intensidade</p>
            <p className="text-sm font-medium" style={{ color: selectedEmotion?.color }}>
              {intensity}/10
            </p>
          </div>
          <input type="range" min="1" max="10" value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: selectedEmotion?.color ?? "#a78bfa" }}
          />
          <div className="flex justify-between">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Suave</span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Muito intenso</span>
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={!selected || isPending}
        className="w-full py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "#7c3aed", color: "white" }}>
        {isPending ? "Registrando..." : "Registrar sentimento"}
      </button>
    </div>
  );
}

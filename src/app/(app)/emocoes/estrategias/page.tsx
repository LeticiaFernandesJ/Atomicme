"use client";

import { useState } from "react";
import Link from "next/link";
import { STRATEGIES, EMOTIONS } from "@/lib/emotions";

const LEVEL_LABELS = {
  iniciante: { label: "Iniciante", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  intermediario: { label: "Intermediário", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  avancado: { label: "Avançado", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function EstrategiasPage() {
  const [search, setSearch] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = STRATEGIES.filter((s) => {
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchEmotion = filterEmotion === "all" || s.emotions.includes(filterEmotion);
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchEmotion && matchLevel;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/emocoes" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#a78bfa" }}>
          ← Mente &amp; Emoções
        </Link>
        <h1 className="text-xl font-medium mt-1" style={{ color: "var(--text-dark)" }}>Biblioteca de Estratégias</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{STRATEGIES.length} técnicas baseadas em TCC</p>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Buscar técnica..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full h-10 px-4 rounded-[10px] text-sm outline-none transition-colors"
        style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
      />

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          {["all", ...EMOTIONS.map((e) => e.key)].map((key) => {
            const em = EMOTIONS.find((e) => e.key === key);
            return (
              <button key={key} onClick={() => setFilterEmotion(key)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: filterEmotion === key ? (em?.bg ?? "#7c3aed") : "var(--offwhite-2)",
                  color: filterEmotion === key ? (em?.color ?? "white") : "var(--text-muted)",
                  border: filterEmotion === key ? `1px solid ${em?.color ?? "#7c3aed"}` : "0.5px solid var(--border-light)",
                }}>
                {key === "all" ? "Todas" : `${em?.emoji} ${em?.label}`}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          {["all", "iniciante", "intermediario", "avancado"].map((level) => {
            const l = LEVEL_LABELS[level as keyof typeof LEVEL_LABELS];
            return (
              <button key={level} onClick={() => setFilterLevel(level)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: filterLevel === level ? (l?.bg ?? "rgba(124,58,237,0.1)") : "var(--offwhite-2)",
                  color: filterLevel === level ? (l?.color ?? "#7c3aed") : "var(--text-muted)",
                  border: filterLevel === level ? `1px solid ${l?.color ?? "#7c3aed"}` : "0.5px solid var(--border-light)",
                }}>
                {level === "all" ? "Todos níveis" : l?.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length} técnicas</p>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((strategy) => {
          const level = LEVEL_LABELS[strategy.level];
          const isExpanded = expanded === strategy.id;
          return (
            <div key={strategy.id} className="rounded-[12px] overflow-hidden"
              style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
              <button onClick={() => setExpanded(isExpanded ? null : strategy.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{strategy.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: level.bg, color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{strategy.description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {strategy.emotions.map((em) => {
                      const e = EMOTIONS.find((e) => e.key === em);
                      return e ? (
                        <span key={em} className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: e.bg, color: e.color }}>
                          {e.emoji} {e.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="shrink-0 mt-0.5 transition-transform"
                  style={{ color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3"
                  style={{ borderTop: "0.5px solid var(--border-light)" }}>
                  <p className="text-xs font-medium uppercase tracking-wide pt-3" style={{ color: "#a78bfa" }}>
                    Passo a passo
                  </p>
                  <ol className="flex flex-col gap-2">
                    {strategy.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 mt-0.5"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

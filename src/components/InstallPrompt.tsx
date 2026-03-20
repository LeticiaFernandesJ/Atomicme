"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Já está instalado como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Verificar se já dispensou antes
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed) return;

    if (ios) {
      // iOS não tem evento — mostra instrução manual após 3s
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome — captura o evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then((result) => {
      if (result.outcome === "accepted") {
        setShow(false);
        setIsInstalled(true);
      }
    });
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "true");
  }

  if (isInstalled || !show) return null;

  // Banner iOS — instrução manual
  if (isIOS) {
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-[100] rounded-[16px] p-4 shadow-xl"
        style={{
          background: "var(--navy-deep)",
          border: "0.5px solid rgba(196,136,74,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Arrow pointing down to safari bar */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
          style={{ background: "var(--navy-deep)", border: "0.5px solid rgba(196,136,74,0.3)" }} />

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(196,136,74,0.15)" }}>
            <span className="text-xl">⚛️</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--offwhite)" }}>
              Instalar AtomicMe
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Toque em{" "}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[11px]"
                style={{ background: "rgba(255,255,255,0.1)", color: "var(--caramel)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v13M8 6l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Compartilhar
              </span>{" "}
              e depois{" "}
              <span style={{ color: "var(--caramel)" }}>"Adicionar à Tela de Início"</span>
            </p>
          </div>

          <button onClick={handleDismiss} className="shrink-0 p-1 hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Banner Android/Chrome — botão de instalação nativo
  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[100] rounded-[16px] overflow-hidden shadow-xl"
      style={{
        background: "var(--navy-deep)",
        border: "0.5px solid rgba(196,136,74,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, var(--caramel), var(--caramel-light), var(--caramel))" }} />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* App icon */}
          <img src="/icons/icon-192x192.png" alt="AtomicMe" className="w-12 h-12 rounded-[12px] shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--offwhite)" }}>
              Instalar AtomicMe
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Adicionar à tela inicial
            </p>
          </div>

          <button onClick={handleDismiss} className="shrink-0 p-1.5 rounded-full hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--caramel-muted)" }}>
          Instale o app para acessar seus hábitos diários mais rápido, sem abrir o navegador.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-70"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            Agora não
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "var(--caramel)", color: "var(--navy-deep)" }}
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}

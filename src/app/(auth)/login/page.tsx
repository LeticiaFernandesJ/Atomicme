"use client";
export const dynamic = "force-dynamic";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_IN_USE:    "Este e-mail já está cadastrado. Faça login.",
  NOT_FOUND:       "E-mail não encontrado. Crie uma conta.",
  WRONG_PASSWORD:  "Senha incorreta. Tente novamente.",
  USE_GOOGLE:      "Esta conta usa o Google. Clique em 'Continuar com Google'.",
  CredentialsSignin: "E-mail ou senha incorretos.",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [isPending, startTransition] = useTransition();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (mode === "register" && !name.trim()) { setError("Digite seu nome"); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres"); return; }
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email:    email.trim().toLowerCase(),
        password,
        name:     name.trim(),
        mode,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? "Ocorreu um erro. Tente novamente.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  const inputStyle = {
    background: "var(--offwhite-2)",
    border: "0.5px solid var(--border)",
    color: "var(--text-dark)",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--offwhite)" }}>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12"
        style={{ background: "var(--navy-deep)" }}>

        <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "var(--caramel)" }}>
          atomicme
        </span>

        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-medium leading-tight" style={{ color: "var(--offwhite)" }}>
              Construa quem<br />você quer ser.
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
              Pequenos hábitos diários. Grande identidade.
            </p>
          </div>

          <div className="rounded-[12px] p-5"
            style={{ background: "rgba(196,136,74,0.08)", borderLeft: "2px solid var(--caramel)" }}>
            <p className="text-sm italic leading-relaxed" style={{ color: "var(--caramel-muted)" }}>
              &ldquo;Todo voto que você faz é um voto para o tipo de pessoa que deseja se tornar.&rdquo;
            </p>
            <p className="text-[11px] mt-3 uppercase tracking-widest font-medium" style={{ color: "var(--caramel)" }}>
              — James Clear, Hábitos Atômicos
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: "✦", text: "As 4 leis do comportamento para criar hábitos duradouros" },
              { icon: "🔗", text: "Habit Stacking — encadeie hábitos em rotinas automáticas" },
              { icon: "🏆", text: "Sistema de XP, níveis e conquistas por consistência" },
              { icon: "🔥", text: "Nunca perca dois dias seguidos — alerta de recuperação" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-base shrink-0 mt-0.5">{icon}</span>
                <p className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Inspirado em <span style={{ color: "var(--caramel)" }}>Hábitos Atômicos</span> de James Clear
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "var(--caramel)" }}>
              atomicme
            </span>
            <p className="text-2xl font-medium mt-2" style={{ color: "var(--text-dark)" }}>
              Construa quem você quer ser.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-[12px] p-1 mb-8"
            style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}>
            {(["login", "register"] as Mode[]).map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200"
                style={mode === m
                  ? { background: "var(--navy)", color: "var(--caramel-pale)" }
                  : { background: "transparent", color: "var(--text-muted)" }
                }>
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-medium" style={{ color: "var(--text-dark)" }}>
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {mode === "login"
                ? "Entre com seu e-mail e senha para continuar."
                : "Preencha os dados abaixo para começar."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name — register only */}
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
                  Nome completo
                </label>
                <input type="text" placeholder="Como você quer ser chamado?"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--caramel)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
                E-mail
              </label>
              <input type="email" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full h-11 px-4 rounded-[10px] text-sm outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--caramel)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
                Senha {mode === "register" && <span style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>(mínimo 6 caracteres)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "register" ? "Crie uma senha segura" : "Sua senha"}
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full h-11 px-4 pr-11 rounded-[10px] text-sm outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--caramel)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
                  style={{ color: "var(--text-muted)" }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[8px] px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.06)", border: "0.5px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isPending}
              className="w-full h-11 rounded-[10px] text-sm font-medium transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-1"
              style={{ background: "var(--navy)", color: "var(--caramel-pale)" }}>
              {isPending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
            
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
          </div>

          

          {/* Switch */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-medium hover:opacity-70 transition-opacity"
              style={{ color: "var(--caramel)" }}>
              {mode === "login" ? "Criar conta grátis" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { BookQuote } from "@/components/ui/BookQuote";
import { createHabit } from "@/app/(app)/habitos/actions";

interface Identity {
  id: string;
  name: string;
}

interface HabitFormProps {
  identities: Identity[];
}

interface FormData {
  trigger: string;
  motivation: string;
  minVersion: string;
  reward: string;
  name: string;
  identityId: string;
  newIdentityName: string;
  rewardLong: string;
}

const LAWS = [
  {
    number: "1",
    title: "Torne óbvio",
    description: "Onde e quando você vai fazer?",
    field: "trigger" as keyof FormData,
    placeholder: "Ex: Depois de escovar os dentes, às 22h no meu quarto",
    quote: "O ambiente é a mão invisível que molda o comportamento humano.",
  },
  {
    number: "2",
    title: "Torne atrativo",
    description: "Por que isso importa para você?",
    field: "motivation" as keyof FormData,
    placeholder: "Ex: Me sentir energético e dormir melhor",
    quote: "Quanto mais atrativo é uma oportunidade, mais provável que ela forme um hábito.",
  },
  {
    number: "3",
    title: "Torne fácil",
    description: "Versão mínima — apenas 2 minutos",
    field: "minVersion" as keyof FormData,
    placeholder: "Ex: Apenas colocar o tênis e dar 2 voltas no quarteirão",
    quote: "Faça o início do seu hábito tão fácil que você não pode dizer não.",
  },
  {
    number: "4",
    title: "Torne satisfatório",
    description: "Qual recompensa imediata você terá?",
    field: "reward" as keyof FormData,
    placeholder: "Ex: Marcar no app e ouvir minha música favorita",
    quote: "O que é recompensado é repetido. O que é punido é evitado.",
  },
];

export function HabitForm({ identities }: HabitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [showNewIdentity, setShowNewIdentity] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    trigger: "",
    motivation: "",
    minVersion: "",
    reward: "",
    name: "",
    identityId: "",
    newIdentityName: "",
    rewardLong: "",
  });

  function update(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateStep1(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (formData.trigger.trim().length < 3) newErrors.trigger = "Descreva o gatilho";
    if (formData.motivation.trim().length < 3) newErrors.motivation = "Descreva a motivação";
    if (formData.minVersion.trim().length < 3) newErrors.minVersion = "Descreva a versão mínima";
    if (formData.reward.trim().length < 2) newErrors.reward = "Descreva a recompensa";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (formData.name.trim().length < 2) newErrors.name = "Nome muito curto";
    if (showNewIdentity && formData.newIdentityName.trim().length < 2) {
      newErrors.newIdentityName = "Nome da identidade muito curto";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep1()) setStep(2);
  }

  function handleSubmit() {
    if (!validateStep2()) return;
    setGlobalError("");

    startTransition(async () => {
      const result = await createHabit({
        name: formData.name.trim(),
        trigger: formData.trigger.trim(),
        motivation: formData.motivation.trim(),
        minVersion: formData.minVersion.trim(),
        reward: formData.reward.trim(),
        identityId: showNewIdentity ? undefined : formData.identityId || undefined,
        newIdentityName: showNewIdentity ? formData.newIdentityName.trim() : undefined,
      });

      if (result.success && result.habitId) {
        router.push(`/habitos/${result.habitId}`);
      } else {
        setGlobalError(result.error ?? "Erro ao criar hábito");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all"
              style={
                s === step
                  ? { background: "var(--navy)", color: "var(--caramel-pale)" }
                  : s < step
                  ? { background: "var(--caramel)", color: "white" }
                  : { background: "var(--border-light)", color: "var(--text-muted)" }
              }
            >
              {s < step ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 2 && (
              <div
                className="w-8 h-px"
                style={{ background: s < step ? "var(--caramel)" : "var(--border)" }}
              />
            )}
          </div>
        ))}
        <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
          {step} de 2
        </span>
      </div>

      {/* Step 1 — As 4 leis */}
      {step === 1 && (
        <>
          <div>
            <p className="text-base font-medium" style={{ color: "var(--text-dark)" }}>
              As 4 leis do hábito
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Baseado em Hábitos Atômicos de James Clear
            </p>
          </div>

          {LAWS.map((law) => (
            <div key={law.number} className="flex flex-col gap-3">
              {/* Law header */}
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-7 h-7 rounded-[8px] flex items-center justify-center text-sm font-medium"
                  style={{ background: "var(--navy)", color: "var(--caramel-pale)" }}
                >
                  {law.number}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>
                    {law.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {law.description}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <BookQuote>{law.quote}</BookQuote>

              {/* Input */}
              <Textarea
                placeholder={law.placeholder}
                value={formData[law.field]}
                onChange={(e) => update(law.field, e.target.value)}
                error={errors[law.field]}
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => router.push("/habitos")} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Continuar →
            </Button>
          </div>
        </>
      )}

      {/* Step 2 — Nome, identidade, recompensa longa */}
      {step === 2 && (
        <>
          <div>
            <p className="text-base font-medium" style={{ color: "var(--text-dark)" }}>
              Finalize seu hábito
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Dê um nome e vincule a uma identidade
            </p>
          </div>

          {/* Summary of step 1 */}
          <div
            className="rounded-[12px] p-4 flex flex-col gap-2"
            style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border-light)" }}
          >
            <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--caramel)" }}>
              Resumo das 4 leis
            </p>
            {[
              { label: "Gatilho", value: formData.trigger },
              { label: "Motivação", value: formData.motivation },
              { label: "Versão mínima", value: formData.minVersion },
              { label: "Recompensa", value: formData.reward },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {label}:{" "}
                </span>
                <span className="text-xs" style={{ color: "var(--text-mid)" }}>
                  {value}
                </span>
              </div>
            ))}
            <button
              onClick={() => setStep(1)}
              className="text-xs text-left mt-1"
              style={{ color: "var(--caramel)" }}
            >
              ← Editar
            </button>
          </div>

          {/* Name */}
          <Input
            label="Nome do hábito"
            placeholder="Ex: Meditação diária"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
          />

          {/* Identity */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
              Identidade (opcional)
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Cada hábito é um voto para quem você está se tornando.
            </p>

            {!showNewIdentity ? (
              <div className="flex flex-col gap-2">
                <select
                  value={formData.identityId}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewIdentity(true);
                      update("identityId", "");
                    } else {
                      update("identityId", e.target.value);
                    }
                  }}
                  className="w-full h-10 px-3 text-sm rounded-[8px] appearance-none cursor-pointer"
                  style={{
                    background: "var(--offwhite-2)",
                    border: "0.5px solid var(--border)",
                    color: formData.identityId ? "var(--text-dark)" : "var(--text-muted)",
                  }}
                >
                  <option value="">Nenhuma identidade</option>
                  {identities.map((id) => (
                    <option key={id.id} value={id.id}>
                      {id.name}
                    </option>
                  ))}
                  <option value="__new__">+ Criar nova identidade</option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Ex: pratica exercícios regularmente"
                  value={formData.newIdentityName}
                  onChange={(e) => update("newIdentityName", e.target.value)}
                  error={errors.newIdentityName}
                />
                <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                  &ldquo;Sou uma pessoa que {formData.newIdentityName || "..."}
                  &rdquo;
                </p>
                <button
                  onClick={() => {
                    setShowNewIdentity(false);
                    update("newIdentityName", "");
                  }}
                  className="text-xs text-left"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← Usar existente
                </button>
              </div>
            )}
          </div>

          {globalError && (
            <p className="text-xs text-red-500">{globalError}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              ← Voltar
            </Button>
            <Button onClick={handleSubmit} loading={isPending} className="flex-1">
              Criar hábito
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

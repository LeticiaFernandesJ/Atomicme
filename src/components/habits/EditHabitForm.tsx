"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { updateHabit, archiveHabit, deleteHabit } from "@/app/(app)/habitos/actions";

interface Identity {
  id: string;
  name: string;
}

interface EditHabitFormProps {
  habit: {
    id: string;
    name: string;
    trigger: string;
    motivation: string;
    minVersion: string;
    reward: string;
    active: boolean;
    identityId: string | null;
  };
  identities: Identity[];
}

export function EditHabitForm({ habit, identities }: EditHabitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewIdentity, setShowNewIdentity] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: habit.name,
    trigger: habit.trigger,
    motivation: habit.motivation,
    minVersion: habit.minVersion,
    reward: habit.reward,
    identityId: habit.identityId ?? "",
    newIdentityName: "",
  });

  function update(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateHabit({
        id: habit.id,
        name: formData.name.trim(),
        trigger: formData.trigger.trim(),
        motivation: formData.motivation.trim(),
        minVersion: formData.minVersion.trim(),
        reward: formData.reward.trim(),
        identityId: showNewIdentity ? undefined : formData.identityId || undefined,
        newIdentityName: showNewIdentity ? formData.newIdentityName.trim() : undefined,
      });

      if (result.success) {
        router.push(`/habitos/${habit.id}`);
      } else {
        setError(result.error ?? "Erro ao salvar");
      }
    });
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveHabit(habit.id);
      router.push("/habitos");
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteHabit(habit.id);
    });
  }

  const fields: { label: string; field: keyof typeof formData; placeholder: string; description: string }[] = [
    { label: "Torne óbvio — gatilho", field: "trigger", placeholder: "Onde e quando você vai fazer?", description: "Especifique o local e o momento exato" },
    { label: "Torne atrativo — motivação", field: "motivation", placeholder: "Por que isso importa?", description: "Sua razão pessoal para este hábito" },
    { label: "Torne fácil — versão mínima", field: "minVersion", placeholder: "Versão de apenas 2 minutos", description: "O mínimo para nunca deixar de fazer" },
    { label: "Torne satisfatório — recompensa", field: "reward", placeholder: "Recompensa imediata", description: "O que torna isso satisfatório agora" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      <Input
        label="Nome do hábito"
        value={formData.name}
        onChange={(e) => update("name", e.target.value)}
      />

      {fields.map(({ label, field, placeholder, description }) => (
        <div key={field} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
            {label}
          </label>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{description}</p>
          <Textarea
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => update(field, e.target.value)}
          />
        </div>
      ))}

      {/* Identity */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-mid)" }}>
          Identidade
        </p>
        {!showNewIdentity ? (
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
            style={{ background: "var(--offwhite-2)", border: "0.5px solid var(--border)", color: "var(--text-dark)" }}
          >
            <option value="">Nenhuma identidade</option>
            {identities.map((id) => (
              <option key={id.id} value={id.id}>{id.name}</option>
            ))}
            <option value="__new__">+ Criar nova identidade</option>
          </select>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Ex: pratica exercícios regularmente"
              value={formData.newIdentityName}
              onChange={(e) => update("newIdentityName", e.target.value)}
            />
            <button onClick={() => { setShowNewIdentity(false); update("newIdentityName", ""); }}
              className="text-xs text-left" style={{ color: "var(--text-muted)" }}>
              ← Usar existente
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleSave} loading={isPending} className="w-full">
        Salvar alterações
      </Button>

      {/* Danger zone */}
      <div
        className="rounded-[12px] p-4 flex flex-col gap-3 mt-2"
        style={{ border: "0.5px solid var(--border-light)" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Zona de perigo
        </p>
        {habit.active && (
          <Button variant="secondary" onClick={handleArchive} loading={isPending} className="w-full">
            Arquivar hábito
          </Button>
        )}
        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full">
            Excluir hábito
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-center" style={{ color: "var(--text-mid)" }}>
              Tem certeza? Todo o histórico será perdido.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={isDeleting} className="flex-1">
                Sim, excluir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

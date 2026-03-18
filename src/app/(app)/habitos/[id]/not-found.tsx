import Link from "next/link";

export default function HabitNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-4">
      <p className="text-4xl">🌱</p>
      <p className="text-base font-medium" style={{ color: "var(--text-dark)" }}>
        Hábito não encontrado
      </p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Este hábito não existe ou foi excluído.
      </p>
      <Link
        href="/habitos"
        className="text-sm font-medium"
        style={{ color: "var(--caramel)" }}
      >
        Ver todos os hábitos →
      </Link>
    </div>
  );
}

import { xpForNextLevel } from "@/lib/xp";

interface IdentityHeroProps {
  identityName: string | null;
  userName: string;
  xp: number;
  level: number;
  streak: number;
}

export function IdentityHero({
  identityName,
  userName,
  xp,
  level,
  streak,
}: IdentityHeroProps) {
  const { current, required, progress } = xpForNextLevel(xp);

  return (
    <div
      className="rounded-[12px] p-5 flex flex-col gap-3"
      style={{ background: "var(--navy-deep)" }}
    >
      {/* Eyebrow */}
      <p
        className="text-[10px] font-medium uppercase tracking-widest"
        style={{ color: "var(--caramel)" }}
      >
        Sua identidade
      </p>

      {/* Identity phrase */}
      {identityName ? (
        <p
          className="text-base italic leading-snug"
          style={{ color: "var(--offwhite)" }}
        >
          &ldquo;Sou uma pessoa que{" "}
          <span style={{ color: "var(--caramel-light)" }}>{identityName}</span>.&rdquo;
        </p>
      ) : (
        <p
          className="text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          Defina sua identidade em{" "}
          <span style={{ color: "var(--caramel)" }}>Perfil</span>.
        </p>
      )}

      {/* Streak + Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span style={{ color: "var(--caramel)" }}>🔥</span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--caramel)" }}
            >
              {streak} {streak === 1 ? "dia" : "dias"}
            </span>
          </div>
          <div
            className="w-px h-3"
            style={{ background: "rgba(255,255,255,0.12)" }}
          />
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Nível {level}
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {current} / {required} XP
        </span>
      </div>

      {/* XP bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: "var(--caramel)",
          }}
        />
      </div>
    </div>
  );
}

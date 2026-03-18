"use client";

import { Wordmark } from "@/components/layout/AppBar";
import Image from "next/image";

interface DashboardHeaderProps {
  userName: string;
  userImage?: string | null;
  streak: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DashboardHeader({ userName, userImage, streak }: DashboardHeaderProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div style={{ background: "var(--navy-deep)" }}>
      {/* AppBar */}
      <div className="px-4 h-14 flex items-center justify-between">
        <Wordmark dark />
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={32}
            height={32}
            className="rounded-full"
            style={{ border: "1.5px solid var(--caramel)" }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{
              background: "var(--navy)",
              color: "var(--caramel-pale)",
              border: "1.5px solid var(--caramel)",
            }}
          >
            {firstName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Greeting area */}
      <div className="px-4 pb-5 pt-1">
        <p
          className="text-xl font-medium"
          style={{ color: "var(--offwhite)" }}
        >
          {getGreeting()}, {firstName}.
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs" style={{ color: "var(--caramel-muted)" }}>
            {getTodayLabel()}
          </p>
          {streak > 0 && (
            <>
              <span
                className="w-0.5 h-0.5 rounded-full"
                style={{ background: "var(--caramel-muted)" }}
              />
              <p className="text-xs" style={{ color: "var(--caramel-muted)" }}>
                {streak} {streak === 1 ? "dia" : "dias"} em sequência
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

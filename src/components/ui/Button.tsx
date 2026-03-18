"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-caramel-pale hover:opacity-90 active:scale-[0.98] border-0",
  secondary:
    "bg-transparent text-text-muted border border-border hover:border-caramel hover:text-text-dark active:scale-[0.98]",
  ghost:
    "bg-transparent text-text-muted hover:text-text-dark hover:bg-offwhite-2 border-0 active:scale-[0.98]",
  danger:
    "bg-transparent text-red-600 border border-red-200 hover:bg-red-50 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

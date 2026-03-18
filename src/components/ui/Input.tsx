"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const baseInputStyles =
  "w-full bg-offwhite-2 border border-border rounded-[8px] px-3 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:border-caramel transition-colors duration-150";

export function Input({ label, error, hint, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-mid uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={[
          baseInputStyles,
          "h-10",
          error ? "border-red-400 focus:border-red-400" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-mid uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={[
          baseInputStyles,
          "py-2.5 resize-none min-h-[80px]",
          error ? "border-red-400 focus:border-red-400" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, className = "", children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-mid uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={[
          baseInputStyles,
          "h-10 cursor-pointer appearance-none",
          error ? "border-red-400" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "dark" | "caramel";
  padding?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-offwhite-2 border border-border-light",
  dark: "bg-navy-deep text-offwhite",
  caramel: "bg-caramel-pale border border-border-light",
};

const paddingStyles = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[12px]",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

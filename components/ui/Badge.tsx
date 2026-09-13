import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "success" | "warning" | "neutral" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  className,
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-[var(--theme-primary)] text-white",
    accent: "bg-[var(--theme-accent)] text-white",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-900 border border-amber-200",
    neutral: "bg-stone-100 text-stone-800 border border-stone-200",
    outline: "border border-stone-300 text-stone-700 bg-white/80",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        // Sharp corners — matches the site's editorial direction, not a pill.
        "inline-flex items-center gap-1 font-medium transition-colors tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

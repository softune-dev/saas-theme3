"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  href?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { settings } = useTheme();

    const radiusClass =
      settings.buttonStyle === "Pill"
        ? "rounded-full"
        : settings.buttonStyle === "Square"
        ? "rounded-none"
        : "rounded-xl";

    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs font-medium gap-1.5",
      md: "px-5 py-2.5 text-sm font-semibold gap-2",
      lg: "px-7 py-3.5 text-base font-bold gap-2.5",
    };

    const variantStyles: Record<string, string> = {
      primary:
        "bg-[var(--theme-primary)] text-white hover:brightness-110 active:scale-[0.98] shadow-sm hover:shadow transition-all duration-200",
      accent:
        "bg-[var(--theme-accent)] text-white hover:brightness-110 active:scale-[0.98] shadow-sm hover:shadow transition-all duration-200",
      outline:
        "border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] bg-transparent hover:bg-[var(--theme-primary)] hover:text-white transition-all duration-200",
      secondary:
        "bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200/80 transition-all duration-200",
      ghost:
        "bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-all duration-200",
    };

    const baseClass = cn(
      "inline-flex items-center justify-center font-medium leading-none cursor-pointer select-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
      radiusClass,
      sizeClasses[size],
      variantStyles[variant],
      className
    );

    const content = (
      <>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={baseClass}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={baseClass}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

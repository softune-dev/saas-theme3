"use client";

import { useTheme } from "@/lib/theme-context";

type SiteLogoProps = {
  /** Visual size slot — matches prior text logo scales. */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass: Record<NonNullable<SiteLogoProps["size"]>, string> = {
  sm: "h-8",
  md: "h-9 md:h-10",
  lg: "h-10 md:h-12",
};

const textSizeClass: Record<NonNullable<SiteLogoProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
};

/** Renders text or image logo from theme settings. Image mode with an empty
 * upload falls back to the text site name so the header never goes blank. */
export function SiteLogo({ size = "md", className = "" }: SiteLogoProps) {
  const { settings } = useTheme();
  const useImage =
    settings.logoType === "image" && Boolean(settings.logoImage?.trim());

  if (useImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={settings.logoImage}
        alt={settings.siteName || "Logo"}
        className={[
          sizeClass[size],
          "w-auto max-w-[10rem] object-contain object-left",
          className,
        ].join(" ")}
      />
    );
  }

  return (
    <span
      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
      className={[
        "font-display tracking-tight text-[var(--foreground)]",
        textSizeClass[size],
        className,
      ].join(" ")}
    >
      {settings.siteName}
    </span>
  );
}

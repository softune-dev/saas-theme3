"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SiteEditorSettings } from "./theme-types";
import { defaultSettings } from "./sample-data";
import { ensureGoogleFont } from "./google-fonts";

interface ThemeContextType {
  settings: SiteEditorSettings;
  updateSettings: (newSettings: Partial<SiteEditorSettings>) => void;
  getButtonRadiusClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Every font next/font actually loaded in app/layout.tsx, keyed by the value
 * the editor's pickers store. Deliberately small and curated rather than a
 * free-text field — see the layout.tsx comment: next/font needs each family
 * imported statically, so "any font" was never on the table. */
export const DISPLAY_FONTS: Record<string, string> = {
  fraunces: "var(--font-fraunces)",
  playfair: "var(--font-playfair)",
  cormorant: "var(--font-cormorant)",
  "libre-baskerville": "var(--font-libre-baskerville)",
  "dm-serif-display": "var(--font-dm-serif-display)",
  spectral: "var(--font-spectral)",
  "bodoni-moda": "var(--font-bodoni-moda)",
  newsreader: "var(--font-newsreader)",
  "instrument-serif": "var(--font-instrument-serif)",
  prata: "var(--font-prata)",
  "archivo-black": "var(--font-archivo-black)",
  "big-shoulders-display": "var(--font-big-shoulders-display)",
};

export const BODY_FONTS: Record<string, string> = {
  inter: "var(--font-inter)",
  manrope: "var(--font-manrope)",
  "work-sans": "var(--font-work-sans)",
  outfit: "var(--font-outfit)",
  karla: "var(--font-karla)",
  sora: "var(--font-sora)",
  "plus-jakarta-sans": "var(--font-plus-jakarta-sans)",
  "space-grotesk": "var(--font-space-grotesk)",
  urbanist: "var(--font-urbanist)",
  figtree: "var(--font-figtree)",
  "dm-sans": "var(--font-dm-sans)",
  "nunito-sans": "var(--font-nunito-sans)",
};

export function ThemeProvider({
  children,
  initialSettings = defaultSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteEditorSettings;
}) {
  const [settings, setSettings] = useState<SiteEditorSettings>(initialSettings);

  const updateSettings = (newSettings: Partial<SiteEditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Compute button border radius class based on buttonStyle
  const getButtonRadiusClass = () => {
    switch (settings.buttonStyle) {
      case "Pill":
        return "rounded-full";
      case "Square":
        return "rounded-none";
      case "Rounded":
      default:
        return "rounded-xl";
    }
  };

  // These are the ONLY three CSS variables the editor's color pickers should
  // touch, and they must be the exact names every section/page actually
  // renders with (--brand for buttons/accents, --foreground for text,
  // --background for page/button-contrast surface) — see globals.css. The
  // editor labels them "Primary" / "Text" / "Surface".
  useEffect(() => {
    const root = document.documentElement;
    // Author !important on an inline style beats any stylesheet rule, so the
    // merchant's chosen colors can never lose to a template default.
    if (settings.primaryColor) {
      root.style.setProperty("--brand", settings.primaryColor, "important");
    }
    if (settings.accentColor) {
      root.style.setProperty("--foreground", settings.accentColor, "important");
    }
    if (settings.surfaceColor) {
      root.style.setProperty("--background", settings.surfaceColor, "important");
    }

    const radius =
      settings.buttonStyle === "Pill"
        ? "9999px"
        : settings.buttonStyle === "Square"
        ? "0px"
        : "0.75rem";
    root.style.setProperty("--theme-btn-radius", radius, "important");

    // Curated fonts resolve to a next/font CSS var (fast, no FOUC). Anything
    // else is a literal Google Font family name picked from the editor's
    // full-library search — load it at runtime and apply the family name
    // directly. Unrecognised/empty keeps whatever globals.css defaults to.
    const displayVar = DISPLAY_FONTS[settings.displayFont ?? ""];
    if (displayVar) {
      root.style.setProperty("--font-display", displayVar, "important");
    } else if (settings.displayFont) {
      ensureGoogleFont(settings.displayFont);
      root.style.setProperty("--font-display", `"${settings.displayFont}", serif`, "important");
    }
    const bodyVar = BODY_FONTS[settings.bodyFont ?? ""];
    if (bodyVar) {
      root.style.setProperty("--font-sans", bodyVar, "important");
    } else if (settings.bodyFont) {
      ensureGoogleFont(settings.bodyFont);
      root.style.setProperty("--font-sans", `"${settings.bodyFont}", sans-serif`, "important");
    }
  }, [
    settings.primaryColor,
    settings.accentColor,
    settings.surfaceColor,
    settings.buttonStyle,
    settings.displayFont,
    settings.bodyFont,
  ]);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSettings,
        getButtonRadiusClass,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

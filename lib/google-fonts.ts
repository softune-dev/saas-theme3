/** Loads an arbitrary Google Font family at runtime via the Google Fonts CSS
 * API, for any displayFont/bodyFont value that isn't one of the next/font
 * -preloaded curated families in DISPLAY_FONTS/BODY_FONTS (theme-context.tsx)
 * — see dashboard/lib/google-fonts.ts, the picker this must stay compatible
 * with. No-op during SSR; dedupes per family for the page's lifetime. */
const loaded = new Set<string>();

export function ensureGoogleFont(family: string, weights = "400;500;600;700") {
  if (!family || typeof document === "undefined") return;
  if (loaded.has(family)) return;
  loaded.add(family);

  if (document.head.querySelector(`link[data-gf="${family}"]`)) return;

  const encoded = encodeURIComponent(family).replace(/%20/g, "+");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weights}&display=swap`;
  link.dataset.gf = family;
  document.head.appendChild(link);
}

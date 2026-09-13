/** WCAG relative-luminance based contrast: given a hex color, returns pure
 * black or white — whichever reads legibly on top of it. Used anywhere a
 * component paints itself with the merchant's primary color (announcement
 * bar, quick-view button) and needs its own text color to auto-adjust
 * instead of assuming the primary is always dark. */
export function getContrastColor(hex?: string | null): "#000000" | "#ffffff" {
  if (!hex) return "#ffffff";
  const c = hex.trim().replace("#", "");
  const full =
    c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return "#ffffff";

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  const [rl, gl, bl] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

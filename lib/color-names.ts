/**
 * Color-name → hex lookup, purely for rendering swatch circles. The
 * backend only ever stores the merchant-typed color NAME (e.g. "Navy") in
 * attributes.variants — there's no hex column anywhere, and this
 * deliberately doesn't add one. A name not found here falls back to a
 * neutral grey dot rather than guessing, so an unusual name (e.g. "Sea
 * Glass") never silently renders as the wrong color.
 */
export const COLOR_NAME_HEX: Record<string, string> = {
  black: "#171717",
  white: "#FFFFFF",
  ivory: "#FFFFF0",
  cream: "#F5EEDC",
  beige: "#E8DCC8",
  camel: "#C19A6B",
  tan: "#D2B48C",
  taupe: "#B8A99A",
  khaki: "#C3B091",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  charcoal: "#36454F",
  silver: "#C0C0C0",
  navy: "#1F2A44",
  blue: "#3B82F6",
  "sky blue": "#87CEEB",
  teal: "#0D9488",
  turquoise: "#40E0D0",
  green: "#22C55E",
  olive: "#708238",
  emerald: "#10B981",
  mint: "#98D8C8",
  red: "#DC2626",
  maroon: "#7F1D1D",
  burgundy: "#800020",
  rust: "#B7410E",
  brick: "#B22222",
  orange: "#F97316",
  rust_orange: "#C1440E",
  yellow: "#EAB308",
  mustard: "#D4A017",
  gold: "#D4AF37",
  pink: "#EC4899",
  blush: "#F4C2C2",
  rose: "#D46A6A",
  purple: "#8B5CF6",
  lavender: "#C4B5FD",
  lilac: "#C8A2C8",
  brown: "#78350F",
  chocolate: "#4A2C2A",
  coffee: "#4B3621",
  denim: "#1560BD",
  indigo: "#4B0082",
  wine: "#722F37",
  coral: "#FF7F50",
  peach: "#FFDAB9",
  multi: "#D1D5DB",
};

/** Case/whitespace-insensitive lookup — falls back to a neutral grey so an
 * unmapped color name still renders a swatch instead of breaking the row. */
export function colorNameToHex(name: string): string {
  const key = name.trim().toLowerCase();
  return COLOR_NAME_HEX[key] ?? "#D1D5DB";
}

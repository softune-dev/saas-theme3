"use client";

import { Icon } from "@iconify/react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

/** Renders any icon value the dashboard's icon picker could have stored,
 * across both eras of that picker:
 * - New values are full Iconify ids, e.g. "solar:bag-bold" (Iconify's Solar
 *   Bold set) — always contain a colon, rendered via @iconify/react.
 * - Old values are bare lucide kebab-case names, e.g. "shield-check" — no
 *   colon, rendered via lucide's <DynamicIcon>, same as before the picker
 *   moved to Solar. This is the only reason the lucide dependency is still
 *   here: every category/product/theme record saved before the switch
 *   keeps rendering exactly as it always has, with no migration required.
 * See dashboard/lib/solar-icons.ts and dashboard/lib/app-icon.tsx for the
 * picker/dashboard-side half of this. */
export function FeatureIcon({
  name,
  className,
  strokeWidth,
}: {
  name: string | undefined | null;
  className?: string;
  strokeWidth?: number;
}) {
  if (!name) return null;
  if (name.includes(":")) {
    return <Icon icon={name} className={className} />;
  }
  return <DynamicIcon name={name as IconName} className={className} strokeWidth={strokeWidth} />;
}

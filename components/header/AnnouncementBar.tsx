"use client";

import React, { Fragment, useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function AnnouncementBar() {
  const { settings } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  const items = (settings.announcementItems ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  const divider = settings.announcementDivider?.trim() || "✦";
  // No fabricated marketing copy when nothing's been entered yet — see the
  // matching comment in sections/BannerSection.tsx. Same sliding marquee
  // treatment either way (real items or this placeholder) — see
  // sections/BannerSection.tsx's own .animate-marquee usage.
  const marqueeItems = items.length > 0 ? items : ["Your announcement goes here"];

  if (!isVisible) return null;

  return (
    <div className="bg-[var(--theme-ink)] text-white text-xs py-2 px-4 relative z-40 transition-all border-b border-stone-800 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-marquee gap-3 whitespace-nowrap font-medium tracking-wide">
            {marqueeItems.concat(marqueeItems, marqueeItems, marqueeItems).map((text, i) => (
              <Fragment key={`${text}-${i}`}>
                <span>{text}</span>
                <span aria-hidden className="opacity-60">
                  {divider}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-400 hover:text-white transition-colors p-0.5 ml-2"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface BannerSectionProps {
  announcementItems: string[];
  announcementDivider: string;
}

export function BannerSection({
  announcementItems,
  announcementDivider,
}: BannerSectionProps) {
  const cleaned = announcementItems?.map((s) => s.trim()).filter(Boolean) ?? [];
  // Announcement chrome the merchant expects to see and fill in — same
  // instinct as the header's AnnouncementBar — so an empty state shows an
  // obvious placeholder instead of omitting the section entirely.
  const items = cleaned.length > 0 ? cleaned : ["Your announcement goes here"];
  const divider = announcementDivider?.trim() || "✦";

  return (
    <section className="border-y hairline py-5 overflow-hidden flex bg-transparent select-none">
      <div className="flex gap-3 whitespace-nowrap font-display text-2xl md:text-3xl animate-marquee items-center text-[var(--foreground)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="flex items-center gap-3"
          >
            {items.map((segment, j) => (
              <React.Fragment key={j}>
                {j > 0 ? <span className="opacity-40">{divider}</span> : null}
                {segment}
              </React.Fragment>
            ))}
            <span className="opacity-40">{divider}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

"use client";

import React, { Fragment, useState } from "react";
import { Phone, X } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useBusiness } from "@/lib/business-context";
import { SocialLinks } from "@/components/social-links/SocialLinks";
import { getContrastColor } from "@/lib/color-contrast";

export function AnnouncementBar() {
  const { settings } = useTheme();
  const business = useBusiness();
  const [isVisible, setIsVisible] = useState(true);

  const items = (settings.announcementItems ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  const divider = "|";
  const marqueeItems =
    items.length > 0 ? items : ["Your announcement goes here"];
  const phone = (business.phone ?? "").trim();
  // Bar always sits on the merchant's primary color — text auto-flips
  // black/white so it stays legible whether they pick a light or dark brand.
  const textColor = getContrastColor(settings.primaryColor);
  if (!isVisible) return null;

  return (
    <div
      className="relative z-40 w-full overflow-hidden px-4 py-2 text-xs"
      style={{ backgroundColor: "var(--brand)", color: textColor }}
    >
      <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4">
        <div className="flex shrink-0 items-center justify-start">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 font-medium tracking-wide hover:opacity-80"
              style={{ color: textColor }}
            >
              <Phone
                className="size-3.5 shrink-0 fill-current"
                strokeWidth={0}
              />
              <span>Call Now</span>
            </a>
          ) : null}
        </div>

        {/* Plain body font, not the display/heading font — this is a ticker,
           not a headline. */}
        <div className="relative mx-auto min-w-0 w-full max-w-xl overflow-hidden font-sans sm:max-w-2xl md:max-w-4xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--brand)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--brand)] to-transparent" />
          <div className="flex animate-marquee gap-3 whitespace-nowrap font-normal tracking-wide">
            {marqueeItems
              .concat(marqueeItems, marqueeItems, marqueeItems)
              .map((text, i) => (
                <Fragment key={`${text}-${i}`}>
                  <span>{text}</span>
                  <span aria-hidden className="px-0.5 font-sans opacity-50">
                    {divider}
                  </span>
                </Fragment>
              ))}
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <SocialLinks
            socials={business.socials}
            className="hidden items-center gap-3 sm:flex [&_a]:!text-current [&_a]:opacity-90 [&_a:hover]:opacity-100"
            iconClassName="size-3.5"
          />
          <button
            onClick={() => setIsVisible(false)}
            className="p-0.5 opacity-70 transition-opacity hover:opacity-100"
            style={{ color: textColor }}
            aria-label="Close announcement"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

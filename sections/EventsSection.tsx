"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Event } from "@/lib/theme-types";

interface EventsSectionProps {
  selectedEventIds: string[];
  events: Event[];
}

const MAX_EVENTS = 3;

function EventCard({ event, index }: { event: Event; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      <Link
        href={`/shop?event=${encodeURIComponent(event.slug)}`}
        className="group relative flex aspect-[16/9] w-full flex-col justify-end overflow-hidden border border-stone-300/60 bg-stone-200"
      >
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : null}
        {/* Two gradients keep left-aligned text legible over any photo: one
            fading in from the left toward the middle, one rising from the
            bottom — together they cover the whole text block, not just a
            bottom strip. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="relative flex flex-col items-start gap-2 p-4 text-left sm:p-6">
          <h3
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-2xl leading-tight tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            {event.name}
          </h3>
          {event.description ? (
            <p className="max-w-sm text-sm leading-relaxed text-white/85 line-clamp-2">
              {event.description}
            </p>
          ) : null}
          <span className="mt-1.5 inline-flex items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold tracking-wider text-[var(--background)] uppercase transition-opacity group-hover:opacity-90">
            {event.ctaLabel || "Shop now"}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonEventCard({ eventIndex }: { eventIndex: number }) {
  return (
    <div className="relative flex aspect-[16/9] w-full flex-col items-start justify-end gap-2 border border-stone-300/80 bg-stone-200/90 p-4 text-left select-none sm:p-5">
      <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-300/80 text-stone-600">
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
      <span
        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        className="font-display text-base text-stone-600 sm:text-lg"
      >
        Add event {eventIndex}
      </span>
      <div className="h-3 w-2/3 rounded-xs bg-stone-300/70" />
      <div className="mt-1.5 h-8 w-28 rounded-[var(--theme-btn-radius)] bg-stone-300/80" />
    </div>
  );
}

/** Up to 3 merchant-featured sale/promo campaigns, right under Hero. Fully
 * curated — an empty/unresolved selectedEventIds always renders the
 * skeleton, never "show every active event" (see CategoryShowcaseSection's
 * own comment for the same rule applied to categories). */
export function EventsSection({ selectedEventIds, events }: EventsSectionProps) {
  const selected =
    selectedEventIds?.length > 0
      ? selectedEventIds
          .map((id) => events.find((e) => e.id === id))
          .filter((e): e is Event => Boolean(e))
          .slice(0, MAX_EVENTS)
      : [];

  const isSkeleton = selected.length === 0;

  return (
    <section className="w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isSkeleton
            ? Array.from({ length: MAX_EVENTS }).map((_, i) => (
                <SkeletonEventCard key={i} eventIndex={i + 1} />
              ))
            : selected.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}

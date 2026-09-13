"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Event } from "@/lib/theme-types";

/** sessionStorage, not localStorage — reappears on a fresh visit tomorrow
 * instead of being dismissed forever the first time anyone closes it, but
 * doesn't re-show on every page navigation within one visit. Keyed by
 * event id so a merchant switching which event is the popup (or editing
 * this one) doesn't get suppressed by an old dismissal. */
function dismissKey(eventId: string): string {
  return `popup-dismissed-${eventId}`;
}

/** The one event (if any) a merchant has flagged as the storefront popup —
 * independent of whether it's also featured in the homepage Events
 * section. Renders nothing when there isn't one. */
export function EventPopupModal({ event }: { event: Event | null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!event) return;
    try {
      if (sessionStorage.getItem(dismissKey(event.id))) return;
    } catch {
      /* sessionStorage may be blocked — fall through and just show it */
    }
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [event]);

  function close() {
    setOpen(false);
    if (event) {
      try {
        sessionStorage.setItem(dismissKey(event.id), "1");
      } catch {
        /* nothing to persist if storage is blocked; it'll just show again */
      }
    }
  }

  if (!event || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:items-center md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/70"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={event.name}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative z-10 grid w-full max-w-xl grid-cols-1 overflow-hidden rounded-t-2xl border border-stone-300 bg-[var(--background)] md:grid-cols-2 md:rounded-none"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center border border-stone-200 bg-white text-stone-700 transition-colors hover:text-black"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            <div className="relative aspect-[16/10] w-full bg-stone-100 sm:aspect-[4/3] md:aspect-auto md:min-h-[280px]">
              {event.image ? (
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div className="flex flex-col justify-center gap-3 p-5 text-center md:p-8 md:text-left">
              {event.discountPercent > 0 ? (
                <span className="inline-flex w-fit items-center justify-center self-center bg-[var(--brand)] px-3 py-1 text-xs font-bold tracking-wide text-white uppercase md:self-start">
                  {event.discountPercent}% off
                </span>
              ) : null}
              <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl">
                {event.name}
              </h2>
              {event.description ? (
                <p className="text-sm leading-relaxed text-stone-500">
                  {event.description}
                </p>
              ) : null}
              <Link
                href={`/shop?event=${encodeURIComponent(event.slug)}`}
                onClick={close}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90 sm:w-fit"
              >
                {event.ctaLabel || "Shop now"}
              </Link>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Preview-only wiring: tells the dashboard editor's iframe what route is
 * actually loaded right now.
 *
 * The editor can't just read `iframe.contentWindow.location` — the browser's
 * same-origin policy blocks that across the dashboard (3000) and this app's
 * (3050) different origins. postMessage is the one channel that's allowed
 * through, so this beacon fires on every client-side navigation and lets the
 * editor's address bar track real clicks inside the preview instead of only
 * updating when the sidebar's own page picker changes.
 */
export function PreviewRouteBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only meaningful when actually embedded — posting to yourself as a
    // top-level window is a harmless no-op, so no dev/prod gate needed.
    if (window.parent === window) return;

    // __site/__r are the editor's OWN preview plumbing (see middleware.ts) —
    // they're really present in this iframe's URL, so searchParams sees them
    // too. Strip them before reporting back: the editor turns this path
    // straight into what a merchant can paste into a nav link, and neither
    // param should ever end up baked into one.
    const query = new URLSearchParams(searchParams);
    query.delete("__site");
    query.delete("__r");
    const path = query.size > 0 ? `${pathname}?${query}` : pathname;

    window.parent.postMessage(
      { source: "softune-preview", type: "route", path },
      "*",
    );
  }, [pathname, searchParams]);

  return null;
}

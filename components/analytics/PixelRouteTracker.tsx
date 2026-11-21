"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports a page view to the Meta and TikTok pixels each time the shopper moves
 * to another page of the store. Their base snippets (layout.tsx) report only the
 * page the visit started on; the storefront then navigates without a reload, so
 * every later page went unreported and ad audiences and funnel reports undercounted.
 */
export function PixelRouteTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // The base snippet already reported the page the visit started on.
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // tracking must never break the page
    }
    try {
      (window as unknown as { ttq?: { page?: () => void } }).ttq?.page?.();
    } catch {
      // same
    }
  }, [pathname]);

  return null;
}

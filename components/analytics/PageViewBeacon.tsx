"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { logPageView } from "@/lib/pageview";

/**
 * Fires one real pageview beacon per client-side route change — the actual
 * data source behind Analytics → Visitors/Conversion Rate in the dashboard
 * (see app/api/analytics.py). Mounted once in the root layout so every page
 * gets counted, not opted in per-page.
 *
 * Skips entirely when embedded in the dashboard's theme editor preview
 * iframe (same `window.parent === window` check PreviewRouteBeacon.tsx uses
 * for its own purpose) — a merchant clicking through their own site while
 * editing it is not a real visitor, and counting it would silently inflate
 * their own Visitors/Conversion Rate with their own editing session.
 */
export function PageViewBeacon({ host }: { host: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.parent !== window) return;
    logPageView(host, pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- host is static for the lifetime of this layout
  }, [pathname]);

  return null;
}

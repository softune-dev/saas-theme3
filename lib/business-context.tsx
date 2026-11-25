"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteConfig } from "./theme-types";

export type Business = NonNullable<PublicSiteConfig["site"]["business"]>;

const BusinessContext = createContext<Business>({});
const BadgeContext = createContext<boolean>(false);

/** Real business/contact info (Site Settings → Contact Info), resolved once
 * server-side in the root layout and made available to any client
 * component nested under it — Footer needs it for social icons without
 * every one of its ~9 call sites having to thread it through as a prop. */
export function BusinessProvider({
  business,
  badge = false,
  children,
}: {
  business: Business;
  /** Config's top-level `badge`: show the "Powered by" footer line. */
  badge?: boolean;
  children: ReactNode;
}) {
  return (
    <BusinessContext.Provider value={business}>
      <BadgeContext.Provider value={badge}>{children}</BadgeContext.Provider>
    </BusinessContext.Provider>
  );
}

export function useBadge(): boolean {
  return useContext(BadgeContext);
}

export function useBusiness(): Business {
  return useContext(BusinessContext);
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteConfig } from "./theme-types";

export type Business = NonNullable<PublicSiteConfig["site"]["business"]>;

const BusinessContext = createContext<Business>({});

/** Real business/contact info (Site Settings → Contact Info), resolved once
 * server-side in the root layout and made available to any client
 * component nested under it — Footer needs it for social icons without
 * every one of its ~9 call sites having to thread it through as a prop. */
export function BusinessProvider({
  business,
  children,
}: {
  business: Business;
  children: ReactNode;
}) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): Business {
  return useContext(BusinessContext);
}

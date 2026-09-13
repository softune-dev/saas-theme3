import { ShieldBan } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Restricted",
  robots: { index: false, follow: false },
};

/**
 * Landed on by lib/get-site.ts's fetchSiteConfig when the backend's
 * ip_block middleware (app/main.py) reports this visitor's IP as blocked
 * (code "ip_blocked") — see that middleware's own docstring for the
 * merchant's product choice to tell a blocked visitor plainly rather than
 * disguising it as a 404.
 *
 * Deliberately static — does NOT call getSiteConfig()/fetchSiteConfig().
 * This route must never itself depend on a backend call that could also be
 * blocked for the same IP, which would either loop or fail confusingly.
 * No merchant-specific contact info for the same reason: fetching it here
 * would be exactly the request that just got blocked.
 */
export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background,#fff)] px-6 text-center text-[var(--foreground,#171717)]">
      <span className="flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <ShieldBan className="size-8" strokeWidth={1.5} />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Access Restricted</h1>
        <p className="max-w-sm text-sm leading-relaxed text-stone-500">
          Your IP address has been blocked by this store.
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-stone-500">
          If you believe this is a mistake, please contact the store owner
          directly through a channel you've used before (phone, email, or
          social media).
        </p>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";

/** Cookie so pages navigated to *inside* the preview iframe (which won't carry
 * the ?__site= query param) keep resolving to the same site. */
const SITE_COOKIE = "__preview_site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";

/**
 * IP-block check, done HERE at the edge rather than inside lib/get-site.ts's
 * page-level fetch, because that fetch is wrapped in Next.js's Data Cache
 * (`next: { revalidate: 60 }`, see get-site.ts's own comment on why) — a
 * cache hit reuses the SAME cached response for every visitor within that
 * window regardless of their own IP, so a per-visitor block check bundled
 * into that cached fetch simply doesn't reliably re-run. Edge middleware
 * runs on every single request before any of that page-level caching, so
 * it's the one place a check like this is guaranteed fresh every time.
 *
 * `cache: "no-store"` matters here too, separate from the above: fetch()
 * calls from middleware aren't subject to Next's page Data Cache the same
 * way, but being explicit costs nothing and documents the intent.
 *
 * Sends the real IP as X-Original-Client-IP, NOT X-Forwarded-For — confirmed
 * empirically that the backend's own reverse proxy (Caddy) overwrites
 * X-Forwarded-For with whatever it sees as the immediate connection peer
 * (this Vercel function's own outbound IP, not the original visitor's),
 * silently discarding any value set here. Caddy has no special handling for
 * an arbitrary custom header name, so it passes through untouched — see
 * app/main.py's ip_block middleware, which checks this header first.
 */
async function checkIpBlocked(host: string, clientIp: string | undefined): Promise<boolean> {
  if (!clientIp) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/public/site/${host}`, {
      method: "HEAD",
      headers: { "X-Original-Client-IP": clientIp },
      cache: "no-store",
    });
    return res.status === 403;
  } catch {
    // Network error reaching our own backend — fail open, same discipline
    // as the backend's own ip_block middleware. A check that can't be
    // answered must never itself take the storefront down.
    return false;
  }
}

/**
 * Host alias for the dashboard's editor preview iframe, which loads this
 * app at its shared Vercel URL (e.g. saas-theme1.vercel.app) regardless of
 * environment — the browser's real Host header there matches no site, so
 * getSiteConfig() would 404. That 404 crashes rather than 404s, because it
 * fires from the root layout (app/layout.tsx), where Next.js forbids
 * notFound().
 *
 * Resolution order, most specific first:
 *   1. ?__site=<host>  — the dashboard passes the site currently being edited
 *   2. __preview_site cookie — set from (1), survives in-iframe navigation
 *   3. SITE_HOST env — plain visits to the shared URL with no context
 *
 * Deliberately NOT gated to development: real customer traffic never
 * carries a ?__site= param (only the dashboard's iframe does), and the
 * data this ever exposes is a site's already-published, already-public
 * content — same as visiting that site's own real domain directly. This
 * previously only worked against `localhost`, which meant the editor's
 * preview broke entirely once deployed — this is the actual fix for that,
 * not a security loosening.
 *
 * Uses a custom header, NOT x-forwarded-host: Vercel's own edge network
 * treats x-forwarded-host as a trusted, infrastructure-owned value (it
 * reflects the real original host for proxy-trust reasons) and resets it
 * after middleware runs, silently discarding whatever middleware set it
 * to — confirmed by testing directly against the deployed instance:
 * middleware ran (its Set-Cookie showed up), but getSiteHost() still saw
 * the real host, not the override. A custom header isn't reserved, so
 * Vercel leaves it alone.
 */
export async function middleware(request: NextRequest) {
  const paramSite = request.nextUrl.searchParams.get("__site");
  const cookieSite = request.cookies.get(SITE_COOKIE)?.value;
  const siteHost = paramSite || cookieSite || process.env.SITE_HOST;

  const headers = new Headers(request.headers);
  // The real visitor IP, threaded through as a custom header so
  // lib/get-site.ts's server-side fetch to our own API can forward it as
  // X-Forwarded-For — without this, a Server Component's OWN outbound
  // fetch() call carries no trace of the original browser's IP at all (it's
  // a brand-new connection from this app's server, not a proxied
  // continuation of the inbound request), so the backend's IP-block
  // middleware (app/main.py's ip_block) would only ever see client-side
  // calls like checkout, never a page's own server-rendered data fetch —
  // a blocked visitor could still browse every page, just not check out.
  // x-forwarded-for here is trustworthy: this is edge middleware reading
  // the INBOUND request, before any of our own outbound hops.
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) headers.set("x-real-client-ip", clientIp);

  // /blocked itself must never be checked — this IS the page a blocked
  // visitor is redirected to, checking it too would just loop forever.
  if (!request.nextUrl.pathname.startsWith("/blocked")) {
    const realHost = (
      siteHost ||
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      ""
    ).split(":")[0];
    if (realHost && (await checkIpBlocked(realHost, clientIp))) {
      return NextResponse.rewrite(new URL("/blocked", request.url));
    }
  }

  if (!siteHost) return NextResponse.next({ request: { headers } });

  headers.set("x-preview-site-host", siteHost);

  const response = NextResponse.next({ request: { headers } });
  if (paramSite && paramSite !== cookieSite) {
    // sameSite: "none" + secure is required for this cookie to survive at
    // all — it's set and read from inside a cross-site iframe (dashboard on
    // one origin, this app on another), and the default SameSite=Lax a
    // cookie gets without this is dropped on exactly that kind of request.
    // Without it, every in-preview client-side navigation (clicking a
    // product/category link inside the iframe, which carries no ?__site=)
    // silently lost the site override and 404'd.
    response.cookies.set(SITE_COOKIE, paramSite, {
      path: "/",
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
  }
  return response;
}

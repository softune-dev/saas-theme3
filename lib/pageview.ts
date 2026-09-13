/**
 * Real visitor/traffic beacon — POST /public/site/{host}/pageview
 * (app/api/public.py's log_page_view). Fire-and-forget: a failed or slow
 * beacon call must never affect the page the visitor is actually looking
 * at, so this never throws and callers never await anything blocking.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

const SESSION_KEY = "sf_session_id";

/** A random id kept in localStorage for the life of the browser's local
 * storage — not a real identity, just enough for the backend to count
 * unique visitors (see PageView's docstring in app/models.py). Falls back
 * to a fresh one on every call if localStorage is unavailable (Safari
 * private mode, storage disabled) rather than throwing. */
function getOrCreateSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function logPageView(host: string, path: string) {
  try {
    const body = JSON.stringify({
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      session_id: getOrCreateSessionId(),
    });
    // sendBeacon survives the page unloading (e.g. clicking a link away)
    // in a way a normal fetch call can't — falls back to fetch with
    // keepalive for browsers/contexts where it's unavailable.
    //
    // type MUST be "text/plain", not "application/json": the backend is on
    // a different origin (API_BASE_URL) than the storefront, and a
    // cross-origin sendBeacon with a non-CORS-safelisted content type
    // (application/json is not one) silently fails with net::ERR_FAILED —
    // sendBeacon can't complete the CORS preflight a JSON content type
    // forces. text/plain IS safelisted, so no preflight is needed. The
    // backend doesn't care either way — Starlette's request.json() decodes
    // the raw body regardless of the Content-Type header.
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain" });
      navigator.sendBeacon(`${API_BASE_URL}/public/site/${host}/pageview`, blob);
      return;
    }
    fetch(`${API_BASE_URL}/public/site/${host}/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // best-effort — see module docstring
    });
  } catch {
    // best-effort — see module docstring
  }
}

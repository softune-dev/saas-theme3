/**
 * A persistent per-browser device id used ONLY for checkout fraud checks
 * (device pending-lock / cooldown — see app/fraud.py and Settings -> Fraud
 * Protection). Deliberately NOT the same id as lib/pageview.ts's
 * sf_session_id — that one is an analytics-only, non-identity signal;
 * reusing it here would conflate two different jobs and silently break if
 * its own key/shape ever changes for analytics reasons unrelated to fraud.
 *
 * Best-effort friction, not a hard identity guarantee: a determined abuser
 * can clear localStorage and get a fresh id. This is the small-business
 * tier of fraud protection (see app/fraud.py's module docstring) — it
 * raises the cost of casual repeat abuse, it doesn't claim to stop a
 * determined one.
 */

const DEVICE_KEY = "sf_device_id";

export function getOrCreateDeviceId(): string {
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DEVICE_KEY, fresh);
    return fresh;
  } catch {
    // Safari private mode, storage disabled, etc. — a fresh id every call
    // means the pending-lock/cooldown checks simply won't catch repeats
    // from this particular browser, which is an acceptable degrade (same
    // as lib/pageview.ts's identical fallback), not a broken checkout.
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

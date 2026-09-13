/**
 * Google reCAPTCHA: v3 (invisible, score-based) as the primary check, with
 * v2 (checkbox) as a fallback the backend asks for when v3's score is too
 * low to auto-approve — see app/recaptcha.py. Both live on the same page
 * off ONE script load (Google's own documented way to combine v2 + v3: a
 * plain, unparameterized script tag, then grecaptcha.execute() for v3 and
 * grecaptcha.render() for v2 — no `?render=` query param needed for either).
 */
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        params: Record<string, unknown>,
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const V3_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const V2_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY;

/** True once a v2 fallback key exists to actually render — callers use this
 * to decide whether a "please verify" response from the backend can be
 * acted on at all, or whether there's simply nothing to show. */
export const hasV2Fallback = !!V2_SITE_KEY;

/** Thrown by checkout/contact submissions when the backend's v3 score was
 * too low and it's offering a v2 checkbox fallback instead of a flat
 * rejection (see app/recaptcha.py's enforce()). */
export class RecaptchaChallengeRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecaptchaChallengeRequiredError";
  }
}

/** Reads a fetch Response's error body and throws the right error type —
 * RecaptchaChallengeRequiredError for the specific "please verify" signal,
 * a plain Error otherwise. Call this instead of a bare `throw new Error(...)`
 * wherever checkout/contact handle a non-ok response. */
export async function throwForErrorResponse(res: Response, fallbackMessage: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const detail = body.detail;
  if (detail && typeof detail === "object" && detail.code === "recaptcha_challenge_required") {
    throw new RecaptchaChallengeRequiredError(detail.message || "Additional verification required.");
  }
  const message = typeof detail === "string" ? detail : detail?.message;
  throw new Error(message || fallbackMessage);
}

// Module-level, not per-call: the script tag must only ever be added once no
// matter how many times these functions are called across the app.
let scriptLoad: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined" || (!V3_SITE_KEY && !V2_SITE_KEY)) {
    return Promise.resolve();
  }
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoad) return scriptLoad;
  scriptLoad = new Promise((resolve) => {
    const script = document.createElement("script");
    // v3's execute() only works for a site key the script was loaded WITH
    // via ?render= — it is not enough for the key to just be passed to
    // execute() later. v2's render() has no such requirement and works
    // fine off this same script regardless. See Google's own "using v2 and
    // v3 together" guidance.
    script.src = V3_SITE_KEY
      ? `https://www.google.com/recaptcha/api.js?render=${V3_SITE_KEY}`
      : "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptLoad;
}

/** Returns "" (not a rejected promise) when the site key isn't configured or
 * the script/execute call fails for any reason — the backend already treats
 * a blank token as "verification skipped" when unconfigured, and a real
 * failure here shouldn't be the reason a genuine shopper can't check out. */
export async function getRecaptchaToken(action: string): Promise<string> {
  if (!V3_SITE_KEY) return "";
  try {
    await loadScript();
    return await new Promise<string>((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(V3_SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(""));
      });
    });
  } catch {
    return "";
  }
}

export type V2WidgetHandle = { reset: () => void };

/** Renders the v2 checkbox into `container` — only called after the backend
 * has actually asked for it (a RecaptchaChallengeRequiredError), never
 * up-front, so a normal checkout/contact submit never shows it. */
export async function renderV2Checkbox(
  container: HTMLElement,
  onVerify: (token: string | null) => void,
): Promise<V2WidgetHandle | null> {
  if (!V2_SITE_KEY) return null;
  await loadScript();
  return new Promise((resolve) => {
    window.grecaptcha!.ready(() => {
      const widgetId = window.grecaptcha!.render(container, {
        sitekey: V2_SITE_KEY,
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onVerify(null),
      });
      resolve({
        reset: () => window.grecaptcha?.reset(widgetId),
      });
    });
  });
}

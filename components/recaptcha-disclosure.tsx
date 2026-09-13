/** Required by Google's reCAPTCHA terms whenever the floating badge is
 * hidden (see app/globals.css's .grecaptcha-badge rule) — this text
 * replaces it. Render next to checkout and the contact form's submit
 * buttons, the two places that call getRecaptchaToken() (lib/recaptcha.ts). */
export function RecaptchaDisclosure() {
  return (
    <p className="text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--foreground)]"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--foreground)]"
      >
        Terms of Service
      </a>{" "}
      apply.
    </p>
  );
}

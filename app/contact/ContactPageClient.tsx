"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
} from "lucide-react";
import { Footer } from "@/components/footer/Footer";
import { SocialLinks } from "@/components/social-links/SocialLinks";
import type { Business } from "@/lib/business-context";
import {
  RecaptchaChallengeRequiredError,
  getRecaptchaToken,
  hasV2Fallback,
  throwForErrorResponse,
} from "@/lib/recaptcha";
import { RecaptchaDisclosure } from "@/components/recaptcha-disclosure";
import {
  RecaptchaV2Fallback,
  type RecaptchaV2FallbackHandle,
} from "@/components/recaptcha-v2-fallback";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export function ContactPageClient({
  business,
  host,
}: {
  business: Business;
  host: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Order Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsChallenge, setNeedsChallenge] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);
  const v2Ref = useRef<RecaptchaV2FallbackHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitting(true);
    setError(null);
    try {
      const recaptcha_token = await getRecaptchaToken("contact");
      const res = await fetch(`${API_BASE_URL}/public/site/${host}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { name, phone, subject, message },
          recaptcha_token,
          recaptcha_v2_token: v2Token ?? "",
        }),
      });
      if (!res.ok) {
        await throwForErrorResponse(res, "Couldn't send your message. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      if (err instanceof RecaptchaChallengeRequiredError) {
        setNeedsChallenge(true);
        setError(hasV2Fallback ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        v2Ref.current?.reset();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const address = business.address;
  const addressLine = [address?.street, address?.city, address?.region, address?.country]
    .filter(Boolean)
    .join(", ");
  const hours = business.opening_hours ?? [];
  const hasSocials =
    business.socials &&
    !Array.isArray(business.socials) &&
    Object.values(business.socials).some(Boolean);

  const channels = [
    addressLine
      ? {
          icon: MapPin,
          label: "Studio",
          body: addressLine,
          href: null as string | null,
        }
      : null,
    business.phone
      ? {
          icon: Phone,
          label: "Phone",
          body: business.phone,
          href: `tel:${business.phone}`,
        }
      : null,
    business.email
      ? {
          icon: Mail,
          label: "Email",
          body: business.email,
          href: `mailto:${business.email}`,
        }
      : null,
    business.whatsapp
      ? {
          icon: MessageCircle,
          label: "WhatsApp",
          body: "Chat with us",
          href: `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, "")}`,
        }
      : null,
  ].filter(Boolean) as {
    icon: typeof MapPin;
    label: string;
    body: string;
    href: string | null;
  }[];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Editorial header — same language as About */}
      <section className="mx-auto max-w-[1600px] px-6 pt-16 text-center md:px-10 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl space-y-5"
        >
          <span className="eyebrow justify-center">Get in touch</span>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="font-display text-4xl leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl"
          >
            Contact.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-stone-500 md:text-lg">
            {business.support_note?.trim() ||
              "Questions about an order, sizing, or something else? Send a note and we will get back to you."}
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-16 md:px-10 md:py-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 lg:col-span-5"
          >
            <div className="space-y-3">
              <span className="eyebrow">Channels</span>
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="font-display text-3xl leading-[1.1] text-[var(--foreground)] md:text-4xl"
              >
                How to reach us
              </h2>
            </div>

            {channels.length > 0 ? (
              <div className="space-y-4">
                {channels.map((c) => {
                  const Icon = c.icon;
                  const inner = (
                    <>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-[var(--foreground)]">
                        <Icon strokeWidth={1.25} className="size-5" />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block text-[11px] font-semibold tracking-[0.18em] text-stone-400 uppercase">
                          {c.label}
                        </span>
                        <span className="mt-1 block text-sm font-medium text-[var(--foreground)] md:text-base">
                          {c.body}
                        </span>
                      </span>
                    </>
                  );
                  return c.href ? (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-4 border border-stone-200 bg-[var(--background)] p-5 transition-colors hover:border-stone-300"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={c.label}
                      className="flex items-center gap-4 border border-stone-200 bg-[var(--background)] p-5"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-400">Contact details coming soon.</p>
            )}

            {hours.length > 0 ? (
              <div className="space-y-3 border-t border-stone-200 pt-8">
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-stone-400 uppercase">
                  <Clock strokeWidth={1.25} className="size-4" />
                  Hours
                </div>
                <div className="space-y-1 text-sm text-stone-500">
                  {hours.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {hasSocials ? (
              <div className="space-y-4 border-t border-stone-200 pt-8">
                <span className="eyebrow">Connect</span>
                <SocialLinks
                  socials={business.socials}
                  className="flex items-center gap-5"
                  iconClassName="size-5"
                />
              </div>
            ) : null}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="border border-stone-200 bg-stone-50/50 p-8 sm:p-10 lg:col-span-7"
          >
            <div className="mb-8 space-y-2">
              <span className="eyebrow">Message</span>
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="font-display text-2xl text-[var(--foreground)] md:text-3xl"
              >
                Send a note
              </h2>
              <p className="text-sm text-stone-500">
                Fill in the details below and we will get back to you.
              </p>
            </div>

            {submitted ? (
              <div className="space-y-4 py-10 text-center">
                <CheckCircle2 className="mx-auto size-10 text-emerald-700" strokeWidth={1.25} />
                <h3
                  style={{ fontFamily: "var(--font-display)" }}
                  className="font-display text-2xl text-[var(--foreground)]"
                >
                  Message received
                </h3>
                <p className="text-sm text-stone-500">
                  Thank you. Our team will reach out shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setPhone("");
                    setMessage("");
                  }}
                  className="mt-2 text-sm font-semibold text-[var(--foreground)] underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-stone-500">
                      Your name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full border-b border-stone-300 bg-transparent py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-stone-500">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full border-b border-stone-300 bg-transparent py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-stone-500">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border-b border-stone-300 bg-transparent py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--brand)]"
                  >
                    <option value="Order Inquiry">Order inquiry & tracking</option>
                    <option value="Product & Sizing">Product & sizing</option>
                    <option value="Exchange & Returns">Exchange or return</option>
                    <option value="General Feedback">General feedback</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-stone-500">
                    Your message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help"
                    className="w-full resize-none border-b border-stone-300 bg-transparent py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)]"
                  />
                </div>

                {error ? <p className="text-xs text-red-600">{error}</p> : null}

                {needsChallenge && hasV2Fallback ? (
                  <RecaptchaV2Fallback ref={v2Ref} onVerify={setV2Token} />
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || (needsChallenge && !v2Token)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-4 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <span>{submitting ? "Sending..." : "Send message"}</span>
                  <Send className="size-3.5" />
                </button>
                <RecaptchaDisclosure />
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

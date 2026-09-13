"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface BannerCtaSectionProps {
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}

/** When merchant hasn't configured title or body, render editorial skeleton card. */
export function BannerCtaSection({
  ctaTitle,
  ctaBody,
  ctaButton,
}: BannerCtaSectionProps) {
  const title = (ctaTitle ?? "").trim();
  const body = (ctaBody ?? "").trim();
  const button = (ctaButton ?? "").trim() || "Subscribe";

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!title && !body) {
    return (
      <section className="bg-[var(--background)] py-10 md:py-14">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="relative border border-stone-200 bg-stone-50 p-6 sm:p-8 md:p-10 select-none">
            <div className="relative z-10 mx-auto max-w-2xl space-y-5 text-center">
              <div className="h-7 sm:h-8 w-64 sm:w-80 mx-auto bg-stone-200 rounded-xs" />
              <div className="h-4 w-72 sm:w-96 max-w-full mx-auto bg-stone-200/80 rounded-xs" />
              <div className="mx-auto flex max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row">
                <div className="h-10 sm:h-11 w-full border border-stone-300 bg-transparent sm:flex-1" />
                <div className="h-10 sm:h-11 w-full sm:w-32 rounded-[var(--theme-btn-radius)] bg-stone-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <section className="bg-[var(--background)] py-10 md:py-14">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="relative border border-stone-200 bg-stone-50 p-6 sm:p-8 md:p-10">
          <div className="relative z-10 mx-auto max-w-2xl space-y-5 text-center">
            {title ? (
              <h2
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                className="font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
              >
                {title}
              </h2>
            ) : null}

            {body ? (
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">
                {body}
              </p>
            ) : null}

            {subscribed ? (
              <div className="inline-flex items-center gap-2 border border-stone-200 bg-stone-100 p-4 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Thank you for subscribing.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full border border-stone-300 bg-transparent px-4 py-3 text-xs text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none sm:flex-1"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3.5 text-xs font-semibold tracking-wider text-[var(--background)] uppercase transition-opacity hover:opacity-90"
                >
                  <span>{button}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

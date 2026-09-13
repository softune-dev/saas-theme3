"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { useBusiness } from "@/lib/business-context";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { SocialLinks } from "@/components/social-links/SocialLinks";

export function Footer() {
  const { settings } = useTheme();
  const business = useBusiness();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t hairline bg-[var(--background)]">
      <div className="mx-auto grid max-w-[1600px] items-start gap-8 px-6 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-24 lg:gap-16">

        {/* Brand Info */}
        <div className="flex flex-col items-center text-center md:col-span-4 md:items-start md:text-left">
          <div className="mb-6">
            <SiteLogo size="lg" />
          </div>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-500 md:mx-0">
            {settings.footerDescription}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/payment.png"
            alt="Accepted payment methods"
            className="mt-4 h-auto w-full max-w-[340px] object-contain object-left md:max-w-[400px]"
          />
        </div>

        {/* Shop Column */}
        <div className="md:col-span-2 text-center md:text-left">
          <div className="text-[12px] uppercase tracking-[0.2em] mb-6 font-medium text-[var(--foreground)]">
            {settings.footerShopLabel}
          </div>
          <ul className="space-y-3.5 text-sm">
            {(settings.footerShopLinks ?? []).map((link) => (
              <li key={link.id}>
                <Link
                  href={link.path || "/"}
                  className="text-stone-500 hover:text-[var(--foreground)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="md:col-span-2 text-center md:text-left">
          <div className="text-[12px] uppercase tracking-[0.2em] mb-6 font-medium text-[var(--foreground)]">
            {settings.footerCompanyLabel}
          </div>
          <ul className="space-y-3.5 text-sm">
            {(settings.footerCompanyLinks ?? []).map((link) => (
              <li key={link.id}>
                <Link
                  href={link.path || "/"}
                  className="text-stone-500 hover:text-[var(--foreground)] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="text-[12px] uppercase tracking-[0.2em] mb-6 font-medium text-[var(--foreground)]">
            Newsletter
          </div>
          <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto md:mx-0">
            Subscribe to receive seasonal updates, artisan stories, and private previews.
          </p>

          {subscribed ? (
            <p className="text-xs text-stone-700 font-medium">
              Thank you for subscribing to our journal.
            </p>
          ) : (
            <form
              onSubmit={handleNewsletter}
              className="flex border-b hairline group focus-within:border-[var(--foreground)] transition-colors w-full max-w-sm"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400 text-[var(--foreground)]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="text-stone-400 group-focus-within:text-[var(--foreground)] transition-colors px-2"
              >
                →
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t hairline">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-widest text-stone-500 gap-4">
          <span>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</span>
          <SocialLinks
            socials={business.socials}
            className="flex items-center gap-5 normal-case tracking-normal"
            iconClassName="size-5"
          />
        </div>
      </div>
    </footer>
  );
}

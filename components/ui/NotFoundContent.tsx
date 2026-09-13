"use client";

import React from "react";
import Link from "next/link";
import { Footer } from "@/components/footer/Footer";

export function NotFoundContent() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto px-6 py-20 sm:py-32 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl font-bold text-stone-500/10 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-2xl sm:text-3xl text-[var(--foreground)]"
            >
              Page Not Found
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] px-8 py-4 text-[12px] uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-stone-300 bg-transparent text-[var(--foreground)] px-8 py-4 text-[12px] uppercase tracking-wider font-semibold hover:border-[var(--brand)] transition-colors"
          >
            Browse Shop
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-stone-200 max-w-md mx-auto w-full">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
            Curated Collections
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link
              href="/shop?category=women"
              className="px-3.5 py-2 bg-stone-50 border hairline text-[var(--foreground)] hover:border-[var(--brand)] transition-colors"
            >
              Women
            </Link>
            <Link
              href="/shop?category=men"
              className="px-3.5 py-2 bg-stone-50 border hairline text-[var(--foreground)] hover:border-[var(--brand)] transition-colors"
            >
              Men
            </Link>
            <Link
              href="/shop?category=bags"
              className="px-3.5 py-2 bg-stone-50 border hairline text-[var(--foreground)] hover:border-[var(--brand)] transition-colors"
            >
              Bags
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

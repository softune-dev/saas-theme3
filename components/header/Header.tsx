"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/components/cart/CartContext";
import type { ProductCategory } from "@/lib/theme-types";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MobileMenu } from "./MobileMenu";

export function Header({
  categories = [],
}: {
  /** Real site categories for the mobile drawer. */
  categories?: ProductCategory[];
}) {
  const { settings } = useTheme();
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/85 backdrop-blur-md border-b hairline">
      <div className="mx-auto max-w-[1600px] px-6 py-5 md:px-10 flex items-center justify-between lg:grid lg:grid-cols-3">

        {/* Left Side: Mobile Menu Button + Mobile Logo (< lg) OR Desktop Nav (>= lg) */}
        <div className="flex items-center gap-4 md:gap-6 justify-start">
          <button
            className="lg:hidden -ml-2 p-2 text-[var(--foreground)] hover:opacity-75 transition-opacity"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.25} className="h-5 w-5" />
          </button>

          <Link href="/" className="lg:hidden" aria-label={settings.siteName || "Home"}>
            <SiteLogo size="sm" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em]">
            {settings.navLinks.map((n) => (
              <Link
                key={n.id}
                href={n.path || "/"}
                className="link-underline py-1 text-stone-600 hover:text-[var(--foreground)] transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Desktop Logo (>= lg) */}
        <div className="hidden lg:flex justify-center">
          <Link href="/" aria-label={settings.siteName || "Home"}>
            <SiteLogo size="md" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4 justify-end">
          <Link
            href="/shop"
            aria-label="Search"
            className="p-2 rounded-full hover:bg-stone-200/50 text-[var(--foreground)] transition-colors"
          >
            <Search strokeWidth={1.25} className="h-5 w-5" />
          </Link>

          <Link
            href="/login"
            aria-label="Account"
            className="p-2 rounded-full hover:bg-stone-200/50 text-[var(--foreground)] transition-colors"
          >
            <User strokeWidth={1.25} className="h-5 w-5" />
          </Link>

          <button
            onClick={openDrawer}
            aria-label="Bag"
            className="p-2 relative rounded-full hover:bg-stone-200/50 text-[var(--foreground)] transition-colors"
          >
            <ShoppingBag strokeWidth={1.25} className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-medium bg-[var(--brand)] text-[var(--background)] inline-flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />
    </header>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/components/cart/CartContext";
import type { ProductCategory } from "@/lib/theme-types";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MobileMenu } from "./MobileMenu";

type NavItem = { key: string; href: string; label: string };

export function Header({
  categories = [],
}: {
  categories?: ProductCategory[];
}) {
  const { settings } = useTheme();
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    active: overflows,
  });

  const items = useMemo<NavItem[]>(() => {
    const seen = new Set<string>();
    const out: NavItem[] = [];

    for (const n of settings.navLinks ?? []) {
      const href = (n.path || "/").trim() || "/";
      const label = (n.label || "").trim();
      if (!label) continue;
      const id = href.toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ key: n.id || href, href, label });
    }

    for (const cat of categories) {
      const href = `/shop?category=${encodeURIComponent(cat.slug)}`;
      const id = href.toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ key: cat.id, href, label: cat.name });
    }

    return out;
  }, [settings.navLinks, categories]);

  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list) return;

    const measure = () => {
      setOverflows(list.scrollWidth > track.clientWidth + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(list);
    return () => ro.disconnect();
  }, [items]);

  return (
    <header className="sticky top-0 z-40 w-full border-b hairline bg-[var(--background)]">
      <div className="relative flex w-full items-center px-4 py-4 md:px-6 lg:px-8">
        <div className="relative z-20 flex shrink-0 items-center gap-2">
          <button
            className="-ml-1 p-2 text-[var(--foreground)] transition-opacity hover:opacity-75 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.25} className="h-5 w-5" />
          </button>
          <Link href="/" aria-label={settings.siteName || "Home"}>
            <SiteLogo size="sm" />
          </Link>
        </div>

        <nav
          className="hidden flex-1 min-w-0 items-center justify-center px-4 md:px-6 lg:flex"
          aria-label="Primary"
        >
          {items.length > 0 ? (
            <div
              ref={trackRef}
              className="relative w-full min-w-0 max-w-full"
            >
              <div
                ref={overflows ? emblaRef : undefined}
                className={overflows ? "overflow-hidden" : ""}
              >
                <div
                  ref={listRef}
                  className={[
                    "flex items-center gap-5 md:gap-7",
                    overflows ? "" : "justify-center",
                  ].join(" ")}
                >
                  {items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="shrink-0 py-1 text-[12px] font-medium tracking-[0.16em] text-[var(--foreground)] uppercase whitespace-nowrap decoration-2 underline-offset-8 transition-colors hover:underline hover:decoration-[var(--brand)] md:text-[13px]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              {overflows ? (
                <>
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--background)] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--background)] to-transparent" />
                </>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="relative z-20 ml-auto flex shrink-0 items-center justify-end gap-1 md:gap-2">
          <Link
            href="/shop"
            aria-label="Search"
            className="p-2 text-[var(--foreground)] transition-colors hover:text-[var(--brand)]"
          >
            <Search strokeWidth={1.25} className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            aria-label="Account"
            className="p-2 text-[var(--foreground)] transition-colors hover:text-[var(--brand)]"
          >
            <User strokeWidth={1.25} className="h-5 w-5" />
          </Link>
          <button
            onClick={openDrawer}
            aria-label="Bag"
            className="relative p-2 text-[var(--foreground)] transition-colors hover:text-[var(--brand)]"
          >
            <ShoppingBag strokeWidth={1.25} className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
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

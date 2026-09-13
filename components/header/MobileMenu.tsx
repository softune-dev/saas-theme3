"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import type { ProductCategory } from "@/lib/theme-types";
import { SiteLogo } from "@/components/brand/SiteLogo";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: ProductCategory[];
}

export function MobileMenu({
  isOpen,
  onClose,
  categories = [],
}: MobileMenuProps) {
  const { settings } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-0 left-0 w-full h-[100dvh] z-50 bg-black/40 backdrop-blur-xs md:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 flex h-[100dvh] w-[85%] max-w-[400px] flex-col bg-[var(--background)] md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b hairline shrink-0">
              <SiteLogo size="sm" />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 text-stone-600 hover:text-black transition-colors"
              >
                <X strokeWidth={1.25} className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {/* Large editorial nav links */}
              <nav className="flex flex-col items-start gap-6 px-6 py-8 text-left">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
                  Menu
                </p>
                {settings.navLinks.map((n, i) => (
                  <motion.div
                    key={n.id || n.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + 0.04 * i, duration: 0.35 }}
                  >
                    <Link
                      href={n.path || "/"}
                      onClick={onClose}
                      className="font-display text-2xl font-medium leading-tight tracking-tight text-[var(--foreground)] transition-colors hover:text-[var(--brand)] sm:text-3xl"
                    >
                      {n.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Categories — real catalog, same as homepage sections */}
              {categories.length > 0 ? (
                <div className="border-t hairline px-6 py-8 text-left">
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
                    Categories
                  </p>
                  <ul className="flex flex-col items-start gap-1">
                    {categories.map((cat, i) => (
                      <motion.li
                        key={cat.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + 0.03 * i, duration: 0.3 }}
                      >
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onClick={onClose}
                          className="flex items-center justify-start gap-2 py-2.5 text-[15px] text-stone-700 transition-colors hover:text-[var(--brand)]"
                        >
                          <span className="min-w-0 truncate">{cat.name}</span>
                          <ChevronRight
                            className="size-4 shrink-0 text-stone-400"
                            strokeWidth={1.5}
                          />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--foreground)] link-underline"
                  >
                    View all
                    <ChevronRight className="size-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Bottom quiet info & account */}
            <div className="flex shrink-0 items-center border-t hairline p-6 text-xs uppercase tracking-widest text-stone-500">
              <Link
                href="/login"
                onClick={onClose}
                className="font-medium text-[var(--foreground)] transition-opacity hover:opacity-75 link-underline"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

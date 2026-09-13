"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "./CartContext";
import { formatTaka } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--background)] flex flex-col shadow-2xl border-l hairline"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b hairline">
              <span className="text-[13px] uppercase tracking-[0.18em] text-[var(--foreground)] font-medium">
                Cart ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
              <button
                onClick={closeDrawer}
                aria-label="Close"
                className="p-1 text-stone-600 hover:text-black transition-colors"
              >
                <X strokeWidth={1.25} className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center py-20">
                  <p className="font-display text-3xl text-[var(--foreground)]">
                    Your cart is empty
                  </p>
                  <p className="mt-3 text-sm text-stone-500">
                    Discover pieces made to last.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-8 inline-block rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] px-8 py-4 text-[12px] uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors"
                  >
                    Return to shop
                  </Link>
                </div>
              ) : (
                <ul className="divide-y hairline">
                  {items.map((item, idx) => (
                    <li
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                      className="flex gap-4 p-6"
                    >
                      <div className="relative w-24 h-32 bg-stone-100 shrink-0 border hairline">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/shop/${item.product.slug}`}
                                onClick={closeDrawer}
                                className="font-display text-lg truncate block text-[var(--foreground)] hover:opacity-75 transition-opacity"
                              >
                                {item.product.name}
                              </Link>
                              <div className="text-xs text-stone-500 mt-1">
                                {item.selectedSize ? `Size ${item.selectedSize}` : item.product.categoryName}
                              </div>
                            </div>
                            <div className="text-sm shrink-0 font-medium text-[var(--foreground)]">
                              {formatTaka(item.product.price)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          {/* Stepper */}
                          <div className="inline-flex items-center border hairline">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-2 text-stone-600 hover:bg-stone-200/50 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" strokeWidth={1.25} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="p-2 text-stone-600 hover:bg-stone-200/50 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.25} />
                            </button>
                          </div>

                          {/* Remove Link */}
                          <button
                            onClick={() =>
                              removeItem(
                                item.product.id,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="text-xs uppercase tracking-[0.18em] text-stone-500 hover:text-black link-underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bottom Checkout & Summary */}
            {items.length > 0 && (
              <div className="border-t hairline p-6 space-y-4 bg-[var(--background)]">
                <div className="flex justify-between text-sm">
                  <span className="uppercase tracking-[0.18em] text-[13px] font-medium">
                    Subtotal
                  </span>
                  <span className="font-medium text-base">
                    {formatTaka(subtotal)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-black transition-colors font-medium"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

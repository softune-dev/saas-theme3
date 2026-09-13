"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Tag, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { Footer } from "@/components/footer/Footer";

export function CartPageClient() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponInput("");
    }
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <section
        className={[
          "mx-auto max-w-[1600px] px-6 pt-16 text-center md:px-10 md:pt-24",
          itemCount === 0 ? "pb-16 md:pb-24" : "",
        ].join(" ")}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center space-y-5"
        >
          <span className="eyebrow justify-center">Shopping bag</span>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="font-display text-4xl leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl"
          >
            Your bag{itemCount > 0 ? `.` : ""}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-stone-500 md:text-lg">
            {itemCount === 0
              ? "Your bag is empty. Discover pieces made to last."
              : `${itemCount} ${itemCount === 1 ? "item" : "items"} ready for checkout.`}
          </p>
          {itemCount === 0 ? (
            <Link
              href="/shop"
              className="inline-flex rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-8 py-3.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
            >
              Explore collections
            </Link>
          ) : null}
        </motion.div>
      </section>

      {items.length > 0 ? (
        <section className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-16 md:px-10 md:py-24">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Line items — same layout language as CartDrawer */}
            <div className="space-y-6 lg:col-span-7">
              <ul className="divide-y hairline border hairline">
                {items.map((item, idx) => (
                  <li
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-4 p-6"
                  >
                    <div className="relative h-32 w-24 shrink-0 border hairline bg-stone-100">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="font-display block truncate text-lg text-[var(--foreground)] transition-opacity hover:opacity-75"
                          >
                            {item.product.name}
                          </Link>
                          <div className="mt-1 text-xs text-stone-500">
                            {item.selectedSize
                              ? `Size ${item.selectedSize}`
                              : item.product.categoryName}
                            {item.selectedColor
                              ? ` · ${item.selectedColor}`
                              : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-medium text-[var(--foreground)]">
                          {formatTaka(item.product.price)}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="inline-flex items-center border hairline">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="p-2 text-stone-600 transition-colors hover:bg-stone-200/50"
                            aria-label="Decrease"
                          >
                            <Minus className="size-3" strokeWidth={1.25} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="p-2 text-stone-600 transition-colors hover:bg-stone-200/50"
                            aria-label="Increase"
                          >
                            <Plus className="size-3" strokeWidth={1.25} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                            )
                          }
                          className="text-xs font-medium tracking-[0.18em] text-stone-500 uppercase link-underline hover:text-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href="/shop"
                className="inline-block text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                Continue shopping
              </Link>
            </div>

            {/* Summary — no internal divider lines */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-6 bg-stone-50/50 p-6 sm:p-8">
                <div className="space-y-2">
                  <span className="eyebrow">Order</span>
                  <h2
                    style={{ fontFamily: "var(--font-display)" }}
                    className="font-display text-2xl text-[var(--foreground)]"
                  >
                    Summary
                  </h2>
                </div>

                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50/50 p-3 text-xs font-medium text-emerald-800">
                      <span>
                        Code: <strong>{appliedCoupon}</strong> (-
                        {formatTaka(couponDiscount)})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Promo code"
                            className="w-full border-b border-stone-300 bg-transparent py-2.5 pr-3 pl-8 text-sm outline-none focus:border-[var(--brand)]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-semibold transition-colors hover:bg-stone-100"
                        >
                          Apply
                        </button>
                      </div>
                      {couponFeedback && !appliedCoupon ? (
                        <p
                          className={`text-xs ${
                            couponFeedback.isError
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {couponFeedback.text}
                        </p>
                      ) : null}
                    </form>
                  )}
                </div>

                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatTaka(subtotal)}
                    </span>
                  </div>

                  {couponDiscount > 0 ? (
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>Discount</span>
                      <span>-{formatTaka(couponDiscount)}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <strong className="text-emerald-700">Free</strong>
                      ) : (
                        formatTaka(deliveryFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-semibold text-[var(--foreground)]">
                    <span>Total</span>
                    <span>{formatTaka(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-4 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
                >
                  Proceed to checkout · {formatTaka(total)}
                </Link>

                <div className="space-y-2 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                    <span>Safe & secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 shrink-0 text-[var(--foreground)]" />
                    <span>Cash on delivery available nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="flex-1" />
      )}

      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ChevronRight } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatTaka } from "@/lib/utils";
import { ManualPaymentModal, type ManualWallet } from "@/components/checkout/ManualPaymentModal";
import { NagadPaymentModal } from "@/components/checkout/NagadPaymentModal";
import { captureAbandonedCheckout, submitOrder, type PublicOrderOut } from "@/lib/checkout";
import { RecaptchaChallengeRequiredError, hasV2Fallback } from "@/lib/recaptcha";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";
import { RecaptchaDisclosure } from "@/components/recaptcha-disclosure";
import {
  RecaptchaV2Fallback,
  type RecaptchaV2FallbackHandle,
} from "@/components/recaptcha-v2-fallback";
import type { PublicPaymentMethod } from "@/lib/theme-types";

// The field only ever collects the LOCAL part after the fixed "+880"
// prefix (see the input below) — 10 digits, starting 3-9 per the real BD
// mobile prefixes (013/014/015/016/017/018/019). Mirrors the shape
// app/api/public.py's _validate_bd_phone accepts once "+880" is prepended;
// client-side is just an earlier, friendlier error, the server is the real
// gate.
const BD_LOCAL_RE = /^1[3-9]\d{8}$/;

function isValidBdLocalPhone(raw: string): boolean {
  return BD_LOCAL_RE.test(raw.replace(/\D/g, ""));
}

const PAYMENT_LABELS: Record<PublicPaymentMethod["provider"], string> = {
  cod: "Cash on Delivery",
  manual: "Manual Payment (bKash/Nagad/Rocket)",
  bkash: "bKash",
  nagad: "Nagad",
  sslcommerz: "SSLCommerz",
  rocket: "Rocket",
};

/** Storefront logos for checkout payment UI (public/assets). */
const WALLET_LOGOS: Record<string, string> = {
  bkash: "/assets/bkash.webp",
  nagad: "/assets/nagad.webp",
  cod: "/assets/cod.webp",
  manual: "/assets/manual.webp",
};

export function CheckoutPageClient({
  host,
  siteName,
  logoUrl,
  paymentMethods,
}: {
  host: string;
  siteName: string;
  logoUrl: string | null;
  /** Only methods the merchant actually enabled in Settings → Payments —
   * see app/api/public.py's get_site_config. Checkout can only render
   * cod/manual today regardless of what's connected (gateways have no live
   * checkout flow yet), so this is filtered to those before display. */
  paymentMethods: PublicPaymentMethod[];
}) {
  const checkoutReadyMethods = paymentMethods.filter(
    (m) => m.provider === "cod" || m.provider === "manual",
  );
  const manualMethod = checkoutReadyMethods.find((m) => m.provider === "manual");
  const manualWallets: ManualWallet[] = manualMethod?.config.wallets?.length
    ? manualMethod.config.wallets
    : ["bkash"];
  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    checkoutReadyMethods[0]?.provider ?? null,
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [activeManualWallet, setActiveManualWallet] = useState<ManualWallet | null>(null);
  const {
    items,
    subtotal,
    clearCart,
    deliveryFee,
    deliveryLocations,
    selectedDeliveryLocation,
    setDeliveryLocation,
  } = useCart();
  const router = useRouter();
  const [order, setOrder] = useState<PublicOrderOut | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsChallenge, setNeedsChallenge] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);
  const v2Ref = useRef<RecaptchaV2FallbackHandle>(null);
  const [formData, setFormData] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
  });

  // Real per-product delivery pricing, admin-configured — see CartContext.
  // No location set (or nothing charged) means genuinely ৳0, not a
  // fabricated flat courier fee. This is the CLIENT-SIDE preview shown
  // before submit; the server independently recomputes the same numbers
  // from the database and that's what actually gets charged (see
  // lib/checkout.ts) — order (once placed) uses the server's numbers.
  const deliveryCharge = deliveryFee;
  const total = subtotal + deliveryCharge;

  // Fires once per real checkout view — not on the empty-cart redirect
  // render below, and not again on every re-render while the form is filled in.
  useEffect(() => {
    if (items.length === 0) return;
    trackInitiateCheckout(
      items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      total,
      "BDT",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount with a non-empty cart, not on every total/items identity change
  }, []);

  // Abandoned-checkout capture: once the phone looks like a real BD mobile
  // number, quietly tell the backend what's in the cart so this shows up in
  // the merchant's abandoned-checkouts list if they never finish. Debounced
  // so it doesn't fire on every keystroke while still typing.
  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isValidBdLocalPhone(formData.phone) || items.length === 0) return;
    if (captureTimer.current) clearTimeout(captureTimer.current);
    captureTimer.current = setTimeout(() => {
      captureAbandonedCheckout(
        host,
        `+880${formData.phone.replace(/\D/g, "")}`,
        items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      );
    }, 800);
    return () => {
      if (captureTimer.current) clearTimeout(captureTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-fire on phone/cart changes, not host identity
  }, [formData.phone, items]);

  async function placeOrder(transactionIdValue?: string) {
    setPlacing(true);
    setError(null);
    try {
      const placed = await submitOrder(host, {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: `+880${formData.phone.replace(/\D/g, "")}`,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
        },
        delivery_location: selectedDeliveryLocation,
        payment_method: paymentMethod as string,
        transaction_id: transactionIdValue,
      }, v2Token ?? "");
      setOrder(placed);
      // PublicOrderItemOut never carries product_id (deliberately minimal —
      // see its docstring), so this uses the cart's own items for real ids
      // instead of the order response, combined with the order's actual
      // charged total/currency/order_number.
      trackPurchase({
        orderId: placed.order_number,
        value: placed.total_cents / 100,
        currency: placed.currency,
        items: items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      });
    } catch (err) {
      if (err instanceof RecaptchaChallengeRequiredError) {
        setNeedsChallenge(true);
        setError(hasV2Fallback ? null : err.message);
      } else {
        setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
        v2Ref.current?.reset();
      }
      throw err;
    } finally {
      setPlacing(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || placing || !paymentMethod) return;
    if (!isValidBdLocalPhone(formData.phone)) {
      setPhoneError("Enter a valid Bangladeshi mobile number, e.g. 17XXXXXXXX.");
      return;
    }
    setPhoneError(null);

    // Manual payment collects the sending number + transaction id inside
    // its own branded modal (opened here, at final submit) instead of an
    // inline form field — see ManualPaymentModal. The real order is only
    // placed once that modal resolves with a transaction id.
    if (paymentMethod === "manual") {
      setActiveManualWallet(manualWallets.length === 1 ? manualWallets[0] : null);
      setManualModalOpen(true);
      return;
    }

    try {
      await placeOrder();
    } catch {
      // Already surfaced via setError/setNeedsChallenge inside placeOrder.
    }
  };

  const handleCloseReceipt = () => {
    clearCart();
    router.push("/");
  };

  if (items.length === 0 && !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 bg-[var(--background)]">
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="font-display text-4xl mb-4 text-[var(--foreground)]"
        >
          Your cart is empty
        </h1>
        <p className="text-stone-500 mb-8">
          Add items to your cart to checkout.
        </p>
        <Link
          href="/shop"
          className="rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] px-8 py-4 text-[13px] uppercase tracking-[0.18em] hover:opacity-90 transition-opacity"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--background)] pb-24 text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 pt-12 md:pt-16">
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="font-display text-4xl md:text-5xl mb-12 text-[var(--foreground)]"
        >
          Checkout.
        </h1>

        <div className="grid w-full min-w-0 lg:grid-cols-12 gap-12 lg:gap-24 relative">

          {/* Left Column: Form */}
          <div className="min-w-0 lg:col-span-7 space-y-12">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">

              {/* Contact — phone only; BD mobile is the order contact channel. */}
              <section className="text-left">
                <h2 className="mb-5 text-sm font-semibold tracking-wide text-[var(--foreground)]">
                  Phone number
                </h2>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-500">
                    Mobile *
                  </label>
                  <div className="flex items-center gap-2 border border-stone-300 bg-stone-50 px-3 transition-colors focus-within:border-[var(--brand)] focus-within:bg-[var(--background)]">
                    <span className="flex shrink-0 items-center gap-1.5 py-3.5 text-sm font-medium text-[var(--foreground)]">
                      <span aria-hidden="true">🇧🇩</span>
                      +880
                    </span>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder="1XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData({ ...formData, phone: digits });
                        if (phoneError) setPhoneError(null);
                      }}
                      className="w-full min-w-0 flex-1 bg-transparent py-3.5 text-base text-[var(--foreground)] outline-none placeholder:text-stone-400"
                    />
                  </div>
                  {phoneError ? (
                    <p className="mt-2 text-xs text-red-600">{phoneError}</p>
                  ) : (
                    <p className="mt-2 text-xs text-stone-500">
                      We&apos;ll use this number to confirm your order.
                    </p>
                  )}
                </div>
              </section>

              {/* Shipping Address */}
              <section className="text-left">
                <h2 className="mb-5 text-sm font-semibold tracking-wide text-[var(--foreground)]">
                  Shipping address
                </h2>
                <div className="space-y-5">
                  {deliveryLocations.length > 1 && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-stone-500">
                        Delivery to
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                        {deliveryLocations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setDeliveryLocation(loc)}
                            aria-pressed={selectedDeliveryLocation === loc}
                            className={`w-full cursor-pointer border px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto ${
                              selectedDeliveryLocation === loc
                                ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--background)]"
                                : "border-stone-300 bg-stone-50 text-[var(--foreground)] hover:border-[var(--brand)]"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {deliveryLocations.length === 1 && (
                    <div className="flex items-center justify-between border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                      <span className="text-xs font-medium text-stone-500">Delivery to</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {deliveryLocations[0]}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-stone-500">
                        First name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full border border-stone-300 bg-stone-50 px-3.5 py-3.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)] focus:bg-[var(--background)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-stone-500">
                        Last name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full border border-stone-300 bg-stone-50 px-3.5 py-3.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)] focus:bg-[var(--background)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-stone-500">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House, road, area"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full border border-stone-300 bg-stone-50 px-3.5 py-3.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)] focus:bg-[var(--background)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-stone-500">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full border border-stone-300 bg-stone-50 px-3.5 py-3.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)] focus:bg-[var(--background)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-stone-500">
                        Postal code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Postal code"
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value })
                        }
                        className="w-full border border-stone-300 bg-stone-50 px-3.5 py-3.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-stone-400 focus:border-[var(--brand)] focus:bg-[var(--background)]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method — only what the merchant actually enabled in
               * Settings → Payments (see app/api/public.py's payment_methods).
               * No fabricated COD default: if nothing is enabled yet, say so
               * honestly rather than silently offering COD anyway. */}
              <section className="text-left">
                <h2 className="mb-5 text-sm font-semibold tracking-wide text-[var(--foreground)]">
                  Payment method
                </h2>
                {checkoutReadyMethods.length === 0 ? (
                  <p className="border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                    This store hasn&apos;t enabled a payment method yet. Please
                    contact them directly to complete your order.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {checkoutReadyMethods.map((method) => {
                      const selected = paymentMethod === method.provider;
                      return (
                        <label
                          key={method.provider}
                          className={`block cursor-pointer border p-5 transition-colors ${
                            selected
                              ? "border-[var(--brand)] bg-[var(--background)]"
                              : "border-stone-200 bg-stone-50/60 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[var(--brand)] bg-[var(--brand)]"
                                    : "border-stone-300"
                                }`}
                              >
                                {selected ? (
                                  <div className="size-1.5 rounded-full bg-[var(--background)]" />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <span className="text-base font-semibold text-[var(--foreground)]">
                                  {method.label || PAYMENT_LABELS[method.provider]}
                                </span>
                                {method.provider === "cod" ? (
                                  <p className="mt-0.5 text-xs text-stone-500">
                                    Pay when your order arrives
                                  </p>
                                ) : method.provider === "manual" ? (
                                  <p className="mt-0.5 text-xs text-stone-500">
                                    You&apos;ll confirm payment on the next step
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="payment_method"
                              className="sr-only"
                              checked={selected}
                              onChange={() => setPaymentMethod(method.provider)}
                            />
                            {WALLET_LOGOS[method.provider] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={WALLET_LOGOS[method.provider]}
                                alt=""
                                className="h-7 w-auto shrink-0 object-contain"
                              />
                            ) : (
                              <CreditCard
                                strokeWidth={1.5}
                                className="size-5 shrink-0 text-stone-400"
                              />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>

            </form>
          </div>

          {/* Right Column: Order Summary & Add-ons */}
          <div className="min-w-0 lg:col-span-5 lg:relative">
            <div className="lg:sticky lg:top-32">
              <div className="min-w-0 bg-[var(--background)] p-8 border hairline shadow-xs space-y-6">
                <h2 className="text-[13px] uppercase tracking-[0.2em] mb-6 font-medium text-stone-500 text-left">
                  Order Summary
                </h2>

                {/* pt-3 gives the qty badge (offset -top-2 above each
                 * thumbnail) room to render without the first row's badge
                 * getting clipped by this list's own overflow-y-auto. */}
                <ul className="space-y-4 max-h-72 overflow-y-auto pt-3 pr-1">
                  {items.map((i) => (
                    <li key={i.product.id + i.selectedSize} className="flex gap-4 items-center">
                      <div className="relative w-16 h-20 bg-stone-100 border hairline shrink-0">
                        {i.product.images[0] ? (
                          <Image
                            src={i.product.images[0]}
                            alt={i.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--brand)] text-[var(--background)] text-[10px] rounded-full flex items-center justify-center font-semibold z-10">
                          {i.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div
                          style={{ fontFamily: "var(--font-display)" }}
                          className="font-display text-lg truncate text-[var(--foreground)]"
                        >
                          {i.product.name}
                        </div>
                        <div className="text-xs text-stone-400">
                          {i.selectedSize && `Size ${i.selectedSize}`}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        {formatTaka(i.product.price * i.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 text-sm text-stone-550">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatTaka(subtotal)}</span>
                  </div>

                  {/* Interactive location choice now lives in the Shipping
                   * Address section above — this is just a readout of the
                   * current selection. */}
                  {selectedDeliveryLocation && (
                    <div className="flex justify-between">
                      <span>Delivery to</span>
                      <span>{selectedDeliveryLocation}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatTaka(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t hairline text-[var(--foreground)]">
                    <span>Total</span>
                    <span className="text-[var(--foreground)] font-bold">{formatTaka(total)}</span>
                  </div>
                </div>

                {error ? (
                  <p className="text-xs text-red-600 pt-2">{error}</p>
                ) : null}

                {needsChallenge && hasV2Fallback ? (
                  <div className="pt-2">
                    <RecaptchaV2Fallback ref={v2Ref} onVerify={setV2Token} />
                  </div>
                ) : null}

                {/* Tied to the form via the `form` attribute rather than
                 * living inside it — this is what lets it sit under Order
                 * Summary in the DOM (and therefore below it once the two
                 * columns stack on mobile) while still submitting the form. */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={placing || (needsChallenge && !v2Token)}
                  className="mt-10 w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] py-5 text-[13px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{placing ? "Placing order…" : "Complete Order"}</span>
                  <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
                </button>
                <div className="mt-3">
                  <RecaptchaDisclosure />
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Success Receipt Modal */}
      <AnimatePresence>
        {order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs print:hidden"
              onClick={handleCloseReceipt}
            />

            <style>{`
 @media print {
 body * { visibility: hidden; }
 #receipt, #receipt * { visibility: visible; }
 #receipt { position: absolute; left: 0; top: 0; margin: 0; padding: 2rem; width: 100%; max-width: none; box-shadow: none; background: white; color: #1c1c1c; }
 .print-hidden { display: none !important; }
 }
 `}</style>

            <motion.div
              id="receipt"
              initial={{ y: "100%", opacity: 0, rotateX: 45 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              style={{ transformPerspective: 1000 }}
              className="relative w-full max-w-sm bg-[#faf9f6] text-[#1c1c1c] p-8 shadow-2xl origin-bottom border border-stone-200"
            >
              {/* Radial gradient zigzag top/bottom edges */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle_at_50%_0,transparent_3px,#faf9f6_4px)] bg-[length:12px_100%] -translate-y-full" />
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[radial-gradient(circle_at_50%_100%,transparent_3px,#faf9f6_4px)] bg-[length:12px_100%] translate-y-full" />

              <div className="text-center mb-6">
                {logoUrl ? (
                  <div className="relative w-28 h-8 mx-auto mb-2">
                    <Image src={logoUrl} alt={siteName} fill className="object-contain" />
                  </div>
                ) : (
                  <h3
                    style={{ fontFamily: "var(--font-display)" }}
                    className="font-display text-3xl mb-1 text-[#1c1c1c]"
                  >
                    {siteName}
                  </h3>
                )}
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1c1c]/60 font-semibold">Order Confirmed</p>
              </div>

              <div className="text-xs text-[#1c1c1c]/70 mb-6 space-y-1.5 font-medium tracking-wide">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order #:</span>
                  <strong className="text-[#1c1c1c]">{order.order_number}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-8 border-y border-dashed border-[#1c1c1c]/20 py-6 text-left">
                {order.items.map((i, idx) => (
                  <div key={`${i.name}-${idx}`} className="flex flex-col gap-0.5">
                    <div className="flex justify-between gap-4">
                      <span className="truncate text-stone-800">{i.quantity}x {i.name}</span>
                      <span className="font-semibold text-stone-900">{formatTaka(i.total_cents / 100)}</span>
                    </div>
                    {i.event_name ? (
                      <span className="text-[11px] uppercase tracking-wider text-[var(--brand)]">
                        {i.event_name} — {i.event_discount_percent}% off
                      </span>
                    ) : null}
                  </div>
                ))}
                <div className="flex justify-between gap-4 text-[#1c1c1c]/60 pt-2">
                  <span>Shipping (COD)</span>
                  <span>{formatTaka(order.shipping_cents / 100)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-[11px] uppercase tracking-[0.2em] text-stone-700">Total</span>
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="font-display text-2xl text-[#1c1c1c] font-bold"
                >
                  {formatTaka(order.total_cents / 100)}
                </span>
              </div>

              <div className="text-center space-y-3 print-hidden">
                <p className="text-xs text-[#1c1c1c]/60 leading-relaxed mb-4">
                  Thank you for your purchase, {formData.firstName}.<br />
                  Your order will be shipped to {formData.city} shortly.
                </p>
                <button
                  onClick={() => window.print()}
                  className="w-full rounded-[var(--theme-btn-radius)] bg-[#1c1c1c] text-[#faf9f6] py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-[#1c1c1c]/85 transition-colors font-semibold"
                >
                  Download Receipt
                </button>
                <button
                  onClick={handleCloseReceipt}
                  className="w-full rounded-[var(--theme-btn-radius)] border border-[#1c1c1c]/25 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-[#1c1c1c]/5 transition-colors font-semibold"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {manualModalOpen && manualWallets.length > 1 && !activeManualWallet ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Choose payment method</h3>
            <div className="space-y-2">
              {manualWallets.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveManualWallet(w)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {w === "bkash" || w === "nagad" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/assets/${w}.webp`} alt="" className="h-6 w-auto object-contain" />
                  ) : (
                    <span className="text-sm font-bold capitalize text-slate-700">{w}</span>
                  )}
                  <span className="text-sm font-medium capitalize text-slate-700">Pay with {w}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setManualModalOpen(false)}
              className="mt-3 w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <NagadPaymentModal
        open={manualModalOpen && activeManualWallet === "nagad"}
        paymentNumber={manualMethod?.config.payment_number ?? ""}
        shopName={siteName}
        totalCents={Math.round(total * 100)}
        onClose={() => {
          setManualModalOpen(false);
          setActiveManualWallet(null);
        }}
        onConfirm={(transactionIdValue) => placeOrder(transactionIdValue)}
      />

      <ManualPaymentModal
        open={manualModalOpen && (activeManualWallet === "bkash" || activeManualWallet === "rocket")}
        wallet={activeManualWallet === "rocket" ? "rocket" : "bkash"}
        paymentNumber={manualMethod?.config.payment_number ?? ""}
        shopName={siteName}
        totalCents={Math.round(total * 100)}
        onClose={() => {
          setManualModalOpen(false);
          setActiveManualWallet(null);
        }}
        onConfirm={(transactionIdValue) => placeOrder(transactionIdValue)}
      />
    </div>
  );
}

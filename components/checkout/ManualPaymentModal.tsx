"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Phone, ShoppingBag, X } from "lucide-react";
import { formatTaka } from "@/lib/utils";

export type ManualWallet = "bkash" | "nagad" | "rocket";

/** Wallets rendered by this shared, themed modal. Nagad has its own
 * dedicated layout (NagadPaymentModal) instead — see that file. */
type SharedWallet = "bkash" | "rocket";

type WalletTheme = {
  name: string;
  /** Real brand primary — used for the divider, payment panel, and button
   * row backgrounds. */
  primary: string;
  primaryDark: string;
  logo: string | null;
  /** Real published customer-care hotline for each wallet. */
  hotline: string;
};

const WALLET_THEME: Record<SharedWallet, WalletTheme> = {
  bkash: {
    name: "bKash",
    primary: "#E2136E",
    primaryDark: "#B90F5B",
    logo: "/assets/bkash.webp",
    hotline: "16247",
  },
  rocket: {
    name: "Rocket",
    primary: "#8C1F8C",
    primaryDark: "#6B1769",
    logo: null,
    hotline: "16216",
  },
};

type Step = "trx" | "saving" | "success";

export type ManualPaymentModalProps = {
  open: boolean;
  wallet: SharedWallet;
  paymentNumber: string;
  shopName: string;
  totalCents: number;
  onClose: () => void;
  /** Resolves once the shopper has entered the transaction id — the parent
   * places the real order right after, using this as
   * PublicOrderCreate.transaction_id. */
  onConfirm: (transactionId: string) => Promise<void>;
};

/** 3 dots scaling up/down in sequence — the "custom, not a circle" loader
 * used both inside the Confirm button while saving and, larger, on the
 * success screen. Framer Motion stagger does the sequencing. */
function PulseDots({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function ManualPaymentModal({
  open,
  wallet,
  paymentNumber,
  shopName,
  totalCents,
  onClose,
  onConfirm,
}: ManualPaymentModalProps) {
  const [step, setStep] = useState<Step>("trx");
  const [trxId, setTrxId] = useState("");
  const [numberCopied, setNumberCopied] = useState(false);
  // Display-only — the real order (and its real order number) is only
  // created once this modal resolves, same as the existing manual-payment
  // flow. This is purely a "here's what you're paying for" reference shown
  // while collecting payment, never sent anywhere.
  const [reference] = useState(() => `REF-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!open) return null;

  function reset() {
    setStep("trx");
    setTrxId("");
    setNumberCopied(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleConfirm() {
    setStep("saving");
    try {
      await onConfirm(trxId.trim());
      setStep("success");
      window.setTimeout(() => {
        reset();
        onClose();
      }, 1600);
    } catch {
      // Submission failed — back to the trx step so they can retry instead
      // of being stuck on a dead "saving" state.
      setStep("trx");
    }
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(paymentNumber);
      setNumberCopied(true);
      window.setTimeout(() => setNumberCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; number stays visible to copy manually */
    }
  }

  const theme = WALLET_THEME[wallet];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60"
          onClick={step === "saving" || step === "success" ? undefined : handleClose}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          {step === "success" ? (
            <>
              {/* White logo header, no close button — success is a one-way animation into order placement. */}
              <div className="bg-white px-5 pb-2 pt-2">
                <div className="flex items-center justify-center">
                  {wallet === "bkash" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/assets/pay-with-bkash.webp" alt="bKash Payment" className="h-14 w-auto object-contain" />
                  ) : theme.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={theme.logo} alt={theme.name} className="h-14 w-auto object-contain" />
                  ) : (
                    <span className="text-xl font-extrabold tracking-tight" style={{ color: theme.primary }}>
                      {theme.name}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ backgroundColor: theme.primary }} className="h-1 w-full" />
              <div
                style={{ backgroundColor: theme.primary }}
                className="flex flex-col items-center gap-4 px-5 py-8 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-white/15">
                  <Check className="size-7 text-white" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-base font-semibold text-white">Payment recorded</p>
                  <p className="mt-1 text-xs text-white/80">Placing your order…</p>
                </div>
                <PulseDots color="#ffffff" size={9} />
              </div>
            </>
          ) : (
            <>
              {/* White logo header — matches the real wallet apps' own checkout banner. */}
              <div className="relative bg-white px-5 pb-2 pt-2">
                {step !== "saving" ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-2 right-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-5" strokeWidth={1.75} />
                  </button>
                ) : null}
                <div className="flex items-center justify-center">
                  {wallet === "bkash" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/assets/pay-with-bkash.webp" alt="bKash Payment" className="h-14 w-auto object-contain" />
                  ) : theme.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={theme.logo} alt={theme.name} className="h-14 w-auto object-contain" />
                  ) : (
                    <span className="text-xl font-extrabold tracking-tight" style={{ color: theme.primary }}>
                      {theme.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Solid brand-color divider bar between the white logo banner and white order summary. */}
              <div style={{ backgroundColor: theme.primary }} className="h-1 w-full" />

              {/* Order summary sits on white, same as the logo banner above it. */}
              <div className="bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200">
                    <ShoppingBag className="size-4 text-slate-500" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{shopName}</p>
                    <p className="truncate text-xs text-slate-400">{reference}</p>
                  </div>
                  <p className="shrink-0 text-base font-bold tabular-nums text-slate-900">
                    {formatTaka(totalCents / 100)}
                  </p>
                </div>
              </div>

              {/* Brand-color payment panel: instructions, the number to send to, then the trx id input. */}
              <div style={{ backgroundColor: theme.primary }} className="px-5 pb-4 pt-4">
                <ol className="space-y-2 text-left">
                  <li className="flex items-start gap-2 text-xs text-white/90">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                      1
                    </span>
                    <span className="pt-0.5">
                      {theme.name} অ্যাপ খুলে &ldquo;Send Money&rdquo; অপশনে যান
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                      2
                    </span>
                    <span className="flex items-center gap-2 rounded-sm bg-white px-3 py-1">
                      <span className="text-lg font-bold tracking-wide text-slate-900">{paymentNumber}</span>
                      <button
                        type="button"
                        onClick={copyNumber}
                        aria-label={numberCopied ? "Copied" : "Copy number"}
                        className="text-slate-500 transition-colors hover:text-slate-800"
                      >
                        {numberCopied ? (
                          <Check className="size-4 text-emerald-600" strokeWidth={2} />
                        ) : (
                          <Copy className="size-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-white/90">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                      3
                    </span>
                    <span className="pt-0.5">টাকা পাঠিয়ে Transaction ID কপি করে নিচে বসান</span>
                  </li>
                </ol>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/send-money.webp" alt="Send money step" className="w-full rounded-md object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/trxid.webp" alt="Transaction id step" className="w-full rounded-md object-cover" />
                </div>

                <div className="mt-4">
                  <p className="text-center text-xs font-medium text-white/90">Enter your Transaction ID</p>
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 9CD4X7Y2Z1"
                    className="mt-2 w-full bg-white px-3 py-2.5 text-center text-sm outline-none"
                  />

                  <p className="mt-3 text-center text-[11px] leading-snug text-white/80">
                    By clicking on <span className="font-bold text-white">Confirm</span>, you are agreeing to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white underline underline-offset-2"
                    >
                      terms &amp; conditions
                    </a>
                    .
                  </p>
                </div>
              </div>

              {step === "trx" ? (
                <div className="flex">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-12 flex-1 bg-slate-300 text-sm font-medium text-white transition-colors hover:bg-slate-400/70"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={!trxId.trim()}
                    onClick={handleConfirm}
                    className="h-12 flex-1 bg-slate-300 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-400/70 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <button
                    type="button"
                    disabled
                    className="flex h-12 w-full items-center justify-center bg-slate-300"
                  >
                    <PulseDots color={theme.primary} size={7} />
                  </button>
                </div>
              )}

              {/* Hotline strip — icon + number only, no label. */}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-white px-5 py-2">
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Phone className="size-2.5 text-white" strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold text-slate-800">{theme.hotline}</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

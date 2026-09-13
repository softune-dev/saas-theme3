"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ShoppingBag } from "lucide-react";
import { formatTaka } from "@/lib/utils";

const NAGAD_PRIMARY = "#EC1D24";
const NAGAD_LIGHT = "#FF5A61";
const NAGAD_DARK = "#8F0F14";
const TRX_LENGTH = 10;

type Step = "trx" | "saving" | "success";

export type NagadPaymentModalProps = {
  open: boolean;
  paymentNumber: string;
  shopName: string;
  totalCents: number;
  onClose: () => void;
  /** Resolves once the shopper has entered the transaction id — the parent
   * places the real order right after, using this as
   * PublicOrderCreate.transaction_id. */
  onConfirm: (transactionId: string) => Promise<void>;
};

/** 3 dots scaling up/down in sequence — same custom loader used on the
 * bKash modal, kept visually consistent across manual payment wallets. */
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

/** Nagad's own checkout modal is a single solid-red card, not the white
 * header + brand panel split used for bKash — mirroring the real Nagad
 * gateway means building it as its own layout, not a themed variant. */
export function NagadPaymentModal({
  open,
  paymentNumber,
  shopName,
  totalCents,
  onClose,
  onConfirm,
}: NagadPaymentModalProps) {
  const [step, setStep] = useState<Step>("trx");
  const [trxId, setTrxId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [numberCopied, setNumberCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Display-only — same purpose as the bKash modal's reference: something
  // to show on screen while collecting payment, never sent anywhere.
  const [reference] = useState(() => `${Math.floor(1000 + Math.random() * 9000)}CC${Math.floor(1000 + Math.random() * 9000)}FCE`);

  if (!open) return null;

  function reset() {
    setStep("trx");
    setTrxId("");
    setAgreed(false);
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

  const canProceed = trxId.trim().length > 0 && agreed;

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
          style={{ background: `radial-gradient(circle at 50% 35%, ${NAGAD_LIGHT} 0%, ${NAGAD_PRIMARY} 55%, ${NAGAD_DARK} 100%)` }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl shadow-2xl"
        >
          {step === "success" ? (
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/15">
                <Check className="size-7 text-white" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-base font-semibold text-white">Payment recorded</p>
                <p className="mt-1 text-xs text-white/80">Placing your order…</p>
              </div>
              <PulseDots color="#ffffff" size={9} />
            </div>
          ) : (
            <div className="px-6 pb-5 pt-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <ShoppingBag className="size-9 text-white/85" strokeWidth={1.25} />
                <p className="mt-1 text-base font-bold text-white">{shopName}</p>
              </div>

              <div className="mt-6 space-y-1.5 text-sm text-white">
                <div className="flex justify-between gap-2">
                  <span className="font-bold">Invoice No:</span>
                  <span className="truncate">{reference}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold">Total Amount:</span>
                  <span>{formatTaka(totalCents / 100)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold">Charge:</span>
                  <span>BDT 0</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-semibold text-white">Send money to</p>
                <div className="mt-0.5 flex items-center justify-center gap-2">
                  <p className="text-lg font-bold tracking-wide text-white">{paymentNumber}</p>
                  <button
                    type="button"
                    onClick={copyNumber}
                    aria-label={numberCopied ? "Copied" : "Copy number"}
                    className="text-white/90 transition-colors hover:text-white"
                  >
                    {numberCopied ? (
                      <Check className="size-4" strokeWidth={2} />
                    ) : (
                      <Copy className="size-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-center text-sm font-semibold text-white">Transaction ID</p>
                <div className="relative mt-2 flex justify-center gap-1.5">
                  {Array.from({ length: TRX_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => inputRef.current?.focus()}
                      className="flex size-7 items-center justify-center rounded-sm bg-white text-sm font-bold uppercase text-slate-900"
                    >
                      {trxId[i] ?? ""}
                    </div>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    autoComplete="off"
                    maxLength={TRX_LENGTH}
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    disabled={step === "saving"}
                    aria-label="Transaction ID"
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>
              </div>

              <label className="mt-5 flex items-start justify-center gap-2 text-center text-xs text-white/90">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 size-3.5 shrink-0 accent-white"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white underline underline-offset-2"
                  >
                    terms and conditions
                  </a>
                </span>
              </label>

              <div className="mt-5 flex items-center justify-center gap-3">
                {step === "trx" ? (
                  <>
                    <button
                      type="button"
                      disabled={!canProceed}
                      onClick={handleConfirm}
                      className="rounded-md bg-white px-6 py-2 text-sm font-bold text-slate-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Proceed
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md bg-white px-6 py-2 text-sm font-bold text-slate-900 transition-opacity hover:opacity-90"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <button type="button" disabled className="rounded-md bg-white px-8 py-2">
                    <PulseDots color={NAGAD_PRIMARY} size={7} />
                  </button>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/nagad.webp"
                  alt="Nagad"
                  className="h-14 w-auto object-contain brightness-0 invert"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

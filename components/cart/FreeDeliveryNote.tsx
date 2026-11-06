"use client";

import { formatTaka } from "@/lib/utils";
import { useCart } from "./CartContext";

/** "Add ৳340 more for free delivery". Only shows when the store has the rule
 * on and the cart would otherwise pay for delivery. */
export function FreeDeliveryNote({ className = "" }: { className?: string }) {
  const { freeDeliveryThreshold, subtotal, hasChargedItems } = useCart();
  if (!freeDeliveryThreshold || !hasChargedItems) return null;
  const left = freeDeliveryThreshold - subtotal;
  return (
    <p className={`text-xs ${className}`}>
      {left > 0 ? `Add ${formatTaka(left)} more for free delivery` : "You've got free delivery"}
    </p>
  );
}

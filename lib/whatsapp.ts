/**
 * The store's WhatsApp number as wa.me wants it: digits only, WITH the country
 * code and no leading + or 0. Merchants type Bangladesh numbers the local way
 * (01712345678), and wa.me/01712345678 opens nothing, so the country code is
 * added here. A number that already carries a country code is left alone.
 */
export function whatsappNumber(raw?: string | null): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits; // already +880...
  if (digits.startsWith("0")) return `88${digits}`; // 01XXXXXXXXX -> 8801XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("1")) return `880${digits}`; // 1XXXXXXXXX
  return digits; // another country, typed with its code
}

/** A wa.me link for the store, with an optional prefilled message. Returns ""
 * when the store has no usable number, so callers can hide the button instead
 * of opening someone else's chat. */
export function whatsappLink(raw?: string | null, message?: string): string {
  const number = whatsappNumber(raw);
  if (!number) return "";
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
}

export type OrderMessageInput = {
  storeName: string;
  /** Prices arrive already formatted (the theme's own formatTaka), so this
   * stays a pure string builder shared by the whatsapp-ordering and
   * order-limit paths. */
  items: { name: string; variant?: string; quantity: number; linePrice: string }[];
  subtotal: string;
  delivery: string;
  deliveryLocation?: string | null;
  total: string;
  customer: { name: string; phone: string; address: string; note?: string };
  /** Present only when the shopper already sent money before the order was refused. */
  transactionId?: string;
};

/** The readable order text the shopper sends to the merchant on WhatsApp. */
export function orderWhatsappMessage(o: OrderMessageInput): string {
  const lines: string[] = [`New order for ${o.storeName}`, ""];
  o.items.forEach((i, idx) => {
    const variant = i.variant ? `, ${i.variant}` : "";
    lines.push(`${idx + 1}. ${i.name}${variant}, Qty ${i.quantity}, ${i.linePrice}`);
  });
  lines.push("", `Subtotal: ${o.subtotal}`);
  lines.push(`Delivery${o.deliveryLocation ? ` to ${o.deliveryLocation}` : ""}: ${o.delivery}`);
  lines.push(`Total: ${o.total}`, "");
  lines.push(`Name: ${o.customer.name}`, `Phone: ${o.customer.phone}`, `Address: ${o.customer.address}`);
  if (o.customer.note?.trim()) lines.push(`Note: ${o.customer.note.trim()}`);
  if (o.transactionId) lines.push("", `Payment sent. Transaction ID: ${o.transactionId}`);
  return lines.join("\n");
}

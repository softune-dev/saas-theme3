"use client";

/**
 * Client-side ecommerce event tracking — fires GA4, Meta Pixel, and TikTok
 * Pixel events for the funnel that actually matters to a merchant running
 * ads: ViewContent → AddToCart → InitiateCheckout → Purchase. Each pixel's
 * base snippet (loaded only if the merchant set an id — see layout.tsx) is
 * what defines window.gtag/fbq/ttq; this file just calls them safely.
 *
 * Every call is wrapped in try/catch and no-ops if the pixel isn't loaded —
 * a tracking failure or an ad-blocker stripping fbq/ttq must never break
 * the actual shopping flow (add to cart, checkout, etc).
 *
 * Purchase's `orderId` is passed as fbq's eventID so Meta deduplicates this
 * client-side event against the server-side Conversions API event fired for
 * the same order (see app/marketing.py) into one conversion, not two.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void };
  }
}

function safely(fn: () => void) {
  try {
    fn();
  } catch {
    // tracking must never break the page
  }
}

export type TrackedItem = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

export function trackViewContent(item: TrackedItem, currency: string) {
  safely(() =>
    window.gtag?.("event", "view_item", {
      currency,
      value: item.price,
      items: [{ item_id: item.id, item_name: item.name, price: item.price }],
    }),
  );
  safely(() =>
    window.fbq?.("track", "ViewContent", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value: item.price,
      currency,
    }),
  );
  safely(() =>
    window.ttq?.track("ViewContent", {
      contents: [{ content_id: item.id, content_name: item.name, price: item.price }],
      value: item.price,
      currency,
    }),
  );
}

export function trackAddToCart(item: TrackedItem, currency: string) {
  const quantity = item.quantity ?? 1;
  const value = item.price * quantity;
  safely(() =>
    window.gtag?.("event", "add_to_cart", {
      currency,
      value,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity }],
    }),
  );
  safely(() =>
    window.fbq?.("track", "AddToCart", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value,
      currency,
    }),
  );
  safely(() =>
    window.ttq?.track("AddToCart", {
      contents: [{ content_id: item.id, content_name: item.name, price: item.price, quantity }],
      value,
      currency,
    }),
  );
}

export function trackInitiateCheckout(items: TrackedItem[], value: number, currency: string) {
  const ids = items.map((i) => i.id);
  safely(() =>
    window.gtag?.("event", "begin_checkout", {
      currency,
      value,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    }),
  );
  safely(() =>
    window.fbq?.("track", "InitiateCheckout", {
      content_ids: ids,
      num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
      value,
      currency,
    }),
  );
  safely(() =>
    window.ttq?.track("InitiateCheckout", {
      contents: items.map((i) => ({
        content_id: i.id,
        content_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
      value,
      currency,
    }),
  );
}

export function trackPurchase(params: {
  orderId: string;
  value: number;
  currency: string;
  items: TrackedItem[];
}) {
  const { orderId, value, currency, items } = params;
  const ids = items.map((i) => i.id);
  safely(() =>
    window.gtag?.("event", "purchase", {
      transaction_id: orderId,
      currency,
      value,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    }),
  );
  safely(() =>
    window.fbq?.(
      "track",
      "Purchase",
      { content_ids: ids, value, currency },
      { eventID: orderId },
    ),
  );
  safely(() =>
    window.ttq?.track("CompletePayment", {
      contents: items.map((i) => ({
        content_id: i.id,
        content_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
      value,
      currency,
    }),
  );
}

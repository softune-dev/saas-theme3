import type { Product } from "@/lib/theme-types";

/**
 * Storefront product search, run on the shop page's already-loaded catalog.
 *
 * Every word the shopper types must appear somewhere in the product (name,
 * category, tagline, description or badge), in any order, ignoring case, so
 * "red saree" finds "Saree, Red Silk". Bangla text matches the same way.
 */
export function matchesSearch(product: Product, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [
    product.name,
    product.categoryName,
    product.tagline,
    product.description,
    product.badge,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}

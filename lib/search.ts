import type { Product } from "@/lib/theme-types";

/**
 * Storefront product search, run on the shop page's already-loaded catalog.
 *
 * Every word the shopper types must start a word somewhere in the product
 * (name, category, tagline, description or badge), in any order, ignoring
 * case: "red saree" finds "Saree, Red Silk" but not "embroidered", and
 * "sun" finds "Sunscreen". Bangla text matches the same way.
 */
export function matchesSearch(product: Product, query: string): boolean {
  const words = query.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
  if (words.length === 0) return true;
  const tokens = [
    product.name,
    product.categoryName,
    product.tagline,
    product.description,
    product.badge,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    // Letters, digits and Bangla vowel signs stay inside a word.
    .split(/[^\p{L}\p{M}\p{N}]+/u);
  return words.every((w) => tokens.some((token) => token.startsWith(w)));
}

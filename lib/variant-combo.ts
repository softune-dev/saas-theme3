import type { Product, ProductVariantCombination } from "./theme-types";

/** Resolves a customer's size/color pick to the one real combination it
 * matches (see theme-types.ts's ProductVariantCombination) — shared by
 * ProductDetailClient.tsx (to show the combo's own price/compare-at/photo/
 * stock) and checkout.ts (to send the matched key as variant_key so the
 * backend can check/decrement THAT combination's stock). Keeping this in
 * one place means the storefront can never show one combo's price while
 * checking out against a different one due to the two call sites drifting
 * apart.
 *
 * product.sizeLabel/colorLabel are the merchant's own real variant type
 * names (e.g. "Size", "Fit", "Volume") — combo.optionValues is keyed by
 * those same names, not literally "size"/"color" (see public-catalog.ts's
 * adaptProduct). A product with no combinations, or a selection that
 * doesn't fully resolve to one, correctly returns undefined — the caller
 * falls back to the product's own price/stock, exactly as before this
 * existed.
 */
export function resolveVariantCombination(
  product: Product,
  selectedSize: string | undefined,
  selectedColor: string | undefined,
): ProductVariantCombination | undefined {
  const combinations = product.variantCombinations;
  if (!combinations || combinations.length === 0) return undefined;

  const selected: Record<string, string> = {};
  if (product.sizeLabel && selectedSize) selected[product.sizeLabel] = selectedSize;
  if (product.colorLabel && selectedColor) selected[product.colorLabel] = selectedColor;

  return combinations.find((combo) => {
    const keys = Object.keys(combo.optionValues);
    if (keys.length !== Object.keys(selected).length) return false;
    return keys.every((k) => combo.optionValues[k] === selected[k]);
  });
}

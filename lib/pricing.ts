import type { Product } from "./theme-types";
import { resolveVariantCombination } from "./variant-combo";

/**
 * The unit price a shopper is actually charged for one cart line.
 *
 * A product with variants can price each one separately (the chosen
 * combination's own price, which the API already shows with any active sale
 * applied); checkout on the server charges exactly that. The cart, the
 * checkout summary and the tracking events all use this one function so they
 * can never show or report a different number from what is charged. A product
 * with no variant price falls back to the product's own price, as before.
 */
export function unitPrice(product: Product, selectedSize?: string, selectedColor?: string): number {
  const combo = resolveVariantCombination(product, selectedSize, selectedColor);
  return combo?.priceCents != null ? combo.priceCents / 100 : product.price;
}

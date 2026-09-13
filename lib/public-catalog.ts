/**
 * Real categories/products for a published site — GET /public/site/{host}
 * /categories and /products (app/api/public.py). Same host + caching
 * pattern as fetchSiteConfig in get-site.ts.
 *
 * WHY AN ADAPTER: the backend's public shape (see _public_category /
 * _public_product in app/api/public.py) is deliberately minimal — only real
 * columns, no invented fields. Aurora's existing Product/ProductCategory
 * types (theme-types.ts) were built against sample-data.ts's richer mock
 * shape (rating, reviewCount, tagline, sizes as a flat array, ...) and are
 * used throughout ProductCard/ProductDetailClient/cart/etc. Adapting real
 * data INTO that existing shape means every one of those components keeps
 * working unchanged — only the sections that fetch/select products need to
 * change at all.
 */
import { Event, Product, ProductCategory } from "./theme-types";
import { colorNameToHex } from "./color-names";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  icon: string;
  itemCount: number;
};

type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  video: string;
  categoryId: string | null;
  categoryName: string | null;
  inStock: boolean;
  stockCount: number;
  attributes: Record<string, unknown>;
  features: { title: string; description: string; icon?: string | null }[];
  freeDelivery: boolean;
  deliveryCharges: { name: string; charge: number }[];
};

type PublicEvent = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  ctaLabel: string;
  discountPercent: number;
  productIds: string[];
};

function adaptEvent(e: PublicEvent): Event {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    description: e.description,
    image: e.image,
    ctaLabel: e.ctaLabel,
    discountPercent: e.discountPercent,
    productIds: e.productIds,
  };
}

function adaptCategory(c: PublicCategory): ProductCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    // No fallback stock photo — an empty string is a real "no image set
    // yet" state, same honesty rule as the theme editor's own image
    // pickers. CategoriesSection's <Image> needs a src either way, so
    // callers that render this must guard for "".
    image: c.image,
    banner: c.banner,
    icon: c.icon,
    itemCount: c.itemCount,
    featured: true,
  };
}

/** description comes back as rich HTML from the dashboard's TipTap editor
 * (see product-description-editor.tsx) — fine to render as-is via
 * dangerouslySetInnerHTML on the product page, but wrong anywhere that
 * expects a short plain-text excerpt (a card's tagline, a <meta
 * description>). Strips tags and collapses whitespace for those contexts. */
function stripHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/** The color variant is found by its real isColor flag FIRST — a merchant
 * can name a color-marked type anything ("Shade", "Finish"), not just
 * literally "Color" — falling back to matching the literal name "color"
 * only for products saved before isColor existed. Size still matches by
 * name only, not by array position — a product with only a Color variant
 * (no Size) used to get its color values mislabeled as sizes because this
 * blindly took variants[0]. Real variant shape is { variants: [{ type,
 * isColor?, values: [{ value, hex?, image?, priceDeltaCents? }] }] }, see
 * app/products.py's validate_variants. A real merchant-picked hex (set via
 * the dashboard's color wheel) is used when present; colorNameToHex only
 * covers products saved before that existed, so an old product doesn't
 * suddenly render every swatch grey. */
function adaptProduct(p: PublicProduct): Product {
  const variants = p.attributes?.variants as
    | {
        type: string;
        isColor?: boolean;
        values: { value: string; hex?: string; image?: string; priceDeltaCents?: number }[];
      }[]
    | undefined;
  const sizeVariant = variants?.find((v) => v.type.trim().toLowerCase() === "size");
  const colorVariant =
    variants?.find((v) => v.isColor) ??
    variants?.find((v) => v.type.trim().toLowerCase() === "color");
  const sizes = sizeVariant?.values.map((v) => v.value) ?? [];
  const sizeLabel = sizeVariant?.type;
  const sizeDetails = sizeVariant?.values.map((v) => ({
    value: v.value,
    image: v.image,
    priceDeltaCents: v.priceDeltaCents,
  }));
  const colors = colorVariant?.values.map((v) => ({
    name: v.value,
    hex: v.hex || colorNameToHex(v.value),
    image: v.image,
    priceDeltaCents: v.priceDeltaCents,
  }));
  const colorLabel = colorVariant?.type;
  const discountPercent =
    p.compareAtPrice && p.compareAtPrice > p.price
      ? Math.round((1 - p.price / p.compareAtPrice) * 100)
      : undefined;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    // tagline is the merchant's own short blurb (Product Details form's
    // "Short Description" field) — a real field, not derived by truncating
    // the long one. Falls back to a stripped excerpt only if they haven't
    // written one yet, so the top of the page isn't blank.
    tagline: p.shortDescription || stripHtml(p.description),
    description: p.description,
    longDescription: stripHtml(p.description, 500),
    features: p.features ?? [],
    price: p.price,
    originalPrice: p.compareAtPrice ?? undefined,
    discountPercent,
    images: p.images,
    video: p.video || undefined,
    categoryId: p.categoryId ?? "",
    categoryName: p.categoryName ?? "",
    // Real reviews aren't built yet — 0/0 is honest ("no reviews"), not a
    // fabricated rating. ProductCard/ProductDetailClient must treat
    // reviewCount === 0 as "don't show a rating", not "show a 0-star badge".
    rating: 0,
    reviewCount: 0,
    inStock: p.inStock,
    stockCount: p.stockCount,
    featured: true,
    freeDelivery: p.freeDelivery,
    deliveryCharges: p.deliveryCharges ?? [],
    sizes,
    sizeLabel,
    sizeDetails,
    colors,
    colorLabel,
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Every active category for this site. Empty array (not sample data) when
 * the site genuinely has none yet, or the request fails — a section reading
 * this must render its own honest empty state, never fall back to fake
 * products a visitor could try to buy. */
export async function getSiteCategories(host: string): Promise<ProductCategory[]> {
  const data = await fetchJson<PublicCategory[]>(`/public/site/${host}/categories`);
  return (data ?? []).map(adaptCategory);
}

/** Active sale/promo campaigns for this site — GET /public/site/{host}
 * /events. Already filtered to active-only by the backend. Empty array
 * (never fake events) when the site has none yet or the request fails. */
export async function getSiteEvents(host: string): Promise<Event[]> {
  const data = await fetchJson<PublicEvent[]>(`/public/site/${host}/events`);
  return (data ?? []).map(adaptEvent);
}

/** Up to 100 active products for this site (matches the public endpoint's
 * max page size) — enough for every homepage section's picks to resolve
 * without a second request per section. */
export async function getSiteProducts(host: string): Promise<Product[]> {
  const data = await fetchJson<{ items: PublicProduct[] }>(
    `/public/site/${host}/products?limit=100`,
  );
  return (data?.items ?? []).map(adaptProduct);
}

/** One product by slug — GET /public/site/{host}/products/{slug}, what the
 * product detail page renders. Null (not a fallback product) when the slug
 * doesn't resolve, so the page can 404 honestly. */
export async function getSiteProduct(
  host: string,
  slug: string,
): Promise<Product | null> {
  const data = await fetchJson<PublicProduct>(
    `/public/site/${host}/products/${slug}`,
  );
  return data ? adaptProduct(data) : null;
}

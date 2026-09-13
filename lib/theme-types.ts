export type SitePageType =
  | "home"
  | "products"
  | "productDetail"
  | "categories"
  | "cart"
  | "checkout"
  | "about"
  | "contact"
  | "faq"
  | "privacy"
  | "terms"
  | "notFound";

export type SectionType =
  | "banner"
  | "hero"
  | "events"
  | "categories"
  | "featureProducts"
  | "productShowcase"
  | "categoryShowcase"
  | "whyChooseUs"
  | "features"
  | "testimonials"
  | "bannerCta"
  | "footer";

export type SitePage = {
  id: string;
  type: SitePageType;
  title: string;
  path: string;
  enabled: boolean;
};

export type PageSection = {
  id: string;
  type: SectionType;
};

export type NavLink = {
  id: string;
  label: string;
  /** Route to navigate to. Set in the dashboard by copying the preview's
   * URL bar. Falls back to "/" when the merchant hasn't set one yet. */
  path?: string;
};

export type HeaderButton = {
  id: string;
  label: string;
  style: "primary" | "outline";
  path?: string;
};

export type EditorTestimonial = {
  id: string;
  name: string;
  quote: string;
  image: string;
  role?: string;
  rating?: number;
};

export type SiteEditorSettings = {
  siteName: string;
  logoType: "text" | "image";
  logoImage: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  /** Keys into DISPLAY_FONTS / BODY_FONTS in theme-context.tsx. */
  displayFont: string;
  bodyFont: string;
  buttonStyle: "Pill" | "Rounded" | "Square";
  navLinks: NavLink[];
  headerButtons: HeaderButton[];
  pages: SitePage[];
  sections: PageSection[];       // ordered — render in this exact order
  announcementItems: string[];
  announcementDivider: string;
  /** Hero is images only — no text, no buttons. 16:9 is required and drives
   * desktop; 1:1 is optional and mobile-only, falling back to 16:9. */
  heroImages: string[]; heroImagesSquare: string[];
  /** Up to 3 featured sale/promo campaigns — merchant picks which of their
   * real Events to show right under Hero. Curated only: an empty selection
   * means the section shows its own skeleton, never "show every event". */
  selectedEventIds: string[];
  categoriesTitle: string; selectedCategoryIds: string[]; excludedCategoryIds?: string[];
  featureProductsTitle: string; selectedProductIds: string[];
  /** Product showcase — picks one catalog product; UI pulls name/price/image from it. */
  showcaseProductId: string;
  whyTitle: string;
  whyImage: string;
  why1Title: string; why1: string;
  why2Title: string; why2: string;
  why3Title: string; why3: string;
  categoryShowcaseTitle: string;
  categoryShowcaseCategoryIds: string[];
  featuresTitle: string;
  feature1Title: string; feature1: string;
  feature1IconKind: "icon" | "image"; feature1Icon: string; feature1Image: string;
  feature2Title: string; feature2: string;
  feature2IconKind: "icon" | "image"; feature2Icon: string; feature2Image: string;
  feature3Title: string; feature3: string;
  feature3IconKind: "icon" | "image"; feature3Icon: string; feature3Image: string;
  testimonialsMode?: "cards" | "images"; testimonialsTitle: string; testimonials: EditorTestimonial[];
  ctaTitle: string; ctaBody: string; ctaButton: string;
  // Footer — Newsletter column is fixed (no editable fields) by design.
  footerDescription: string;
  footerShopLabel: string; footerShopLinks: NavLink[];
  footerCompanyLabel: string; footerCompanyLinks: NavLink[];
};

// Additional e-commerce domain models for products, categories, cart items
export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  /** Wide cover image for the shop page's per-category banner — real
   * merchant upload, empty string when they haven't set one yet. */
  banner: string;
  /** lucide-react icon name (e.g. "Truck") — empty when unset. Only some
   * templates render a category icon; others simply ignore it. */
  icon: string;
  itemCount: number;
  featured?: boolean;
};

export type ProductVariant = {
  id: string;
  name: string;
  options: string[];
};

export type ProductFeatureHighlight = {
  title: string;
  description: string;
  /** lucide-react icon name the merchant picked (same picker as category
   * icons) — falls back to a neutral default icon when unset, never a guess
   * derived from the title text. */
  icon?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  /** Merchant-entered icon callouts (e.g. "Free delivery") — empty when
   * none were added; the storefront section hides itself rather than
   * inventing generic commitments. */
  features?: ProductFeatureHighlight[];
  price: number;              // In Taka
  originalPrice?: number;     // Original price before discount
  discountPercent?: number;
  images: string[];
  /** Cloudinary upload or pasted external link (YouTube etc.) — empty when
   * the merchant hasn't added one. Shown as an extra slide alongside the
   * product images, not auto-played. */
  video?: string;
  categoryId: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  badge?: string;             // e.g. "Signature", "Bestseller", "Handmade"
  featured?: boolean;
  details?: {
    material?: string;
    origin?: string;
    care?: string;
    dimensions?: string;
  };
  sizes?: string[];
  /** The merchant's own label for this variant type (e.g. "Size", "Fit",
   * "Length") — variant.type is free text, not a fixed "Size"/"Color"
   * pair, so the storefront must show what was actually saved rather than
   * a hardcoded "Size" heading. */
  sizeLabel?: string;
  /** Same values as `sizes`, but carrying each value's own image/price
   * override when the merchant set one (dashboard's variant editor) — kept
   * separate from `sizes` (a plain string list) since most call sites only
   * ever need the label. image, when set, swaps the main product photo;
   * priceDeltaCents, when set, is added to the base price. */
  sizeDetails?: { value: string; image?: string; priceDeltaCents?: number }[];
  /** hex is a real merchant-picked color (dashboard color wheel) when
   * present; only falls back to a name-based guess for products saved
   * before that existed (see color-names.ts). image, when set, is the
   * merchant's own photo for this specific color — selecting it swaps the
   * main product photo instead of just tinting a swatch. priceDeltaCents,
   * when set, is added to the base price. */
  colors?: { name: string; hex: string; image?: string; priceDeltaCents?: number }[];
  colorLabel?: string;
  /** True = no delivery charge for this product, ever. False + empty
   * deliveryCharges = the merchant hasn't set delivery pricing yet — treat
   * as "unknown", not as free. */
  freeDelivery: boolean;
  /** Real delivery-charge options the merchant configured for this product
   * (Add/Edit Product → Shipping). Empty when none were added. */
  deliveryCharges: { name: string; charge: number }[];
};

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

/** A merchant-run sale/promo campaign. Real backend data — see
 * lib/public-catalog.ts's getSiteEvents. discountPercent is the real
 * checkout-honored discount (already applied to `price` on any Product in
 * productIds — see Product.originalPrice/discountPercent), not cosmetic. */
export type Event = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  ctaLabel: string;
  discountPercent: number;
  productIds: string[];
};

// Public Backend API Contracts for SEO & Dynamic Site Fetching
export type ResolvedPageSeo = {
  title: string;
  description: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon?: string;
  noindex?: boolean;
  canonical: string;
};

export type PublicSitePage = {
  slug: string;
  path: string;
  title: string;
  blocks?: any[];
  seo: ResolvedPageSeo;
};

export type PublicPaymentMethod = {
  provider: "cod" | "manual" | "bkash" | "nagad" | "sslcommerz" | "rocket";
  label: string;
  config: {
    cod_fee_cents?: number;
    payment_number?: string;
    wallets?: ("bkash" | "nagad" | "rocket")[];
  };
};

export type PublicSiteConfig = {
  site: {
    id: string;
    name: string;
    template_key: string;
    framework: string;
    theme?: Record<string, any>;
    /** Dedicated About Us content — separate from theme.tagline and
     * business.description, with its own image (not the homepage hero). */
    about?: {
      heading?: string;
      image?: string;
      paragraphs?: string[];
    };
    business?: {
      name?: string;
      type?: string;
      description?: string;
      phone?: string;
      email?: string;
      logo_url?: string;
      address?: {
        street?: string;
        city?: string;
        region?: string;
        postal_code?: string;
        country?: string;
      };
      map_url?: string;
      whatsapp?: string;
      hours?: { day: string; open: string; close: string; closed: boolean }[];
      opening_hours?: string[];
      socials?: Record<string, string> | string[];
      support_note?: string;
    };
    seo?: {
      keywords?: string;
      sitemap_enabled?: boolean;
      google_analytics?: string;
      google_search_console?: string;
      facebook_pixel?: string;
      tiktok_pixel?: string;
      gtm_container_id?: string;
      favicon?: string;
    };
    faqs?: { id: string; question: string; answer: string }[];
    legal?: {
      privacy?: { title: string; content: string; published: boolean };
      terms?: { title: string; content: string; published: boolean };
    };
    /** Only status='connected' methods reach here — see app/api/public.py's
     * get_site_config. A merchant who hasn't enabled anything in Settings
     * → Payments gets an empty array, not a fabricated default. */
    payment_methods?: PublicPaymentMethod[];
  };
  nav: { title: string; path: string }[];
  pages: PublicSitePage[];
  json_ld?: Record<string, any> | null;
  updated_at?: string;
};

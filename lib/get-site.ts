import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublicSiteConfig, ResolvedPageSeo, Product } from "./theme-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

const DEFAULT_SITE_HOST =
  process.env.NEXT_PUBLIC_SITE_HOST ||
  process.env.SITE_HOST ||
  "localhost";

/**
 * Extract the incoming host from request headers (Server Components only).
 *
 * x-preview-site-host (set by middleware.ts from ?__site=/the preview
 * cookie) wins over everything — it's how the dashboard's editor iframe
 * previews a specific site on the shared Vercel deployment. Checked before
 * x-forwarded-host on purpose: Vercel's edge resets x-forwarded-host to the
 * real request host after middleware runs, so it can never carry the
 * override there — only a non-reserved custom header can.
 */
export async function getSiteHost(): Promise<string> {
  try {
    const headersList = await headers();
    const hostHeader =
      headersList.get("x-preview-site-host") ||
      headersList.get("x-forwarded-host") ||
      headersList.get("host") ||
      DEFAULT_SITE_HOST;

    // Strip port if present (e.g., localhost:3050 -> localhost)
    return hostHeader.split(":")[0];
  } catch {
    return DEFAULT_SITE_HOST;
  }
}

/**
 * Fetch the published site configuration from the backend API
 * (/public/site/{host}).
 *
 * No fake-data fallback here on purpose. A site that genuinely doesn't exist
 * or isn't published is a 404 on the backend too (see _find_published_site in
 * app/api/public.py) — rendering fabricated business content instead would
 * mean a broken/misconfigured deployment silently shows a fictional store
 * instead of failing loudly. notFound() matches the backend's own behavior.
 */
export async function getSiteConfig(providedHost?: string): Promise<PublicSiteConfig> {
  const config = await fetchSiteConfig(providedHost);
  if (!config) notFound();
  return config;
}

/**
 * Same fetch, but returns null instead of calling notFound().
 *
 * The root layout cannot use notFound() — Next.js throws
 * "notFound() is not allowed to use in root layout" and the visitor gets an
 * opaque client-side "Application error" instead of anything actionable. In
 * dev that error is almost always "the API isn't running", which is worth
 * saying out loud rather than making someone read a stack trace.
 */
export async function fetchSiteConfig(
  providedHost?: string,
): Promise<PublicSiteConfig | null> {
  const host = providedHost || (await getSiteHost());

  // The real visitor IP (set by middleware.ts from the INBOUND request,
  // before it's threaded here) — forwarded explicitly as X-Original-Client-IP
  // on this OUTBOUND call, since this fetch() is a brand-new connection
  // from this app's own server and carries none of the original request's
  // networking context otherwise. Without this, app/main.py's ip_block
  // middleware never sees a blocked visitor's real IP for any
  // server-rendered page — only client-side calls (checkout) would
  // actually be blocked. NOT X-Forwarded-For: confirmed empirically that
  // the backend's own reverse proxy (Caddy) overwrites that header with
  // whatever it sees as the immediate connection peer (this server's own
  // outbound IP, not the original visitor's) — a custom header name passes
  // through untouched.
  const clientIp = (await headers()).get("x-real-client-ip");

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/public/site/${host}`, {
      headers: clientIp ? { "X-Original-Client-IP": clientIp } : undefined,
      // In development this MUST NOT cache. The dashboard's editor preview
      // reloads this page expecting to see what was just published; a 60s
      // window (or worse, a cached copy of a site that has since been
      // deleted) makes the preview look permanently broken even though the
      // publish succeeded. Production keeps the cache — that's the whole
      // point of it — and publishes drop it by tag.
      ...(process.env.NODE_ENV === "development"
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: [`site-${host}`] } }),
    });
  } catch {
    // Network error / API unreachable — nothing real to render.
    return null;
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => null);
    if (body?.detail?.code === "ip_blocked") {
      // redirect() works from anywhere — including the root layout, unlike
      // notFound() (see this file's own comment above on that restriction)
      // — so this one check covers every page and the layout in one place.
      redirect("/blocked");
    }
  }

  if (!res.ok) return null;

  return (await res.json()) as PublicSiteConfig;
}

/**
 * Resolve SEO metadata for any specific page/slug.
 */
export async function getPageSeo(
  slug: string,
  providedHost?: string
): Promise<ResolvedPageSeo> {
  const host = providedHost || (await getSiteHost());
  const config = await getSiteConfig(host);
  const normalizedSlug = slug.replace(/^\//, "").replace(/\/$/, "");

  const page = config.pages.find((p) => {
    const pageSlug = p.slug.replace(/^\//, "").replace(/\/$/, "");
    return pageSlug === normalizedSlug;
  });

  if (page?.seo) {
    return page.seo;
  }

  // A page with no seo entry (e.g. a dynamic route) still needs *something*
  // real to build a title/description from — use the site's own name and
  // tagline (both real, seeded data), never invented marketing copy.
  const siteName = config.site.name;
  const tagline = (config.site.theme?.tagline as string | undefined) ?? "";
  const baseUrl = `https://${host}`;
  const canonical = `${baseUrl}/${normalizedSlug}`.replace(/\/$/, "") || `${baseUrl}/`;

  return {
    title: `${normalizedSlug ? normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1) : "Home"} | ${siteName}`,
    description: config.site.business?.description || tagline,
    og_image: "",
    canonical,
    noindex: false,
  };
}

/**
 * Turns a resolved page SEO object into Next.js Metadata — one place for the
 * title/description/keywords/OG/twitter/robots shape every page.tsx here
 * was hand-duplicating (and had drifted: most set og:title/description to
 * the plain title/description rather than the merchant's own OG fields, and
 * none set keywords). Real merchant-entered values (Site Settings → SEO)
 * flow through automatically once a page switches to this.
 */
export function buildMetadata(seo: ResolvedPageSeo): Metadata {
  return {
    // { absolute } opts out of the root layout's title.template ("%s | Site
    // Name") — seo.title already has the merchant's title_suffix appended
    // server-side (app/api/public.py's _resolve_seo), so without this every
    // page title got suffixed twice: "FAQ | Suffix | Site Name".
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: seo.canonical,
    },
    openGraph: {
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      url: seo.canonical,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.noindex,
    },
  };
}

/**
 * Fetch sitemap URL entries for app/sitemap.ts.
 */
export async function getSiteSitemap(providedHost?: string): Promise<
  Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
  }>
> {
  const host = providedHost || (await getSiteHost());

  try {
    const res = await fetch(`${API_BASE_URL}/public/site/${host}/sitemap.xml`, {
      next: { revalidate: 3600, tags: [`sitemap-${host}`] },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.urls) && data.urls.length > 0) {
        return data.urls.map((u: { loc: string; lastmod?: string; priority?: number }) => ({
          url: u.loc,
          lastModified: u.lastmod ? new Date(u.lastmod) : new Date(),
          priority: u.priority || 0.7,
          changeFrequency: u.priority === 1.0 ? "daily" : "weekly",
        }));
      }
    }
  } catch {
    // fall through to the page-list-only sitemap below
  }

  // Backend sitemap endpoint didn't return usable data — build one from the
  // page list we already have. NOTE: category and product detail URLs are
  // intentionally NOT included here. There is no public products/categories
  // endpoint yet (that's the next phase of work); inventing sample product
  // URLs here would put fake pages in a real sitemap submitted to Google.
  const config = await getSiteConfig(host);
  return config.pages
    .filter((page) => !page.seo.noindex)
    .map((page) => ({
      url: page.seo.canonical,
      lastModified: config.updated_at ? new Date(config.updated_at) : new Date(),
      changeFrequency: (page.path === "/" ? "daily" : "weekly") as "daily" | "weekly",
      priority: page.path === "/" ? 1.0 : 0.8,
    }));
}

/**
 * Generate Product Schema for rich Google Shopping / rich search snippet results.
 */
export function generateProductJsonLd(product: Product, host: string, siteName: string) {
  const baseUrl = `https://${host}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/shop/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: siteName,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
    },
  };
}

/**
 * Generate BreadcrumbList Schema for Google rich breadcrumbs.
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  host: string
) {
  const baseUrl = `https://${host}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${baseUrl}${item.path}`,
    })),
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteProduct, getSiteProducts } from "@/lib/public-catalog";
import {
  getSiteHost,
  getSiteConfig,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/get-site";
import { ProductDetailClient } from "./ProductDetailClient";

// No generateStaticParams: which products exist depends on which tenant's
// site this is (host-based, resolved from request headers in getSiteHost),
// so there is no fixed slug list to pre-render at build time. Next renders
// each product page on demand instead — the same constraint every other
// page here already has via getSiteHost()/fetchSiteConfig().

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const host = await getSiteHost();
  const product = await getSiteProduct(host, slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const config = await getSiteConfig(host);
  const siteName = config.site.name;
  const baseUrl = `https://${host}`;
  const canonical = `${baseUrl}/shop/${product.slug}`;

  return {
    title: `${product.name} | ${siteName}`,
    description: product.tagline,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${product.name} | ${siteName}`,
      description: product.tagline,
      images: product.images.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description: product.tagline,
      images: product.images,
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "BDT",
      "product:availability": product.inStock ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const host = await getSiteHost();
  // All three fetches are independent — only the notFound() gate and the
  // related-products filter below actually depend on `product`'s value, not
  // on fetch order. Firing them together removes a real waterfall (was:
  // product, then config, then products — three sequential round trips).
  const [product, config, allProducts] = await Promise.all([
    getSiteProduct(host, slug),
    getSiteConfig(host),
    getSiteProducts(host),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId,
  );
  const productJsonLd = generateProductJsonLd(product, host, config.site.name);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: product.categoryName, path: `/shop?category=${product.categoryId}` },
      { name: product.name, path: `/shop/${product.slug}` },
    ],
    host
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <ProductDetailClient initialProduct={product} relatedProducts={related} />
    </>
  );
}

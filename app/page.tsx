import type { Metadata } from "next";
import { getSiteHost, getPageSeo, buildMetadata } from "@/lib/get-site";
import { getSiteCategories, getSiteEvents, getSiteProducts } from "@/lib/public-catalog";
import { HomePageClient } from "./HomePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("", host);

  return buildMetadata(seo);
}

export default async function HomePage() {
  const host = await getSiteHost();
  // Fetched once here, server-side, and threaded through every section that
  // needs it — see SectionRenderer.tsx — rather than each section fetching
  // (and re-fetching) its own copy.
  const [categories, products, events] = await Promise.all([
    getSiteCategories(host),
    getSiteProducts(host),
    getSiteEvents(host),
  ]);

  return <HomePageClient categories={categories} products={products} events={events} />;
}

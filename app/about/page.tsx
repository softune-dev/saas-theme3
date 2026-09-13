import type { Metadata } from "next";
import { getSiteHost, getPageSeo, buildMetadata, getSiteConfig } from "@/lib/get-site";
import { AboutPageClient } from "./AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("about", host);

  return buildMetadata(seo);
}

export default async function AboutPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);

  return (
    <AboutPageClient
      siteName={config.site.name}
      theme={config.site.theme ?? {}}
      about={config.site.about ?? {}}
    />
  );
}

import type { Metadata } from "next";
import { getSiteHost, getPageSeo, buildMetadata, getSiteConfig } from "@/lib/get-site";
import { ContactPageClient } from "./ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("contact", host);

  return buildMetadata(seo);
}

export default async function ContactPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);

  return <ContactPageClient business={config.site.business ?? {}} host={host} />;
}

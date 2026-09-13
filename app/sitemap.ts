import { MetadataRoute } from "next";
import { getSiteSitemap } from "@/lib/get-site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSiteSitemap();
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified || new Date(),
    changeFrequency: entry.changeFrequency || "weekly",
    priority: entry.priority || 0.7,
  }));
}

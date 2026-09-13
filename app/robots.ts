import { MetadataRoute } from "next";
import { getSiteHost } from "@/lib/get-site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await getSiteHost();
  const baseUrl = `https://${host}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/api/*", "/404"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

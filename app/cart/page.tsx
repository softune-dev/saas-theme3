import type { Metadata } from "next";
import { getSiteHost, getPageSeo } from "@/lib/get-site";
import { CartPageClient } from "./CartPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("cart", host);

  return {
    title: "Shopping Bag | Ananya Lifestyle",
    description: "Review your items and proceed to checkout.",
    alternates: {
      canonical: `https://${host}/cart`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartPage() {
  return <CartPageClient />;
}

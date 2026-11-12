import { NextResponse } from "next/server";
import { getSiteHost } from "@/lib/get-site";
import { getSiteProducts } from "@/lib/public-catalog";
import { matchesSearch } from "@/lib/search";

/**
 * Live results for the header search box: GET /api/search?q=...
 * Filters this store's catalog (the same cached list the shop page uses)
 * with the shop page's own matcher, so the box and /shop?q= always agree.
 */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 80);
  if (!q) return NextResponse.json({ total: 0, items: [] });
  const host = await getSiteHost();
  const matches = (await getSiteProducts(host)).filter((p) => matchesSearch(p, q));
  return NextResponse.json({
    total: matches.length,
    items: matches.slice(0, 6).map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.categoryName,
      price: p.price,
      image: p.images[0] ?? null,
    })),
  });
}

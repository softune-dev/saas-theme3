import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteCategories } from "@/lib/public-catalog";
import { getSiteHost, getPageSeo, buildMetadata } from "@/lib/get-site";
import { Footer } from "@/components/footer/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("categories", host);

  return buildMetadata(seo);
}

export default async function CategoriesPage() {
  const host = await getSiteHost();
  const categories = await getSiteCategories(host);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col text-[var(--foreground)]">

      {/* Compact Header Banner */}
      <div className="pt-8 pb-3 sm:pt-12 sm:pb-4">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-left">
          <h1
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-[var(--foreground)]"
          >
            Collections.
          </h1>
        </div>
      </div>

      {/* Main Grid (2 columns on mobile, 3 on tablet, 4 on desktop) */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col transition-all duration-300"
            >
              {/* Category Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  />
                ) : null}
              </div>

              {/* Text Info (Tighter padding & smaller font sizing) */}
              <div className="pt-4 flex flex-col flex-1 justify-between space-y-2 text-left">
                <div>
                  <h3
                    style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                    className="font-display text-base sm:text-lg md:text-xl text-[var(--foreground)] group-hover:opacity-85 transition-opacity mb-1"
                  >
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 group-hover:text-[var(--foreground)] pt-1 group-hover:translate-x-1 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

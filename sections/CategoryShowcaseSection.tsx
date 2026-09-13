"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { Product, ProductCategory } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";

interface CategoryShowcaseSectionProps {
  categoryShowcaseTitle: string;
  categoryShowcaseCategoryIds: string[];
  categories: ProductCategory[];
  products: Product[];
}

function CategoryProductSlider({
  categoryId,
  categoryName,
  categorySlug,
  products,
}: {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  products: Product[];
}) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const categoryProducts = products.filter((p) => p.categoryId === categoryId);
  if (categoryProducts.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-end justify-between gap-3 md:mb-8 md:gap-4">
        <h3
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
          className="min-w-0 font-display text-xl leading-tight tracking-tight text-[var(--foreground)] sm:text-2xl md:text-3xl"
        >
          {categoryName}
        </h3>
        {/* Always visible (incl. mobile) — same eyebrow treatment as
         * Categories / Feature Products section headers. */}
        <Link
          href={`/shop?category=${encodeURIComponent(categorySlug)}`}
          className="mb-0.5 shrink-0 text-[11px] uppercase tracking-[0.24em] text-[var(--foreground)] link-underline sm:text-[12px]"
        >
          View all
        </Link>
      </div>

      <div
        className="overflow-hidden -mx-6 px-6 md:-mx-10 md:px-10"
        ref={emblaRef}
      >
        <div className="flex w-full cursor-grab gap-4 pb-2 active:cursor-grabbing md:gap-6">
          {categoryProducts.map((product, i) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_22%]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCategoryProductSlider({
  categoryIndex,
}: {
  categoryIndex: number;
}) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <div className="w-full select-none">
      <div className="mb-6 flex items-end justify-between gap-3 md:mb-8 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-stone-600">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <h3
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="min-w-0 font-display text-xl leading-tight tracking-tight text-stone-600 sm:text-2xl md:text-3xl"
          >
            Add category {categoryIndex}
          </h3>
        </div>
        <span className="mb-0.5 shrink-0 text-[11px] uppercase tracking-[0.24em] text-stone-500 sm:text-[12px]">
          Add products
        </span>
      </div>

      <div
        className="overflow-hidden -mx-6 px-6 md:-mx-10 md:px-10"
        ref={emblaRef}
      >
        <div className="flex w-full cursor-grab gap-4 pb-2 active:cursor-grabbing md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_22%]"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-200/90 border border-stone-300/80 flex flex-col items-center justify-center p-4 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-300/80 text-stone-600 mb-2">
                  <Plus className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                  className="font-display text-xs sm:text-sm text-stone-600"
                >
                  Add product {i + 1}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-left w-full">
                <div className="hidden sm:block h-2.5 w-16 bg-stone-200 rounded-xs" />
                <div className="h-4 w-3/4 bg-stone-200 rounded-xs" />
                <div className="h-3.5 w-14 bg-stone-200 rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryShowcaseSection({
  categoryShowcaseTitle,
  categoryShowcaseCategoryIds,
  categories: allCategories,
  products,
}: CategoryShowcaseSectionProps) {
  // The merchant must explicitly pick categories in the editor — no
  // "nothing selected = show every category" fallback.
  const categories =
    categoryShowcaseCategoryIds?.length > 0
      ? allCategories.filter((cat) => categoryShowcaseCategoryIds.includes(cat.id))
      : [];

  const isSkeleton = categories.length === 0;

  return (
    <section className="w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 md:mb-8"
        >
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
          >
            {(categoryShowcaseTitle ?? "").trim() || "Collections"}
          </h2>
        </motion.div>

        <div className="flex w-full flex-col gap-10 md:gap-12">
          {isSkeleton
            ? Array.from({ length: 2 }).map((_, blockIdx) => (
                <SkeletonCategoryProductSlider
                  key={blockIdx}
                  categoryIndex={blockIdx + 1}
                />
              ))
            : categories.map((cat) => (
                <CategoryProductSlider
                  key={cat.id}
                  categoryId={cat.id}
                  categoryName={cat.name}
                  categorySlug={cat.slug}
                  products={products}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

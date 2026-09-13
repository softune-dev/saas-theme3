"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductCategory } from "@/lib/theme-types";

interface CategoriesSectionProps {
  categoriesTitle: string;
  selectedCategoryIds: string[];
  excludedCategoryIds?: string[];
  categories: ProductCategory[];
}

export function CategoriesSection({
  categoriesTitle,
  selectedCategoryIds,
  excludedCategoryIds,
  categories: allCategories,
}: CategoriesSectionProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  let categories: ProductCategory[];
  if (excludedCategoryIds) {
    categories = allCategories.filter(
      (cat) => !excludedCategoryIds.includes(cat.id),
    );
  } else if (selectedCategoryIds?.length > 0) {
    categories = allCategories.filter((cat) =>
      selectedCategoryIds.includes(cat.id),
    );
  } else {
    categories = allCategories;
  }

  const isSkeleton = categories.length === 0;
  const items = isSkeleton
    ? Array.from({ length: 6 }).map((_, i) => ({ id: `sk-${i}`, i }))
    : categories;

  return (
    <section className="w-full px-6 py-10 md:px-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center md:mb-16"
      >
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
          {(categoriesTitle ?? "").trim() || "Categories"}
        </h2>
      </motion.div>

      <div className="slider-edge-fade overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 md:gap-8">
          {isSkeleton
            ? (items as { id: string; i: number }[]).map((sk) => (
                <div
                  key={sk.id}
                  className="flex w-36 shrink-0 flex-col items-center text-center sm:w-48 md:w-56 lg:w-64"
                >
                  <div className="flex aspect-square w-full items-center justify-center rounded-full border-4 border-[var(--brand)] bg-stone-200/90">
                    <Plus className="h-8 w-8 text-stone-500" strokeWidth={1.75} />
                  </div>
                  <span className="mt-3 font-display text-sm text-stone-500 sm:text-base">
                    Add {sk.i + 1}
                  </span>
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id || cat.name}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex w-36 shrink-0 flex-col items-center text-center sm:w-48 md:w-56 lg:w-64"
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded-full border-4 border-[var(--brand)] bg-stone-200">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 256px"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </span>
                  <h3 className="mt-3 font-display text-sm font-medium text-[var(--foreground)] sm:text-base md:text-lg">
                    {cat.name}
                  </h3>
                </Link>
              ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/categories"
          className="inline-block text-[12px] font-semibold uppercase tracking-[0.24em] text-[var(--foreground)] underline decoration-2 decoration-[var(--brand)] underline-offset-8"
        >
          See all
        </Link>
      </div>
    </section>
  );
}

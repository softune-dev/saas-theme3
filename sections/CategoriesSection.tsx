"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
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

  // Opt-out model: every real category shows by default, including ones
  // added to the catalog after this section was last touched in the editor
  // — only excludedCategoryIds hides one. selectedCategoryIds is the older
  // opt-in list from before this existed; sites that never touched the new
  // field still resolve against it here so an already-published curated
  // list keeps rendering exactly as before.
  let categories: ProductCategory[];
  if (excludedCategoryIds) {
    categories = allCategories.filter((cat) => !excludedCategoryIds.includes(cat.id));
  } else if (selectedCategoryIds?.length > 0) {
    categories = allCategories.filter((cat) => selectedCategoryIds.includes(cat.id));
  } else {
    categories = allCategories;
  }

  const isSkeleton = categories.length === 0;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex items-end justify-between gap-4 md:mb-8"
      >
        <div>
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
          >
            {(categoriesTitle ?? "").trim() || "Categories"}
          </h2>
        </div>

        <Link
          href="/categories"
          className="hidden md:inline-block text-[12px] uppercase tracking-[0.24em] link-underline text-[var(--foreground)] mb-2"
        >
          See all
        </Link>
      </motion.div>

      {/* Embla Slider Container (No borders) */}
      <div className="overflow-hidden -mx-6 px-6 md:-mx-10 md:px-10" ref={emblaRef}>
        <div className="flex w-full cursor-grab gap-4 pb-2 active:cursor-grabbing md:gap-6">
          {isSkeleton
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0"
                >
                  <div className="relative w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-stone-200/90 border border-stone-300/80 flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-300/80 text-stone-600 mb-3">
                      <Plus className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <span
                      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                      className="font-display text-lg md:text-xl text-stone-600"
                    >
                      Add category {i + 1}
                    </span>
                  </div>
                </div>
              ))
            : categories.map((cat) => (
                <div
                  key={cat.id || cat.name}
                  className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0"
                >
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="group block relative w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-stone-200"
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                        className="h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-[0.22,1,0.36,1] group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-transparent transition-colors duration-700 group-hover:bg-black/20" />
                    {/* Always-on bottom scrim so category titles stay readable on light images */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[42%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between text-white z-10">
                      <h3
                        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                        className="font-display text-2xl md:text-3xl text-white font-normal drop-shadow-sm"
                      >
                        {cat.name}
                      </h3>
                      <div className="overflow-hidden flex items-center justify-center w-8 h-8 rounded-full border border-white/40 backdrop-blur-xs opacity-0 -translate-x-3 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-x-0 shrink-0 ml-2">
                        <ArrowRight className="h-4 w-4 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

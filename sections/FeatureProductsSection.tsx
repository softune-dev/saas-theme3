"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";

interface FeatureProductsSectionProps {
  featureProductsTitle: string;
  selectedProductIds?: string[];
  products: Product[];
}

export function FeatureProductsSection({
  featureProductsTitle,
  selectedProductIds,
  products: allProducts,
}: FeatureProductsSectionProps) {
  // The merchant must explicitly pick products in the editor — no
  // "nothing selected = show everything" fallback. Until they do, this
  // section has nothing configured yet, not an arbitrary catalog dump.
  const displayProducts =
    selectedProductIds && selectedProductIds.length > 0
      ? allProducts.filter((p) => selectedProductIds.includes(p.id))
      : [];

  const isSkeleton = displayProducts.length === 0;

  return (
    <section className="w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-end justify-between md:mb-8"
        >
          <div>
            <h2
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
            >
              {(featureProductsTitle ?? "").trim() || "Featured"}
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden md:inline-block text-[12px] uppercase tracking-[0.24em] link-underline text-[var(--foreground)]"
          >
            Shop latest
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {isSkeleton
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-200/90 border border-stone-300/80 flex flex-col items-center justify-center p-4 text-center select-none">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-300/80 text-stone-600 mb-2">
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <span
                      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                      className="font-display text-sm sm:text-base text-stone-600"
                    >
                      Add your product {i + 1}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-left w-full">
                    <div className="hidden sm:block h-2.5 w-16 bg-stone-200 rounded-xs" />
                    <div className="h-4 w-3/4 bg-stone-200 rounded-xs" />
                    <div className="h-3.5 w-14 bg-stone-200 rounded-xs" />
                  </div>
                </div>
              ))
            : displayProducts.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}

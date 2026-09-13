"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";

interface ProductShowcaseSectionProps {
  showcaseProductId: string;
  products: Product[];
}

export function ProductShowcaseSection({
  showcaseProductId,
  products,
}: ProductShowcaseSectionProps) {
  const { addItem, openDrawer } = useCart();

  // Only the merchant-picked product — no silent fall-through to products[0]
  // or bundled stock images when nothing is configured.
  const product = showcaseProductId
    ? products.find((p) => p.id === showcaseProductId)
    : undefined;

  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : [];
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] ?? "");

  // Keep size selection valid when the picked product changes in the editor.
  useEffect(() => {
    const next = product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "";
    setSelectedSize(next);
  }, [product?.id, product?.sizes]);

  if (!product) {
    return (
      <section className="w-full bg-transparent">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 select-none"
          >
            {/* Image skeleton block */}
            <div className="relative aspect-square w-full overflow-hidden bg-stone-200" />

            {/* Product info skeleton */}
            <div className="flex w-full flex-col gap-6 md:gap-8">
              <div className="h-3 w-24 bg-stone-200 rounded-xs" />

              <div className="h-8 w-3/4 bg-stone-200 rounded-xs sm:h-10" />

              <div>
                <div className="h-3 w-12 bg-stone-200 rounded-xs mb-3" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="border hairline py-3.5 bg-stone-100"
                    />
                  ))}
                </div>
              </div>

              <div className="h-6 w-28 bg-stone-200 rounded-xs" />

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <div className="h-12 flex-1 rounded-[var(--theme-btn-radius)] border hairline bg-stone-100" />
                <div className="h-12 flex-1 rounded-[var(--theme-btn-radius)] bg-stone-200" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const image = product.images?.[0] ?? "";
  const needsSize = sizes.length > 0;
  const canAdd = !needsSize || Boolean(selectedSize);

  function handleAddToBag() {
    if (!canAdd || !product) return;
    addItem(product, 1, selectedSize || undefined);
    openDrawer();
  }

  return (
    <section className="w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
        >
          {/* Image — top on mobile, left on desktop */}
          <div className="relative aspect-square w-full overflow-hidden bg-stone-200">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : null}
          </div>

          {/* Product info */}
          <div className="flex w-full flex-col gap-6 md:gap-8">
            {product.categoryName ? (
              <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">
                {product.categoryName}
              </div>
            ) : null}

            <h2
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
            >
              {product.name}
            </h2>

            {sizes.length > 0 ? (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-700">
                  <span>Size</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`cursor-pointer border py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                        selectedSize === s
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--background)]"
                          : "hairline bg-transparent text-stone-850 hover:border-[var(--brand)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-baseline gap-3 text-lg font-medium text-[var(--foreground)]">
              <span>{formatTaka(product.price)}</span>
              {product.originalPrice ? (
                <span className="text-sm text-stone-400 line-through">
                  {formatTaka(product.originalPrice)}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!canAdd}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-stone-800 py-4 text-[12px] font-semibold tracking-[0.24em] text-[var(--foreground)] uppercase transition-all hover:bg-[var(--brand)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/bag.svg" alt="" className="h-4 w-4" />
                Add to bag
              </button>
              <Link
                href={`/shop/${product.slug}`}
                className="inline-flex flex-1 items-center justify-center rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-4 text-[12px] font-semibold tracking-[0.24em] text-[var(--background)] uppercase transition-opacity hover:opacity-90"
              >
                View details
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

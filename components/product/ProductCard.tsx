"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { Product } from "@/lib/theme-types";
import { getContrastColor } from "@/lib/color-contrast";
import { useTheme } from "@/lib/theme-context";
import { formatTaka } from "@/lib/utils";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { settings } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const quickViewColor = getContrastColor(settings.primaryColor);
  const primary = product.images[0];
  const secondary = product.images[1];
  const shown = hovered && secondary ? secondary : primary;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : product.discountPercent ?? 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.7,
          delay: Math.min(index, 6) * 0.05,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/shop/${product.slug}`} className="block w-full">
        <div className="relative w-full overflow-hidden bg-stone-200 aspect-[3/4]">
          {shown ? (
            <Image
              src={shown}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-stone-400">
              <ImageOff className="size-6" strokeWidth={1.25} />
            </div>
          )}

          {discount > 0 ? (
            <span className="absolute top-3 left-3 bg-[var(--brand)] px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              Save {discount}%
            </span>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickView(true);
            }}
            className={[
              "absolute inset-x-0 bottom-0 z-10 py-2 text-center text-[10px] font-semibold tracking-[0.14em] uppercase transition-all duration-300 md:py-4 md:text-sm md:tracking-[0.16em]",
              hovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0 max-md:translate-y-0 max-md:opacity-100",
            ].join(" ")}
            style={{
              backgroundColor: "var(--brand)",
              color: quickViewColor,
            }}
          >
            Quick View
          </button>
        </div>

        <div className="mt-3 w-full space-y-1 text-center">
          <h3 className="font-display text-base font-medium leading-snug text-[var(--foreground)] sm:text-lg md:text-xl">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-center gap-2 text-sm font-semibold">
            <span className="text-[var(--foreground)]">
              {formatTaka(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="text-sm font-medium text-stone-400 line-through">
                {formatTaka(product.originalPrice)}
              </span>
            ) : null}
          </div>
        </div>
        </Link>
      </motion.div>

      <QuickViewModal
        product={quickView ? product : null}
        isOpen={quickView}
        onClose={() => setQuickView(false)}
      />
    </>
  );
}

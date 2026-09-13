"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
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
    >
      <Link href={`/shop/${product.slug}`} className="group block w-full">
        {/* Product Image Stage (No white borders, supports dark mode background) */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-200">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="w-full h-full object-cover object-center transition-transform duration-[1.2s] ease-[0.22,1,0.36,1] group-hover:scale-104"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-stone-400">
              <ImageOff className="size-6" strokeWidth={1.25} />
            </div>
          )}
        </div>

        {/* Product Meta & Pricing - Left Aligned to prevent overlap */}
        <div className="mt-3 space-y-1 text-left w-full">
          {/* Category Tag - Hidden on Mobile */}
          <div className="hidden sm:block text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium leading-none">
            {product.categoryName}
          </div>

          {/* Product Name — wrap instead of truncating */}
          <h3
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-base sm:text-lg md:text-xl leading-snug text-[var(--foreground)] group-hover:opacity-75 transition-opacity"
          >
            {product.name}
          </h3>

          {/* Pricing — main left, compare to its right */}
          <div className="flex items-baseline gap-2 text-xs sm:text-sm font-medium">
            <span className="text-[var(--foreground)]">
              {formatTaka(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="line-through text-stone-400 text-[10px] sm:text-xs">
                {formatTaka(product.originalPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

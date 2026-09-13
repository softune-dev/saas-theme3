"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck } from "lucide-react";
import { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]?.name
  );
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    showToast(
      "Added to bag",
      `${product.name} (${quantity} item${quantity > 1 ? "s" : ""}) added to your bag.`,
      "success"
    );
    onClose();
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white border border-stone-300 shadow-2xl my-8 max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white text-stone-700 hover:text-black border border-stone-200 transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-stone-50 justify-between">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 mb-3 border border-stone-200">
            {product.images[selectedImage] || product.images[0] ? (
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : null}
            {product.badge && (
              <div className="absolute top-3 left-3">
                <Badge variant="primary" size="sm">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-20 overflow-hidden border shrink-0 transition-all ${
                    selectedImage === idx
                      ? "border-[var(--theme-primary)]"
                      : "border-stone-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[var(--theme-accent)]">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1 text-stone-600">
                <Star className="w-3.5 h-3.5 fill-[var(--theme-accent)] text-[var(--theme-accent)]" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--theme-ink)] leading-snug mb-2">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-[var(--theme-ink)]">
                {formatTaka(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatTaka(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="accent" size="sm">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Quick view is a compact preview — the plain-text tagline
             * excerpt, not the full rich HTML description (that's the
             * dedicated product page's job, ProductDetailClient.tsx). */}
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              {product.tagline}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[var(--theme-ink)] uppercase tracking-wider mb-2">
                  {product.colorLabel || "Color"}: <span className="font-normal text-stone-600">{selectedColor || product.colors[0].name}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 border transition-all flex items-center justify-center ${
                        selectedColor === c.name
                          ? "border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/20"
                          : "border-stone-300"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="w-3 h-3 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[var(--theme-ink)] uppercase tracking-wider mb-2">
                  Select {product.sizeLabel || "Size"}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 text-xs font-medium border transition-all ${
                        selectedSize === s
                          ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
                          : "border-stone-200 text-stone-800 hover:border-stone-400 bg-stone-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-semibold text-[var(--theme-ink)] uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-stone-200 bg-stone-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold text-stone-900 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-200">
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
              leftIcon={<ShoppingBag className="w-5 h-5" />}
            >
              Add to Bag • {formatTaka(product.price * quantity)}
            </Button>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                Nationwide Home Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--theme-primary)]" />
                100% Genuine Craft
              </span>
            </div>

            <div className="text-center pt-1">
              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="text-xs font-semibold text-[var(--theme-primary)] hover:underline inline-block"
              >
                View Full Product Details & Specs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

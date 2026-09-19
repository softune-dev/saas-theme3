"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { resolveVariantCombination } from "@/lib/variant-combo";

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
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !product) return;
    setSelectedImage(0);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setQuantity(1);
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !product || !mounted) return null;

  const resolvedCombo = resolveVariantCombination(product, selectedSize, selectedColor);
  const displayPrice = resolvedCombo
    ? (resolvedCombo.priceCents ?? product.price * 100) / 100
    : product.price;
  const displayOriginalPrice = resolvedCombo
    ? resolvedCombo.compareAtCents !== undefined
      ? resolvedCombo.compareAtCents / 100
      : undefined
    : product.originalPrice;
  const comboOutOfStock =
    !!resolvedCombo && resolvedCombo.trackStock && resolvedCombo.stock <= 0;
  const hasUnresolvedCombo =
    (product.variantCombinations?.length ?? 0) > 0 && !resolvedCombo;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    showToast(
      "Added to bag",
      `${product.name} (${quantity} item${quantity > 1 ? "s" : ""}) added to your bag.`,
      "success"
    );
    onClose();
  };

  const discount = displayOriginalPrice
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
      )
    : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-stone-950/70 p-0 animate-fade-in md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-stone-300 bg-white md:max-h-[90vh] md:rounded-none md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 border border-stone-200 bg-white p-1.5 text-stone-700 transition-all hover:text-black md:top-4 md:right-4 md:p-2"
          aria-label="Close"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <div className="flex w-full shrink-0 flex-col bg-stone-50 p-3 md:w-1/2 md:p-6">
          <div className="relative mb-2 aspect-[16/10] w-full overflow-hidden border border-stone-200 bg-stone-100 md:mb-3 md:aspect-[4/5]">
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
            <div className="hidden gap-2 overflow-x-auto pb-1 md:flex">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-14 w-12 shrink-0 overflow-hidden border transition-all md:h-20 md:w-16 ${
                    selectedImage === idx
                      ? "border-[var(--brand)]"
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
        <div className="flex min-h-0 w-full flex-1 flex-col md:w-1/2">
          <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-8">
            <div className="mb-1 text-[10px] text-stone-500 md:mb-2 md:text-xs">
              <span className="font-semibold uppercase tracking-wider text-[var(--accent)]">
                {product.categoryName}
              </span>
            </div>

            <h2 className="mb-1 text-base font-semibold leading-snug text-[var(--ink)] md:mb-2 md:text-2xl">
              {product.name}
            </h2>

            <div className="mb-3 flex items-baseline gap-2 md:mb-4 md:gap-3">
              <span className="text-lg font-semibold text-[var(--ink)] md:text-2xl">
                {formatTaka(displayPrice)}
              </span>
              {displayOriginalPrice && (
                <span className="text-sm font-semibold text-[var(--brand)] line-through md:text-sm">
                  {formatTaka(displayOriginalPrice)}
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
            <p className="mb-3 text-xs leading-relaxed text-stone-600 md:mb-5 md:text-sm">
              {product.tagline}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3 md:mb-4">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)] md:mb-2 md:text-xs">
                  {product.colorLabel || "Color"}
                  {selectedColor ? (
                    <span className="font-normal text-stone-600">: {selectedColor}</span>
                  ) : null}
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                        selectedColor === c.name
                          ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20"
                          : "border-stone-300"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-3 md:mb-5">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)] md:mb-2 md:text-xs">
                  Select {product.sizeLabel || "Size"}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`flex size-8 items-center justify-center rounded-full border text-[10px] font-medium transition-all md:size-10 md:text-xs ${
                        selectedSize === s
                          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                          : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4 flex items-center gap-3 md:mb-6 md:gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)] md:text-xs">
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

          <div className="shrink-0 border-t border-stone-200 p-3 md:p-4 md:px-8">
            <Button
              onClick={handleAddToCart}
              disabled={comboOutOfStock || hasUnresolvedCombo}
              className="w-full text-sm md:text-base"
              size="md"
              leftIcon={<ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />}
            >
              {hasUnresolvedCombo
                ? "Select an option"
                : comboOutOfStock
                  ? "Out of stock"
                  : `Add to Bag • ${formatTaka(displayPrice * quantity)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, Play } from "lucide-react";
import { Product } from "@/lib/theme-types";
import { formatTaka } from "@/lib/utils";
import { toEmbedUrl } from "@/lib/video";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductReviews } from "@/components/product/ProductReviews";
import { useCart } from "@/components/cart/CartContext";
import { trackAddToCart, trackViewContent } from "@/lib/tracking";
import { Footer } from "@/components/footer/Footer";
import { FeatureIcon } from "@/lib/icon-map";

const defaultSizes = ["XS", "S", "M", "L", "XL"];

// Neutral fallback for a feature added before icon-picking existed (or left
// unset) — never a guess derived from the title text.
const DEFAULT_FEATURE_ICON = "star";

export function ProductDetailClient({
  initialProduct,
  relatedProducts,
}: {
  initialProduct: Product;
  relatedProducts: Product[];
}) {
  const product = initialProduct;
  const { addItem, openDrawer, closeDrawer } = useCart();
  const router = useRouter();

  // Next's scroll-to-top-on-navigate can land mid-page instead of the top
  // when this route streams in behind loading.tsx — force it explicitly
  // rather than depend on that timing. Re-fires per product so clicking a
  // related product (same route pattern, new slug) also resets scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
    trackViewContent({ id: product.id, name: product.name, price: product.price }, "BDT");
  }, [product.id, product.name, product.price]);

  const [activeImage, setActiveImage] = useState<number>(0);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || "M"
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]?.name
  );
  // A color/size value with its own photo (dashboard variant editor)
  // overrides the main stage — set only on an explicit selection, cleared
  // the moment a gallery thumbnail (or a value with no photo) is picked, so
  // the merchant's own gallery order/browsing never gets silently
  // overridden by default.
  const [colorImage, setColorImage] = useState<string | null>(null);
  const [sizeImage, setSizeImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Size/color values can each carry their own price override (dashboard's
  // "affects price" variant toggle) — both are added on top of the base
  // price, same as the real order total the backend computes.
  const selectedSizeDetail = product.sizeDetails?.find(
    (d) => d.value === selectedSize,
  );
  const selectedColorDetail = product.colors?.find(
    (c) => c.name === selectedColor,
  );
  const variantDeltaCents =
    (selectedSizeDetail?.priceDeltaCents ?? 0) +
    (selectedColorDetail?.priceDeltaCents ?? 0);
  const displayPrice = product.price + variantDeltaCents / 100;

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity }, "BDT");
    closeDrawer();
    router.push("/checkout");
  };

  const handleWhatsAppBuy = () => {
    const phoneNumber = "8801700000000"; // Default phone number
    const url = typeof window !== "undefined" ? window.location.href : "";
    const colorLine = selectedColor ? `\nColor: ${selectedColor}` : "";
    const message = `Hello, I'd like to order: *${product.name}*\nSize: ${selectedSize}${colorLine}\nQuantity: ${quantity}\nLink: ${url}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;

  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    trackAddToCart({ id: product.id, name: product.name, price: product.price, quantity }, "BDT");
    openDrawer();
  };

  const features = product.features ?? [];
  // A pasted YouTube/Vimeo link is a webpage URL, not a video file — a plain
  // <video src="..."> can't decode that (shows black). Direct uploads
  // (Cloudinary) play natively; recognized links render as an iframe embed.
  const videoEmbedUrl = product.video ? toEmbedUrl(product.video) : null;
  const isEmbeddedVideo = !!videoEmbedUrl;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col text-[var(--foreground)]">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-10 w-full">
        <nav className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
          <Link href="/shop" className="link-underline hover:text-[var(--foreground)]">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-stone-700">{product.categoryName}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 mt-8 grid md:grid-cols-2 gap-10 md:gap-16 w-full flex-1">

        {/* Left Column: Image Stage */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-stone-100 aspect-[3/4] overflow-hidden border hairline"
          >
            {showVideo && product.video ? (
              isEmbeddedVideo ? (
                <iframe
                  src={`${videoEmbedUrl}?autoplay=1`}
                  title={`${product.name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              )
            ) : colorImage || sizeImage || product.images[activeImage] || product.images[0] ? (
              <Image
                src={colorImage || sizeImage || product.images[activeImage] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover object-center"
              />
            ) : null}
          </motion.div>

          {/* Multiple Thumbnails Selector — video (if any) sits alongside
           * the images, same size/style, so it reads as just another slide. */}
          {product.images.length > 1 || product.video ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(idx);
                    setShowVideo(false);
                    setColorImage(null);
                    setSizeImage(null);
                  }}
                  className={`relative w-20 h-28 bg-stone-100 overflow-hidden border shrink-0 transition-opacity ${!showVideo && activeImage === idx
                      ? "border-[var(--brand)] opacity-100"
                      : "hairline opacity-60 hover:opacity-100"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
              {product.video ? (
                <button
                  onClick={() => setShowVideo(true)}
                  aria-label="Play product video"
                  className={`relative w-20 h-28 bg-stone-900 overflow-hidden border shrink-0 transition-opacity ${showVideo
                      ? "border-[var(--brand)] opacity-100"
                      : "hairline opacity-60 hover:opacity-100"
                    }`}
                >
                  {/* An iframe embed can't be used as a live thumbnail — only
                   * a direct file upload gets a real video preview here. */}
                  {!isEmbeddedVideo ? (
                    <video src={product.video} className="h-full w-full object-cover" muted preload="metadata" />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play className="h-5 w-5 text-white" strokeWidth={1.5} fill="white" />
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right Column: Details & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="md:sticky md:top-24 md:self-start space-y-8"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500 font-medium">
              {product.categoryName}
            </div>
            <h1
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 leading-[0.95] text-[var(--foreground)]"
            >
              {product.name}
            </h1>
            <div className="mt-4 flex items-baseline gap-3 text-2xl font-medium text-[var(--foreground)] sm:text-3xl">
              <span>{formatTaka(displayPrice)}</span>
              {product.originalPrice && (
                <span className="text-base text-stone-400 line-through sm:text-lg">
                  {formatTaka(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* The short blurb, not the full rich description — that lives
           * further down in "Product Details" instead, where there's room
           * for it (and its images/formatting) to actually breathe. */}
          {product.tagline ? (
            <p className="max-w-md text-sm leading-relaxed text-stone-600">
              {product.tagline}
            </p>
          ) : null}

          {/* Color Selector — real swatch circles using the merchant's own
           * picked hex (dashboard color wheel); colorNameToHex only ever
           * covers products saved before that existed. A color with its own
           * photo swaps the main stage image on click (cleared again by
           * picking a gallery thumbnail or a color with no photo). */}
          {product.colors && product.colors.length > 0 ? (
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-medium text-stone-700">
                <span>{product.colorLabel || "Color"}</span>
                {selectedColor ? (
                  <span className="text-stone-400">{selectedColor}</span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name);
                      setColorImage(c.image || null);
                      setShowVideo(false);
                    }}
                    aria-label={c.name}
                    title={c.name}
                    className={`size-9 shrink-0 cursor-pointer rounded-full border transition-all ${selectedColor === c.name
                        ? "ring-2 ring-[var(--brand)] ring-offset-2"
                        : "border-stone-300 hover:ring-2 hover:ring-stone-300 hover:ring-offset-2"
                      }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Size Selector — label is the merchant's own saved variant
           * type name (e.g. "Size"), not a hardcoded heading; the old
           * "Standard fit" subtitle was invented copy with nothing behind
           * it, so it's gone rather than kept as a fake reassurance. */}
          <div>
            <div className="flex items-center text-[11px] uppercase tracking-[0.18em] font-medium text-stone-700">
              <span>{product.sizeLabel || "Size"}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSize(s);
                    const detail = product.sizeDetails?.find((d) => d.value === s);
                    setSizeImage(detail?.image || null);
                  }}
                  className={`py-3.5 text-xs uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${selectedSize === s
                      ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--background)]"
                      : "hairline hover:border-[var(--brand)] bg-transparent text-stone-850"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Add to Bag, Buy Now, Buy on WhatsApp */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center rounded-[var(--theme-btn-radius)] border hairline bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-4 text-[var(--foreground)] hover:bg-stone-200/50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.25} />
                </button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-4 text-[var(--foreground)] hover:bg-stone-200/50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.25} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-stone-800 bg-white py-4 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--brand)] hover:text-[var(--background)]"
              >
                <img src="/assets/bag.svg" alt="Bag Icon" className="w-4 h-4" />
                Add to bag
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleBuyNow}
                className="cursor-pointer rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-4 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
              >
                Buy Now
              </button>

              <button
                onClick={handleWhatsAppBuy}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] border border-stone-300 bg-white py-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--brand)]"
              >
                <img src="/assets/whatsapp.svg" alt="WhatsApp Icon" className="w-4.5 h-4.5" />
                Order via WhatsApp
              </button>
            </div>
          </div>

        </motion.div>
      </section>

      {/* Product Details Section (Clean, spacious, flat layout with zero lines) */}
      {(product.description || features.length > 0) && (
        <section className="mx-auto max-w-[1200px] px-6 md:px-10 py-12 md:py-16 w-full space-y-12 md:space-y-16">

          {/* Product Details — the merchant's own rich description (with
           * whatever formatting/images they added in the editor), not a
           * hardcoded material/care checklist. */}
          {product.description ? (
            <div className="space-y-4 text-left">
              <h3
                style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                className="font-display text-2xl md:text-3xl text-[var(--foreground)]"
              >
                Product Details
              </h3>
              <div
                className="max-w-3xl text-[15px] leading-relaxed text-stone-650 font-light md:text-[16px] [&_a]:text-[var(--brand)] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-stone-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:my-4 [&_img]:rounded-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          ) : null}

          {/* Feature highlights — only what the merchant actually entered on
           * the product (Add Product > Feature highlights). No fallback
           * "commitments" copy when they haven't added any. */}
          {features.length > 0 ? (
            <div className="space-y-6 text-left pt-6">
              <div className="grid gap-8 text-left md:grid-cols-3 md:gap-12">
                {features.map((feature, i) => {
                  const iconName = feature.icon || DEFAULT_FEATURE_ICON;
                  return (
                    <div key={i} className="space-y-3">
                      <FeatureIcon
                        name={iconName}
                        strokeWidth={1.25}
                        className="h-6 w-6 text-[var(--foreground)]"
                      />
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)] md:text-base">
                        {feature.title}
                      </h4>
                      {feature.description ? (
                        <p className="text-[14px] font-light leading-relaxed text-stone-500 md:text-[15px]">
                          {feature.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

        </section>
      )}

      {/* Product Reviews Section */}
      <ProductReviews averageRating={product.rating} totalReviews={product.reviewCount} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-6 md:px-10 pt-4 pb-20 md:pb-24 w-full">
          <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500 font-medium">
            Also consider
          </div>
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-4xl md:text-5xl mt-3 mb-12 text-[var(--foreground)]"
          >
            You may like.
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-14">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

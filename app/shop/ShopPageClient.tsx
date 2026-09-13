"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import type { Event, Product, ProductCategory } from "@/lib/theme-types";
import { ProductCard } from "@/components/product/ProductCard";
import { Footer } from "@/components/footer/Footer";

const priceRanges = ["All", "Under ৳3,000", "৳3,000 - ৳6,000", "Over ৳6,000"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Highest Rated"];

type ShopPageClientProps = {
  categories: ProductCategory[];
  products: Product[];
  events: Event[];
};

export function ShopPageClient({
  categories: allCategories,
  products: allProducts,
  events,
}: ShopPageClientProps) {
  const searchParams = useSearchParams();

  const categories = useMemo(() => {
    return ["All", ...allCategories.map((c) => c.name)];
  }, [allCategories]);

  // Nav links save a lowercase ?category= (e.g. from "/shop?category=women"),
  // so match case-insensitively against the real category names.
  const categoryFromUrl = useMemo(() => {
    const raw = searchParams.get("category");
    if (!raw) return "All";
    return (
      categories.find((c) => c.toLowerCase() === raw.toLowerCase()) ?? "All"
    );
  }, [searchParams, categories]);

  // Same recipe as ?category= — resolves to null (not a filter) when the
  // slug doesn't match any real event, same graceful fallback.
  const eventFromUrl = useMemo(() => {
    const raw = searchParams.get("event");
    if (!raw) return null;
    return events.find((e) => e.slug.toLowerCase() === raw.toLowerCase()) ?? null;
  }, [searchParams, events]);

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(eventFromUrl);
  const [selectedPrice, setSelectedPrice] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("Featured");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Re-sync when the URL's category changes — e.g. clicking a different nav
  // link while already on /shop doesn't remount this component.
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setSelectedEvent(eventFromUrl);
  }, [eventFromUrl]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }

    // Event filter — a product's id must be in the event's own productIds,
    // not a name/slug match like category (a product has no eventSlug of
    // its own).
    if (selectedEvent) {
      result = result.filter((p) => selectedEvent.productIds.includes(p.id));
    }

    // Price Filter
    if (selectedPrice === "Under ৳3,000") result = result.filter((p) => p.price < 3000);
    if (selectedPrice === "৳3,000 - ৳6,000")
      result = result.filter((p) => p.price >= 3000 && p.price <= 6000);
    if (selectedPrice === "Over ৳6,000") result = result.filter((p) => p.price > 6000);

    // Sorting
    if (selectedSort === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    if (selectedSort === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    if (selectedSort === "Highest Rated") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [allProducts, selectedCategory, selectedEvent, selectedPrice, selectedSort]);

  const displayTitle = selectedEvent
    ? `${selectedEvent.name}.`
    : selectedCategory === "All"
      ? "The Collection."
      : `${selectedCategory}.`;

  // Real per-category banner, set by the merchant in the dashboard (Category
  // → banner image). "All" isn't a real category, so there's no banner field
  // for it to have — rather than showing nothing, it borrows the first real
  // banner any category actually has set. A category with none of its own
  // still gets the plain dark background below, not a fake stock photo. An
  // active event's own image takes precedence over both.
  const firstAvailableBanner = allCategories.find((c) => c.banner)?.banner || "";
  const currentBanner = selectedEvent?.image
    ? selectedEvent.image
    : selectedCategory === "All"
      ? firstAvailableBanner
      : allCategories.find((c) => c.name === selectedCategory)?.banner || "";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Banner with Maison Style */}
      <div className="relative h-[22vh] md:h-[30vh] w-full overflow-hidden flex items-center justify-center bg-stone-900 border-b hairline">
        {currentBanner ? (
          <Image
            src={currentBanner}
            alt={`${selectedCategory} Banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-all duration-700 opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/45 z-0" />

        <div className="relative z-10 text-center text-white px-6 w-full max-w-4xl">
          <motion.div
            key={displayTitle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white drop-shadow-md"
            >
              {displayTitle}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 pt-12 md:pt-16 pb-20 md:pb-32">

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-8 border-b hairline pb-4">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
            {filteredProducts.length} Results
          </span>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[var(--foreground)]"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

          {/* Sidebar Filters */}
          <aside className={`md:w-60 shrink-0 ${showMobileFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-28 space-y-10">

              {/* Category Filter */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-stone-500 mb-5 font-semibold">
                  Category
                </h3>
                <ul className="space-y-3.5">
                  {categories.map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => {
                          setSelectedCategory(c);
                          setShowMobileFilters(false);
                        }}
                        className={`text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer block text-left ${selectedCategory === c
                            ? "text-[var(--foreground)] font-bold"
                            : "text-stone-600 hover:text-[var(--foreground)]"
                          }`}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-stone-500 mb-5 font-semibold">
                  Price
                </h3>
                <ul className="space-y-3.5">
                  {priceRanges.map((p) => (
                    <li key={p}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${selectedPrice === p
                              ? "border-[var(--brand)] bg-[var(--brand)]"
                              : "border-stone-300 group-hover:border-stone-550"
                            }`}
                        >
                          {selectedPrice === p && (
                            <div className="w-1.5 h-1.5 bg-[var(--background)] rounded-full" />
                          )}
                        </div>
                        <span
                          className={`text-xs tracking-wide transition-colors ${selectedPrice === p
                              ? "text-[var(--foreground)] font-semibold"
                              : "text-stone-655 group-hover:text-[var(--foreground)]"
                            }`}
                        >
                          {p}
                        </span>
                        <input
                          type="radio"
                          name="price"
                          className="hidden"
                          checked={selectedPrice === p}
                          onChange={() => setSelectedPrice(p)}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-stone-500 mb-5 font-semibold">
                  Sort By
                </h3>
                <ul className="space-y-3.5">
                  {sortOptions.map((s) => (
                    <li key={s}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${selectedSort === s
                              ? "border-[var(--brand)] bg-[var(--brand)]"
                              : "border-stone-300 group-hover:border-stone-550"
                            }`}
                        >
                          {selectedSort === s && (
                            <div className="w-1.5 h-1.5 bg-[var(--background)] rounded-full" />
                          )}
                        </div>
                        <span
                          className={`text-xs tracking-wide transition-colors ${selectedSort === s
                              ? "text-[var(--foreground)] font-semibold"
                              : "text-stone-655 group-hover:text-[var(--foreground)]"
                            }`}
                        >
                          {s}
                        </span>
                        <input
                          type="radio"
                          name="sort"
                          className="hidden"
                          checked={selectedSort === s}
                          onChange={() => setSelectedSort(s)}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reset link */}
              {(selectedCategory !== "All" || selectedPrice !== "All" || selectedSort !== "Featured") && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedPrice("All");
                      setSelectedSort("Featured");
                    }}
                    className="text-xs uppercase tracking-[0.16em] text-[var(--foreground)] font-semibold link-underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="hidden md:flex justify-between items-center mb-8 border-b hairline pb-4">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                {filteredProducts.length} Pieces Found
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ProductCard product={p} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-stone-500 text-sm">
                  No products match your current filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPrice("All");
                    setSelectedSort("Featured");
                  }}
                  className="mt-6 text-xs uppercase tracking-[0.18em] font-semibold text-[var(--foreground)] link-underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

interface HeroSectionProps {
  /** 16:9 images. Required set — desktop always uses these. */
  heroImages: string[];
  /** 1:1 images. Optional, mobile only; empty means mobile reuses heroImages. */
  heroImagesSquare: string[];
}

const SLIDE_MS = 3000;

/** Advances through `count` slides every SLIDE_MS. Returns 0 forever when
 * there's nothing to advance through, so a single image never animates. */
function useSlideIndex(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count]);

  // A shrinking gallery (merchant removed an image) would otherwise leave the
  // index pointing past the end until the next tick.
  return index < count ? index : 0;
}

/** One aspect-locked, cross-fading stack of images. */
function HeroSlides({
  images,
  className,
  priority,
}: {
  images: string[];
  className: string;
  priority: boolean;
}) {
  const index = useSlideIndex(images.length);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          // Only the first image of the visible set blocks paint; the rest are
          // 3s away at minimum and shouldn't compete for initial bandwidth.
          priority={priority && i === 0}
          sizes="100vw"
          className={[
            "object-cover object-center transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export function HeroSection({ heroImages, heroImagesSquare }: HeroSectionProps) {
  const wide = (heroImages ?? []).filter(Boolean);
  // Square set is a mobile-only override. Without it, mobile shows the same
  // 16:9 images rather than nothing.
  const square = (heroImagesSquare ?? []).filter(Boolean);
  const mobile = square.length > 0 ? square : wide;

  // When no hero images are configured, render stylized skeleton placeholders
  // matching the category card aesthetic with + icon, labels, and aspect ratio info.
  if (wide.length === 0) {
    return (
      <section className="relative bg-[var(--background)]">
        {/* Mobile: 1:1 skeleton */}
        <div className="relative aspect-square w-full bg-stone-200/90 border border-stone-300/80 flex flex-col items-center justify-center p-6 text-center select-none md:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-300/80 text-stone-600 mb-3">
            <Plus className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <span
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-lg text-stone-600 sm:text-xl"
          >
            Add hero image mobile
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
            1:1
          </span>
        </div>

        {/* Desktop: 16:9 skeleton */}
        <div className="relative hidden aspect-[21/9] w-full bg-stone-200/90 border border-stone-300/80 md:flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-300/80 text-stone-600 mb-3">
            <Plus className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <span
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-xl text-stone-600 md:text-2xl"
          >
            Add hero image desktop
          </span>
          <span className="mt-1.5 text-xs uppercase tracking-[0.24em] text-stone-400">
            16:9
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[var(--background)]">
      {/* Two stacks rather than one responsive stack: the mobile set can have a
       * different aspect ratio AND a different image count, so they can't share
       * a slide index. */}
      <HeroSlides
        images={mobile}
        className="aspect-square md:hidden"
        priority
      />
      <HeroSlides
        images={wide}
        className="hidden aspect-[21/9] md:block"
        priority
      />
    </section>
  );
}

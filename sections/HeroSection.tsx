"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getContrastColor } from "@/lib/color-contrast";
import { useTheme } from "@/lib/theme-context";

interface HeroSectionProps {
  heroMediaType?: "image" | "video";
  heroImages: string[];
  heroImagesSquare: string[];
  /** One clip for both desktop and mobile — only used when heroMediaType
   * is "video". */
  heroVideo?: string;
  /** Fashion Classic's hero is image-only by design; heroTitle/heroBody/heroCta
   * are still accepted for contract compatibility but intentionally unused here. */
  heroTitle?: string;
  heroBody?: string;
  heroCta?: string;
  primaryColor?: string;
}

const SLIDE_MS = 3000;

function useSlideIndex(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count]);

  return [index < count ? index : 0, setIndex] as const;
}

function HeroSlides({
  images,
  className,
  priority,
}: {
  images: string[];
  className: string;
  priority: boolean;
}) {
  const [index, setIndex] = useSlideIndex(images.length);
  const { settings } = useTheme();
  const arrowColor = getContrastColor(settings.primaryColor);

  return (
    <div className={`group relative w-full overflow-hidden ${className}`}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={priority && i === 0}
          sizes="100vw"
          className={[
            "object-cover object-top transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ))}
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute top-1/2 left-4 z-10 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[var(--brand)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ color: arrowColor }}
          >
            <ChevronLeft className="size-7" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute top-1/2 right-4 z-10 flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[var(--brand)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ color: arrowColor }}
          >
            <ChevronRight className="size-7" strokeWidth={1.75} />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={[
                  "size-2",
                  i === index ? "bg-[var(--brand)]" : "bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function HeroSection({
  heroMediaType,
  heroImages,
  heroImagesSquare,
  heroVideo,
}: HeroSectionProps) {
  if (heroMediaType === "video") {
    if (!heroVideo) {
      return (
        <section className="relative w-full bg-[var(--background)]">
          <div className="relative flex aspect-square w-full select-none flex-col items-center justify-center border border-stone-300/80 bg-stone-200/90 p-6 text-center md:aspect-auto md:h-[85vh] md:max-h-[780px] md:min-h-[320px]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center bg-stone-300/80 text-stone-600">
              <Plus className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <span className="font-display text-lg text-stone-600 sm:text-xl">
              Add hero video
            </span>
          </div>
        </section>
      );
    }
    return (
      <section className="relative w-full bg-[var(--background)]">
        <div className="relative aspect-square w-full overflow-hidden md:aspect-auto md:h-[85vh] md:max-h-[780px] md:min-h-[320px]">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={heroVideo}
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </section>
    );
  }

  const wide = (heroImages ?? []).filter(Boolean);
  const square = (heroImagesSquare ?? []).filter(Boolean);
  const mobile = square.length > 0 ? square : wide;

  if (wide.length === 0) {
    return (
      <section className="relative w-full bg-[var(--background)]">
        <div className="relative flex aspect-square w-full select-none flex-col items-center justify-center border border-stone-300/80 bg-stone-200/90 p-6 text-center md:aspect-auto md:h-[85vh] md:max-h-[780px] md:min-h-[320px]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center bg-stone-300/80 text-stone-600">
            <Plus className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <span className="font-display text-lg text-stone-600 sm:text-xl">
            Add hero image
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-[var(--background)]">
      <HeroSlides
        images={mobile}
        className="aspect-square md:hidden"
        priority
      />
      <HeroSlides
        images={wide}
        className="hidden h-[85vh] max-h-[780px] min-h-[320px] md:block"
        priority
      />
    </section>
  );
}

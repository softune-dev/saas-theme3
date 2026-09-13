"use client";

import React, { useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { EditorTestimonial } from "@/lib/theme-types";

interface TestimonialsSectionProps {
  testimonialsMode?: "cards" | "images";
  testimonialsTitle: string;
  testimonials: EditorTestimonial[];
}

export function TestimonialsSection({
  testimonialsMode,
  testimonialsTitle,
  testimonials,
}: TestimonialsSectionProps) {
  const isImages = testimonialsMode === "images";
  // Filter real entries
  const list = (testimonials ?? []).filter((t) =>
    isImages ? (t.image ?? "").trim() : (t.quote ?? "").trim() || (t.name ?? "").trim(),
  );

  const isSkeleton = list.length === 0;

  const plugin = useRef(
    AutoScroll({ speed: 1.5, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: list.length > 1,
      align: "start",
      containScroll: "trimSnaps",
    },
    isSkeleton ? [] : [plugin.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const title = (testimonialsTitle ?? "").trim() || (isSkeleton ? "What Our Customers Say" : "");

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-10 md:px-10 md:py-14">
      {/* Editorial Header */}
      <div className="mb-6 flex flex-col gap-4 text-left md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          {title ? (
            <h2
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
            >
              {title}
            </h2>
          ) : null}
        </div>

        {/* Side Controls */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={scrollPrev}
            aria-label="Previous testimonials"
            className="p-3 rounded-full border hairline hover:bg-stone-200/50 text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <ChevronLeft strokeWidth={1.25} className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next testimonials"
            className="p-3 rounded-full border hairline hover:bg-stone-200/50 text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <ChevronRight strokeWidth={1.25} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Embla Slider Container (3 in 1 Row) */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6 cursor-grab active:cursor-grabbing pb-4">
          {isSkeleton
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="pl-6 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%] min-w-0"
                >
                  <div className="bg-stone-50 border hairline p-8 flex flex-col justify-between min-h-[300px] h-full text-left select-none">
                    <div className="space-y-4">
                      {/* Rating Placeholder */}
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="w-3.5 h-3.5 fill-stone-200 text-stone-200"
                          />
                        ))}
                      </div>

                      {/* Quote Skeleton */}
                      <div className="space-y-2 pt-1">
                        <div className="h-4 w-full bg-stone-200/80 rounded-xs" />
                        <div className="h-4 w-5/6 bg-stone-200/80 rounded-xs" />
                        <div className="h-4 w-2/3 bg-stone-200/80 rounded-xs" />
                      </div>
                    </div>

                    {/* Author Info Skeleton */}
                    <div className="flex items-center gap-3 mt-6">
                      <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-stone-200 rounded-xs" />
                        <div className="h-2.5 w-14 bg-stone-200/70 rounded-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : list.map((item) =>
                isImages ? (
                  <div
                    key={item.id}
                    className="pl-6 flex-[0_0_72%] sm:flex-[0_0_40%] lg:flex-[0_0_26%] min-w-0"
                  >
                    <div className="relative aspect-[9/16] w-full overflow-hidden border hairline bg-stone-50">
                      <Image
                        src={item.image}
                        alt={item.name || "Customer screenshot"}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="pl-6 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%] min-w-0"
                  >
                    <div className="bg-stone-50 border hairline p-8 flex flex-col justify-between min-h-[300px] h-full text-left">
                      {/* Quote Content */}
                      <div className="space-y-4">
                        {/* Rating */}
                        <div className="flex gap-1 text-stone-800">
                          {Array.from({ length: item.rating || 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-3.5 h-3.5 fill-stone-850 text-stone-850"
                            />
                          ))}
                        </div>

                        <blockquote
                          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                          className="font-display text-lg sm:text-xl text-[var(--foreground)] leading-relaxed italic"
                        >
                          &ldquo;{item.quote}&rdquo;
                        </blockquote>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mt-6">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-200 shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[var(--foreground)] uppercase tracking-wider">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{item.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
        </div>
      </div>
    </section>
  );
}

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
    <section className="w-full px-6 py-10 md:px-10 md:py-14">
      {/* Editorial Header */}
      <div className="mb-12 text-center md:mb-16">
        {title ? (
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl"
          >
            {title}
          </h2>
        ) : null}
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
                        <div className="h-4 w-full bg-stone-200/80 rounded-none" />
                        <div className="h-4 w-5/6 bg-stone-200/80 rounded-none" />
                        <div className="h-4 w-2/3 bg-stone-200/80 rounded-none" />
                      </div>
                    </div>

                    {/* Author Info Skeleton */}
                    <div className="flex items-center gap-3 mt-6">
                      <div className="w-10 h-10 rounded-none bg-stone-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-stone-200 rounded-none" />
                        <div className="h-2.5 w-14 bg-stone-200/70 rounded-none" />
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
                    <div className="flex h-full min-h-[300px] flex-col justify-between border-t-4 border-[var(--brand)] bg-stone-50 p-8 text-center">
                      <div className="space-y-4">
                        <p className="font-display text-5xl leading-none text-[var(--brand)]">
                          “
                        </p>
                        <div className="flex justify-center gap-1 text-[var(--brand)]">
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
                      <div className="mt-6 flex flex-col items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-stone-200">
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

      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={scrollPrev}
          aria-label="Previous testimonials"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border hairline text-[var(--foreground)] transition-colors hover:bg-stone-200/50"
        >
          <ChevronLeft strokeWidth={1.25} className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next testimonials"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border hairline text-[var(--foreground)] transition-colors hover:bg-stone-200/50"
        >
          <ChevronRight strokeWidth={1.25} className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

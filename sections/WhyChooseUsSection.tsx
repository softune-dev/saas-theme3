"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, CheckCircle2, HeartHandshake, Plus } from "lucide-react";

interface WhyChooseUsSectionProps {
  whyTitle: string;
  whyImage: string;
  why1Title: string;
  why1: string;
  why2Title: string;
  why2: string;
  why3Title: string;
  why3: string;
}

const ICONS = [Award, CheckCircle2, HeartHandshake] as const;

export function WhyChooseUsSection({
  whyTitle,
  whyImage,
  why1Title,
  why1,
  why2Title,
  why2,
  why3Title,
  why3,
}: WhyChooseUsSectionProps) {
  const points = [
    { title: (why1Title ?? "").trim(), body: (why1 ?? "").trim(), Icon: ICONS[0], n: "01" },
    { title: (why2Title ?? "").trim(), body: (why2 ?? "").trim(), Icon: ICONS[1], n: "02" },
    { title: (why3Title ?? "").trim(), body: (why3 ?? "").trim(), Icon: ICONS[2], n: "03" },
  ].filter((p) => p.title || p.body);

  const title = (whyTitle ?? "").trim();
  const image = (whyImage ?? "").trim();

  return (
    <section className="w-full">
      <div className="grid w-full items-center gap-10 px-6 py-10 md:grid-cols-2 md:gap-14 md:px-10 md:py-14">
        {image ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        ) : (
          <div className="relative flex aspect-[4/3] w-full select-none flex-col items-center justify-center overflow-hidden border border-stone-300/80 bg-stone-200/90 p-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-300/80 text-stone-600">
              <Plus className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="font-display text-base text-stone-600 sm:text-lg"
            >
              Add why choose us image
            </span>
          </div>
        )}

        <div className="w-full text-left">
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display mb-8 text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:mb-10 md:text-4xl"
          >
            {title || "Why choose us"}
          </h2>

          {points.length === 0 ? (
            <p className="text-sm text-stone-500">
              Add your store&apos;s story, craft details, guarantees, or reasons customers can trust your brand.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {points.map((pt, idx) => {
                const Icon = pt.Icon;
                return (
                  <motion.div
                    key={pt.n}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-start gap-3"
                  >
                    <Icon
                      className="mt-0.5 size-5 shrink-0 text-[var(--brand)]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      {pt.title ? (
                        <h3
                          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                          className="font-display text-base font-medium leading-snug text-[var(--foreground)] sm:text-lg md:text-xl"
                        >
                          {pt.title}
                        </h3>
                      ) : null}
                      {pt.body ? (
                        <p className="mt-1 text-sm leading-relaxed text-stone-500">
                          {pt.body}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

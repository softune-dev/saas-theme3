"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Heart, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer/Footer";
import type { PublicSiteConfig } from "@/lib/theme-types";

type Theme = NonNullable<PublicSiteConfig["site"]["theme"]>;
type About = NonNullable<PublicSiteConfig["site"]["about"]>;

// Reuses the merchant's own Why Choose Us content (Site Editor → Why Choose
// Us section) rather than inventing separate "About page" copy — it's
// already real, editable, and about the store, so a second hardcoded set
// here would just be the same problem in a different section.
const PILLAR_ICONS = [Award, Heart, ShieldCheck];

export function AboutPageClient({
  siteName,
  theme,
  about,
}: {
  siteName: string;
  theme: Theme;
  about: About;
}) {
  // Dedicated About Us content (Site Settings → About Us) — deliberately
  // NOT the homepage hero images or the short business.description; this
  // page has its own image and longer-form story paragraphs.
  const aboutImage = about.image || "";
  const heading = about.heading || siteName;
  const paragraphs = about.paragraphs ?? [];
  const tagline = (theme.tagline as string | undefined) || "";

  const pillars = [
    { title: theme.why1Title as string, body: theme.why1 as string },
    { title: theme.why2Title as string, body: theme.why2 as string },
    { title: theme.why3Title as string, body: theme.why3 as string },
  ].filter((p) => p.title || p.body);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Editorial Header */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 pt-16 md:pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <span className="eyebrow justify-center">Our Story</span>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="font-display text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-[var(--foreground)]"
          >
            {siteName}
          </h1>
          {tagline ? (
            <p className="mt-8 text-base md:text-lg text-stone-500 max-w-xl mx-auto leading-relaxed">
              {tagline}
            </p>
          ) : null}
        </motion.div>
      </section>

      {/* Story Stage */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[3/4] md:aspect-[4/5] bg-stone-200 overflow-hidden"
        >
          {aboutImage ? (
            <Image
              src={aboutImage}
              alt={siteName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 text-left max-w-md"
        >
          <span className="eyebrow">The Origin</span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="font-display text-3xl md:text-4xl leading-[1.1] text-[var(--foreground)]"
          >
            {heading}
          </h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm md:text-base text-stone-500 leading-relaxed">
              {p}
            </p>
          ))}
        </motion.div>
      </section>

      {/* Pillars Section — mirrors the site's own Why Choose Us content */}
      {pillars.length > 0 ? (
        <section className="border-t hairline bg-stone-50/50 py-16 md:py-24">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <div className="text-center mb-16 space-y-4">
              <span className="eyebrow justify-center font-semibold">
                Our Commitment
              </span>
              {theme.whyTitle ? (
                <h3
                  style={{ fontFamily: "var(--font-display)" }}
                  className="font-display text-3xl md:text-4xl text-[var(--foreground)]"
                >
                  {theme.whyTitle as string}
                </h3>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pillars.map((p, i) => {
                const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                return (
                  <motion.div
                    key={p.title || i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="p-8 border border-stone-200 bg-[var(--background)] flex flex-col justify-between h-full"
                  >
                    <div>
                      <Icon strokeWidth={1} className="w-8 h-8 text-stone-600 mb-6" />
                      {p.title ? (
                        <h4
                          style={{ fontFamily: "var(--font-display)" }}
                          className="font-display text-xl text-[var(--foreground)] mb-3"
                        >
                          {p.title}
                        </h4>
                      ) : null}
                      {p.body ? (
                        <p className="text-stone-500 text-xs md:text-sm leading-relaxed">
                          {p.body}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
}

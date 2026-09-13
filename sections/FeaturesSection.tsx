"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FeatureIcon } from "@/lib/icon-map";
import { useTheme } from "@/lib/theme-context";

interface FeaturesSectionProps {
  featuresTitle?: string;
  feature1Title?: string;
  feature1?: string;
  feature1IconKind?: "icon" | "image";
  feature1Icon?: string;
  feature1Image?: string;
  feature2Title?: string;
  feature2?: string;
  feature2IconKind?: "icon" | "image";
  feature2Icon?: string;
  feature2Image?: string;
  feature3Title?: string;
  feature3?: string;
  feature3IconKind?: "icon" | "image";
  feature3Icon?: string;
  feature3Image?: string;
}

export function FeaturesSection(props: FeaturesSectionProps) {
  const { settings } = useTheme();

  // Props from SectionRenderer take precedence over raw theme settings
  const featuresTitle = props.featuresTitle ?? settings.featuresTitle;
  const feature1Title = props.feature1Title ?? settings.feature1Title;
  const feature1 = props.feature1 ?? settings.feature1;
  const feature1IconKind =
    props.feature1IconKind ?? settings.feature1IconKind;
  const feature1Icon = props.feature1Icon ?? settings.feature1Icon;
  const feature1Image = props.feature1Image ?? settings.feature1Image;

  const feature2Title = props.feature2Title ?? settings.feature2Title;
  const feature2 = props.feature2 ?? settings.feature2;
  const feature2IconKind =
    props.feature2IconKind ?? settings.feature2IconKind;
  const feature2Icon = props.feature2Icon ?? settings.feature2Icon;
  const feature2Image = props.feature2Image ?? settings.feature2Image;

  const feature3Title = props.feature3Title ?? settings.feature3Title;
  const feature3 = props.feature3 ?? settings.feature3;
  const feature3IconKind =
    props.feature3IconKind ?? settings.feature3IconKind;
  const feature3Icon = props.feature3Icon ?? settings.feature3Icon;
  const feature3Image = props.feature3Image ?? settings.feature3Image;

  const raw = [
    {
      iconName:
        feature1IconKind === "icon" && feature1Icon
          ? feature1Icon
          : undefined,
      image:
        feature1IconKind === "image" && feature1Image
          ? feature1Image
          : undefined,
      title: (feature1Title ?? "").trim(),
      description: (feature1 ?? "").trim(),
    },
    {
      iconName:
        feature2IconKind === "icon" && feature2Icon
          ? feature2Icon
          : undefined,
      image:
        feature2IconKind === "image" && feature2Image
          ? feature2Image
          : undefined,
      title: (feature2Title ?? "").trim(),
      description: (feature2 ?? "").trim(),
    },
    {
      iconName:
        feature3IconKind === "icon" && feature3Icon
          ? feature3Icon
          : undefined,
      image:
        feature3IconKind === "image" && feature3Image
          ? feature3Image
          : undefined,
      title: (feature3Title ?? "").trim(),
      description: (feature3 ?? "").trim(),
    },
  ];

  const filtered = raw.filter((item) => item.title || item.description);
  const isSkeleton = filtered.length === 0;
  const commitments = filtered;

  const title = (featuresTitle ?? "").trim();

  return (
    <section className="w-full border-t hairline bg-transparent">
      <div className="mx-auto max-w-[1600px]">
        {title ? (
          <h2
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display px-6 pt-8 text-center text-2xl leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:pt-10 md:text-4xl"
          >
            {title}
          </h2>
        ) : null}
        <div
          className={[
            "grid grid-cols-1 divide-y hairline md:divide-y-0 md:divide-x",
            (isSkeleton ? 3 : commitments.length) === 1
              ? "md:grid-cols-1"
              : (isSkeleton ? 3 : commitments.length) === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-3",
          ].join(" ")}
        >
          {isSkeleton
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center px-6 py-8 text-center md:py-10"
                  aria-hidden
                >
                  <span className="mb-5 h-7 w-7 rounded-full bg-stone-300" />
                  <div className="h-4 w-28 rounded bg-stone-300" />
                  <div className="mt-2 h-3 w-40 max-w-xs rounded bg-stone-300/70" />
                </div>
              ))
            : commitments.map((item, i) => (
                <motion.div
                  key={`${item.title}-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group flex flex-col items-center px-6 py-8 text-center transition-colors duration-300 hover:bg-stone-100/40 md:py-10"
                >
                  {item.image ? (
                    <span className="relative mb-5 h-10 w-10 overflow-hidden rounded-full">
                      <Image src={item.image} alt="" fill className="object-cover" />
                    </span>
                  ) : item.iconName ? (
                    <FeatureIcon
                      name={item.iconName}
                      strokeWidth={1.1}
                      className="mb-5 h-7 w-7 text-stone-600 transition-colors group-hover:text-stone-900"
                    />
                  ) : null}
                  {item.title ? (
                    <h3
                      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                      className="font-display text-lg tracking-tight text-[var(--foreground)]"
                    >
                      {item.title}
                    </h3>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-stone-500">
                      {item.description}
                    </p>
                  ) : null}
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

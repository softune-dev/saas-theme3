"use client";

import React from "react";
import { Event, Product, ProductCategory, SectionType, SiteEditorSettings } from "@/lib/theme-types";
import { BannerSection } from "./BannerSection";
import { HeroSection } from "./HeroSection";
import { EventsSection } from "./EventsSection";
import { CategoriesSection } from "./CategoriesSection";
import { FeatureProductsSection } from "./FeatureProductsSection";
import { ProductShowcaseSection } from "./ProductShowcaseSection";
import { CategoryShowcaseSection } from "./CategoryShowcaseSection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import { FeaturesSection } from "./FeaturesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { BannerCtaSection } from "./BannerCtaSection";
import { FooterSection } from "./FooterSection";

interface SectionRendererProps {
  type: SectionType;
  settings: SiteEditorSettings;
  /** Real backend categories/products for this site — see
   * lib/public-catalog.ts. Only the sections that pick from the catalog
   * (categories, featureProducts, categoryShowcase, productShowcase) read
   * these; every other section ignores them. */
  categories: ProductCategory[];
  products: Product[];
  events: Event[];
}

export function SectionRenderer({
  type,
  settings,
  categories,
  products,
  events,
}: SectionRendererProps) {
  switch (type) {
    case "banner":
      return (
        <BannerSection
          announcementItems={settings.announcementItems ?? []}
          announcementDivider={settings.announcementDivider ?? "✦"}
        />
      );

    case "hero":
      return (
        <HeroSection
          heroImages={settings.heroImages}
          heroImagesSquare={settings.heroImagesSquare}
        />
      );

    case "events":
      return (
        <EventsSection
          selectedEventIds={settings.selectedEventIds ?? []}
          events={events}
        />
      );

    case "features":
      return (
        <FeaturesSection
          featuresTitle={settings.featuresTitle}
          feature1Title={settings.feature1Title}
          feature1={settings.feature1}
          feature1IconKind={settings.feature1IconKind}
          feature1Icon={settings.feature1Icon}
          feature1Image={settings.feature1Image}
          feature2Title={settings.feature2Title}
          feature2={settings.feature2}
          feature2IconKind={settings.feature2IconKind}
          feature2Icon={settings.feature2Icon}
          feature2Image={settings.feature2Image}
          feature3Title={settings.feature3Title}
          feature3={settings.feature3}
          feature3IconKind={settings.feature3IconKind}
          feature3Icon={settings.feature3Icon}
          feature3Image={settings.feature3Image}
        />
      );

    case "categories":
      return (
        <CategoriesSection
          categoriesTitle={settings.categoriesTitle}
          selectedCategoryIds={settings.selectedCategoryIds}
          excludedCategoryIds={settings.excludedCategoryIds}
          categories={categories}
        />
      );

    case "featureProducts":
      return (
        <FeatureProductsSection
          featureProductsTitle={settings.featureProductsTitle}
          selectedProductIds={settings.selectedProductIds}
          products={products}
        />
      );

    case "productShowcase":
      return (
        <ProductShowcaseSection
          showcaseProductId={settings.showcaseProductId ?? ""}
          products={products}
        />
      );

    case "categoryShowcase":
      return (
        <CategoryShowcaseSection
          categoryShowcaseTitle={settings.categoryShowcaseTitle ?? ""}
          categoryShowcaseCategoryIds={
            settings.categoryShowcaseCategoryIds ?? []
          }
          categories={categories}
          products={products}
        />
      );

    case "whyChooseUs":
      return (
        <WhyChooseUsSection
          whyTitle={settings.whyTitle}
          whyImage={settings.whyImage ?? ""}
          why1Title={settings.why1Title ?? ""}
          why1={settings.why1}
          why2Title={settings.why2Title ?? ""}
          why2={settings.why2}
          why3Title={settings.why3Title ?? ""}
          why3={settings.why3}
        />
      );

    case "testimonials":
      return (
        <TestimonialsSection
          testimonialsMode={settings.testimonialsMode}
          testimonialsTitle={settings.testimonialsTitle}
          testimonials={settings.testimonials}
        />
      );

    case "bannerCta":
      return (
        <BannerCtaSection
          ctaTitle={settings.ctaTitle}
          ctaBody={settings.ctaBody}
          ctaButton={settings.ctaButton}
        />
      );

    case "footer":
      return <FooterSection />;

    default:
      return null;
  }
}

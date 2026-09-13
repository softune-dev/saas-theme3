"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { SectionRenderer } from "@/sections/SectionRenderer";
import type { Event, Product, ProductCategory } from "@/lib/theme-types";

type HomePageClientProps = {
  categories: ProductCategory[];
  products: Product[];
  events: Event[];
};

export function HomePageClient({ categories, products, events }: HomePageClientProps) {
  const { settings } = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      {settings.sections.map((section) => (
        <SectionRenderer
          key={section.id}
          type={section.type}
          settings={settings}
          categories={categories}
          products={products}
          events={events}
        />
      ))}
    </div>
  );
}

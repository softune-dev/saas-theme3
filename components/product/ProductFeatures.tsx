"use client";

import React from "react";
import { Package, ShieldCheck, RefreshCcw } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ProductFeatures() {
  const { settings } = useTheme();

  return (
    <div className="py-16 md:py-24 border-t hairline w-full">
      <div className="grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">

        {/* Feature 1 */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border hairline bg-stone-50 text-[var(--foreground)]">
            <Package strokeWidth={1.25} className="h-5 w-5" />
          </div>
          <h4 className="mb-3 text-[12px] font-semibold tracking-[0.24em] text-[var(--foreground)] uppercase">
            Premium Packaging
          </h4>
          <p className="text-sm leading-relaxed text-stone-500">
            {settings.feature1 || "Delivered in signature sustainable packaging to ensure your garments arrive in perfect condition."}
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border hairline bg-stone-50 text-[var(--foreground)]">
            <ShieldCheck strokeWidth={1.25} className="h-5 w-5" />
          </div>
          <h4 className="mb-3 text-[12px] font-semibold tracking-[0.24em] text-[var(--foreground)] uppercase">
            Made to Last
          </h4>
          <p className="text-sm leading-relaxed text-stone-500">
            {settings.feature2 || "Our garments are made to last. We offer care guides and repairs to keep your pieces in perfect condition."}
          </p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border hairline bg-stone-50 text-[var(--foreground)]">
            <RefreshCcw strokeWidth={1.25} className="h-5 w-5" />
          </div>
          <h4 className="mb-3 text-[12px] font-semibold tracking-[0.24em] text-[var(--foreground)] uppercase">
            Easy Returns
          </h4>
          <p className="text-sm leading-relaxed text-stone-500">
            {settings.feature3 || "7-day straightforward doorstep exchange on all unworn pieces. Shop with absolute confidence."}
          </p>
        </div>

      </div>
    </div>
  );
}

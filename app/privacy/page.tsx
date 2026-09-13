import React from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/footer/Footer";
import { getSiteHost, getPageSeo, buildMetadata, getSiteConfig } from "@/lib/get-site";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("privacy", host);

  return buildMetadata(seo);
}

export default async function PrivacyPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const privacy = config.site.legal?.privacy;
  const isPublished = privacy?.published && privacy.content.trim();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col text-[var(--foreground)]">
      {/* Header Banner */}
      <div className="bg-stone-50 border-b hairline py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center space-y-3">
          <span className="eyebrow justify-center">Trust & Security</span>
          <h1
            style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--foreground)]"
          >
            {privacy?.title || "Privacy Policy"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 sm:py-16 flex-1 w-full text-left">
        <div className="bg-stone-50 border hairline p-8 sm:p-12 text-stone-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {isPublished ? (
            privacy!.content
          ) : (
            <p className="text-center text-stone-500">
              Our privacy policy isn't published yet — check back soon.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

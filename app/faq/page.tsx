import React from "react";
import type { Metadata } from "next";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Footer } from "@/components/footer/Footer";
import { getSiteHost, getPageSeo, buildMetadata, getSiteConfig } from "@/lib/get-site";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  const seo = await getPageSeo("faq", host);

  return buildMetadata(seo);
}

export default async function FAQPage() {
  const host = await getSiteHost();
  const config = await getSiteConfig(host);
  const faqs = config.site.faqs ?? [];

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      ) : null}

      {/* Editorial header — same language as About / Contact */}
      <section className="mx-auto max-w-[1600px] px-6 pt-16 text-center md:px-10 md:pt-24">
        <div className="mx-auto max-w-3xl space-y-5">
          <span className="eyebrow justify-center">Help & answers</span>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="font-display text-4xl leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl"
          >
            FAQ.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-stone-500 md:text-lg">
            Everything you need to know about products, delivery, and exchanges.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:px-10 md:py-24">
        {faqs.length === 0 ? (
          <p className="text-center text-sm text-stone-500">
            No frequently asked questions yet. Check back soon.
          </p>
        ) : (
          <Accordion>
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.id} title={faq.question} defaultOpen={i === 0}>
                {faq.answer}
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border border-stone-200 bg-stone-50/50 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-[var(--background)] text-[var(--foreground)]">
              <HelpCircle className="size-5" strokeWidth={1.25} />
            </span>
            <div>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="font-display text-xl text-[var(--foreground)]"
              >
                Still have questions?
              </h3>
              <p className="mt-0.5 text-sm text-stone-500">
                Reach out and our team will get back to you.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            <span>Contact us</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

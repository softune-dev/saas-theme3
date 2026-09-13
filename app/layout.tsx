import type { Metadata } from "next";
import {
  Archivo_Black,
  Big_Shoulders,
  Bodoni_Moda,
  Cormorant,
  DM_Sans,
  DM_Serif_Display,
  Figtree,
  Fraunces,
  Instrument_Serif,
  Inter,
  Karla,
  Libre_Baskerville,
  Manrope,
  Newsreader,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Prata,
  Sora,
  Space_Grotesk,
  Spectral,
  Urbanist,
  Work_Sans,
} from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { BusinessProvider } from "@/lib/business-context";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/header/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PreviewRouteBeacon } from "@/components/dev/PreviewRouteBeacon";
import { PageViewBeacon } from "@/components/analytics/PageViewBeacon";
import { getSiteHost, fetchSiteConfig, getPageSeo } from "@/lib/get-site";
import { getSiteCategories } from "@/lib/public-catalog";
import { SiteUnavailable } from "@/components/ui/SiteUnavailable";
import type { SiteEditorSettings } from "@/lib/theme-types";

// Every font the editor's Brand panel can choose between, all loaded
// statically — next/font requires a literal import per family, so picking a
// font at runtime means having already loaded all the candidates and
// switching which CSS variable --font-display/--font-sans point at (see
// theme-context.tsx). Each gets its OWN variable name so none of them collide
// with --font-display/--font-sans, which stay reserved for "whichever one is
// actually selected right now".
//
// preload:false on everything but the shipped default avoids the browser
// eagerly fetching five font families nobody asked for on every page load.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
  preload: false,
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
  preload: false,
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif-display",
  display: "swap",
  preload: false,
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
  preload: false,
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni-moda",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: false,
});

const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
  preload: false,
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
  display: "swap",
  preload: false,
});

const bigShouldersDisplay = Big_Shoulders({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-big-shoulders-display",
  display: "swap",
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
  preload: false,
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
  preload: false,
});

const fontVariables = [
  fraunces.variable,
  playfair.variable,
  cormorant.variable,
  inter.variable,
  manrope.variable,
  workSans.variable,
  libreBaskerville.variable,
  dmSerifDisplay.variable,
  spectral.variable,
  outfit.variable,
  karla.variable,
  sora.variable,
  bodoniModa.variable,
  newsreader.variable,
  instrumentSerif.variable,
  prata.variable,
  archivoBlack.variable,
  bigShouldersDisplay.variable,
  plusJakartaSans.variable,
  spaceGrotesk.variable,
  urbanist.variable,
  figtree.variable,
  dmSans.variable,
  nunitoSans.variable,
].join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const host = await getSiteHost();
  // Same constraint as the layout itself: a notFound() thrown from metadata
  // generation for the root layout crashes rather than 404s.
  const config = await fetchSiteConfig(host);
  if (!config) return { title: "Site unavailable" };

  const baseUrl = `https://${host}`;
  const siteName = config.site.name;

  // Root layout metadata is the site-wide default every page inherits
  // (favicon, OG image, indexing) unless a specific page overrides it — so
  // this must read the merchant's real SEO settings, not invent a generic
  // title/description from scratch. getPageSeo("") already merges page SEO
  // over site SEO over business description (see _resolve_seo on the
  // backend) — previously none of og_title/og_description/og_image/favicon/
  // noindex ever reached here, so Settings → SEO silently did nothing.
  const seo = await getPageSeo("", host);

  return {
    metadataBase: new URL(baseUrl),
    // No title.template here: pages that use buildMetadata() already opt
    // out via { absolute: seo.title } (see that function's own comment for
    // why — a template would double-suffix an already-suffixed title), and
    // the product page composes its own full title manually. A template on
    // this layout would only ever double-suffix, never usefully apply.
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: seo.canonical,
    },
    icons: seo.favicon ? { icon: seo.favicon } : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: siteName,
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [{ url: seo.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.title,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
    robots: seo.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = await getSiteHost();
  // notFound() is illegal here, so resolve the config without it and render a
  // real explanation when there's nothing to show.
  const config = await fetchSiteConfig(host);

  if (!config) {
    return (
      <html lang="en" className={fontVariables}>
        <body className="min-h-screen antialiased">
          <SiteUnavailable host={host} />
        </body>
      </html>
    );
  }

  const theme = config.site.theme as SiteEditorSettings;
  const seo = config.site.seo ?? {};
  // Mobile drawer lists categories beside nav — fetched once here, same
  // public catalog as the homepage sections (no sample-data fallback).
  const categories = await getSiteCategories(host);

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {seo.favicon ? <link rel="icon" href={seo.favicon} /> : null}
        {seo.google_search_console ? (
          <meta name="google-site-verification" content={seo.google_search_console} />
        ) : null}
        {config.json_ld && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(config.json_ld),
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--ink)] selection:text-[var(--background)]">
        {/* Merchant-provided tracking — only loaded when an id is actually
         * set (Site Settings → SEO), so a site with none pays zero cost. */}
        {seo.google_analytics ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seo.google_analytics}');`}
            </Script>
          </>
        ) : null}
        {seo.facebook_pixel ? (
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${seo.facebook_pixel}');
              fbq('track', 'PageView');`}
          </Script>
        ) : null}
        {seo.tiktok_pixel ? (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">
            {`!function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=i+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
              ttq.load('${seo.tiktok_pixel}');
              ttq.page();
            }(window, document, 'ttq');`}
          </Script>
        ) : null}
        {seo.gtm_container_id ? (
          <>
            <Script id="gtm-init" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${seo.gtm_container_id}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${seo.gtm_container_id}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}
        <Suspense fallback={null}>
          <PreviewRouteBeacon />
        </Suspense>
        <Suspense fallback={null}>
          <PageViewBeacon host={host} />
        </Suspense>
        <ThemeProvider initialSettings={theme}>
          <BusinessProvider business={config.site.business ?? {}}>
            <ToastProvider>
              <CartProvider>
                <Header categories={categories} />
                <main className="flex-1">{children}</main>
                <CartDrawer />
              </CartProvider>
            </ToastProvider>
          </BusinessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

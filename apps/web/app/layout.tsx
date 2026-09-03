import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/auth/SiteHeader";
import { ActiveStudentProvider } from "@/lib/auth/ActiveStudentContext";
import { SITE_NAME as siteName, SITE_URL as appUrl } from "@/lib/siteConfig";

const defaultDescription =
  "K-8 competitive school entrance exam prep for JNVST, AISSEE, RMS, and premier private admissions like DPS — full-length mock tests, instant diagnostics, a Mistake Vault, and Vedic speed-math shortcuts.";

export const metadata: Metadata = {
  // Resolves relative OG/Twitter image URLs against the deployed origin.
  metadataBase: new URL(appUrl),
  // Child routes set their own `title` string and get " | Vedic Neev"
  // appended automatically; routes with no override (rare) fall back to
  // `default` below rather than silently reusing another page's title.
  title: {
    default: `${siteName} — JNVST, AISSEE & RMS Mock Tests`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "JNVST mock test",
    "AISSEE mock test",
    "Navodaya Vidyalaya entrance exam",
    "Sainik School entrance exam",
    "RMS entrance exam",
    "Vedic maths for kids",
    "K-8 entrance exam preparation",
  ],
  applicationName: siteName,
  // Explicit baseline (Next.js defaults to this anyway) so it's obvious at
  // a glance that indexing is opt-out per-route, not opt-in — see the
  // `robots: { index: false }` overrides on account-gated and
  // session-specific routes (dashboard, parent, onboarding, exam player).
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_IN",
    url: "/",
    title: `${siteName} — JNVST, AISSEE & RMS Mock Tests`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — JNVST, AISSEE & RMS Mock Tests`,
    description: defaultDescription,
  },
};

/**
 * Organization + WebSite structured data — emitted once, site-wide (this is
 * the standard placement for these two schema types, unlike page-specific
 * schema like Product/Offer on the pricing page). Helps Search Console
 * associate the domain with a named entity and enables a sitelinks search
 * box eligibility check.
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: appUrl,
  description: defaultDescription,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: appUrl,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {/* Scroll-reveal (src/components/marketing/Reveal.tsx) starts content
            at opacity-0 as a JS-enhanced entrance animation — force it back
            to visible when there's no JS to ever flip that class, so content
            is never permanently hidden. */}
        <noscript>
          <style>{`.reveal-init { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <ActiveStudentProvider>
          <SiteHeader />
          {children}
        </ActiveStudentProvider>
      </body>
    </html>
  );
}

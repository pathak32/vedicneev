import type { Metadata } from "next";
import { PLAN_CONFIG } from "@vedicneev/engine";

import { SITE_URL } from "@/lib/siteConfig";

const title = "Pricing — Plans for JNVST, AISSEE, RMS & DPS Prep";
const description =
  "Start free with one full-length mock test, unlock unlimited practice for a single exam with an Exam Pass, or get Vedic All-Access for every exam, every child, and full Mistake Vault remediation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title, description, url: "/pricing" },
  twitter: { title, description },
};

/** One Product+Offer per plan — eligible for Google's pricing rich results on the pricing page. */
const productsJsonLd = Object.values(PLAN_CONFIG).map((plan) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: plan.name,
  description: plan.tagline,
  offers: {
    "@type": "Offer",
    price: plan.priceInr.toFixed(2),
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
  },
}));

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {productsJsonLd.map((product) => (
        // eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script
        <script
          key={product.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
        />
      ))}
      {children}
    </>
  );
}

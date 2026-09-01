import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/auth/SiteHeader";
import { ActiveStudentProvider } from "@/lib/auth/ActiveStudentContext";

// `?? fallback` alone isn't enough here: NEXT_PUBLIC_APP_URL can be set but
// empty, or set without a protocol (e.g. "vedicneev.com"), and `new URL()`
// throws ERR_INVALID_URL on either — which previously crashed the Vercel
// build during "Collecting page data". Only accept the env value when it
// actually looks like an absolute URL.
const defaultAppUrl = "https://vedicneev.com";
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : defaultAppUrl;

export const metadata: Metadata = {
  // Resolves relative OG/Twitter image URLs against the deployed origin.
  metadataBase: new URL(appUrl),
  title: "Vedic Neev",
  description: "K-8 competitive school entrance exam prep — JNVST, AISSEE, RMS, and premier private admissions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ActiveStudentProvider>
          <SiteHeader />
          {children}
        </ActiveStudentProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/auth/SiteHeader";
import { ActiveStudentProvider } from "@/lib/auth/ActiveStudentContext";

export const metadata: Metadata = {
  // Resolves relative OG/Twitter image URLs against the deployed origin;
  // falls back to localhost so dev/preview builds without the env var set
  // still produce valid (if non-canonical) absolute URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
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

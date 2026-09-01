import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}

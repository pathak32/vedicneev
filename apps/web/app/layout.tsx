import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/auth/SiteHeader";
import { ActiveStudentProvider } from "@/lib/auth/ActiveStudentContext";

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
      <body>
        <ActiveStudentProvider>
          <SiteHeader />
          {children}
        </ActiveStudentProvider>
      </body>
    </html>
  );
}

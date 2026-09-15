import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VedicNeev Institute Suite",
  description: "Batch OMR grading, section-wise analytics, and the Mistake Vault for coaching institutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

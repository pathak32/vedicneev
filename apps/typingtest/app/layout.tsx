import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";

import "./globals.css";

// Mangal (what government portals traditionally reference for Hindi) is a
// proprietary OS-bundled font with no legitimate web-embeddable
// distribution — Noto Sans Devanagari is the standard open substitute for
// correct Devanagari glyph/matra rendering, which is what actually matters
// for Inscript/Remington passages to display and print correctly.
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VedicNeev Typing Test — Government Exam Typing Practice",
    template: "%s | VedicNeev Typing Test",
  },
  description:
    "Official-format typing speed tests for RRB NTPC, High Court, UPSSSC, AIIMS and other government exams — English & Hindi (Inscript/Remington), Gross/Net Speed and Accuracy scoring, plus the Typing Speed & Logic dual-mode challenge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={notoSansDevanagari.variable}>
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border bg-card">
            <div className="container flex h-16 items-center justify-between">
              <a href="/" className="text-lg font-bold text-foreground">
                VedicNeev <span className="text-primary">Typing Test</span>
              </a>
              <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <a href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </a>
                <a href="/login" className="hover:text-foreground">
                  Sign in
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            A VedicNeev product — government-exam typing practice, bilingual (English/Hindi).
          </footer>
        </div>
      </body>
    </html>
  );
}

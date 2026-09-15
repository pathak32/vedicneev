import type { Metadata } from "next";

import "./globals.css";

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
    <html lang="en">
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

/**
 * Site-wide footer — mainly exists so the legal/compliance pages (privacy,
 * terms, FAQ) are actually linked from somewhere, not just reachable by
 * typing the URL. Hidden on /exam/** : ExamPlayer.tsx renders a fixed
 * `h-dvh` layout with its own internal scroll region and a sticky action
 * bar, deliberately sized to the viewport for a focused, timed test — a
 * footer below it would just add unwanted page-level scroll during an
 * active attempt.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/exam/")) return null;

  return (
    <footer className="border-t border-border bg-background px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Vedic Neev. JNVST, AISSEE, and RMS exam prep for K-8 students.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

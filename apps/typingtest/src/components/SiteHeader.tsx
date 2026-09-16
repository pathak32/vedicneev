"use client";

import Link from "next/link";

import { useT } from "@/lib/i18n/useT";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  const t = useT();

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold text-foreground">
          VedicNeev <span className="text-primary">Typing Test</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/blog" className="hidden hover:text-foreground sm:inline">
            {t("navBlog")}
          </Link>
          <Link href="/faq" className="hidden hover:text-foreground sm:inline">
            {t("navFaq")}
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            {t("navDashboard")}
          </Link>
          <Link href="/login" className="hover:text-foreground">
            {t("navSignIn")}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}

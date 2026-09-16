"use client";

import Link from "next/link";

import { useT } from "@/lib/i18n/useT";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-border py-6">
      <div className="container flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
        <p>{t("footerTagline")}</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <Link href="/privacy" className="hover:text-foreground">
            {t("footerPrivacy")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("footerTerms")}
          </Link>
          <Link href="/disclaimer" className="hover:text-foreground">
            {t("footerDisclaimer")}
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            {t("navFaq")}
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            {t("navBlog")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

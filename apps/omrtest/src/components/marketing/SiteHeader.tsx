import Link from "next/link";
import { ScanLine } from "lucide-react";

import { Button } from "@vedicneev/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
            <ScanLine className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            VedicNeev <span className="text-white/50">OMR</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          <Link href="#features" className="transition-colors hover:text-white">
            Features
          </Link>
          <Link href="#calculator" className="transition-colors hover:text-white">
            ROI Calculator
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex">
            <Link href="#pricing">Book a demo</Link>
          </Button>
          <Button asChild size="sm" className="bg-white text-brand-navy hover:bg-white/90">
            <Link href="/login">WhatsApp Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

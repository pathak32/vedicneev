import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy py-8 text-sm text-white/50">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p>© {new Date().getFullYear()} VedicNeev. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-white/80">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/80">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-white/80">Refund Policy</Link>
        </nav>
        <p>A product of Vedic Mind AI.</p>
      </div>
    </footer>
  );
}

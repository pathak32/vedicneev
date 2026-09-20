export function SiteFooter() {
  return (
    <footer className="bg-brand-navy py-8 text-sm text-white/50">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p>© {new Date().getFullYear()} VedicNeev. All rights reserved.</p>
        <p>A product of Vedic Mind AI.</p>
      </div>
    </footer>
  );
}

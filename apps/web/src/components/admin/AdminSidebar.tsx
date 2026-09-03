"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, cn } from "@vedicneev/ui";
import { BookOpenCheck, LayoutDashboard, Menu, Newspaper, Settings, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blog Drafts Queue", icon: Newspaper },
  { href: "/admin/exams", label: "Question Bank Seeding", icon: BookOpenCheck },
  { href: "/admin/settings", label: "System Settings", icon: Settings },
] as const;

/** True for the exact route, or a sub-route of it — except "/admin" itself, which would otherwise match every admin page. */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: hamburger trigger + slide-out drawer */}
      <div className="flex items-center gap-2 border-b border-border bg-background p-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Open admin navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-left">
                <Sparkles className="h-5 w-5 text-primary" />
                Vedic Neev Admin
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Vedic Neev Admin
        </span>
      </div>

      {/* Desktop: persistent sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-background p-4 md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-1 font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Vedic Neev Admin
        </Link>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}

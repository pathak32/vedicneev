"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, cn } from "@vedicneev/ui";
import { BookOpen, LayoutDashboard, Lightbulb, Menu, NotebookPen, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/mistakes", label: "Mistake Vault", icon: Lightbulb },
  { href: "/exam/demo-jnvst", label: "Take a Mock Test", icon: NotebookPen },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/parent", label: "Parent Command Center", icon: Users },
] as const;

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <span className="text-sm font-semibold text-foreground">Dashboard</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <aside className="hidden shrink-0 border-r border-border bg-background p-4 md:block md:w-60">
        <NavLinks pathname={pathname} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-3/4 sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Dashboard</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

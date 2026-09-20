"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, ScanLine } from "lucide-react";

import { Badge, cn } from "@vedicneev/ui";

const NAV_ITEMS = [{ href: "/dashboard", label: "Dashboard" }];

interface DashboardShellProps {
  instituteName: string;
  role: string;
  children: React.ReactNode;
}

export function DashboardShell({ instituteName, role, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-brand-navy">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                VedicNeev <span className="text-white/50">OMR</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tests/new"
              className="hidden items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-white/90 sm:inline-flex"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              New Test
            </Link>
            <div className="hidden items-center gap-2 border-l border-white/10 pl-3 text-right md:flex">
              <div>
                <p className="text-sm font-medium leading-none text-white">{instituteName}</p>
                <p className="text-xs leading-none text-white/50">{role}</p>
              </div>
            </div>
            <Badge className="border-transparent bg-white/10 text-white md:hidden">{role}</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}

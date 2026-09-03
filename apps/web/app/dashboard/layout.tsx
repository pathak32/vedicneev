import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

// Account-specific student dashboard (covers /dashboard and
// /dashboard/mistakes) — never meant to rank; see app/parent/layout.tsx for
// why this is noindex rather than a robots.txt disallow.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

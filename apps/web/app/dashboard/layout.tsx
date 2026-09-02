import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

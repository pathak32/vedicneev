import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default function AdminBlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-8">
        <Link href="/admin/blogs" className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Vedic Neev Admin — Blog Queue
        </Link>
        <AdminLogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

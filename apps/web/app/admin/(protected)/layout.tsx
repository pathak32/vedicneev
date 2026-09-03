import { redirect } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAuthenticatedAdmin } from "@/lib/admin/user";

/**
 * The real, server-side, role-based gate for everything under /admin
 * except /admin/login. middleware.ts already bounced any request with a
 * missing/invalid session cookie to /admin/login before this ever runs
 * (it can only check the cookie's signature — no Prisma on the Edge
 * Runtime), so reaching this layout means the signature is valid. What's
 * checked here is the part middleware structurally can't: that the
 * signed userId still resolves to a real User whose role is actually
 * ADMIN. Redirects home (not back to login) since a signed-in-but-wrong-role
 * visitor doesn't need another crack at the password prompt.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-border bg-background px-6 py-3 md:flex">
          <p className="text-sm text-muted-foreground">Signed in as {admin.name ?? "Admin"}</p>
          <AdminLogoutButton />
        </header>
        <div className="flex justify-end border-b border-border bg-background px-4 py-2 md:hidden">
          <AdminLogoutButton />
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

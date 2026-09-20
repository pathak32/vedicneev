import { redirect } from "next/navigation";

import { getInstituteSession } from "@/lib/institute/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

/**
 * The real, DB-backed gate for every institute-facing page (dashboard,
 * tests, students, billing, etc.) — middleware.ts only confirmed a
 * Supabase session exists; this confirms it's actually an InstituteAdmin,
 * same enforcement split apps/web's /admin panel already uses. Anything
 * short of a valid InstituteAdmin session (not authenticated, or
 * authenticated but not yet onboarded) is sent to /login rather than
 * /onboarding — a signed-in-but-unboarded visitor reaches /onboarding via
 * login/callback's own redirect, not by landing on a protected page first.
 *
 * force-dynamic: every route under here reads the request's cookie jar via
 * getInstituteSession. Without this, `next build`'s static-generation pass
 * tries to prerender these pages with no real request in scope —
 * getInstituteSession then legitimately returns null (no cookies to read),
 * which crashed dashboard/page.tsx's build (see that file's own fix) rather
 * than this layout's redirect ever taking effect, since build-time
 * prerendering doesn't carry a live request for redirect() to act on.
 */
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getInstituteSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell instituteName={session.institute.name} role={session.admin.role}>
      {children}
    </DashboardShell>
  );
}

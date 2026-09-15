import { redirect } from "next/navigation";

import { getInstituteSession } from "@/lib/institute/session";

/**
 * The real, DB-backed gate for every institute-facing page (dashboard,
 * tests, students, billing, etc.) — middleware.ts only confirmed a
 * Supabase session exists; this confirms it's actually an InstituteAdmin,
 * same enforcement split apps/web's /admin panel already uses. Anything
 * short of a valid InstituteAdmin session (not authenticated, or
 * authenticated but not yet onboarded) is sent to /login rather than
 * /onboarding — a signed-in-but-unboarded visitor reaches /onboarding via
 * login/callback's own redirect, not by landing on a protected page first.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getInstituteSession();
  if (!session) redirect("/login");

  return <>{children}</>;
}

import { redirect } from "next/navigation";

import { getAuthenticatedSupabaseUserId, getInstituteSession } from "@/lib/institute/session";
import { OnboardingForm } from "@/components/OnboardingForm";

/**
 * Reachable by an authenticated Supabase user who has no InstituteAdmin
 * row yet — deliberately NOT inside app/(protected), since that layout's
 * gate requires an InstituteAdmin to already exist. Requires authentication
 * (redirects to /login otherwise) but not onboarding completion (that's
 * the entire point of this page). Already-onboarded admins are bounced
 * straight to /dashboard instead of seeing this again.
 */
// See app/(protected)/layout.tsx's note: reads the request's cookie jar,
// never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) redirect("/login");

  const session = await getInstituteSession();
  if (session) redirect("/dashboard");

  return (
    <main>
      <h1>Set up your institute</h1>
      <p>This takes a minute — you'll be scanning your first sheets right after.</p>
      <OnboardingForm />
    </main>
  );
}

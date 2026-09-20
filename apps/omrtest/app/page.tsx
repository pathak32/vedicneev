import { redirect } from "next/navigation";

import { getAuthenticatedSupabaseUserId, getInstituteSession } from "@/lib/institute/session";
import { LandingPage } from "@/components/marketing/LandingPage";

/**
 * For a signed-in visitor this still never renders content of its own — it
 * routes straight to /dashboard or /onboarding, the same "seamless routing"
 * contract as the header link on vedicneev.com that points here. An
 * anonymous visitor (no Supabase session) instead sees the marketing
 * landing page below; middleware.ts's PUBLIC_PATHS carries the matching
 * exemption for "/", since without it every anonymous request here would
 * already have been redirected to /login before this code runs.
 *
 * force-dynamic: this reads the request's cookie jar (via
 * getAuthenticatedSupabaseUserId/getInstituteSession) on every visit —
 * never a candidate for static generation. See app/(protected)/layout.tsx's
 * identical note for what goes wrong at build time otherwise.
 */
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) return <LandingPage />;

  const session = await getInstituteSession();
  redirect(session ? "/dashboard" : "/onboarding");
}

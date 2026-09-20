import { redirect } from "next/navigation";
import { ScanLine } from "lucide-react";

import { getAuthenticatedSupabaseUserId, getInstituteSession } from "@/lib/institute/session";
import { OnboardingForm } from "@/components/OnboardingForm";
import { Card, CardContent } from "@vedicneev/ui";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <ScanLine className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Set up your institute</h1>
          <p className="mt-1 text-sm text-slate-500">
            This takes a minute — you&apos;ll be scanning your first sheets right after.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { Clock3, ShieldAlert } from "lucide-react";

import { getAuthenticatedSupabaseUserId, getInstituteSession } from "@/lib/institute/session";
import { Card, CardContent } from "@vedicneev/ui";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

// Reads the request's cookie jar — never a candidate for static generation.
export const dynamic = "force-dynamic";

/**
 * Where every non-ACTIVE institute admin lands — reachable regardless of
 * Institute.status (unlike app/(protected)'s pages, which require ACTIVE),
 * since this IS the page that explains why they can't reach those yet.
 * Requires authentication and a completed InstituteAdmin row (an
 * unauthenticated or unboarded visitor has nothing to be "pending" about,
 * so they're sent to /login or /onboarding respectively instead); an
 * already-ACTIVE institute is sent straight to /dashboard rather than
 * seeing this page again.
 */
export default async function OnboardingPendingPage() {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) redirect("/login");

  const session = await getInstituteSession();
  if (!session) redirect("/onboarding");
  if (session.institute.status === "ACTIVE") redirect("/dashboard");

  const isSuspended = session.institute.status === "SUSPENDED";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <span
          className={
            isSuspended
              ? "mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
              : "mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-white"
          }
        >
          {isSuspended ? (
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          )}
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {isSuspended ? "Account suspended" : "Awaiting approval"}
        </h1>

        <Card className="mt-6 border-slate-200 text-left shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">
              {isSuspended ? (
                <>
                  <strong>{session.institute.name}</strong>&apos;s access has been suspended. Contact VedicNeev
                  support to resolve this before test batches and scans become available again.
                </>
              ) : (
                <>
                  <strong>{session.institute.name}</strong> is set up and waiting on a quick review by the VedicNeev
                  team before you can create test batches or upload scans. This is usually fast — check back soon,
                  or reach out if it's been a while.
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <LogoutButton variant="light" />
        </div>
      </div>
    </div>
  );
}

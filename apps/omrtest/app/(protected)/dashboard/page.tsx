import { redirect } from "next/navigation";

import { getInstituteSession } from "@/lib/institute/session";

export default async function DashboardPage() {
  const session = await getInstituteSession();
  // Defensive, not redundant: app/(protected)/layout.tsx already redirects
  // away when there's no session on a real request, but a build-time
  // static-generation pass renders this page with no request in scope at
  // all — there, getInstituteSession legitimately returns null even though
  // the layout's own redirect() has no live request to act on. Redirecting
  // again here (rather than a `session!` assertion) keeps that case a
  // normal redirect instead of a build-breaking crash.
  if (!session) redirect("/login");

  return (
    <main>
      <h1>{session.institute.name}</h1>
      <p>Batches, credit balance, and Mistake Vault trends land here.</p>
    </main>
  );
}

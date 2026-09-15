import { redirect } from "next/navigation";

import { getAuthenticatedSupabaseUserId, getInstituteSession } from "@/lib/institute/session";

/**
 * `/` never renders content of its own — it exists only to route an
 * arriving visitor to the right place, same "seamless routing" contract as
 * the header link on vedicneev.com that points here.
 */
export default async function RootPage() {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) redirect("/login");

  const session = await getInstituteSession();
  redirect(session ? "/dashboard" : "/onboarding");
}

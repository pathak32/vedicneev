import { redirect } from "next/navigation";
import { Card, CardContent } from "@vedicneev/ui";

import { getInstituteSession } from "@/lib/institute/session";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SetPasswordForm } from "@/components/settings/SetPasswordForm";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getInstituteSession();
  // Defensive, not redundant — see dashboard/page.tsx's identical comment.
  if (!session) redirect("/login");

  return (
    <>
      <PageHeader title="Settings" description="Manage how you sign in to your institute account." />
      <Card className="max-w-xl border-slate-200">
        <CardContent className="p-6">
          <SetPasswordForm hasPassword={Boolean(session.admin.passwordHash)} />
        </CardContent>
      </Card>
    </>
  );
}

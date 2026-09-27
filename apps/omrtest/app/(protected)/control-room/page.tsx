import { redirect } from "next/navigation";

import { getInstituteSession } from "@/lib/institute/session";
import { buildControlRoomData } from "@/lib/institute/controlRoomData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ControlRoomView } from "@/components/controlRoom/ControlRoomView";

// Reads live TestBatch + OmrUpload state for the whole institute — never
// prerenderable.
export const dynamic = "force-dynamic";

export default async function ControlRoomPage() {
  const session = await getInstituteSession();
  if (!session) redirect("/login");
  // The director's own oversight view — a FACULTY session has no reason to
  // see other faculty's/branches' results.
  if (session.admin.role !== "OWNER") redirect("/dashboard");

  const branches = await buildControlRoomData(session.institute.id);

  return (
    <>
      <PageHeader
        title="Control Room"
        description="Branch → subject → class → batch → student, drilled down. Adjust the cutoff to see who's above or below it."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
      <ControlRoomView branches={branches} />
    </>
  );
}

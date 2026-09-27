import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { NewTestForm } from "@/components/tests/NewTestForm";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export default async function NewTestPage() {
  const session = await getInstituteSession();
  if (!session) redirect("/login");

  const isFaculty = session.admin.role === "FACULTY";
  const branches = isFaculty
    ? []
    : await prisma.instituteBranch.findMany({ where: { instituteId: session.institute.id }, orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageHeader
        title="New Test"
        description="Every field below is required before OMR sheets can be generated for this batch."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <NewTestForm
        isFaculty={isFaculty}
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        assignments={session.admin.assignments.map((a) => ({ subject: a.subject, classLevel: a.classLevel }))}
      />
    </>
  );
}

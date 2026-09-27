import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { Card, CardContent } from "@vedicneev/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddBranchForm } from "@/components/branches/AddBranchForm";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const session = await getInstituteSession();
  if (!session) redirect("/login");
  // Branch management is director-only — a FACULTY session never gets a
  // reason to be here.
  if (session.admin.role !== "OWNER") redirect("/dashboard");

  const branches = await prisma.instituteBranch.findMany({
    where: { instituteId: session.institute.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Branches"
        description="Add every physical branch this institute runs — faculty are assigned to exactly one."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card className="border-slate-200 transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <AddBranchForm />
          </CardContent>
        </Card>

        <Card className="border-slate-200 transition-shadow hover:shadow-md">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Existing Branches</h2>
          </div>
          {branches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-slate-500">No branches yet — add your first one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.map((branch) => (
                    <tr key={branch.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{branch.name}</td>
                      <td className="px-6 py-4 text-slate-600">{branch.city ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

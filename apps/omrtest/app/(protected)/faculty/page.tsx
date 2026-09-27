import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { Card, CardContent } from "@vedicneev/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddFacultyForm } from "@/components/faculty/AddFacultyForm";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  const session = await getInstituteSession();
  if (!session) redirect("/login");
  // Faculty management is director-only.
  if (session.admin.role !== "OWNER") redirect("/dashboard");

  const [branches, faculty] = await Promise.all([
    prisma.instituteBranch.findMany({ where: { instituteId: session.institute.id }, orderBy: { createdAt: "asc" } }),
    prisma.instituteAdmin.findMany({
      where: { instituteId: session.institute.id, role: "FACULTY" },
      include: { user: true, branch: true, assignments: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Faculty"
        description="Add a faculty login, scoped to one branch and whichever subjects/classes they teach."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            {branches.length === 0 ? (
              <p className="text-sm text-slate-500">
                Add at least one branch first — a faculty account must be assigned to one.
              </p>
            ) : (
              <AddFacultyForm branches={branches.map((b) => ({ id: b.id, name: b.name }))} />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Existing Faculty</h2>
          </div>
          {faculty.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">No faculty accounts yet — add your first one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Mobile</th>
                    <th className="px-6 py-3 font-medium">Branch</th>
                    <th className="px-6 py-3 font-medium">Subject / Class</th>
                    <th className="px-6 py-3 font-medium">Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faculty.map((f) => (
                    <tr key={f.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">{f.user.name ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-600">+91 {f.user.phone}</td>
                      <td className="px-6 py-4 text-slate-600">{f.branch?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {f.assignments.map((a) => (
                            <span
                              key={`${a.subject}-${a.classLevel}`}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {a.subject} · Class {a.classLevel}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge tone={f.passwordHash ? "success" : "secondary"}>
                          {f.passwordHash ? "Password set" : "WhatsApp OTP only"}
                        </StatusBadge>
                      </td>
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

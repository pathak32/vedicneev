import { Badge, Card, CardContent } from "@vedicneev/ui";
import type { InstituteStatus } from "@vedicneev/db";

import { getAllInstitutesForAdmin } from "@/lib/admin/institutes";
import { ApproveInstituteButton } from "@/components/admin/ApproveInstituteButton";

export const dynamic = "force-dynamic";

/** "918573000191" -> "+91 8573000191"; anything else just gets a leading "+". */
function formatPhone(phone: string): string {
  return /^91\d{10}$/.test(phone) ? `+91 ${phone.slice(2)}` : `+${phone}`;
}

const STATUS_BADGE: Record<InstituteStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  PENDING_APPROVAL: { label: "Pending Approval", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
};

export default async function AdminInstitutesPage() {
  const institutes = await getAllInstitutesForAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Institutes</h1>
        <p className="text-sm text-muted-foreground">
          {institutes.length} institute{institutes.length === 1 ? "" : "s"} onboarded to omrtest.vedicneev.com.
        </p>
      </div>

      {institutes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No institutes have onboarded yet.</p>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Institute</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Branch / City</th>
                  <th className="px-4 py-3 font-medium">Admin WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Exam Category</th>
                  <th className="px-4 py-3 font-medium">Credit Balance</th>
                  <th className="px-4 py-3 font-medium">Onboarded</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map((institute) => (
                  <tr key={institute.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{institute.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[institute.status].variant}>
                        {STATUS_BADGE[institute.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{institute.branchCity ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {institute.adminPhone ? formatPhone(institute.adminPhone) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {institute.examCategory ? (
                        <Badge variant="secondary">{institute.examCategory}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{institute.creditBalance}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {institute.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      {institute.status !== "ACTIVE" ? (
                        <ApproveInstituteButton instituteId={institute.id} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

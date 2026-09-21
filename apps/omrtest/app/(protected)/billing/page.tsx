import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteCreditBalance } from "@/lib/institute/credits";
import { getInstituteSession } from "@/lib/institute/session";
import { BillingPageClient } from "@/components/billing/BillingPageClient";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getInstituteSession();
  // Defensive, not redundant — see dashboard/page.tsx's identical comment:
  // app/(protected)/layout.tsx's redirect() has no live request to act on
  // during a build-time static-generation pass.
  if (!session) redirect("/login");

  const { institute } = session;

  const subscription = await prisma.instituteSubscription.findUnique({ where: { instituteId: institute.id } });
  const periodStart = subscription?.currentPeriodStart ?? institute.createdAt;
  const creditBalance = await getInstituteCreditBalance(institute.id, periodStart);

  return (
    <>
      <PageHeader title="Billing" description="Manage your subscription plan and scan-credit balance." />
      <BillingPageClient
        currentTier={subscription?.tier ?? null}
        currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
        subscriptionStatus={subscription?.status ?? null}
        creditBalance={creditBalance}
      />
    </>
  );
}

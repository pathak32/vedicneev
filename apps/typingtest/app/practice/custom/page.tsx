import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { checkTypingPassageAccess } from "@vedicneev/engine";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { CustomPracticeFlow } from "@/components/typing/CustomPracticeFlow";

export const dynamic = "force-dynamic";

export default async function CustomPracticePage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/practice/custom");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [subscription, freePassagesUsedToday] = await Promise.all([
    prisma.typingSubscription.findUnique({ where: { userId } }),
    // Custom attempts share the same daily counter as catalog attempts —
    // see app/api/attempts/route.ts's comment on why.
    prisma.typingAttempt.count({ where: { userId, completedAt: { gte: todayStart } } }),
  ]);

  const access = checkTypingPassageAccess(
    subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          validUntil: subscription.validUntil ? subscription.validUntil.getTime() : null,
        }
      : null,
    freePassagesUsedToday
  );

  if (!access.allowed) {
    return (
      <div className="container flex max-w-lg flex-col gap-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Daily free limit reached</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              You&apos;ve used today&apos;s free passages. Upgrade to Pro for unlimited daily attempts, or come back
              tomorrow.
            </p>
            <Button asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CustomPracticeFlow />;
}

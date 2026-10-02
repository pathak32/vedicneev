import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { PilotFeedbackForm } from "@/components/marketing/PilotFeedbackForm";

// A private, per-person link: never indexed.
export const metadata: Metadata = {
  title: "Your feedback | VedicNeev",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PilotFeedbackPage({ params }: { params: { token: string } }) {
  const feedback = await prisma.pilotFeedback.findUnique({
    where: { token: params.token },
    select: { contactName: true, instituteName: true, status: true },
  });
  if (!feedback) notFound();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          How did it go, {feedback.contactName}?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for trying VedicNeev with {feedback.instituteName}. Three short questions, about two minutes. Honest
          answers help us most.
        </p>
      </div>

      {feedback.status === "REQUESTED" ? (
        <PilotFeedbackForm token={params.token} contactName={feedback.contactName} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          We have already received your feedback. Thank you.
        </div>
      )}
    </main>
  );
}

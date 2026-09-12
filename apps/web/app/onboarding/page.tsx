"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@vedicneev/ui";

import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasHydrated, isAuthenticated } = useActiveStudent();
  // Where to return once onboarding is done — e.g. back to the exam that
  // sent the student here — falling back to "/" when there's nowhere in
  // particular to return to.
  const next = searchParams.get("next") || "/";

  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">Sign in first</p>
        <p className="text-sm text-muted-foreground">
          Sign in with your mobile number from the home page before adding a student profile.
        </p>
        <Button type="button" onClick={() => router.push(next)}>
          {next === "/" ? "Go to home" : "Go back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">Add a student profile</h1>
        <p className="text-sm text-muted-foreground">Set this up once per child — it takes under a minute.</p>
      </div>
      <OnboardingFlow onComplete={() => router.push(next)} />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageContent />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";

import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useActiveStudent();

  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">Sign in first</p>
        <p className="text-sm text-muted-foreground">
          Sign in with your mobile number from the home page before adding a student profile.
        </p>
        <Button type="button" onClick={() => router.push("/")}>
          Go to home
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
      <OnboardingFlow onComplete={() => router.push("/")} />
    </div>
  );
}

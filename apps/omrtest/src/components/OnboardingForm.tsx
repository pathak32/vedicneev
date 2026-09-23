"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface FormState {
  instituteName: string;
  examCategory: string;
  branchCity: string;
  adminName: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  instituteName: "",
  examCategory: "JNVST",
  branchCity: "",
  adminName: "",
  password: "",
};

/**
 * One-time signup form for an authenticated-but-unboarded Supabase user —
 * submitting this is what actually creates the Institute/InstituteAdmin
 * rows (see /api/institutes and createInstitute.ts); there is no draft or
 * edit mode here, matching /tests/new's same one-shot gate pattern.
 */
export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isComplete =
    form.instituteName.trim() !== "" && form.branchCity.trim() !== "" && form.adminName.trim() !== "";

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/institutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your institute.");
        setSubmitting(false);
        return;
      }
      // Every new institute starts PENDING_APPROVAL (see createInstitute.ts)
      // — pushing straight to the pending view skips the redirect hop
      // app/(protected)/layout.tsx would otherwise bounce /dashboard through.
      router.push("/onboarding/pending");
      router.refresh();
    } catch {
      setError("Network error — could not reach the server.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="instituteName">Institute Name</Label>
        <Input
          id="instituteName"
          value={form.instituteName}
          onChange={(e) => update("instituteName", e.target.value)}
          placeholder="e.g. Bright Future Academy"
          disabled={submitting}
        />
      </div>

      <div>
        <Label htmlFor="examCategory">Target Exam Category</Label>
        <Select
          id="examCategory"
          value={form.examCategory}
          onChange={(e) => update("examCategory", e.target.value)}
          disabled={submitting}
        >
          <option value="JNVST">JNVST</option>
          <option value="AISSEE">AISSEE</option>
          <option value="RMS">RMS</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="branchCity">Branch / City</Label>
        <Input
          id="branchCity"
          value={form.branchCity}
          onChange={(e) => update("branchCity", e.target.value)}
          placeholder="e.g. Patna"
          disabled={submitting}
        />
      </div>

      <div>
        <Label htmlFor="adminName">Admin Name</Label>
        <Input
          id="adminName"
          value={form.adminName}
          onChange={(e) => update("adminName", e.target.value)}
          placeholder="Your full name"
          disabled={submitting}
        />
      </div>

      <div>
        <Label htmlFor="password">Password or PIN (optional)</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="6-digit PIN or a password (8+ characters)"
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Set this now for fast daily sign-in, or skip it — WhatsApp OTP always works either way.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={!isComplete || submitting} className="w-full">
        {submitting ? "Setting up…" : "Create Institute & Continue"}
      </Button>
    </form>
  );
}

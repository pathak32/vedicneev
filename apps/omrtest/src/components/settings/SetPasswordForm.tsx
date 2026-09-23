"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface SetPasswordFormProps {
  hasPassword: boolean;
}

export function SetPasswordForm({ hasPassword }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update your password.");
        return;
      }
      setPassword("");
      setSuccess(true);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="password">{hasPassword ? "New password or PIN" : "Set a password or PIN"}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6-digit PIN or a password (8+ characters)"
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Once set, you can sign in with your phone number and this password/PIN instead of WhatsApp OTP every time.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-sm font-medium text-emerald-600">Saved.</p> : null}

      <Button type="submit" disabled={submitting || !password} className="w-fit">
        {submitting ? "Saving…" : hasPassword ? "Update Password" : "Set Password"}
      </Button>
    </form>
  );
}

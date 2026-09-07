"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { Loader2 } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { INDIAN_STATES } from "@/lib/sprints/indianStates";
import type { SprintEntry } from "@/lib/sprints/useSprintIdentityStore";
import type { SprintListItem } from "@/lib/sprints/types";

export interface SprintRegisterDialogProps {
  sprint: SprintListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered: (entry: SprintEntry) => void;
}

/** Captures guest details (name/mobile/email/state) directly — no OTP sign-in required — while pre-filling from a signed-in parent's active student when one exists, per the "1-click Register Free... or links the authenticated user instantly" spec. */
export function SprintRegisterDialog({ sprint, open, onOpenChange, onRegistered }: SprintRegisterDialogProps) {
  const { activeStudent } = useActiveStudent();
  const parent = useAuthStore(selectActiveParent);

  const [participantName, setParticipantName] = useState(activeStudent?.fullName ?? "");
  const [phone, setPhone] = useState(parent?.phone ?? "");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<string>(INDIAN_STATES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!participantName.trim() || !phone.trim() || !state) {
      setError("Name, mobile number, and state are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sprints/${sprint.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: participantName.trim(), phone: phone.trim(), email: email.trim() || undefined, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not register for this sprint.");

      onRegistered({
        registrationId: data.registrationId,
        participantName: participantName.trim(),
        phone: phone.trim(),
        state,
        hasSubmitted: false,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register for this sprint.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Register for {sprint.title}</DialogTitle>
          <DialogDescription>Free to enter — no sign-in required.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sprint-name" className="text-sm font-medium text-foreground">
              Student&apos;s full name
            </label>
            <input
              id="sprint-name"
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sprint-phone" className="text-sm font-medium text-foreground">
              Mobile number
            </label>
            <input
              id="sprint-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sprint-email" className="text-sm font-medium text-foreground">
              Email (optional)
            </label>
            <input
              id="sprint-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sprint-state" className="text-sm font-medium text-foreground">
              State
            </label>
            <select
              id="sprint-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Free"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

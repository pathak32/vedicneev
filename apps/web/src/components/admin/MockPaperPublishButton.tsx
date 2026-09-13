"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Rocket, Undo2 } from "lucide-react";

export interface MockPaperPublishButtonProps {
  examType: string;
  classLevel: number;
  paperNumber: number;
  action: "publish" | "unpublish";
}

/** Approve/rollback control for one mock paper card on /admin/mock-papers — see api/admin/mock-papers/publish/route.ts. */
export function MockPaperPublishButton({ examType, classLevel, paperNumber, action }: MockPaperPublishButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mock-papers/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, classLevel, paperNumber, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update this paper.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={action === "publish" ? "default" : "outline"}
        size="sm"
        disabled={pending}
        onClick={handleClick}
      >
        {action === "publish" ? <Rocket className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />}
        {pending ? "Working…" : action === "publish" ? "Publish" : "Unpublish"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";

export function ApproveInstituteButton({ instituteId }: { instituteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/institutes/${instituteId}/approve`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Could not approve this institute.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size="sm" onClick={handleApprove} disabled={pending}>
      {pending ? "Approving…" : "Approve Institute"}
    </Button>
  );
}

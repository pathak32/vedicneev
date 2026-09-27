"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function AddBranchForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/institute/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add this branch.");
        toast.error(data.error ?? "Could not add this branch.");
        return;
      }
      toast.success(`${name} added.`);
      setName("");
      setCity("");
      router.refresh();
    } catch {
      setError("Network error — could not reach the server.");
      toast.error("Network error — could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="branchName">Branch Name</Label>
        <Input
          id="branchName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Main Campus"
          disabled={submitting}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="branchCity">City</Label>
        <Input
          id="branchCity"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Patna"
          disabled={submitting}
        />
      </div>
      <Button type="submit" disabled={!name.trim() || submitting}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        {submitting ? "Adding…" : "Add Branch"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive sm:basis-full">
          {error}
        </p>
      ) : null}
    </form>
  );
}

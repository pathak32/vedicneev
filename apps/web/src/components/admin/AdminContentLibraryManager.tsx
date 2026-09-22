"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CardContent } from "@vedicneev/ui";
import type { ContentBlock, ContentBlockBrand, ContentBlockCategory, ContentBlockStatus } from "@vedicneev/db";
import { ChevronDown, ChevronUp, Linkedin, Loader2, Pencil, Save } from "lucide-react";

const BRAND_LABEL: Record<ContentBlockBrand, string> = {
  VEDIC_MIND: "Vedic Mind AI",
  VEDIC_NEEV: "VedicNeev",
};

const CATEGORY_LABEL: Record<ContentBlockCategory, string> = {
  COGNITIVE_MASTERY: "Cognitive Mastery",
  VEDIC_MATH: "Vedic Math",
  INSTITUTIONAL_AUTOMATION: "Institutional Automation",
};

const STATUS_BADGE: Record<ContentBlockStatus, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  DRAFT: { variant: "outline" },
  APPROVED: { variant: "secondary" },
  SCHEDULED: { variant: "default" },
  PUBLISHED: { variant: "default", className: "bg-emerald-600 text-white" },
};

/** "2026-03-05T18:30:00.000Z" Date -> "2026-03-05T18:30" for a <input type="datetime-local">. */
function toDatetimeLocalValue(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditState {
  hookText: string;
  bodyContent: string;
  ctaText: string;
  scheduledFor: string;
}

export function AdminContentLibraryManager({ initialBlocks }: { initialBlocks: ContentBlock[] }) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<ContentBlockBrand | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ContentBlockCategory | "ALL">("ALL");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blocks.filter((b) => {
      if (brandFilter !== "ALL" && b.brand !== brandFilter) return false;
      if (categoryFilter !== "ALL" && b.category !== categoryFilter) return false;
      if (!q) return true;
      return b.hookText.toLowerCase().includes(q) || b.bodyContent.toLowerCase().includes(q) || b.ctaText.toLowerCase().includes(q);
    });
  }, [blocks, search, brandFilter, categoryFilter]);

  function startEdit(block: ContentBlock) {
    setEditingId(block.id);
    setExpandedId(block.id);
    setEdit({
      hookText: block.hookText,
      bodyContent: block.bodyContent,
      ctaText: block.ctaText,
      scheduledFor: toDatetimeLocalValue(block.scheduledFor),
    });
  }

  async function patchBlock(id: string, data: Record<string, unknown>): Promise<ContentBlock | null> {
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed.");
      setBlocks((prev) => prev.map((b) => (b.id === id ? json.block : b)));
      return json.block as ContentBlock;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      return null;
    }
  }

  async function handleSaveEdit(id: string) {
    if (!edit) return;
    setBusyId(id);
    const saved = await patchBlock(id, {
      hookText: edit.hookText,
      bodyContent: edit.bodyContent,
      ctaText: edit.ctaText,
    });
    setBusyId(null);
    if (saved) {
      setEditingId(null);
      setEdit(null);
    }
  }

  async function handleSchedule(id: string) {
    if (!edit?.scheduledFor) {
      setError("Pick a date/time before scheduling.");
      return;
    }
    setBusyId(id);
    await patchBlock(id, { status: "SCHEDULED", scheduledFor: new Date(edit.scheduledFor).toISOString() });
    setBusyId(null);
  }

  async function handlePublish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed.");
      setBlocks((prev) => prev.map((b) => (b.id === id ? json.block : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hook, body, or CTA…"
          className="h-9 min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 text-sm"
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value as ContentBlockBrand | "ALL")}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="ALL">All brands</option>
          <option value="VEDIC_MIND">Vedic Mind AI</option>
          <option value="VEDIC_NEEV">VedicNeev</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ContentBlockCategory | "ALL")}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="ALL">All categories</option>
          <option value="COGNITIVE_MASTERY">Cognitive Mastery</option>
          <option value="VEDIC_MATH">Vedic Math</option>
          <option value="INSTITUTIONAL_AUTOMATION">Institutional Automation</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {blocks.length} block{blocks.length === 1 ? "" : "s"}
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No content blocks match your filters.
          </p>
        ) : (
          filtered.map((block) => {
            const expanded = expandedId === block.id;
            const editingThis = editingId === block.id;
            const busy = busyId === block.id;
            const badge = STATUS_BADGE[block.status];

            return (
              <Card key={block.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={block.brand === "VEDIC_MIND" ? "secondary" : "outline"}>{BRAND_LABEL[block.brand]}</Badge>
                        <Badge variant="outline">{CATEGORY_LABEL[block.category]}</Badge>
                        <Badge variant={badge.variant} className={badge.className}>
                          {block.status}
                        </Badge>
                        {block.scheduledFor ? (
                          <span className="text-xs text-muted-foreground">
                            Scheduled: {new Date(block.scheduledFor).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 truncate text-sm font-medium text-foreground">{block.hookText}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setExpandedId(expanded ? null : block.id)}
                        aria-label="Toggle details"
                      >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {expanded ? (
                    editingThis && edit ? (
                      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                        <label className="text-xs font-semibold text-muted-foreground">Hook</label>
                        <textarea
                          value={edit.hookText}
                          onChange={(e) => setEdit((f) => (f ? { ...f, hookText: e.target.value } : f))}
                          rows={2}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm"
                        />
                        <label className="text-xs font-semibold text-muted-foreground">Body</label>
                        <textarea
                          value={edit.bodyContent}
                          onChange={(e) => setEdit((f) => (f ? { ...f, bodyContent: e.target.value } : f))}
                          rows={6}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm"
                        />
                        <label className="text-xs font-semibold text-muted-foreground">CTA</label>
                        <textarea
                          value={edit.ctaText}
                          onChange={(e) => setEdit((f) => (f ? { ...f, ctaText: e.target.value } : f))}
                          rows={2}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm"
                        />
                        <label className="text-xs font-semibold text-muted-foreground">Schedule for</label>
                        <input
                          type="datetime-local"
                          value={edit.scheduledFor}
                          onChange={(e) => setEdit((f) => (f ? { ...f, scheduledFor: e.target.value } : f))}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button type="button" size="sm" disabled={busy} onClick={() => handleSaveEdit(block.id)} className="gap-1.5">
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save changes
                          </Button>
                          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => handleSchedule(block.id)}>
                            Schedule
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEdit(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                        <p className="whitespace-pre-wrap text-sm text-foreground">{block.bodyContent}</p>
                        <p className="text-sm font-medium text-foreground">{block.ctaText}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(block)} className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" /> Edit / Schedule
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy || block.status === "PUBLISHED"}
                            onClick={() => handlePublish(block.id)}
                            className="gap-1.5"
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Linkedin className="h-3.5 w-3.5" />}
                            {block.status === "PUBLISHED" ? "Published" : "Publish to LinkedIn"}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

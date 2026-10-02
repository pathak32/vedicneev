"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import type { CoachingLead, CoachingLeadStatus } from "@vedicneev/db";
import { CalendarClock, Check, ChevronDown, ChevronUp, Copy, ExternalLink, Loader2, Plus, Save, Send, Upload } from "lucide-react";

import {
  formatLeadPhone,
  generateCommentReply,
  generateLinkedInConnectionNote,
  generateLinkedInFollowUp,
  generateOutreachMessage,
  generateWhatsAppFollowUp,
  TRIAL_CREDIT_GRANT,
  type OutreachLead,
} from "@/lib/admin/leadOutreach";

const STATUS_OPTIONS: CoachingLeadStatus[] = ["PENDING", "CONTACTED", "TRIAL_ACTIVE", "CONVERTED"];

const STATUS_LABEL: Record<CoachingLeadStatus, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  TRIAL_ACTIVE: "Trial active",
  CONVERTED: "Converted",
};

const STATUS_BADGE: Record<CoachingLeadStatus, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  PENDING: { variant: "outline" },
  CONTACTED: { variant: "secondary" },
  TRIAL_ACTIVE: { variant: "default" },
  CONVERTED: { variant: "default", className: "bg-emerald-600 text-white" },
};

const TEMPLATES: { key: string; label: string; build: (lead: OutreachLead) => string }[] = [
  { key: "wa-first", label: "WhatsApp: first message", build: generateOutreachMessage },
  { key: "wa-follow", label: "WhatsApp: follow-up", build: generateWhatsAppFollowUp },
  { key: "li-connect", label: "LinkedIn: connection note", build: generateLinkedInConnectionNote },
  { key: "li-follow", label: "LinkedIn: message after they accept", build: generateLinkedInFollowUp },
  { key: "li-comment", label: "LinkedIn: reply to a comment", build: generateCommentReply },
];

interface EmptyLeadForm {
  instituteName: string;
  directorName: string;
  city: string;
  state: string;
  district: string;
  phoneNumber: string;
  linkedinUrl: string;
  notes: string;
}

const EMPTY_FORM: EmptyLeadForm = {
  instituteName: "",
  directorName: "",
  city: "",
  state: "",
  district: "",
  phoneNumber: "",
  linkedinUrl: "",
  notes: "",
};

function inputClass() {
  return "mt-1 w-full rounded-md border border-border bg-background p-2 text-sm";
}

/** Local calendar date as YYYY-MM-DD, for an <input type="date">. */
function toDateInput(value: Date | string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

/** A follow-up is due once its date is today or earlier, unless the lead already converted. */
function isFollowUpDue(lead: CoachingLead): boolean {
  if (!lead.nextFollowUpAt || lead.status === "CONVERTED") return false;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(lead.nextFollowUpAt).getTime() <= endOfToday.getTime();
}

function LeadDetails({
  lead,
  onPatch,
}: {
  lead: CoachingLead;
  onPatch: (id: string, data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [templateKey, setTemplateKey] = useState(TEMPLATES[0]!.key);
  const [copied, setCopied] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(lead.linkedinUrl ?? "");
  const [followUp, setFollowUp] = useState(toDateInput(lead.nextFollowUpAt));
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);

  const template = TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0]!;
  const text = template.build(lead);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the text is selectable in the box above.
    }
  }

  async function save() {
    setSaving(true);
    await onPatch(lead.id, {
      linkedinUrl: linkedinUrl.trim() || null,
      nextFollowUpAt: followUp ? new Date(`${followUp}T09:00:00+05:30`).toISOString() : null,
      notes,
    });
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/30 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
          >
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {template.key === "li-connect" ? (
              <span className="text-xs text-muted-foreground">{text.length}/300 characters</span>
            ) : null}
            <Button type="button" size="sm" variant="outline" onClick={copy} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm text-foreground">{text}</pre>
        <p className="text-xs text-muted-foreground">
          Copy and send this yourself from your own LinkedIn or WhatsApp. Nothing here posts or messages on LinkedIn.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">LinkedIn profile link</label>
          <div className="flex items-center gap-2">
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className={inputClass()}
            />
            {lead.linkedinUrl ? (
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open LinkedIn profile"
                className="mt-1 rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Next follow-up</label>
          <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className={inputClass()} />
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => setFollowUp(addDays(2))}>
              +2 days
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setFollowUp(addDays(7))}>
              +7 days
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setFollowUp("")}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass()} />
      </div>

      <div>
        <Button type="button" size="sm" disabled={saving} onClick={save} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save details
        </Button>
      </div>
    </div>
  );
}

export function AdminLeadsManager({ initialLeads }: { initialLeads: CoachingLead[] }) {
  const [leads, setLeads] = useState<CoachingLead[]>(initialLeads);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CoachingLeadStatus | "ALL">("ALL");
  const [dueOnly, setDueOnly] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<EmptyLeadForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const counts = useMemo(() => {
    const byStatus: Record<CoachingLeadStatus, number> = { PENDING: 0, CONTACTED: 0, TRIAL_ACTIVE: 0, CONVERTED: 0 };
    for (const l of leads) byStatus[l.status] += 1;
    return { byStatus, due: leads.filter(isFollowUpDue).length };
  }, [leads]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = leads.filter((l) => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (dueOnly && !isFollowUpDue(l)) return false;
      if (!q) return true;
      return [l.instituteName, l.directorName, l.city, l.district, l.state, l.phoneNumber, l.source ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (dueOnly) {
      rows.sort((a, b) => new Date(a.nextFollowUpAt ?? 0).getTime() - new Date(b.nextFollowUpAt ?? 0).getTime());
    }
    return rows;
  }, [leads, search, statusFilter, dueOnly]);

  async function patchLead(id: string, data: Record<string, unknown>): Promise<boolean> {
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save.");
      setLeads((prev) => prev.map((l) => (l.id === id ? json.lead : l)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      return false;
    }
  }

  async function handleAdd() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: addForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not add lead.");
      setLeads((prev) => [...data.leads, ...prev]);
      setAddForm(EMPTY_FORM);
      setAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add lead.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImport() {
    const rows = importText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(",").map((cell) => cell.trim()));

    const parsed = rows
      .filter((cells) => cells.length >= 6)
      .map((cells) => ({
        instituteName: cells[0],
        directorName: cells[1],
        city: cells[2],
        state: cells[3],
        district: cells[4],
        phoneNumber: cells[5],
        linkedinUrl: cells[6] ?? "",
      }));

    if (parsed.length === 0) {
      setError("No valid rows found. Each line needs: institute, director, city, state, district, phone.");
      return;
    }

    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");
      setLeads((prev) => [...data.leads, ...prev]);
      setImportText("");
      setImportOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSend(lead: CoachingLead) {
    setSendingId(lead.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/send`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed.");
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? data.lead : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSendingId(null);
    }
  }

  async function handleStatusChange(lead: CoachingLead, status: CoachingLeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    const ok = await patchLead(lead.id, { status });
    if (!ok) setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              statusFilter === s ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
            }`}
          >
            <p className="text-2xl font-bold text-foreground">{counts.byStatus[s]}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</p>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDueOnly(!dueOnly)}
          className={`rounded-lg border p-3 text-left transition-colors ${
            dueOnly ? "border-destructive bg-destructive/5" : "border-border hover:bg-accent"
          }`}
        >
          <p className={`text-2xl font-bold ${counts.due > 0 ? "text-destructive" : "text-foreground"}`}>{counts.due}</p>
          <p className="text-xs text-muted-foreground">Follow-ups due</p>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search institute, name, city, phone or source…"
          className="h-9 min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
          <Upload className="h-4 w-4" /> Bulk Import
        </Button>
        <Button type="button" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {visible.length} of {leads.length} leads.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2">
        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {leads.length === 0
              ? "No leads yet. Add one, import a list, or share your /for-institutes link."
              : "No leads match these filters."}
          </p>
        ) : (
          visible.map((lead) => {
            const expanded = expandedId === lead.id;
            const sending = sendingId === lead.id;
            const badge = STATUS_BADGE[lead.status];
            const due = isFollowUpDue(lead);

            return (
              <Card key={lead.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{lead.instituteName}</p>
                        <Badge variant={badge.variant} className={badge.className}>
                          {STATUS_LABEL[lead.status]}
                        </Badge>
                        {due ? (
                          <Badge variant="destructive" className="gap-1">
                            <CalendarClock className="h-3 w-3" /> Follow up
                          </Badge>
                        ) : lead.nextFollowUpAt ? (
                          <Badge variant="outline" className="gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {new Date(lead.nextFollowUpAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </Badge>
                        ) : null}
                        {lead.source ? <Badge variant="outline">Source: {lead.source}</Badge> : null}
                        {lead.trialCreditsGrantedAt ? (
                          <Badge variant="outline">{TRIAL_CREDIT_GRANT} trial credits granted</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lead.directorName} · {formatLeadPhone(lead.phoneNumber)} ·{" "}
                        {[lead.city, lead.district, lead.state].filter(Boolean).join(", ")}
                      </p>
                      {lead.lastContactedAt ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Last contacted{" "}
                          {new Date(lead.lastContactedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as CoachingLeadStatus)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setExpandedId(expanded ? null : lead.id)}
                        aria-label="Toggle details"
                      >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {expanded ? <LeadDetails key={lead.id} lead={lead} onPatch={patchLead} /> : null}

                  <div className="flex justify-end">
                    <Button type="button" size="sm" disabled={sending} onClick={() => handleSend(lead)} className="gap-1.5">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Approve & Send via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add coaching lead</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {(
              [
                ["instituteName", "Institute name"],
                ["directorName", "Director name"],
                ["city", "City"],
                ["district", "District"],
                ["state", "State"],
                ["phoneNumber", "Phone number (WhatsApp)"],
                ["linkedinUrl", "LinkedIn profile link (optional)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                <input
                  value={addForm[key]}
                  onChange={(e) => setAddForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={inputClass()}
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Notes (optional)</label>
              <textarea
                value={addForm.notes}
                onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className={inputClass()}
              />
            </div>
            <Button type="button" onClick={handleAdd} disabled={saving} className="mt-2">
              {saving ? "Adding…" : "Add lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk import leads</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              One lead per line, comma-separated: Institute, Director, City, State, District, Phone, LinkedIn link (optional)
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              placeholder="Bright Future Academy, Ramesh Kumar, Patna, Bihar, Patna, 9876543210"
              className={`${inputClass()} font-mono text-xs`}
            />
            <Button type="button" onClick={handleImport} disabled={importing} className="mt-2">
              {importing ? "Importing…" : "Import leads"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

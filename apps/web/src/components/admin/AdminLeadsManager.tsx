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
import { ChevronDown, ChevronUp, Loader2, Plus, Send, Upload } from "lucide-react";

import { formatLeadPhone, generateOutreachMessage, TRIAL_CREDIT_GRANT } from "@/lib/admin/leadOutreach";

const STATUS_OPTIONS: CoachingLeadStatus[] = ["PENDING", "CONTACTED", "TRIAL_ACTIVE", "CONVERTED"];

const STATUS_BADGE: Record<CoachingLeadStatus, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  PENDING: { variant: "outline" },
  CONTACTED: { variant: "secondary" },
  TRIAL_ACTIVE: { variant: "default" },
  CONVERTED: { variant: "default", className: "bg-emerald-600 text-white" },
};

interface EmptyLeadForm {
  instituteName: string;
  directorName: string;
  city: string;
  state: string;
  district: string;
  phoneNumber: string;
  notes: string;
}

const EMPTY_FORM: EmptyLeadForm = {
  instituteName: "",
  directorName: "",
  city: "",
  state: "",
  district: "",
  phoneNumber: "",
  notes: "",
};

function inputClass() {
  return "mt-1 w-full rounded-md border border-border bg-background p-2 text-sm";
}

export function AdminLeadsManager({ initialLeads }: { initialLeads: CoachingLead[] }) {
  const [leads, setLeads] = useState<CoachingLead[]>(initialLeads);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<EmptyLeadForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const pendingCount = useMemo(() => leads.filter((l) => l.status === "PENDING").length, [leads]);

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
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {pendingCount} not yet contacted / {leads.length} total.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
            <Upload className="h-4 w-4" /> Bulk Import
          </Button>
          <Button type="button" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2">
        {leads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No leads yet — add one or bulk import a list of coaching institutes to start outreach.
          </p>
        ) : (
          leads.map((lead) => {
            const expanded = expandedId === lead.id;
            const sending = sendingId === lead.id;
            const badge = STATUS_BADGE[lead.status];

            return (
              <Card key={lead.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{lead.instituteName}</p>
                        <Badge variant={badge.variant} className={badge.className}>
                          {lead.status.replace("_", " ")}
                        </Badge>
                        {lead.trialCreditsGrantedAt ? (
                          <Badge variant="outline">{TRIAL_CREDIT_GRANT} trial credits granted</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lead.directorName} · {formatLeadPhone(lead.phoneNumber)} · {lead.city}, {lead.district}, {lead.state}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value as CoachingLeadStatus)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setExpandedId(expanded ? null : lead.id)}
                        aria-label="Toggle message preview"
                      >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">WhatsApp message preview</p>
                      <pre className="whitespace-pre-wrap text-sm text-foreground">{generateOutreachMessage(lead)}</pre>
                      {lead.notes ? (
                        <p className="mt-1 text-xs text-muted-foreground">Notes: {lead.notes}</p>
                      ) : null}
                    </div>
                  ) : null}

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
              One lead per line, comma-separated: Institute, Director, City, State, District, Phone
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

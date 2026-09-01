"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import {
  formatWhatsAppDiagnosticPayload,
  type DiagnosticReportForWhatsApp,
  type StudentProfileForReport,
} from "@vedicneev/engine";
import { AlertTriangle, CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";

import { dispatchWhatsAppReport, type DispatchResult } from "@/lib/whatsapp/dispatchReport";

export interface WhatsAppPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DiagnosticReportForWhatsApp;
  student: StudentProfileForReport;
  /** 10-digit Indian mobile number, no country code. */
  toPhone: string;
  language?: "en" | "hi";
}

type SendStatus = "idle" | "sending" | "sent" | "error";

export function WhatsAppPreviewModal({
  open,
  onOpenChange,
  report,
  student,
  toPhone,
  language = "en",
}: WhatsAppPreviewModalProps) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [result, setResult] = useState<DispatchResult | null>(null);

  const { payload, plaintextPreview } = useMemo(
    () => formatWhatsAppDiagnosticPayload(report, student, toPhone, language),
    [report, student, toPhone, language]
  );

  async function handleSend() {
    setStatus("sending");
    const res = await dispatchWhatsAppReport(payload);
    setResult(res);
    setStatus(res.success ? "sent" : "error");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setStatus("idle");
          setResult(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Simulated WhatsApp Message Preview
          </DialogTitle>
          <DialogDescription>To: +91 {toPhone}</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl rounded-tl-none bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
          <p className="whitespace-pre-line">{plaintextPreview}</p>
        </div>

        {status === "sent" && result ? (
          <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              {result.mock
                ? "Demo mode — logged server-side, not actually sent (no WhatsApp Business API connected)."
                : "Sent via WhatsApp Cloud API."}{" "}
              {result.messageId ? `Message ID: ${result.messageId}` : null}
            </span>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {result?.error ?? "Could not send this message."}
          </div>
        ) : null}

        <Button type="button" onClick={handleSend} disabled={status === "sending"}>
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {status === "sending" ? "Sending…" : status === "sent" ? "Send Again" : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

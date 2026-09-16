"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";

export function SendScorecardButton({ attemptId }: { attemptId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSend() {
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/whatsapp/send-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json();
      if (data.success) {
        setState("sent");
      } else {
        setState("error");
        setMessage(data.error || "WhatsApp delivery isn't configured yet for this exam portal.");
      }
    } catch {
      setState("error");
      setMessage("Network error while sending.");
    }
  }

  if (state === "sent") {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Scorecard sent to your WhatsApp.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2"
        disabled={state === "sending"}
        onClick={handleSend}
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Send Scorecard to WhatsApp
      </Button>
      {state === "error" && message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

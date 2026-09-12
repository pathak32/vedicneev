"use client";

import { useEffect, useState } from "react";

export interface CountdownTimerProps {
  targetMs: number;
  label: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Live, ticking `Dd HH:MM:SS` countdown to `targetMs` — a digit-based
 * companion to SprintCatalogClient's own coarse "Xd Xh" text, used on a
 * registered test's card. Starts `now` as null so the server render and the
 * client's first render match exactly (both show the loading placeholder);
 * a useEffect starts the live per-second clock only after hydration, same
 * pattern SprintCatalogClient.tsx already uses for its own clock.
 */
export function CountdownTimer({ targetMs, label }: CountdownTimerProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    return <p className="font-mono text-lg font-bold tabular-nums text-foreground">&nbsp;</p>;
  }

  const diff = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-bold tabular-nums text-foreground">
        {days > 0 ? `${days}d ` : ""}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </p>
    </div>
  );
}

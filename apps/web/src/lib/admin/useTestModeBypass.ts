"use client";

import { useEffect, useState } from "react";

/**
 * Whether this browser session is allowed to bypass paywalls for QA —
 * see app/api/test-mode/status/route.ts for what actually decides that
 * (holding a valid admin session). Defaults to false until the check
 * resolves, so nothing is ever briefly over-permissive on first render.
 */
export function useTestModeBypass(): boolean {
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/test-mode/status")
      .then((res) => (res.ok ? res.json() : { bypass: false }))
      .then((data) => {
        if (!cancelled) setBypass(Boolean(data.bypass));
      })
      .catch(() => {
        if (!cancelled) setBypass(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return bypass;
}

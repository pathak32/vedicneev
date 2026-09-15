"use client";

import { useEffect } from "react";

import { captureVedicMindAiReferral } from "@/lib/ecosystem/attribution";

/** Mounted once in the root layout — has no UI, just records ecosystem referrals. */
export function EcosystemReferralListener() {
  useEffect(() => {
    captureVedicMindAiReferral(window.location.search);
  }, []);
  return null;
}

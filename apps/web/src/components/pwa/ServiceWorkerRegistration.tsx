"use client";

import { useEffect } from "react";

/** Mounted once in the root layout — has no UI, just registers public/sw.js. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW registration failed:", err));
  }, []);
  return null;
}

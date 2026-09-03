"use client";

import { useEffect, useRef, useState } from "react";

/** Fires once when the element first scrolls into view, then disconnects — used to trigger one-shot entrance animations, not to track ongoing visibility. */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect a browser/OS environment that can't report intersection (very
    // old browsers, some test runners) by just showing content immediately
    // rather than leaving it permanently hidden.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

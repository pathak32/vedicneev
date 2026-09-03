"use client";

import { cn } from "@vedicneev/ui";

import { useInView } from "@/lib/hooks/useInView";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger multiple Reveals in the same section by passing increasing values (ms). */
  delayMs?: number;
}

/**
 * Fades + slides content up into place the first time it scrolls into view.
 *
 * Starts at opacity-0 for the JS-enhanced entrance effect, but that's a
 * progressive enhancement, not a requirement to see the content: the
 * `reveal-init` class is force-overridden back to fully visible inside a
 * `<noscript>` block in the root layout, so a visitor (or crawler) without
 * JavaScript still gets the real content, just without the animation.
 */
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-init opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none",
        inView && "opacity-100 translate-y-0",
        className
      )}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

"use client";

const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

// Standard touch-typing home-row finger assignment (the same map taught in
// every typing course/textbook) — universally-established pedagogy, not a
// guess, unlike the Inscript/Remington physical layouts this component
// deliberately still doesn't attempt (see the comment below).
type Finger = "leftPinky" | "leftRing" | "leftMiddle" | "leftIndex" | "rightIndex" | "rightMiddle" | "rightRing" | "rightPinky";

const FINGER_MAP: Record<string, Finger> = {
  "1": "leftPinky", Q: "leftPinky", A: "leftPinky", Z: "leftPinky",
  "2": "leftRing", W: "leftRing", S: "leftRing", X: "leftRing",
  "3": "leftMiddle", E: "leftMiddle", D: "leftMiddle", C: "leftMiddle",
  "4": "leftIndex", "5": "leftIndex", R: "leftIndex", T: "leftIndex", F: "leftIndex", G: "leftIndex", V: "leftIndex", B: "leftIndex",
  "6": "rightIndex", "7": "rightIndex", Y: "rightIndex", U: "rightIndex", H: "rightIndex", J: "rightIndex", N: "rightIndex", M: "rightIndex",
  "8": "rightMiddle", I: "rightMiddle", K: "rightMiddle",
  "9": "rightRing", O: "rightRing", L: "rightRing",
  "0": "rightPinky", P: "rightPinky",
};

const FINGER_COLOR: Record<Finger, string> = {
  leftPinky: "bg-rose-200 text-rose-900 dark:bg-rose-900/50 dark:text-rose-200",
  leftRing: "bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200",
  leftMiddle: "bg-lime-200 text-lime-900 dark:bg-lime-900/50 dark:text-lime-200",
  leftIndex: "bg-sky-200 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200",
  rightIndex: "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200",
  rightMiddle: "bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-900/50 dark:text-fuchsia-200",
  rightRing: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200",
  rightPinky: "bg-pink-200 text-pink-900 dark:bg-pink-900/50 dark:text-pink-200",
};

export interface VirtualKeyboardProps {
  nextChar: string | null;
  /** Overlays each key with the finger that should press it (standard touch-typing assignment) — the Virtual Finger Placement Assistant, opt-in via the toggle in TypingArena. */
  showFingerGuide?: boolean;
}

/**
 * QWERTY-only for now — a Devanagari Inscript/Remington key map is real
 * reference data a candidate would rely on to actually learn the layout,
 * and guessing at it would be actively misleading rather than merely
 * incomplete. Exams on those layouts render the passage/timer without this
 * overlay instead of a fabricated one; see TypingArena's caller.
 */
export function VirtualKeyboard({ nextChar, showFingerGuide = false }: VirtualKeyboardProps) {
  const target = nextChar?.toUpperCase() ?? null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-3">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.map((key) => {
            const finger = FINGER_MAP[key];
            const fingerClass = showFingerGuide && finger ? FINGER_COLOR[finger] : "";
            return (
              <span
                key={key}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                  key === target
                    ? "border-primary bg-primary text-primary-foreground"
                    : fingerClass
                      ? `border-transparent ${fingerClass}`
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {key}
              </span>
            );
          })}
        </div>
      ))}
      <span className="flex h-8 w-40 items-center justify-center rounded-md border border-border bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
        space (thumbs)
      </span>
    </div>
  );
}

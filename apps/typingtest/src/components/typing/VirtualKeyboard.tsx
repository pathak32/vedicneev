"use client";

const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

/**
 * QWERTY-only for now — a Devanagari Inscript/Remington key map is real
 * reference data a candidate would rely on to actually learn the layout,
 * and guessing at it would be actively misleading rather than merely
 * incomplete. Exams on those layouts render the passage/timer without this
 * overlay instead of a fabricated one; see TypingArena's caller.
 */
export function VirtualKeyboard({ nextChar }: { nextChar: string | null }) {
  const target = nextChar?.toUpperCase() ?? null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-3">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.map((key) => (
            <span
              key={key}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                key === target
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {key}
            </span>
          ))}
        </div>
      ))}
      <span className="flex h-8 w-40 items-center justify-center rounded-md border border-border bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
        space
      </span>
    </div>
  );
}

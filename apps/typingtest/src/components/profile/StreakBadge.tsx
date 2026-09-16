import { Flame } from "lucide-react";

export function StreakBadge({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  if (currentStreak === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Flame className="h-4 w-4" />
        No active streak yet — complete a passage today to start one.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      <Flame className="h-4 w-4 text-primary" />
      <span className="font-semibold text-foreground">{currentStreak}-day streak</span>
      <span className="text-muted-foreground">· best {longestStreak} days</span>
    </div>
  );
}

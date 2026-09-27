// Matches globals.css's HSL tokens closely enough for chart fills — recharts
// needs literal color strings, it can't read CSS custom properties through
// Tailwind's utility classes the way JSX className can.
export const CHART_COLORS = {
  success: "#16a34a",
  warning: "#f59e0b",
  destructive: "#dc2626",
  indigo: "#1E3A8A",
  slate: "#94a3b8",
};

export function accuracyColor(percent: number): string {
  if (percent >= 60) return CHART_COLORS.success;
  if (percent >= 40) return CHART_COLORS.warning;
  return CHART_COLORS.destructive;
}

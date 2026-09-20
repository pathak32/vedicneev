import { Badge, cn } from "@vedicneev/ui";

export type StatusTone = "success" | "warning" | "destructive" | "secondary";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "border-transparent bg-success text-success-foreground",
  warning: "border-transparent bg-warning text-warning-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return <Badge className={cn(TONE_CLASSES[tone], className)}>{children}</Badge>;
}

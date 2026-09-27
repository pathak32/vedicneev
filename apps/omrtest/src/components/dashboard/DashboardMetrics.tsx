"use client";

import { motion } from "framer-motion";
import { AlertTriangle, FileSpreadsheet, ScanLine, Wallet } from "lucide-react";

import { Badge, Card, CardContent, cn } from "@vedicneev/ui";

const LOW_BALANCE_THRESHOLD = 50;
// Not a real plan quota (credits are pay-as-you-go top-ups, see credits.ts)
// — purely the "full" reference point for the gauge bar below, so a
// balance still reads as a proportion instead of a bare number.
const GAUGE_REFERENCE = 200;

interface DashboardMetricsProps {
  creditBalance: number;
  batchCount: number;
  mostRecentBatchName: string | null;
}

/**
 * Client-only so the credit/batch-count cards get a mount-in animation and
 * the low-balance warning pill — the page itself stays a server component
 * (it needs live Prisma reads), this just wraps the three numbers it passes
 * down.
 */
export function DashboardMetrics({ creditBalance, batchCount, mostRecentBatchName }: DashboardMetricsProps) {
  const lowBalance = creditBalance <= LOW_BALANCE_THRESHOLD;
  const gaugePct = Math.max(4, Math.min(100, (creditBalance / GAUGE_REFERENCE) * 100));

  const otherCards = [
    { icon: FileSpreadsheet, value: batchCount, label: "Test batches created" },
    { icon: ScanLine, value: mostRecentBatchName ?? "—", label: "Most recent batch" },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className={cn("border-slate-200 transition-shadow hover:shadow-md", lowBalance && "border-warning/40")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg",
                  lowBalance ? "bg-warning/10 text-warning" : "bg-brand-indigo/10 text-brand-indigo"
                )}
              >
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-2xl font-bold text-slate-900">{creditBalance}</p>
                  {lowBalance ? (
                    <Badge className="flex items-center gap-1 border-transparent bg-warning/10 text-warning">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Low
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-500">Scan credits remaining</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={cn("h-full rounded-full", lowBalance ? "bg-warning" : "bg-brand-indigo")}
                initial={{ width: 0 }}
                animate={{ width: `${gaugePct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {otherCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: (index + 1) * 0.06 }}
          className={index === 1 ? "sm:col-span-2 lg:col-span-1" : undefined}
        >
          <Card className="border-slate-200 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

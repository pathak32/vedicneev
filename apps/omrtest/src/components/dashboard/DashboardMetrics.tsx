"use client";

import { motion } from "framer-motion";
import { AlertTriangle, FileSpreadsheet, ScanLine, Wallet } from "lucide-react";

import { Badge, Card, CardContent, cn } from "@vedicneev/ui";

const LOW_BALANCE_THRESHOLD = 50;

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

  const cards = [
    {
      icon: Wallet,
      value: creditBalance,
      label: "Scan credits remaining",
      warn: lowBalance,
    },
    {
      icon: FileSpreadsheet,
      value: batchCount,
      label: "Test batches created",
      warn: false,
    },
    {
      icon: ScanLine,
      value: mostRecentBatchName ?? "—",
      label: "Most recent batch",
      warn: false,
    },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.06 }}
          className={index === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}
        >
          <Card className={cn("border-slate-200 transition-shadow hover:shadow-md", card.warn && "border-warning/40")}>
            <CardContent className="flex items-center gap-4 p-6">
              <span
                className={cn(
                  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg",
                  card.warn ? "bg-warning/10 text-warning" : "bg-brand-indigo/10 text-brand-indigo"
                )}
              >
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-2xl font-bold text-slate-900">{card.value}</p>
                  {card.warn ? (
                    <Badge className="flex items-center gap-1 border-transparent bg-warning/10 text-warning">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Low
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

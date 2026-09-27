"use client";

import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { CHART_COLORS } from "@/components/charts/colors";

interface BlindSpotChartProps {
  rows: { label: string; count: number }[];
}

export function BlindSpotChart({ rows }: BlindSpotChartProps) {
  const data = rows.map((row) => ({ label: row.label, value: row.count, color: CHART_COLORS.destructive }));
  return <HorizontalBarChart data={data} labelWidth={200} />;
}

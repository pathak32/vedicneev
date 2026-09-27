"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_COLORS } from "./colors";

interface CutoffDonutChartProps {
  above: number;
  below: number;
}

export function CutoffDonutChart({ above, below }: CutoffDonutChartProps) {
  const total = above + below;
  const pctAbove = total > 0 ? Math.round((above / total) * 100) : 0;
  const data = [
    { name: "Above cutoff", value: above },
    { name: "Below cutoff", value: below },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            startAngle={90}
            endAngle={-270}
            paddingAngle={total > 0 ? 2 : 0}
            stroke="none"
          >
            <Cell fill={CHART_COLORS.success} />
            <Cell fill={total > 0 ? CHART_COLORS.destructive : CHART_COLORS.slate} />
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [value, name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{total > 0 ? `${pctAbove}%` : "—"}</span>
        <span className="text-[11px] text-slate-500">above cutoff</span>
      </div>
    </div>
  );
}

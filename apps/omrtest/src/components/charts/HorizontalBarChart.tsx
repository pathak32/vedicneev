"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS } from "./colors";

export interface HorizontalBarDatum {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  data: HorizontalBarDatum[];
  max?: number;
  valueSuffix?: string;
  labelWidth?: number;
}

/**
 * Generic label/value bar chart shared by branch-average, subsection-
 * accuracy, and mistake-blind-spot views — those only differ in what they
 * label and how they color a bar, not in layout.
 */
export function HorizontalBarChart({ data, max, valueSuffix = "", labelWidth = 150 }: HorizontalBarChartProps) {
  if (data.length === 0) return null;
  const domainMax = max ?? Math.max(...data.map((d) => d.value)) * 1.1;

  return (
    <ResponsiveContainer width="100%" height={Math.max(80, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
        <XAxis type="number" domain={[0, domainMax]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#475569" }}
        />
        <Tooltip
          cursor={{ fill: "rgba(15,23,42,0.04)" }}
          formatter={(value: number) => [`${value.toFixed(1)}${valueSuffix}`, ""]}
          labelFormatter={() => ""}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? CHART_COLORS.indigo} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value: number) => `${value.toFixed(0)}${valueSuffix}`}
            style={{ fontSize: 11, fill: "#334155" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useState } from "react";
import type { GymMember, Gym } from "@vedicneev/db";

type MemberWithGym = GymMember & { gym: Pick<Gym, "name"> };

interface Props {
  metrics: {
    totalActive: number;
    atRiskCount: number;
    mrr: number;
    totalPlans: number;
  };
  members: MemberWithGym[];
}

type StatusFilter = "ALL" | "ACTIVE" | "AT_RISK" | "EXPIRED";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  AT_RISK: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  EXPIRED: "text-red-400 border-red-400/30 bg-red-400/10",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function GymOpsDashboard({ metrics, members }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) => {
    const matchStatus = filter === "ALL" || m.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.phone.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 font-mono text-sm md:p-8">
      {/* Header */}
      <div className="mb-8 border-b border-green-900/50 pb-4">
        <p className="text-xs text-green-600">{"// GymOps & Member Retention Engine v1.0"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-green-400">
          &#x25B6; GYMOPS DASHBOARD
        </h1>
        <p className="text-xs text-zinc-500">Operational control panel &mdash; gym owner view</p>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="ACTIVE MEMBERS" value={String(metrics.totalActive)} accent="green" />
        <MetricCard label="MRR (EST.)" value={formatINR(metrics.mrr)} accent="cyan" />
        <MetricCard label="EXPIRING THIS WEEK" value={String(metrics.atRiskCount)} accent="amber" />
        <MetricCard label="PLANS CREATED" value={String(metrics.totalPlans)} accent="violet" />
      </div>

      {/* Roster */}
      <div className="rounded-md border border-zinc-800 bg-zinc-950">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Member Roster — {filtered.length} records
          </p>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / phone..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-green-700 md:w-52"
            />
            <div className="flex gap-1">
              {(["ALL", "ACTIVE", "AT_RISK", "EXPIRED"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === s
                      ? "bg-green-900/50 text-green-300"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500">
                <Th>NAME</Th>
                <Th>GYM</Th>
                <Th>PHONE</Th>
                <Th>TRAINER</Th>
                <Th>MEMBERSHIP END</Th>
                <Th>STATUS</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-600">
                    No members found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                    <Td>{m.name}</Td>
                    <Td className="text-zinc-500">{m.gym.name}</Td>
                    <Td className="text-zinc-400">{m.phone}</Td>
                    <Td className="text-zinc-500">{m.assignedTrainer ?? "—"}</Td>
                    <Td className={new Date(m.membershipEnd) < new Date() ? "text-red-400" : "text-zinc-300"}>
                      {formatDate(m.membershipEnd)}
                    </Td>
                    <Td>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          STATUS_BADGE[m.status] ?? "text-zinc-400"
                        }`}
                      >
                        {m.status}
                      </span>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const colors: Record<string, string> = {
    green: "border-green-900/50 text-green-400",
    cyan: "border-cyan-900/50 text-cyan-400",
    amber: "border-amber-900/50 text-amber-400",
    violet: "border-violet-900/50 text-violet-400",
  };
  return (
    <div className={`rounded-md border bg-zinc-950 p-4 ${colors[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-semibold uppercase tracking-wider">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-zinc-300 ${className}`}>{children}</td>;
}

"use client";

import { useState } from "react";
import type { GymMember, GymDietPlan, Gym } from "@vedicneev/db";

type MemberRow = Pick<GymMember, "id" | "name" | "phone" | "assignedTrainer" | "status">;
type PlanRow = GymDietPlan & { member: Pick<GymMember, "name"> };

interface Props {
  members: MemberRow[];
  plans: PlanRow[];
}

interface MealEntry {
  time: string;
  meal: string;
  calories: string;
}

interface WorkoutEntry {
  day: string;
  exercise: string;
  sets: string;
  reps: string;
}

export function GymTrainerBuilder({ members, plans: initialPlans }: Props) {
  const [plans, setPlans] = useState<PlanRow[]>(initialPlans);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [title, setTitle] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [meals, setMeals] = useState<MealEntry[]>([{ time: "", meal: "", calories: "" }]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([{ day: "", exercise: "", sets: "", reps: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function addMeal() {
    setMeals((prev) => [...prev, { time: "", meal: "", calories: "" }]);
  }

  function updateMeal(i: number, field: keyof MealEntry, value: string) {
    setMeals((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  function removeMeal(i: number) {
    setMeals((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addWorkout() {
    setWorkouts((prev) => [...prev, { day: "", exercise: "", sets: "", reps: "" }]);
  }

  function updateWorkout(i: number, field: keyof WorkoutEntry, value: string) {
    setWorkouts((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  }

  function removeWorkout(i: number) {
    setWorkouts((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedMemberId) return setError("Please select a member.");
    if (!title.trim()) return setError("Plan title is required.");
    if (!assignedBy.trim()) return setError("Trainer name is required.");

    setSaving(true);
    try {
      const res = await fetch("/api/gym-ops/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          title: title.trim(),
          assignedBy: assignedBy.trim(),
          details: { meals, workouts },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save plan.");
      } else {
        setSuccess(`Plan "${title}" created for ${data.plan.member.name}.`);
        setPlans((prev) => [data.plan, ...prev]);
        setTitle("");
        setSelectedMemberId("");
        setMeals([{ time: "", meal: "", calories: "" }]);
        setWorkouts([{ day: "", exercise: "", sets: "", reps: "" }]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 font-mono text-sm md:p-8">
      {/* Header */}
      <div className="mb-8 border-b border-green-900/50 pb-4">
        <p className="text-xs text-green-600">{"// GymOps — Trainer Workspace"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-green-400">
          &#x25B6; DIET &amp; WORKOUT BUILDER
        </h1>
        <p className="text-xs text-zinc-500">Assign structured plans to members — data stays with the gym, not the trainer</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Builder form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-5">
            <SectionLabel>01 / PLAN DETAILS</SectionLabel>

            <div className="mt-4 flex flex-col gap-3">
              <Field label="MEMBER">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200 outline-none focus:border-green-700"
                >
                  <option value="">— Select member —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="PLAN TITLE">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 12-Week Fat Loss Plan"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="ASSIGNED BY (TRAINER)">
                <input
                  value={assignedBy}
                  onChange={(e) => setAssignedBy(e.target.value)}
                  placeholder="Trainer name"
                  className={INPUT_CLS}
                />
              </Field>
            </div>
          </div>

          {/* Nutrition */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-5">
            <SectionLabel>02 / NUTRITION PLAN</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {meals.map((meal, i) => (
                <div key={i} className="flex gap-2">
                  <input value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)} placeholder="Time" className={`${INPUT_CLS} w-20 shrink-0`} />
                  <input value={meal.meal} onChange={(e) => updateMeal(i, "meal", e.target.value)} placeholder="Meal description" className={`${INPUT_CLS} flex-1`} />
                  <input value={meal.calories} onChange={(e) => updateMeal(i, "calories", e.target.value)} placeholder="kcal" className={`${INPUT_CLS} w-16 shrink-0`} />
                  <button type="button" onClick={() => removeMeal(i)} className="text-red-600 hover:text-red-400">✕</button>
                </div>
              ))}
              <button type="button" onClick={addMeal} className="mt-1 text-xs text-green-600 hover:text-green-400">
                + Add meal
              </button>
            </div>
          </div>

          {/* Workouts */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-5">
            <SectionLabel>03 / WORKOUT PLAN</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {workouts.map((w, i) => (
                <div key={i} className="flex gap-2">
                  <input value={w.day} onChange={(e) => updateWorkout(i, "day", e.target.value)} placeholder="Day" className={`${INPUT_CLS} w-16 shrink-0`} />
                  <input value={w.exercise} onChange={(e) => updateWorkout(i, "exercise", e.target.value)} placeholder="Exercise" className={`${INPUT_CLS} flex-1`} />
                  <input value={w.sets} onChange={(e) => updateWorkout(i, "sets", e.target.value)} placeholder="Sets" className={`${INPUT_CLS} w-14 shrink-0`} />
                  <input value={w.reps} onChange={(e) => updateWorkout(i, "reps", e.target.value)} placeholder="Reps" className={`${INPUT_CLS} w-14 shrink-0`} />
                  <button type="button" onClick={() => removeWorkout(i)} className="text-red-600 hover:text-red-400">✕</button>
                </div>
              ))}
              <button type="button" onClick={addWorkout} className="mt-1 text-xs text-green-600 hover:text-green-400">
                + Add exercise
              </button>
            </div>
          </div>

          {error && <p className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">{error}</p>}
          {success && <p className="rounded border border-green-900/50 bg-green-950/30 px-3 py-2 text-xs text-green-400">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded border border-green-700 bg-green-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-400 transition-colors hover:bg-green-900/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "&#9654; Assign Plan"}
          </button>
        </form>

        {/* Existing plans */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <SectionLabel>ASSIGNED PLANS — {plans.length}</SectionLabel>
          </div>
          <div className="flex flex-col gap-3">
            {plans.length === 0 ? (
              <p className="text-xs text-zinc-600">No plans assigned yet. Create one on the left.</p>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-semibold text-green-400">{plan.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    &#8594; {plan.member.name} &nbsp;|&nbsp; by {plan.assignedBy}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    {new Date(plan.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT_CLS =
  "rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-green-700 w-full";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

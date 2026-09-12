"use client";

import { useMemo, useState } from "react";
import { Badge } from "@vedicneev/ui";

import type { ExportedQuestion } from "@/lib/admin/questionExport";

const ALL = "ALL";
const ROW_CAP = 150;

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
    >
      <option value={ALL}>{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/** Client-side filter over the already-fetched full question set — the on-page view is for spot-checking; the CSV/JSON export (buttons above this) is the real audit surface for all ~1200+ rows. */
export function QuestionExportTable({ questions }: { questions: ExportedQuestion[] }) {
  const [board, setBoard] = useState(ALL);
  const [classLevel, setClassLevel] = useState(ALL);
  const [section, setSection] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);
  const [search, setSearch] = useState("");

  const boards = useMemo(() => Array.from(new Set(questions.map((q) => q.examBoard))).sort(), [questions]);
  const sections = useMemo(() => Array.from(new Set(questions.map((q) => q.section))).sort(), [questions]);
  const difficulties = useMemo(() => Array.from(new Set(questions.map((q) => q.difficulty))).sort(), [questions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (board !== ALL && q.examBoard !== board) return false;
      if (classLevel !== ALL && q.classLevel !== classLevel) return false;
      if (section !== ALL && q.section !== section) return false;
      if (difficulty !== ALL && q.difficulty !== difficulty) return false;
      if (term && !q.questionText.toLowerCase().includes(term) && !q.key.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [questions, board, classLevel, section, difficulty, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect value={board} onChange={setBoard} options={boards} label="Board" />
        <FilterSelect value={classLevel} onChange={setClassLevel} options={["6", "9"]} label="Class" />
        <FilterSelect value={section} onChange={setSection} options={sections} label="Section" />
        <FilterSelect value={difficulty} onChange={setDifficulty} options={difficulties} label="Difficulty" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question text or key…"
          className="h-9 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} matching row{filtered.length === 1 ? "" : "s"} out of {questions.length} total
        {filtered.length > ROW_CAP ? ` — showing the first ${ROW_CAP}; use the CSV/JSON export above for everything` : ""}.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {["Source", "Key", "Board", "Class", "Section", "Topic", "Difficulty", "Question", "A", "B", "C", "D", "Answer", "Explanation"].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.slice(0, ROW_CAP).map((q) => (
              <tr key={q.id} className={q.correctAnswer === "" || q.questionText === "(missing)" ? "bg-destructive/5" : undefined}>
                <td className="px-2 py-2">
                  <Badge variant="outline" className="text-[10px]">
                    {q.source}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-2 py-2 font-mono">{q.key}</td>
                <td className="whitespace-nowrap px-2 py-2">{q.examBoard}</td>
                <td className="px-2 py-2">{q.classLevel}</td>
                <td className="whitespace-nowrap px-2 py-2">{q.section}</td>
                <td className="whitespace-nowrap px-2 py-2">{q.topic ?? "—"}</td>
                <td className="whitespace-nowrap px-2 py-2">{q.difficulty}</td>
                <td className="min-w-[220px] max-w-[320px] px-2 py-2">{q.questionText}</td>
                <td className="max-w-[140px] px-2 py-2">{q.optionA}</td>
                <td className="max-w-[140px] px-2 py-2">{q.optionB}</td>
                <td className="max-w-[140px] px-2 py-2">{q.optionC}</td>
                <td className="max-w-[140px] px-2 py-2">{q.optionD}</td>
                <td className="px-2 py-2 font-semibold">{q.correctAnswer || "?"}</td>
                <td className="min-w-[200px] max-w-[320px] px-2 py-2">{q.explanation || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

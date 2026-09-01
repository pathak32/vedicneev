import type { CutoffCategory, CutoffLocality, HistoricalCutoff } from "@vedicneev/engine";

/**
 * ILLUSTRATIVE PLACEHOLDER DATA — not sourced from any official NVS/AISSEE
 * publication. Exists so the admission-probability demo has something to
 * compute against. Replace with a verified cutoff dataset (and a real
 * source citation) before this ever reaches production.
 */
export const SAMPLE_HISTORICAL_CUTOFFS: HistoricalCutoff[] = [
  { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "GEN", cutoffPercentage: 58 },
  { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "OBC", cutoffPercentage: 54 },
  { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "SC", cutoffPercentage: 48 },
  { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "ST", cutoffPercentage: 45 },
  { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "DEFENSE", cutoffPercentage: 52 },
  { examType: "JNVST", state: "Bihar", locality: "URBAN", category: "GEN", cutoffPercentage: 64 },
  { examType: "JNVST", state: "Bihar", locality: "URBAN", category: "OBC", cutoffPercentage: 60 },
  { examType: "JNVST", state: "Uttar Pradesh", locality: "RURAL", category: "GEN", cutoffPercentage: 60 },
  { examType: "JNVST", state: "Uttar Pradesh", locality: "RURAL", category: "OBC", cutoffPercentage: 56 },
  { examType: "JNVST", state: "Uttar Pradesh", locality: "URBAN", category: "GEN", cutoffPercentage: 66 },
  { examType: "JNVST", state: "Maharashtra", locality: "RURAL", category: "GEN", cutoffPercentage: 55 },
  { examType: "JNVST", state: "Maharashtra", locality: "URBAN", category: "GEN", cutoffPercentage: 61 },
  { examType: "AISSEE", state: "Bihar", locality: "RURAL", category: "GEN", cutoffPercentage: 62 },
  { examType: "AISSEE", state: "Bihar", locality: "URBAN", category: "GEN", cutoffPercentage: 68 },
  { examType: "AISSEE", state: "Uttar Pradesh", locality: "RURAL", category: "GEN", cutoffPercentage: 63 },
  { examType: "AISSEE", state: "Maharashtra", locality: "URBAN", category: "GEN", cutoffPercentage: 65 },
];

export const SAMPLE_STATES = ["Bihar", "Uttar Pradesh", "Maharashtra"] as const;

export const CATEGORY_OPTIONS: { value: CutoffCategory; label: string }[] = [
  { value: "GEN", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "DEFENSE", label: "Defense" },
];

export const LOCALITY_OPTIONS: { value: CutoffLocality; label: string }[] = [
  { value: "RURAL", label: "Rural" },
  { value: "URBAN", label: "Urban" },
];

/**
 * ILLUSTRATIVE synthetic cohort of raw scores (out of the demo's 14
 * questions) standing in for real aggregated TestSession results, so the
 * "national percentile" figure has a distribution to compare against.
 */
export const SAMPLE_PERCENTILE_COHORT: number[] = [
  1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10,
  10, 11, 11, 12, 12, 13, 3, 4, 5, 6, 7, 8, 9, 2, 6, 7, 5, 4,
];

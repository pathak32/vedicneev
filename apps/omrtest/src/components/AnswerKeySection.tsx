"use client";

import { useState } from "react";

import { AnswerKeyForm } from "@/components/AnswerKeyForm";
import { MultiSetPanel } from "@/components/MultiSetPanel";

interface AnswerKeySectionProps {
  testBatchId: string;
  totalQuestions: number;
  initialHasCompleteAnswerKey: boolean;
}

/**
 * AnswerKeyForm and MultiSetPanel are siblings, not parent/child — neither
 * can see the other's state directly. Without this wrapper,
 * "hasCompleteAnswerKey" was computed ONCE server-side at page load and
 * never updated, so saving a complete key left MultiSetPanel's "Generate
 * Multi-Set Papers" button permanently disabled until a full page reload.
 * This holds that one piece of shared state instead, updated the instant
 * AnswerKeyForm's save succeeds.
 *
 * `refreshToken` (bumped on every save) is passed to MultiSetPanel too, so
 * it re-fetches its own setLabels list — existing sets are NOT cleared by
 * a resave (setMappings stays as-is; see the save routes' own comments on
 * why), so this is what lets MultiSetPanel notice the key changed under
 * an already-generated set and show its own "unconfirmed" warning instead
 * of silently keeping stale set-download links up.
 *
 * `isAnswerKeyConfirmed` is the actual gate on generating sets (see
 * TestBatch.answerKeyConfirmedAt's own schema comment) — lifted here for
 * the same cross-sibling reason as hasCompleteAnswerKey.
 */
export function AnswerKeySection({ testBatchId, totalQuestions, initialHasCompleteAnswerKey }: AnswerKeySectionProps) {
  const [hasCompleteAnswerKey, setHasCompleteAnswerKey] = useState(initialHasCompleteAnswerKey);
  const [isAnswerKeyConfirmed, setIsAnswerKeyConfirmed] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <AnswerKeyForm
        testBatchId={testBatchId}
        totalQuestions={totalQuestions}
        onSaved={(isComplete) => {
          setHasCompleteAnswerKey(isComplete);
          setRefreshToken((n) => n + 1);
        }}
        onConfirmedChange={setIsAnswerKeyConfirmed}
      />
      <MultiSetPanel
        testBatchId={testBatchId}
        hasCompleteAnswerKey={hasCompleteAnswerKey}
        isAnswerKeyConfirmed={isAnswerKeyConfirmed}
        refreshToken={refreshToken}
      />
    </div>
  );
}

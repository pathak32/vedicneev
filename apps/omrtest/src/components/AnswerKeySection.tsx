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
 * `refreshToken` (bumped on every save) is passed to MultiSetPanel too —
 * a resaved key clears any previously-generated setMappings server-side
 * (see PATCH .../answer-key's own comment), so MultiSetPanel needs to
 * re-fetch and drop its stale set-download list, not just unlock its button.
 */
export function AnswerKeySection({ testBatchId, totalQuestions, initialHasCompleteAnswerKey }: AnswerKeySectionProps) {
  const [hasCompleteAnswerKey, setHasCompleteAnswerKey] = useState(initialHasCompleteAnswerKey);
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
      />
      <MultiSetPanel testBatchId={testBatchId} hasCompleteAnswerKey={hasCompleteAnswerKey} refreshToken={refreshToken} />
    </div>
  );
}

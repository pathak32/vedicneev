"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import { Target } from "lucide-react";

import type { TopicAccuracy } from "@/lib/exam/diagnostics";
import type { LanguageCode } from "@/lib/exam/types";

export interface RemedialRecommendationsProps {
  weakTopics: TopicAccuracy[];
  language: LanguageCode;
}

/** Surfaces the weakest attempted topics (see diagnostics.ts's buildWeakTopics) as a ranked "practice this next" list, each linking straight into that topic's practice session. */
export function RemedialRecommendations({ weakTopics, language }: RemedialRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          Recommended Next Practice
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weakTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No weak topics found in this attempt — solid accuracy across every topic you tried.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {weakTopics.map((topic) => (
              <div
                key={topic.key}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{topic.name[language]}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.accuracyPercent.toFixed(0)}% accuracy · {topic.correct}/{topic.attempted} correct
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/practice/${topic.key}`}>Practice</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

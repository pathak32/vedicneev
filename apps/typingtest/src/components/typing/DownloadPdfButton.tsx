"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { Download, Loader2 } from "lucide-react";

export interface DownloadPdfButtonProps {
  examName: string;
  completedAt: string;
  grossSpeedWpm: number;
  netSpeedWpm: number;
  accuracyPercent: number;
  fullMistakes: number;
  halfMistakes: number;
  keyDepressions: number;
  backspaceCount: number;
  timeTakenSeconds: number;
}

/** jsPDF is dynamically imported here (never in the initial bundle) — a plain text-only report needs none of jsPDF's heavier plugins (autotable, html2canvas), keeping this genuinely lightweight. */
export function DownloadPdfButton(props: DownloadPdfButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      let y = 20;
      const line = (text: string, size = 11, gap = 8) => {
        doc.setFontSize(size);
        doc.text(text, 14, y);
        y += gap;
      };

      line("VedicNeev Typing Scorecard", 16, 10);
      line(props.examName, 12, 10);
      line(`Completed: ${props.completedAt}`, 10, 10);

      y += 4;
      line("Official Score Breakdown", 13, 8);
      line(`Gross Speed: ${props.grossSpeedWpm} wpm`);
      line(`Net Speed: ${props.netSpeedWpm} wpm`);
      line(`Accuracy: ${props.accuracyPercent}%`);
      line(`Full Mistakes: ${props.fullMistakes}`);
      line(`Half Mistakes: ${props.halfMistakes}`);
      line(`Key Depressions: ${props.keyDepressions}`);
      line(`Backspaces Used: ${props.backspaceCount}`);
      line(`Time Taken: ${props.timeTakenSeconds}s`);

      doc.save(`vedicneev-typing-scorecard-${Date.now()}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="lg" className="w-full gap-2" disabled={generating} onClick={handleDownload}>
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download PDF Report
    </Button>
  );
}

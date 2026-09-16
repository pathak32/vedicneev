import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import { FileText, PenLine } from "lucide-react";

export function PracticeModeSelector() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link href="/">
        <Card className="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Timed Paragraph Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The official government-exam catalog — Gross/Net Speed, Accuracy, and Full/Half Mistakes, graded exactly
            like the real test.
          </CardContent>
        </Card>
      </Link>
      <Link href="/practice/custom">
        <Card className="h-full transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PenLine className="h-4 w-4 text-primary" />
              Custom Text Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Paste any passage, legal draft, or official text and test your speed and accuracy on it instantly.
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

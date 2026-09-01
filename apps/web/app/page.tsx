import Link from "next/link";
import { Printer, ScanLine, Sparkles } from "lucide-react";

import { formatDuration } from "@vedicneev/engine";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vedicneev/ui";

export default function HomePage() {
  const sampleTimeLimit = formatDuration(45 * 60);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vedic Neev
          </CardTitle>
          <CardDescription>
            Practice engine ready — sample section time limit: {sampleTimeLimit}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/exam/demo-jnvst">Start a mock test</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst/omr/print">
              <Printer className="h-4 w-4" />
              Print OMR sheet
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst/omr/scan">
              <ScanLine className="h-4 w-4" />
              Scan a filled OMR sheet
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

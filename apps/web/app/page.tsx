import { Sparkles } from "lucide-react";

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
        <CardContent>
          <Button>Start a mock test</Button>
        </CardContent>
      </Card>
    </main>
  );
}

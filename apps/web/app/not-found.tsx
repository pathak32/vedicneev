import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vedicneev/ui";
import { Compass } from "lucide-react";

// Served with a real HTTP 404 (Next.js sets this automatically for the
// not-found boundary) — keeping this branded and link-rich, rather than the
// bare default, gives visitors somewhere useful to go instead of bouncing,
// and keeps internal link equity flowing to the pages that are meant to rank.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <Card className="w-full">
        <CardHeader className="items-center">
          <Compass className="h-10 w-10 text-primary" />
          <CardTitle className="text-xl">Page not found</CardTitle>
          <CardDescription>
            This page doesn&apos;t exist, or the mock test you&apos;re looking for isn&apos;t available.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/">Go to Vedic Neev home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">View pricing plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn">Browse speed-math lessons</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

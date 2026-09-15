import Link from "next/link";
import { prisma } from "@vedicneev/db";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { localize } from "@/lib/localize";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const exams = await prisma.typingExam.findMany({
    where: { isActive: true },
    orderBy: { organization: "asc" },
  });

  return (
    <div className="container flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Government Exam Typing Practice</h1>
        <p className="max-w-2xl text-muted-foreground">
          Official-format typing tests — Gross/Net Speed, Accuracy, and Full/Half Mistakes graded exactly like the
          real exam. English &amp; Hindi (Inscript/Remington) layouts supported.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{localize(exam.name)}</CardTitle>
                  <Badge variant="outline">{exam.language}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>{exam.organization}</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{Math.round(exam.durationSeconds / 60)} min</Badge>
                  <Badge variant="secondary">{exam.layout}</Badge>
                  <Badge variant="secondary">{exam.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {exams.length === 0 ? (
        <p className="text-muted-foreground">No exams are published yet — check back soon.</p>
      ) : null}
    </div>
  );
}

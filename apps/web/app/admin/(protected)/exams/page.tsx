import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vedicneev/ui";
import { prisma } from "@vedicneev/db";
import { BookOpenCheck, Layers, ListTree, Sparkles, Target } from "lucide-react";

export const dynamic = "force-dynamic";

async function loadQuestionBankStats() {
  const [examTemplateCount, sectionCount, topicCount, questionCount, speedHackCount, questionsByDifficulty] =
    await Promise.all([
      prisma.examTemplate.count(),
      prisma.section.count(),
      prisma.topic.count(),
      prisma.question.count(),
      prisma.vedicSpeedHack.count(),
      prisma.question.groupBy({ by: ["difficulty"], _count: { _all: true } }),
    ]);

  return { examTemplateCount, sectionCount, topicCount, questionCount, speedHackCount, questionsByDifficulty };
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default async function AdminExamsPage() {
  const stats = await loadQuestionBankStats();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Question Bank Seeding</h1>
        <p className="text-sm text-muted-foreground">
          What&apos;s currently in packages/db — exam templates, subject taxonomy, and the question bank itself.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Exam templates" value={stats.examTemplateCount} icon={Target} />
        <StatCard label="Sections" value={stats.sectionCount} icon={Layers} />
        <StatCard label="Topics" value={stats.topicCount} icon={ListTree} />
        <StatCard label="Questions" value={stats.questionCount} icon={BookOpenCheck} />
        <StatCard label="Vedic speed hacks" value={stats.speedHackCount} icon={Sparkles} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions by difficulty</CardTitle>
          <CardDescription>Live counts from the questions table.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {stats.questionsByDifficulty.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions seeded yet.</p>
          ) : (
            stats.questionsByDifficulty.map((row) => (
              <Badge key={row.difficulty} variant="secondary">
                {row.difficulty}: {row._count._all}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adding more content</CardTitle>
          <CardDescription>
            New questions, sections, and exam templates are added through packages/db/prisma/seed.ts, not from this
            page — seeding runs migrations against the live database, which isn&apos;t something to trigger from a
            web request. Run it from a trusted machine:
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <code className="block rounded-md bg-muted px-3 py-2 text-sm text-foreground">npm run db:seed --workspace=@vedicneev/db</code>
        </CardContent>
      </Card>
    </div>
  );
}

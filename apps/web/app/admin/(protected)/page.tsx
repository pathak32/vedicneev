import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vedicneev/ui";
import { prisma } from "@vedicneev/db";
import { ArrowRight, CheckCircle2, Database, FileEdit, Users, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A single connectivity probe, timed and isolated from the rest of the
 * page's queries — if the database is unreachable, this fails fast and
 * every count below defaults to 0 (via allSettled below) instead of
 * throwing the whole dashboard into Next.js's generic error boundary.
 */
async function checkDatabase(): Promise<{ connected: boolean; latencyMs: number | null }> {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, latencyMs: Date.now() - startedAt };
  } catch {
    return { connected: false, latencyMs: null };
  }
}

async function loadDashboardData() {
  const db = await checkDatabase();
  if (!db.connected) {
    return {
      db,
      studentCount: 0,
      parentCount: 0,
      activeStudentsLast7d: 0,
      testSessionCount: 0,
      draftCount: 0,
      publishedCount: 0,
      recentDrafts: [] as { id: string; title: string; category: string }[],
    };
  }

  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

  const [
    studentCount,
    parentCount,
    activeStudentsLast7d,
    testSessionCount,
    draftCount,
    publishedCount,
    recentDrafts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.user
      .findMany({
        where: { role: "STUDENT", testSessions: { some: { startedAt: { gte: sevenDaysAgo } } } },
        select: { id: true },
      })
      .then((rows) => rows.length),
    prisma.testSession.count(),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.findMany({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, title: true, category: true },
    }),
  ]);

  return { db, studentCount, parentCount, activeStudentsLast7d, testSessionCount, draftCount, publishedCount, recentDrafts };
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const data = await loadDashboardData();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">System telemetry and quick actions.</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Database connection</span>
          </div>
          {data.db.connected ? (
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Connected{data.db.latencyMs !== null ? ` · ${data.db.latencyMs}ms` : ""}
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              Disconnected
            </Badge>
          )}
        </CardContent>
      </Card>

      {!data.db.connected ? (
        <p className="text-sm text-muted-foreground">
          The database is unreachable, so the stats below can&apos;t load right now. Check DATABASE_URL / DIRECT_URL
          and try again.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students" value={data.studentCount} icon={Users} />
            <StatCard label="Parents" value={data.parentCount} icon={Users} />
            <StatCard
              label="Active students"
              value={data.activeStudentsLast7d}
              icon={Users}
              hint="Started a test in the last 7 days"
            />
            <StatCard label="Test sessions" value={data.testSessionCount} icon={FileEdit} hint="All time" />
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Content moderation</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/blogs">
                  Open Blog Queue
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {data.draftCount} draft{data.draftCount === 1 ? "" : "s"} awaiting publish
                </CardTitle>
                <CardDescription>{data.publishedCount} posts already published.</CardDescription>
              </CardHeader>
              {data.recentDrafts.length > 0 ? (
                <CardContent className="flex flex-col gap-2 pt-0">
                  {data.recentDrafts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/blogs/${post.id}/preview`}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="truncate text-foreground">{post.title}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">{post.category}</span>
                    </Link>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

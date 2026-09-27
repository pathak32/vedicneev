import type { Prisma, TestBatch } from "@vedicneev/db";

import type { InstituteSession } from "./session";

/**
 * OWNER/STAFF have unrestricted access to every batch in their institute —
 * OWNER deliberately keeps this as a fallback even after branches/faculty
 * are set up (see the FACULTY rollout's migration note). FACULTY is scoped
 * to exactly the batches matching their own assigned branch + one of their
 * (subject, classLevel) pairs.
 */
export function canAccessTestBatch(
  session: InstituteSession,
  testBatch: Pick<TestBatch, "instituteId" | "branchId" | "subject" | "classLevel">
): boolean {
  if (testBatch.instituteId !== session.institute.id) return false;
  if (session.admin.role !== "FACULTY") return true;

  if (!testBatch.branchId || testBatch.branchId !== session.admin.branchId) return false;

  const subject = (testBatch.subject ?? "").trim().toLowerCase();
  const classLevel = (testBatch.classLevel ?? "").trim().toLowerCase();
  return session.admin.assignments.some(
    (a) => a.subject.trim().toLowerCase() === subject && a.classLevel.trim().toLowerCase() === classLevel
  );
}

/**
 * The dashboard/list-query counterpart of canAccessTestBatch — a Prisma
 * `where` clause that scopes a testBatch.findMany the same way, so a
 * FACULTY session's dashboard only ever shows batches it's actually
 * allowed to open. A FACULTY with zero assignment rows gets a clause that
 * matches nothing (an empty Prisma `OR` array matches everything, not
 * nothing, so that case is guarded explicitly rather than relied on).
 */
export function facultyTestBatchWhereClause(session: InstituteSession): Prisma.TestBatchWhereInput {
  if (session.admin.role !== "FACULTY") return { instituteId: session.institute.id };
  if (session.admin.assignments.length === 0 || !session.admin.branchId) {
    return { id: "__no_faculty_access__" };
  }

  return {
    instituteId: session.institute.id,
    branchId: session.admin.branchId,
    OR: session.admin.assignments.map((a) => ({
      subject: { equals: a.subject, mode: "insensitive" as const },
      classLevel: { equals: a.classLevel, mode: "insensitive" as const },
    })),
  };
}

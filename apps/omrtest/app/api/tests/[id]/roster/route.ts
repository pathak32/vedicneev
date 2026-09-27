import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";

// Reads/writes live DB state on every request — never cache or statically
// collect this route.
export const dynamic = "force-dynamic";

/** A plausible 10-digit phone number — loose on purpose (no country-code/leading-zero rules enforced). */
const PHONE_RE = /^\d{10}$/;

/** All roster entries for this batch, for the Roster editor UI. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const entries = await prisma.testBatchRosterEntry.findMany({
    where: { testBatchId: testBatch.id },
    orderBy: { sequenceNumber: "asc" },
    select: {
      id: true,
      rollNumber: true,
      studentName: true,
      parentName: true,
      parentPhone: true,
      parentEmail: true,
    },
  });

  return NextResponse.json({ entries });
}

interface RosterPatchEntry {
  id?: unknown;
  studentName?: unknown;
  parentName?: unknown;
  parentPhone?: unknown;
  parentEmail?: unknown;
}

/**
 * Bulk-updates a set of roster rows' editable contact fields from the
 * Roster editor UI. Rejects the whole request with a 400 naming the
 * offending row rather than silently dropping a bad field — simpler to
 * implement correctly than a partial-apply-and-report scheme, and this
 * form is small/manual entry so an admin fixing one row and resubmitting
 * is not a burden.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let body: { entries?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.entries)) {
    return NextResponse.json({ error: '"entries" is required — an array of roster row updates.' }, { status: 400 });
  }

  const updates: { id: string; data: Record<string, string | null> }[] = [];

  for (const raw of body.entries as RosterPatchEntry[]) {
    if (typeof raw.id !== "string" || !raw.id) {
      return NextResponse.json({ error: "Every entry needs a valid roster row id." }, { status: 400 });
    }

    const data: Record<string, string | null> = {};

    if (raw.studentName !== undefined) {
      if (raw.studentName !== null && typeof raw.studentName !== "string") {
        return NextResponse.json({ error: `Row ${raw.id}: studentName must be a string.` }, { status: 400 });
      }
      data.studentName = raw.studentName === null ? null : raw.studentName.trim() || null;
    }

    if (raw.parentName !== undefined) {
      if (raw.parentName !== null && typeof raw.parentName !== "string") {
        return NextResponse.json({ error: `Row ${raw.id}: parentName must be a string.` }, { status: 400 });
      }
      data.parentName = raw.parentName === null ? null : raw.parentName.trim() || null;
    }

    if (raw.parentPhone !== undefined) {
      if (raw.parentPhone !== null && typeof raw.parentPhone !== "string") {
        return NextResponse.json({ error: `Row ${raw.id}: parentPhone must be a string.` }, { status: 400 });
      }
      const trimmed = raw.parentPhone === null ? "" : raw.parentPhone.trim();
      if (trimmed && !PHONE_RE.test(trimmed)) {
        return NextResponse.json(
          { error: `Row ${raw.id}: parentPhone must be a 10-digit phone number.` },
          { status: 400 }
        );
      }
      data.parentPhone = trimmed || null;
    }

    if (raw.parentEmail !== undefined) {
      if (raw.parentEmail !== null && typeof raw.parentEmail !== "string") {
        return NextResponse.json({ error: `Row ${raw.id}: parentEmail must be a string.` }, { status: 400 });
      }
      data.parentEmail = raw.parentEmail === null ? null : raw.parentEmail.trim() || null;
    }

    if (Object.keys(data).length > 0) {
      updates.push({ id: raw.id, data });
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  // Individual `update` calls (not `updateMany`) — each row carries its own
  // distinct set of changed fields, and this batch is at most a couple
  // thousand rows (MAX_TOTAL_STUDENTS), well within a single transaction.
  await prisma.$transaction(
    updates.map((u) =>
      prisma.testBatchRosterEntry.update({
        where: { id: u.id, testBatchId: testBatch.id },
        data: u.data,
      })
    )
  );

  return NextResponse.json({ ok: true, updated: updates.length });
}

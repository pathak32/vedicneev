import { prisma } from "@vedicneev/db";
import type { OmrSheetEvaluationSummary } from "@vedicneev/engine";

export interface StudentResult {
  rosterEntryId: string;
  rollNumber: string;
  studentName: string | null;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  invalidCount: number;
  totalQuestions: number;
  percent: number;
}

export interface BatchNode {
  id: string;
  batchName: string;
  testCode: string;
  totalStudents: number;
  totalQuestions: number;
  appeared: number;
  averagePercent: number;
  students: StudentResult[];
}

export interface ClassNode {
  classLevel: string;
  batches: BatchNode[];
}

export interface SubjectNode {
  subject: string;
  classes: ClassNode[];
}

export interface BranchNode {
  branchId: string | null;
  branchName: string;
  subjects: SubjectNode[];
}

/**
 * Builds the director's Control Room tree — branch -> subject -> class ->
 * batch -> student — by aggregating live TestBatch + GRADED OmrUpload rows
 * in memory rather than in SQL, since a graded score lives inside
 * OmrUpload.gradingResult's JSON blob (see that column's own schema
 * comment) and Prisma can't aggregate a JSON path server-side. Fine at
 * this scale (one institute's own batches); revisit if that ever stops
 * being true.
 */
export async function buildControlRoomData(instituteId: string): Promise<BranchNode[]> {
  const batches = await prisma.testBatch.findMany({
    where: { instituteId },
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  });

  const uploads = await prisma.omrUpload.findMany({
    where: { testBatch: { instituteId }, status: "GRADED" },
    select: {
      testBatchId: true,
      rosterEntryId: true,
      gradingResult: true,
      rosterEntry: { select: { rollNumber: true, studentName: true } },
    },
  });

  const uploadsByBatch = new Map<string, typeof uploads>();
  for (const upload of uploads) {
    if (!upload.rosterEntryId || !upload.rosterEntry) continue;
    const list = uploadsByBatch.get(upload.testBatchId) ?? [];
    list.push(upload);
    uploadsByBatch.set(upload.testBatchId, list);
  }

  const branchMap = new Map<string, BranchNode>();

  for (const batch of batches) {
    const branchKey = batch.branchId ?? "__unassigned__";
    let branchNode = branchMap.get(branchKey);
    if (!branchNode) {
      branchNode = { branchId: batch.branchId, branchName: batch.branch?.name ?? "Unassigned", subjects: [] };
      branchMap.set(branchKey, branchNode);
    }

    const subjectName = batch.subject?.trim() || "Unspecified subject";
    let subjectNode = branchNode.subjects.find((s) => s.subject === subjectName);
    if (!subjectNode) {
      subjectNode = { subject: subjectName, classes: [] };
      branchNode.subjects.push(subjectNode);
    }

    const classLevel = batch.classLevel?.trim() || "Unspecified class";
    let classNode = subjectNode.classes.find((c) => c.classLevel === classLevel);
    if (!classNode) {
      classNode = { classLevel, batches: [] };
      subjectNode.classes.push(classNode);
    }

    const batchUploads = uploadsByBatch.get(batch.id) ?? [];
    const students: StudentResult[] = batchUploads
      .map((upload): StudentResult => {
        const result = upload.gradingResult as unknown as OmrSheetEvaluationSummary | null;
        const correctCount = result?.correctCount ?? 0;
        const incorrectCount = result?.incorrectCount ?? 0;
        const unattemptedCount = result?.unattemptedCount ?? 0;
        const invalidCount = result?.invalidCount ?? 0;
        return {
          rosterEntryId: upload.rosterEntryId!,
          rollNumber: upload.rosterEntry!.rollNumber,
          studentName: upload.rosterEntry!.studentName,
          correctCount,
          incorrectCount,
          unattemptedCount,
          invalidCount,
          totalQuestions: batch.totalQuestions,
          percent: batch.totalQuestions > 0 ? (correctCount / batch.totalQuestions) * 100 : 0,
        };
      })
      .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true }));

    const appeared = students.length;
    const averagePercent = appeared > 0 ? students.reduce((sum, s) => sum + s.percent, 0) / appeared : 0;

    classNode.batches.push({
      id: batch.id,
      batchName: batch.batchName,
      testCode: batch.testCode,
      totalStudents: batch.totalStudents,
      totalQuestions: batch.totalQuestions,
      appeared,
      averagePercent,
      students,
    });
  }

  return Array.from(branchMap.values());
}

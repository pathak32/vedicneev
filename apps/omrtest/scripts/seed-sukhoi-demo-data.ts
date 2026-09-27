/**
 * One-off script: populates the Sukhoi Academy demo institute's existing
 * "Sukhoi Demo — Class 6 Maths" TestBatch with real questions (6 pulled
 * from the existing JNVST Question bank, 2 hand-written where no clean
 * topic match exists), an answer key, and 10 synthetic-but-realistic
 * GRADED OmrUploads + their TestBatchMistake rows — so every chart added
 * this session (Control Room donut/bar charts, Mistake Vault blind-spot
 * chart, dashboard metrics) has real data to show in a client demo.
 *
 * No images/CV involved: calls the exact same evaluateOmrSheet() and
 * recordMistakesForGrading() the real upload pipeline uses, just fed
 * hand-built "what the student marked" data instead of a scanned photo —
 * see apps/omrtest/app/api/tests/[id]/upload/route.ts for the real path
 * this mirrors.
 *
 * Run once: npx tsx apps/omrtest/scripts/seed-sukhoi-demo-data.ts
 * Safe to re-run: deletes and recreates this batch's own question items,
 * uploads, and mistakes each time (never touches any other batch/institute).
 */
import { prisma } from "@vedicneev/db";
import {
  evaluateOmrSheet,
  DEFAULT_MARKING_SCHEME,
  type BubbleOption,
  type OmrQuestionScan,
  type OmrAnswerKeyEntry,
} from "@vedicneev/engine";
import { recordMistakesForGrading } from "../src/lib/tests/recordMistakes";

const TEST_BATCH_ID = "cmujc9sm20009g7z03lvvh4fr";

const SUBSECTIONS = {
  speedTimeDistance: "cmujar41c000c720t2vw6auma",
  percentage: "cmujar2cx0004720toxn6kcv4",
  fractionsDecimals: "cmujar1xp0002720txxjkuyjh",
  profitLoss: "cmujar37s0008720tfxz5ibtu",
  ratioProportion: "cmujar3m9000a720trt4cyhq9",
  areaPerimeter: "cmujar4fr000e720tb5bcjxp0",
  lcmHcf: "cmujar4uu000g720t5uaig08a",
  simplification: "cmujar2ru0006720thn9z3ns7",
};

interface DemoQuestion {
  questionNumber: number;
  text: string;
  options: Record<BubbleOption, string>;
  correctOption: BubbleOption;
  subsectionId: string;
}

// Q1/Q2/Q8 are hand-written (no clean topic match in the existing bank for
// plain "Speed/Time/Distance" word problems, pure "Percentage", or
// "Simplification"); Q3-Q7 are real questions pulled from the existing
// ~1400-question JNVST bank (packages/db's Question model, arithmetic
// section), reworded not at all — same text/options/correct answer as seeded.
const QUESTIONS: DemoQuestion[] = [
  {
    questionNumber: 1,
    text: "A car travels 150 km in 3 hours. What is its average speed?",
    options: { A: "40 km/hr", B: "45 km/hr", C: "50 km/hr", D: "55 km/hr" },
    correctOption: "C",
    subsectionId: SUBSECTIONS.speedTimeDistance,
  },
  {
    questionNumber: 2,
    text: "What is 15 percent of 480?",
    options: { A: "62", B: "66", C: "70", D: "72" },
    correctOption: "D",
    subsectionId: SUBSECTIONS.percentage,
  },
  {
    // From the Question bank: id cmtos7w5e018rnvyydvb1aksa (topic "Fractions & Decimals")
    questionNumber: 3,
    text: "Convert the fraction 1/4 to a decimal.",
    options: { A: "4", B: "0.25", C: "2.5", D: "0.35" },
    correctOption: "B",
    subsectionId: SUBSECTIONS.fractionsDecimals,
  },
  {
    // From the Question bank: id cmtos85x301aznvyymvejtfur (topic "Profit, Loss & Simple Interest")
    questionNumber: 4,
    text: "A shopkeeper buys an item for ₹200 and wants to make a profit of 10%. At what price should they sell it?",
    options: { A: "₹20", B: "₹220", C: "₹180", D: "₹230" },
    correctOption: "B",
    subsectionId: SUBSECTIONS.profitLoss,
  },
  {
    // From the Question bank: id cmtpb0sw0008xvnu5m5bak4co (topic "Averages, Ratio & Percentage")
    questionNumber: 5,
    text: "₹60 is divided between A and B in the ratio 2:3. How much does A get?",
    options: { A: "24", B: "36", C: "12", D: "26" },
    correctOption: "A",
    subsectionId: SUBSECTIONS.ratioProportion,
  },
  {
    // From the Question bank: id cmtos8fp401d7nvyylhprq7xa (topic "Area, Perimeter & Volume")
    questionNumber: 6,
    text: "Find the area of a rectangle with length 12 units and width 7 units.",
    options: { A: "38 sq. units", B: "84 sq. units", C: "19 sq. units", D: "96 sq. units" },
    correctOption: "B",
    subsectionId: SUBSECTIONS.areaPerimeter,
  },
  {
    // From the Question bank: id cmtos7md6016jnvyy7vx4sdl9 (topic "Factors, HCF & LCM")
    questionNumber: 7,
    text: "What is the LCM (Lowest Common Multiple) of 4 and 6?",
    options: { A: "24", B: "12", C: "16", D: "6" },
    correctOption: "B",
    subsectionId: SUBSECTIONS.lcmHcf,
  },
  {
    questionNumber: 8,
    text: "Simplify: 8 + 4 x 2 - 6",
    options: { A: "10", B: "12", C: "14", D: "16" },
    correctOption: "A",
    subsectionId: SUBSECTIONS.simplification,
  },
];

const ANSWER_KEY: OmrAnswerKeyEntry[] = QUESTIONS.map((q) => ({
  questionNumber: q.questionNumber,
  correctOption: q.correctOption,
}));

// Deliberately weighted so Q5 (Ratio & Proportion) and Q7 (LCM & HCF) are
// commonly wrong across the class — a believable "conceptual blind spot"
// for the Mistake Vault / Control Room subsection charts to surface, while
// Q1/Q3/Q6 stay near-universal strengths. Each row is Q1..Q8; `[]` = left
// unattempted, a 2-letter array = an invalid multiple-fill.
const STUDENT_MARKS: BubbleOption[][][] = [
  [["C"], ["D"], ["B"], ["B"], ["A"], ["B"], ["B"], ["A"]], // 01: 8/8
  [["C"], ["D"], ["B"], ["B"], ["A"], ["B"], ["A"], ["A"]], // 02: 7/8
  [["C"], ["D"], ["B"], ["B"], ["B"], ["B"], ["B"], ["A"]], // 03: 7/8
  [["C"], ["D"], ["B"], ["B"], ["B"], ["B"], ["A"], ["A"]], // 04: 6/8
  [["C"], ["D"], ["B"], ["C"], ["A"], ["B"], ["A"], ["A"]], // 05: 6/8
  [["C"], ["D"], ["B"], ["C"], ["B"], ["B"], ["A"], ["A"]], // 06: 5/8
  [["C"], ["B"], ["B"], ["C"], ["B"], ["B"], ["A"], ["A"]], // 07: 4/8
  [["C"], ["B"], ["B"], ["C"], ["B"], ["B"], ["A"], ["B"]], // 08: 3/8
  [["C"], ["B"], ["C"], ["C"], ["B"], ["B"], ["A"], ["B"]], // 09: 2/8
  [["C"], ["B"], [], ["C"], ["B"], ["B"], ["A"], ["A", "B"]], // 10: 2/8 (+1 unattempted, +1 invalid)
];

async function main() {
  const rosterEntries = await prisma.testBatchRosterEntry.findMany({
    where: { testBatchId: TEST_BATCH_ID },
    orderBy: { sequenceNumber: "asc" },
  });
  if (rosterEntries.length !== STUDENT_MARKS.length) {
    throw new Error(`Expected ${STUDENT_MARKS.length} roster entries, found ${rosterEntries.length}. Aborting.`);
  }

  const storedAnswerKey: Record<string, BubbleOption> = {};
  for (const q of QUESTIONS) storedAnswerKey[String(q.questionNumber)] = q.correctOption;
  const masterQuestions = QUESTIONS.map((q) => ({
    questionNumber: q.questionNumber,
    correctOption: q.correctOption,
    text: q.text,
    options: q.options,
  }));

  await prisma.$transaction(
    async (tx) => {
    // --- Questions + answer key (mirrors questions/save/route.ts's base-paper path) ---
    await tx.testBatchQuestionItem.deleteMany({ where: { testBatchId: TEST_BATCH_ID, setCode: null } });
    await tx.testBatchQuestionItem.createMany({
      data: QUESTIONS.map((q) => ({
        testBatchId: TEST_BATCH_ID,
        setCode: null,
        questionNumber: q.questionNumber,
        text: q.text,
        optionA: q.options.A,
        optionB: q.options.B,
        optionC: q.options.C,
        optionD: q.options.D,
        correctOption: q.correctOption,
        subsectionId: q.subsectionId,
      })),
    });
    await tx.testBatch.update({
      where: { id: TEST_BATCH_ID },
      data: {
        answerKey: storedAnswerKey,
        masterQuestions,
        answerKeyConfirmedAt: new Date(),
      },
    });

    // --- Clear any previous seed run's uploads/mistakes/ledger rows for this batch ---
    await tx.testBatchMistake.deleteMany({ where: { rosterEntry: { testBatchId: TEST_BATCH_ID } } });
    await tx.omrUpload.deleteMany({ where: { testBatchId: TEST_BATCH_ID } });
    await tx.instituteCreditLedger.deleteMany({ where: { testBatchId: TEST_BATCH_ID } });
    await tx.testBatchRosterEntry.updateMany({ where: { testBatchId: TEST_BATCH_ID }, data: { consumedAt: null } });

    const instituteId = (await tx.testBatch.findUniqueOrThrow({ where: { id: TEST_BATCH_ID } })).instituteId;

    for (let i = 0; i < rosterEntries.length; i++) {
      const rosterEntry = rosterEntries[i]!;
      const marks = STUDENT_MARKS[i]!;
      const scans: OmrQuestionScan[] = marks.map((markedOptions, idx) => ({
        questionNumber: idx + 1,
        markedOptions,
      }));

      const grading = evaluateOmrSheet(scans, ANSWER_KEY, DEFAULT_MARKING_SCHEME);

      const upload = await tx.omrUpload.create({
        data: {
          testBatchId: TEST_BATCH_ID,
          rosterEntryId: rosterEntry.id,
          imageUrl: `demo-seed://sukhoi/${rosterEntry.rollNumber}`,
          imageHash: `demo-seed-${rosterEntry.rollNumber}`,
          status: "GRADED",
          detectedScans: scans as unknown as object,
          detectedSetCode: null,
          gradingResult: grading as unknown as object,
          creditConsumed: true,
        },
      });

      await tx.testBatchRosterEntry.update({ where: { id: rosterEntry.id }, data: { consumedAt: new Date() } });

      await recordMistakesForGrading(tx, {
        testBatchId: TEST_BATCH_ID,
        rosterEntryId: rosterEntry.id,
        omrUploadId: upload.id,
        grading,
        detectedSetCode: null,
        setMappings: null,
      });

      await tx.instituteCreditLedger.create({
        data: { instituteId, delta: -1, reason: "SCAN_CONSUMED", testBatchId: TEST_BATCH_ID, omrUploadId: upload.id },
      });

      console.log(
        `${rosterEntry.rollNumber}: ${grading.correctCount}/${QUESTIONS.length} correct (${((grading.correctCount / QUESTIONS.length) * 100).toFixed(1)}%)`
      );
    }
    },
    { timeout: 30000 }
  );

  console.log("\nDone — Sukhoi Demo batch now has 8 real questions, a confirmed answer key, and 10 graded uploads.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

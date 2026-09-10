import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Genuine JNVST/AISSEE-style mental-ability and speed-arithmetic items —
// short enough to answer inside the widget's 10-second window, matching
// what these boards actually test (see ExamTracksHub's section breakdown).
const QUESTIONS: { question: string; options: string[]; correct: number; topic: string }[] = [
  { question: "What is 25 × 11?", options: ["255", "275", "265", "285"], correct: 1, topic: "Vedic Speed Math" },
  { question: "What is 19 × 19 (square of a number ending in 9)?", options: ["351", "361", "371", "381"], correct: 1, topic: "Vedic Speed Math" },
  { question: "Complete the series: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], correct: 2, topic: "Number Series" },
  { question: "If CAT is coded as DBU, how is DOG coded?", options: ["EPH", "EPI", "FPH", "EQH"], correct: 0, topic: "Coding-Decoding" },
  { question: "Find the odd one out: Triangle, Square, Circle, Cube", options: ["Triangle", "Square", "Circle", "Cube"], correct: 3, topic: "Classification" },
  { question: "A train 100m long crosses a pole in 10 seconds. What is its speed?", options: ["10 m/s", "36 km/h", "Both A and B", "20 m/s"], correct: 2, topic: "Speed Calculation" },
  { question: "What is 105 × 108 using the Nikhilam base-100 method?", options: ["11240", "11340", "11440", "11140"], correct: 2, topic: "Vedic Speed Math" },
  { question: "Which number replaces the '?': 5, 10, 20, 40, ?", options: ["60", "70", "80", "90"], correct: 2, topic: "Number Series" },
  { question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°", "7.5°", "15°", "30°"], correct: 1, topic: "Mental Ability" },
  { question: "What is the next figure in a sequence rotating 90° clockwise each step, starting from an upward arrow?", options: ["Right arrow", "Down arrow", "Left arrow", "Up arrow"], correct: 0, topic: "Figure Series" },
];

async function main() {
  console.log(`Seeding ${QUESTIONS.length} Speed Challenge questions...`);
  for (const q of QUESTIONS) {
    const existing = await prisma.speedChallengeQuestion.findFirst({ where: { question: q.question } });
    if (existing) {
      console.log(`  skip (already exists): ${q.question}`);
      continue;
    }
    await prisma.speedChallengeQuestion.create({ data: q });
    console.log(`  created: ${q.question}`);
  }
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

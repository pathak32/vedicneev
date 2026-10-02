import { PrismaClient, type ContentBlockBrand, type ContentBlockCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Batch 3 of the LinkedIn story library. Same rules as batches 1-2: stories
// are framed as illustrations ("Imagine...") or addressed to the reader,
// never as a personal event that did not happen. Product statements are
// limited to behaviour that exists in the apps (append-only credit ledger,
// rejected scans never use a credit, sheets can be printed before the answer
// key exists, per-student sheet tokens, three mistake categories). Every
// maths example was checked by hand. Lint rejects banned buzzwords and em
// dashes before anything is written.
interface SeedBlock {
  brand: ContentBlockBrand;
  category: ContentBlockCategory;
  hookText: string;
  bodyContent: string;
  ctaText: string;
}

const NEEV = "VEDIC_NEEV" as const;
const MIND = "VEDIC_MIND" as const;
const AUTO = "INSTITUTIONAL_AUTOMATION" as const;
const COG = "COGNITIVE_MASTERY" as const;
const MATH = "VEDIC_MATH" as const;
const PREP = "EXAM_PREPARATION" as const;

const BLOCKS: SeedBlock[] = [
  // ── VedicNeev: product design and institute operations ──────────────
  {
    brand: NEEV,
    category: AUTO,
    hookText: "We never edit a balance. We add a correcting line.",
    bodyContent:
      "Imagine a billing dispute. A scan was counted twice and the institute asks: where did my credits go?\n\nIf a system just overwrites a number, the answer is \"trust us\". If it records every grant and every use as its own line, the answer is a list you can read together.\n\nThat is how we track grading credits. Every grant, every use, every refund is a separate line. A mistake is fixed by adding a new line, not by erasing the old one.\n\nBoring accounting. It is also what makes a dispute short.",
    ctaText: "How do you track what your institute has paid for and used?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "A blurry photo should not cost you a credit.",
    bodyContent:
      "Imagine a teacher scanning 80 sheets in a hurry. Three of them come out blurry.\n\nIn our system a sheet that cannot be read is rejected, and a rejected sheet does not use up a credit. You re-scan and try again.\n\nIt sounds small. But nobody should pay for a result they did not get.\n\nBuild the rule around the teacher's worst Tuesday, not the demo.",
    ctaText: "What is the most annoying thing a tool has ever charged you for?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Print the sheets today. Decide the answer key next week.",
    bodyContent:
      "Imagine an institute that finalises its answer key only after a faculty meeting the night before the test.\n\nMost tools force the key first. We let you generate and print sheets before the key exists, then add the key when you are ready. The marked answers can be graded once it arrives.\n\nSoftware should follow how an institute works, not the other way round.",
    ctaText: "When does your answer key get final: before, during or after the test?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "One roll number is not enough.",
    bodyContent:
      "Roll number 14 in Batch A and roll number 14 in Batch B are two different children.\n\nIf a sheet carries only a roll number, a mix-up is one pile away. Ours carries the roll number and a unique token, so a sheet always points to exactly one student in exactly one test.\n\nIt is the kind of detail nobody praises. Everyone notices when it is missing.",
    ctaText: "Ever mixed up two students' sheets? How did you catch it?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "What 10 free credits are actually for.",
    bodyContent:
      "Not for a demo. For one honest experiment.\n\nPick a real test. Let your students take it as usual. Scan the sheets. Look at what comes out: scores, section-wise analysis, mistakes by type.\n\nThen ask yourself one question: did this give me anything I did not already have?\n\nIf yes, we should talk. If no, you have lost nothing but an hour.",
    ctaText: "Run a JNVST, Sainik or RMS batch? Comment \"TRIAL\" and I will send the steps.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "The Monday morning note.",
    bodyContent:
      "Imagine every Monday, each student gets a short note: their top two weak topics, and one thing they did well.\n\nNot a rank list. A note.\n\nAn institute that can say \"we noticed your child\" has something that is hard to copy. People stay where they feel seen.\n\nThe only hard part is time. That is the part we try to remove.",
    ctaText: "What would your Monday note say about your weakest batch?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Every wrong answer has one of three stories.",
    bodyContent:
      "Careless: the child knew it and slipped.\nCalculation: the idea was right, the arithmetic was not.\nConcept: the idea itself was missing.\n\nEach one needs a different fix. Rushed slips need a slower routine. Calculation gaps need checking drills. Concept gaps need a teacher.\n\nTreating all three the same is why so much extra practice does not work.\n\nThat is why our Mistake Vault sorts every wrong answer into one of these three.",
    ctaText: "Which of the three do you see most in your batch?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "The 4 numbers worth tracking after every mock test.",
    bodyContent:
      "1. Accuracy: right answers out of the ones attempted.\n2. Attempt rate: how many questions were tried.\n3. Time per question, section by section.\n4. Repeat mistakes: the same error twice.\n\nA total score blends all four into one number and hides the story.\n\nTrack the four and you will know what to teach on Monday.",
    ctaText: "Which of the four do you track today? Which one is missing?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Your institute's best marketing is a good Monday.",
    bodyContent:
      "Imagine a parent who gets one thing a week from you that is specific to their child.\n\nNot a poster. Not a banner. A note, a number, a plan.\n\nIt costs little. It gets talked about at the school gate, which is where many admissions in a small town are decided.\n\nWord of mouth is just good Mondays, repeated.",
    ctaText: "What is the one thing your happiest parents say about you to others?",
  },
  // ── VedicNeev: exam preparation and school choice ───────────────────
  {
    brand: NEEV,
    category: PREP,
    hookText: "Day boarding or hostel? Parents ask. Institutes should be ready.",
    bodyContent:
      "Imagine a parent comparing a day-boarding school with a hostel school. They are not only comparing fees. They are comparing how much time their child spends at home, in what routine, and with whom.\n\nInstitutes that prepare students for entrance exams get this question in some form, again and again.\n\nA clear, honest answer builds more trust than a sales pitch: what each option gives, what it asks of the family, and who it suits.\n\nIf you cannot answer it, say so and find out. Parents notice.",
    ctaText: "What do parents ask you most about school choice?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Before you plan prep for a school entrance test, check three things.",
    bodyContent:
      "1. Whether the school runs its own entrance test or accepts a common one.\n\n2. The class and age cut-offs for the year you are applying.\n\n3. What the written test covers, and what comes after it, such as an interview.\n\nAll three are published by the school each year. None of them should come from a forwarded message.\n\nStart prep after you have the facts. Otherwise you may be training for the wrong paper.",
    ctaText: "Which school are your students aiming for? Tell me and I will cover its prep.",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Two weeks before an entrance exam: a calm checklist.",
    bodyContent:
      "1. One full paper, timed, every other day.\n\n2. Review only the mistakes, not the whole paper.\n\n3. Revise formulas and rules for ten minutes daily.\n\n4. Fix the sleep schedule now, not the night before.\n\n5. Pack the admit card and pencils the evening before.\n\nNothing new in the last two weeks. Only sharpen what already exists.",
    ctaText: "What would you add to this list?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "A question with two good answers is a lesson, not a problem.",
    bodyContent:
      "Imagine a child who gives an answer different from the key, with a reason that makes sense.\n\nA good teacher stops and looks. Sometimes the key is wrong. Sometimes the child found another path. Either way, there is something to learn.\n\nA system that only checks \"match or not\" misses these moments. The best institutes still keep a human who looks.",
    ctaText: "When did a student last prove your answer key wrong?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Why a child should attempt the easy questions first.",
    bodyContent:
      "Imagine a child who gets stuck on question 4, spends six minutes there, and never reaches the questions at the end that they could have solved in one minute each.\n\nOrder matters. First pass: take every question you are sure about. Second pass: the medium ones. Third pass: the hard ones, if time is left.\n\nIt feels slower. It scores higher.",
    ctaText: "How do you teach the three-pass approach in your batches?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "The notes that make a ten-year-old sit down on their own.",
    bodyContent:
      "Imagine notes with one idea per page, a hand-drawn figure, a worked example and a tiny \"try this\" at the bottom.\n\nNo walls of text. No jargon. A child can read it in three minutes and feel they understood something.\n\nThat feeling is the real product. Everything else is formatting.",
    ctaText: "What do you wish your notes had more of? Comment \"NOTES\" for a sample page.",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Sample paper, near-full marks, still not ready.",
    bodyContent:
      "Imagine a child who scores 38 out of 40 on a sample paper in a quiet room at home.\n\nThen sits in a hall with 300 strangers, a ticking clock and an unfamiliar sheet. The score drops.\n\nThe skill was real. The setting was new.\n\nSo rehearse the setting too: a timer, a printed OMR sheet, a pencil, no help. That is what a mock test is really for.",
    ctaText: "How do you recreate exam conditions for your batch?",
  },
  // ── Vedic Mind AI: cognitive mastery ────────────────────────────────
  {
    brand: MIND,
    category: COG,
    hookText: "Boredom is not laziness.",
    bodyContent:
      "Imagine a child who rushes through easy sums and then daydreams. The teacher writes \"careless\" in the notebook.\n\nBut the child may be under-challenged, not careless. The sums were too small for them.\n\nGive one harder question at the end. Watch what happens to the attention.",
    ctaText: "Does your child lose interest when the work is too easy?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Sleep is a study tool.",
    bodyContent:
      "Imagine two children who studied the same two hours. One slept eight hours, the other five.\n\nSleep is when the brain sorts what it learned. Cut it short and part of the evening's work never settles.\n\nBefore buying another workbook, check the bedtime.",
    ctaText: "What time does your child's last screen switch off?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "A small win beats a big goal.",
    bodyContent:
      "A child told \"score 90\" sees a mountain. A child told \"beat yesterday's 12 by one\" sees a step.\n\nSmall targets make the next try feel possible. And possible is when effort shows up.\n\nSet one step for tomorrow, not a mountain for March.",
    ctaText: "What is tomorrow's one step for your child?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Ask your child to explain this week's topic to a toy.",
    bodyContent:
      "Out loud. Ninety seconds. A stuffed toy is a patient audience.\n\nWhen the child gets stuck while explaining, you have found the exact gap, without a single test.\n\nTeaching is the fastest way to find out what you actually understand.",
    ctaText: "Try it tonight and tell me where your child got stuck.",
  },
  // ── Vedic Mind AI: Vedic maths ──────────────────────────────────────
  {
    brand: MIND,
    category: MATH,
    hookText: "The multiply-by-11 trick works on three-digit numbers too.",
    bodyContent:
      "Take 123 x 11. Write the first digit, then add each pair of neighbours, then write the last digit.\n\n1 | 1+2 | 2+3 | 3 gives 1, 3, 5, 3. Answer: 1353.\n\nIf a pair adds past 9, carry the 1 to the left. 256 x 11: 2 | 7 | 11 | 6 becomes 2, 8, 1, 6. Answer: 2816.",
    ctaText: "Try 342 x 11.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Check any multiplication in 3 seconds with digit sums.",
    bodyContent:
      "Take 34 x 27 = 918.\n\nAdd the digits of each number down to one digit: 34 gives 7, 27 gives 9. Multiply those: 7 x 9 = 63, which gives 9.\n\nNow do the same to the answer: 918 gives 18, which gives 9. They match, so the answer is probably right.\n\nIt cannot prove a result correct, but a mismatch proves it is wrong. A cheap check that catches careless slips.",
    ctaText: "Check 46 x 23 = 1058 this way. Is it right?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Percentages without a calculator: start with 10%.",
    bodyContent:
      "15% of 80: 10% is 8, 5% is half of that, which is 4. Together: 12.\n\n35% of 60: 10% is 6, so 30% is 18, and 5% is 3. Together: 21.\n\nBreak a percentage into pieces you can see.",
    ctaText: "What is 15% of 240?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Dividing by 5 is easier than it looks.",
    bodyContent:
      "Double the number, then divide by 10.\n\n135 / 5: double 135 is 270, divide by 10 gives 27.\n425 / 5: 850 / 10 gives 85.\n\nSame family as the multiply-by-5 trick. 5 is just half of 10.",
    ctaText: "Try 365 / 5.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Squaring numbers near 100 in two moves.",
    bodyContent:
      "Take 103. It is 3 above 100.\n\nMove 1: add the gap to the number. 103 + 3 = 106.\nMove 2: square the gap. 3 x 3 = 09.\n\nAnswer: 10609.\n\nFor 98, the gap is 2 below: 98 - 2 = 96, and 2 x 2 = 04. Answer: 9604.",
    ctaText: "Try 104 squared.",
  },
];

const BANNED = /delve|revolution|synerg|paradigm|leverage|testament|beacon|landscape|game.?changer|unlock|journey/i;

async function main() {
  console.log(`Seeding ${BLOCKS.length} story blocks...`);
  for (const block of BLOCKS) {
    const all = `${block.hookText} ${block.bodyContent} ${block.ctaText}`;
    if (BANNED.test(all)) throw new Error(`Banned word in: ${block.hookText}`);
    if (all.includes("—")) throw new Error(`Em dash in: ${block.hookText}`);

    const existing = await prisma.contentBlock.findFirst({ where: { hookText: block.hookText } });
    if (existing) {
      console.log(`  skip: ${block.hookText.slice(0, 55)}`);
      continue;
    }
    await prisma.contentBlock.create({ data: block });
    console.log(`  created [${block.brand}/${block.category}]: ${block.hookText.slice(0, 50)}`);
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

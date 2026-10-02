import { PrismaClient, type ContentBlockBrand, type ContentBlockCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Batch 2 of the LinkedIn story library. Same rules as batch 1: stories are
// framed as illustrations ("Imagine...") or addressed to the reader, never as
// a personal event that did not happen; product claims stay within what the
// apps really do; every maths example is checked; lint rejects banned
// buzzwords and em dashes before anything is written.
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
  // ── VedicNeev: exam preparation ─────────────────────────────────────
  {
    brand: NEEV,
    category: PREP,
    hookText: "A mock test is only as good as the questions in it.",
    bodyContent:
      "Imagine a paper where half the questions can be guessed by elimination. Students score 70, feel ready, and walk into the real exam to find questions that do not behave like that.\n\nA practice paper is a rehearsal. If the rehearsal is easier than the show, nobody is ready.\n\nGood question banks are built the other way round: a spread of easy, medium and hard, topic by topic, so the weak spots show up before the exam does.",
    ctaText: "What makes a practice question good, in your view? Tell me below.",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Why handwritten-style notes still matter for a Class 6 child.",
    bodyContent:
      "A typed page looks finished. A handwritten page looks like someone is explaining it to you.\n\nFor a ten-year-old, that difference matters. Handwriting shows the steps in the order a person would think them: the crossing out, the arrow, the little box around the answer.\n\nThat is why we keep a handwritten feel in our study notes instead of turning everything into slides.\n\nNotes should feel like a patient older sibling, not a textbook.",
    ctaText: "Comment \"NOTES\" for a sample page.",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "An entrance paper often rewards the calmer child more than the child who knows more.",
    bodyContent:
      "Imagine two children. One knows every topic but panics when a question looks unfamiliar. The other knows a little less but reads each question twice and takes the easy marks first.\n\nOn exam day, the second one often wins. Not because they are cleverer. Because they have a routine.\n\nA routine is teachable: read, mark the easy ones, return, check the bubbles.\n\nThat is where a good mock test earns its place. It rehearses the routine, not just the content.",
    ctaText: "What routine do your students follow in the first five minutes of a paper?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Sample papers are not for scoring. They are for finding the leak.",
    bodyContent:
      "Imagine a bucket with a small hole. You can keep pouring water in, or you can find the hole.\n\nA sample paper does the second job. Not \"what did I score\", but \"where did the marks leak\": time, careless slips, one topic, one type of question.\n\nTake the same kind of paper twice, a week apart. If the leak is the same, the problem is not effort. It is method.\n\nThat shift, from score to leak, is the whole point.",
    ctaText: "Which leak shows up most for your students: time, careless slips or one topic?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Sainik School, RMS, JNVST. Same child, three different papers.",
    bodyContent:
      "Parents often group them as \"the entrance exams\". Teachers know they are not the same.\n\nPatterns, weightage and the feel of the paper differ from board to board and from year to year. A child ready for one is not automatically ready for another.\n\nSo the first job of any prep plan is boring and essential: read the current official notification and pattern for the exam your student is targeting. Everything else sits on top of that.\n\nTemplate advice is cheap. Plan from the source.",
    ctaText: "Do you prepare students for more than one of these exams? How do you split the time?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "A question bank is not a pile of questions. It is a map.",
    bodyContent:
      "Imagine a map with no labels. Every road looks the same.\n\nTagging a question by topic, difficulty and the mistake it usually causes turns a pile into a path: start here, move to this, then this.\n\nA student who follows a path improves. A student handed 500 loose questions mostly gets tired.",
    ctaText: "How do you organise questions for your batches today? Spreadsheet, notebook, memory?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Why the last week before a mock test should look boring.",
    bodyContent:
      "Imagine a child who learns three new topics in the final week. On test day, none of them is solid.\n\nThe last week is for what is already learned. Short revisions. A few timed sections. Sleep.\n\nExcitement belongs in the first weeks. Calm belongs at the end.\n\nThis is boring advice. Boring advice is usually right.",
    ctaText: "What does the last week before a test look like in your institute?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Bubbles. Bubbles. Bubbles. The quiet reason good students lose marks.",
    bodyContent:
      "Imagine the child who knew every answer and shifted one row halfway down the sheet. Every answer after that is one bubble off.\n\nIt happens. Tired hands, a skipped question, a rushed finish.\n\nTwo habits cut it down: say the question number as you mark it, and spend the last two minutes checking the row-to-question match on every fifth question.\n\nSmall, dull, effective.",
    ctaText: "Ever seen a student lose marks to a shifted row? Tell me below.",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "The sample paper nobody finishes.",
    bodyContent:
      "Imagine a child who has done the first half of ten different sample papers and the full length of none.\n\nThey have started a lot. They have finished nothing. And the real exam is one long sitting.\n\nStamina is a skill. One full timed paper a week beats five half-papers.\n\nStart less. Finish more.",
    ctaText: "How many full-length papers does your student finish in a month?",
  },
  // ── VedicNeev: institutional automation ─────────────────────────────
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Your teachers are not your biggest cost. Their lost hours are.",
    bodyContent:
      "Imagine adding up every evening your best teachers spend on checking, collecting, copying and calling parents about marks.\n\nNow imagine those hours going into one extra doubt class a week.\n\nThe cost of an institute is not just rent and salaries. It is what the same people could have done with the hours that went to paperwork.\n\nAutomation is not about cutting people. It is about giving the good ones their hours back.",
    ctaText: "If you got five hours a week back, what would your team do with them?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "A parent-teacher meeting without data is a feelings meeting.",
    bodyContent:
      "Imagine ten minutes with a worried parent. You say \"he is improving\". They hear nothing.\n\nNow imagine the same ten minutes with three numbers: accuracy in arithmetic, time per question, repeat mistakes.\n\nThe conversation changes. It becomes \"let us fix this one thing\", not \"please trust me\".\n\nData does not replace the relationship. It gives the relationship something to stand on.",
    ctaText: "What do you show parents in a meeting, besides the score?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Imagine running a 20-test series with no spreadsheet.",
    bodyContent:
      "No copying marks from sheet to sheet. No merging files named final_v3. No wondering who got the wrong total.\n\nJust: test, scan, report. Next test, same.\n\nA test series is a promise to students that they will see their progress. The promise is kept in the boring details.\n\nTools should make the boring part invisible.",
    ctaText: "How many tests do you run per batch per month?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "The new teacher problem.",
    bodyContent:
      "Imagine a new teacher who joins in June. By July she is checking sheets the way her old institute did. By August the other teachers check them another way.\n\nResults that depend on who checked them are not results.\n\nA standard process protects everyone: the same answer key and the same marking rule, applied the same way every time. It protects the students, and it protects the new teacher too.",
    ctaText: "How do you keep marking consistent across teachers?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "The answer key changed after the test. Now what?",
    bodyContent:
      "Imagine the notice: question 37 had two correct options. Re-evaluate.\n\nBy hand, that means re-checking every sheet.\n\nWhen the marked answers are already stored digitally, it is one change to the key and a re-score. Same sheets, new key, a few minutes.\n\nKey mistakes happen to everyone. The difference is how painful the fix is.",
    ctaText: "When did a key change last cost your team a weekend?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Three branches, three ways of reporting results, one confused parent.",
    bodyContent:
      "Imagine a parent comparing notes with a cousin whose child studies in your other branch. The numbers do not look alike. Neither does the format.\n\nA single report format across branches is not about control. It is about trust. A parent in any branch should read the same page and understand it the same way.\n\nConsistency is a quiet brand.",
    ctaText: "Do all your branches report results the same way?",
  },
  // ── Vedic Mind AI: cognitive mastery ────────────────────────────────
  {
    brand: MIND,
    category: COG,
    hookText: "A child who \"cannot focus\" on maths can often focus on a game for an hour.",
    bodyContent:
      "Imagine a ten-year-old who cannot sit through a worksheet but plays one level for an hour.\n\nThat is not a broken attention span. It is attention with a reason.\n\nThe game gives small goals, quick feedback and a feeling of progress. A worksheet gives none of them.\n\nWhen maths borrows those three things, attention shows up on its own.",
    ctaText: "What makes your child sit still for an hour? Tell me below.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Mistakes are the cheapest teacher in the house.",
    bodyContent:
      "A wrong answer costs one mark. A wrong answer ignored costs the same mark every week.\n\nWhen a child sees a mistake as a clue, not a verdict, the mood in the room changes.\n\nTry one small ritual: a notebook with three columns. The question, what I did, what I will do next time. Five minutes on Sunday.\n\nA month of that beats a month of extra worksheets.",
    ctaText: "Would your child keep a mistake notebook? Reply YES or NO.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "The memory trick every child already uses without knowing it.",
    bodyContent:
      "Think of a phone number you know by heart. You did not memorise it digit by digit. You chunked it: 98, 765, 43210.\n\nChunking is how a small working memory holds a big problem.\n\nA child who learns to chunk numbers, steps and words gets room back inside their head.\n\nTeach chunking once and it helps in every subject.",
    ctaText: "How do you chunk a long number? Show me an example.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Why \"sit and study for two hours\" fails most ten-year-olds.",
    bodyContent:
      "Imagine a child at a desk for two hours. By minute 25 the mind has left the room, but the body is still there.\n\nShort blocks work better: 25 minutes of work, 5 minutes of movement. Repeat.\n\nIt is not lowering the standard. It is matching the work to the brain doing it.",
    ctaText: "What block length works for your child: 15, 25 or 40 minutes?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Praise the method, not the marks.",
    bodyContent:
      "Imagine two children who both score 18 out of 20. One is told \"you are so smart\". The other is told \"I liked how you checked your carry\".\n\nThe next test is harder. The first child is afraid of being found out. The second knows what to do.\n\nPraise that points at a method is a tool. Praise that points at a label is pressure.",
    ctaText: "What is one thing you praised this week that was not a score?",
  },
  // ── Vedic Mind AI: Vedic maths ──────────────────────────────────────
  {
    brand: MIND,
    category: MATH,
    hookText: "Squaring a number that ends in 5 takes about 3 seconds.",
    bodyContent:
      "Take 75. Multiply the first digit by one more than itself: 7 x 8 = 56. Put 25 at the end. 5625.\n\nTry 85: 8 x 9 = 72, then 25. 7225.\n\nWhy does it work? Because a number like 10a + 5, when squared, always ends in 25 and the front part is a x (a + 1).\n\nA rule with a reason is easy to remember.",
    ctaText: "Try 95 squared and post your answer.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Multiply by 5 by doing the easier thing first.",
    bodyContent:
      "Multiplying by 5 is multiplying by 10, then halving.\n\n48 x 5: 480 halved is 240.\n36 x 5: 360 halved is 180.\n\nNo table needed. Just a halving, which every child can do.\n\nThe trick is not memory. It is noticing that 5 is half of 10.",
    ctaText: "Do 68 x 5 in your head. Answer below.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Multiply by 9 without the 9 times table.",
    bodyContent:
      "Take 47 x 9. Think 47 x 10, then take away 47.\n\n470 - 47 = 423.\n\nSame for 63 x 9: 630 - 63 = 567.\n\nThe bigger idea: if a number sits next to a friendly number, use the friendly one and adjust.",
    ctaText: "Try 38 x 9. Post your answer.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "1000 minus any number, without borrowing.",
    bodyContent:
      "Take 1000 - 367.\n\nSubtract each digit of 367 from 9, except the last one, which you subtract from 10: 9 - 3 = 6, 9 - 6 = 3, 10 - 7 = 3.\n\nAnswer: 633.\n\nNo borrowing, no crossed-out zeros. It works because 1000 is just 999 plus 1.",
    ctaText: "Try 1000 - 458.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Squares of numbers near 50 in two steps.",
    bodyContent:
      "Take 52. It is 2 above 50.\n\nStep 1: add the gap to 25. 25 + 2 = 27. That is the front part.\nStep 2: square the gap. 2 x 2 = 04. That is the back part.\n\nAnswer: 2704.\n\nTry 47, which is 3 below 50: 25 - 3 = 22, and 3 x 3 = 09. Answer: 2209.",
    ctaText: "Try 54 squared.",
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

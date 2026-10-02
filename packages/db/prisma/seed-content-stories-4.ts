import { PrismaClient, type ContentBlockBrand, type ContentBlockCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Batch 4 of the LinkedIn story library (42 posts, completing 60 days at two
// a day). Same rules as batches 1-3: illustrations framed as "Imagine..." or
// addressed to the reader, opinions stated as opinions, product statements
// limited to behaviour that exists, every maths example checked by hand.
// Lint rejects banned buzzwords and em dashes before anything is written.
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
  // ── VedicNeev: institute operations ─────────────────────────────────
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Poll: how long does your institute take to publish test results?",
    bodyContent:
      "A. Same day\nB. 2 to 3 days\nC. A week\nD. Depends on who is checking\n\nNo wrong answer. But the answer says a lot about how fast a student can act on feedback.\n\nA result that arrives while the test is still fresh teaches. One that arrives after the next test has started is only a record.",
    ctaText: "Vote in the comments: A, B, C or D.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Three things I would automate first in a coaching institute.",
    bodyContent:
      "1. Checking and totalling marks. The most repetitive task and the most error-prone.\n\n2. Sending results to parents. The same message, 200 times.\n\n3. Attendance follow-ups.\n\nAnd three things I would never automate: the call to a worried parent, the doubt class, and the hello at the door.\n\nAutomate the paper. Keep the people.",
    ctaText: "What would you add to either list?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Faster grading does not make a better institute. What you do with the time does.",
    bodyContent:
      "Imagine two institutes that both get results in an hour. One posts a rank list and stops. The other spends the saved evening calling the five students whose scores dropped.\n\nSame tool. Different institute.\n\nSpeed is only a gift if someone uses it.",
    ctaText: "If you saved an evening a week, what is the first thing you would do with it?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "A sheet is a promise.",
    bodyContent:
      "Every OMR sheet a child fills is a small promise from the institute: your effort will be counted properly.\n\nBreak it once, with a wrong total, a lost sheet or a mix-up, and the child remembers it for a long time. Keep it a hundred times and nobody notices.\n\nThat is the strange thing about trust. It is built from boring, invisible days.",
    ctaText: "What is the smallest thing that ever cost an institute a parent's trust?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Mock test day, 8 AM to 8 PM: where the hours go.",
    bodyContent:
      "Imagine it. 8 AM: sheets handed out. 11 AM: the test ends and sheets are collected. 12 PM: counting begins. 4 PM: totals done. 6 PM: someone spots a mistake and re-adds a column. 8 PM: results typed into a sheet.\n\nThe test took three hours. Everything after it took nine.\n\nThe interesting question is not how to do those nine hours faster. It is why they exist.",
    ctaText: "How long between your test ending and results going out?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Your most underused asset: the wrong answers you already collect.",
    bodyContent:
      "Every test your institute runs produces hundreds of wrong answers. Most of them end up in a bin.\n\nEach one is a tiny clue: a topic, a habit, a gap. Together they are the best curriculum document you will ever get, because they were written by your own students.\n\nTag them, count them, and your next month of teaching nearly plans itself.",
    ctaText: "Do you keep a record of the most common wrong answers in your batches?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Why a small institute can move faster than a big chain.",
    bodyContent:
      "A big chain needs approvals, training sessions and a six-month rollout.\n\nA small institute can try something on Monday, check the result on Tuesday, and keep it or drop it by Friday.\n\nThat speed is a real advantage. The trick is having something worth trying and a way to see whether it worked.",
    ctaText: "What is the last thing you tried in your institute and kept?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "If a teacher does the same job twice, ask why.",
    bodyContent:
      "Imagine a teacher who marks a sheet by hand, then enters the same marks into a spreadsheet, then types them again into a message to the parent.\n\nThree times the same information. Three chances for a mistake.\n\nWhenever a person copies a number from one place to another, a system should be doing it instead.",
    ctaText: "Where does your team copy the same number most often?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Setup should take an afternoon, not a quarter.",
    bodyContent:
      "If a tool needs a month of training before it saves you any time, it has already cost you the month.\n\nThe test of good software for an institute is simple: can a teacher who has never seen it grade a batch on the first day?\n\nWe build toward that. One batch, one phone, one afternoon.",
    ctaText: "How long did your last piece of software take to set up?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "A good mock test leaves one question behind.",
    bodyContent:
      "Not \"what did I score?\" but \"what will I do differently on Monday?\"\n\nIf a student leaves a mock test with only a number, the test did half its job. If they leave with one specific thing to fix, it did all of it.\n\nDesign the report for the second question.",
    ctaText: "What does your student take home after a mock test: a number or a plan?",
  },
  // ── VedicNeev: exam preparation ─────────────────────────────────────
  {
    brand: NEEV,
    category: PREP,
    hookText: "Mistake of the week: reading \"not\" as \"is\".",
    bodyContent:
      "Imagine a question: \"Which of these is NOT a prime number?\" The child spots that 7 is prime and marks it.\n\nThey answered the question they expected, not the one asked.\n\nThe fix is physical: circle or underline words like not, except, least and always before reading the options.\n\nIt takes two seconds. It saves a mark a paper.",
    ctaText: "What other words do you tell students to circle?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "How many questions should a Class 6 child practise in a day?",
    bodyContent:
      "Imagine a parent asking for a number. The honest answer: fewer than you think, done better than you think.\n\nTen questions, with the mistakes reviewed, beat forty questions rushed through.\n\nQuantity feels like progress. Review is progress.\n\nStart with ten and check what the child actually learned from them.",
    ctaText: "How many questions does your student attempt a day, and how many do they review?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Mental Ability is a skill, not a talent.",
    bodyContent:
      "Imagine a child who stares at a figure series and says \"I am not good at these\".\n\nMost reasoning questions follow a handful of patterns: rotation, mirroring, adding, removing, a repeating cycle.\n\nOnce a child learns to ask \"what changed?\", the series stops being a mystery.\n\nShow the child the questions to ask, not just the answers.",
    ctaText: "What pattern do your students find hardest to spot?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Reading the question paper is part of the exam.",
    bodyContent:
      "Imagine the first two minutes. Some children start answering at once. Others scan the whole paper: how many sections, how many questions, where the easy ones are.\n\nThe second group has a plan. The first group has momentum, until they hit a wall.\n\nTeach the two-minute scan the way you would teach a formula.",
    ctaText: "Do your students scan the paper before they start?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Why revision works better in short rounds.",
    bodyContent:
      "Imagine one four-hour revision on Sunday against four 30-minute sessions across the week.\n\nThe four short rounds usually win, because the brain gets to forget a little and then re-learn, which is what makes a memory stick.\n\nSpread it out. It feels easier and works better.",
    ctaText: "How do you schedule revision for your students?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "What a parent should ask a coaching institute before joining.",
    bodyContent:
      "1. How often are tests held, and how soon do results arrive?\n\n2. Will my child get feedback beyond a rank?\n\n3. How many students are in a batch?\n\n4. What happens if my child falls behind?\n\nA good institute will welcome these questions. If you run one, prepare your answers. Parents are asking.",
    ctaText: "Which question do parents ask you most often?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "The first ten minutes after an exam matter.",
    bodyContent:
      "Imagine a child who walks out and lists everything they got wrong. The parent panics, the child feels worse.\n\nA better first ten minutes: water, a snack, one question. \"What was the easiest part?\"\n\nThe analysis can wait a day. The child's mood cannot.",
    ctaText: "What is the first thing you ask your child after an exam?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Guessing is a strategy, not a sin.",
    bodyContent:
      "Imagine a child who leaves a question blank because they are not 100% sure.\n\nWhether guessing helps depends on the exam's marking scheme. Where there is no negative marking, a blank is a free mark thrown away. Where there is, a smart guess after removing two options can still be worth it.\n\nSo the first job is to know the rules of the exam. Read the marking scheme before the practice, not after.",
    ctaText: "Do your students know the marking scheme of their target exam by heart?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "Sainik, Navodaya, RMS: one skill all three reward.",
    bodyContent:
      "Papers differ. Patterns differ. But there is one thing all of them reward: the ability to read carefully and stay calm through a long sitting.\n\nA child who can do that has a head start in any of them.\n\nSo train the sitting: one long, quiet, timed paper a week. Everything else sits on top.",
    ctaText: "How long can your students sit and focus before they drift?",
  },
  {
    brand: NEEV,
    category: PREP,
    hookText: "The last 15 minutes of a paper are for checking, not for finishing.",
    bodyContent:
      "Imagine a child who plans to finish at the buzzer. One slip in the last minute, a shifted bubble or a missed question, and there is no time to find it.\n\nPlan to finish 10 to 15 minutes early. Use those minutes for the three things that go wrong most: shifted bubbles, skipped questions and calculation slips.\n\nFinish with time, not at the buzzer.",
    ctaText: "How many minutes do your students keep for checking?",
  },
  // ── Vedic Mind AI: cognitive mastery ────────────────────────────────
  {
    brand: MIND,
    category: COG,
    hookText: "Questions to ask at dinner instead of \"how was school?\"",
    bodyContent:
      "1. What was the hardest thing you worked on today?\n\n2. What did you get wrong that taught you something?\n\n3. What could you teach me from today?\n\n\"Fine\" is the answer to \"how was school?\". These get a real answer.\n\nIt takes three minutes and builds the habit of thinking about thinking.",
    ctaText: "What is your favourite question to ask your child?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "A child who hates maths usually hates a feeling, not a subject.",
    bodyContent:
      "Imagine a child who froze on a test once and has been afraid ever since.\n\nThe subject did not change. The feeling attached to it did.\n\nThe way back is not more tests. It is small, safe, quick wins that slowly replace the old feeling with a new one.",
    ctaText: "What helped a child you know feel safe with numbers?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Do not hand over the answer. Hand over a smaller question.",
    bodyContent:
      "Imagine a child stuck on a word problem. \"Just tell me the answer\" is the easy path for both of you.\n\nTry this instead: \"What is the question asking? What do you know? What is the first small step?\"\n\nThree small questions are easier than one big one. And the child gets to be the one who solved it.",
    ctaText: "What small question helps your child get unstuck?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "The two-minute drill that wakes up a sleepy brain.",
    bodyContent:
      "Before homework, ask five quick mental sums: 7 x 8, 15 + 27, 100 - 36, half of 90, 12 x 5.\n\nIt takes two minutes. It is not about the sums. It is about switching the brain from tired to thinking.\n\nThink of it as stretching before a run.",
    ctaText: "Make five of your own for your child tonight and share your favourite.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Praise effort in public. Correct mistakes in private.",
    bodyContent:
      "Imagine a child corrected in front of cousins. The mistake is forgotten in a minute. The embarrassment is not.\n\nNo child learns better when they are ashamed.\n\nCelebrate effort loudly. Fix errors quietly, one-to-one, later. Same standards, kinder delivery.",
    ctaText: "How do you handle mistakes when other people are watching?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Short attention is trainable.",
    bodyContent:
      "Imagine starting with 5 minutes of focused work and a timer. Next week, 7. The week after, 10.\n\nNo lecture. No punishment. Just a small stretch each week.\n\nAttention grows like fitness: gently, and a little every day.",
    ctaText: "What is your child's current focus time? Be honest.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Why \"be careful\" is useless advice.",
    bodyContent:
      "\"Be careful\" tells a child nothing. Careful how?\n\nGive a specific habit instead: check the sign, re-read the question, estimate the answer first.\n\nA habit is something a child can actually do. \"Be careful\" is just a worry said out loud.",
    ctaText: "What is one specific habit you have taught your child to avoid mistakes?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Estimate first. Calculate second.",
    bodyContent:
      "Before solving 48 x 21, ask: about how big should the answer be? Around 50 x 20 is 1000, so the answer should be near 1000. The real answer is 1008.\n\nNow if a child's result comes out as 100 or 10,000, they know at once that something went wrong.\n\nEstimating is a seatbelt for calculations.",
    ctaText: "Estimate 62 x 19 before you calculate it.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "The best homework helper is a patient silence.",
    bodyContent:
      "Imagine sitting next to a child who is thinking. You can see the answer. Every instinct says: help.\n\nWait ten more seconds.\n\nMost of the time, the child gets there. And a child who gets there alone remembers the answer for much longer.",
    ctaText: "Can you wait ten seconds? Try it tonight.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Reading a story aloud still helps a ten-year-old.",
    bodyContent:
      "Imagine ten minutes of reading aloud before bed. Not a lesson. A story.\n\nVocabulary grows. Listening grows. And so does the one thing every exam quietly tests: staying with a long piece of language without drifting.\n\nPlus, it is nice for everybody.",
    ctaText: "What is your child reading right now?",
  },
  // ── Vedic Mind AI: Vedic maths ──────────────────────────────────────
  {
    brand: MIND,
    category: MATH,
    hookText: "Subtract from 100 in your head.",
    bodyContent:
      "Take 100 - 37. Subtract each digit from 9, except the last, which you subtract from 10: 9 - 3 = 6, 10 - 7 = 3. Answer: 63.\n\nSame idea as 1000 minus a number, with one fewer step.\n\nTry 100 - 48: 9 - 4 = 5, 10 - 8 = 2. Answer: 52.",
    ctaText: "Try 100 - 76.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Multiply by 25 without long multiplication.",
    bodyContent:
      "25 is a quarter of 100. So multiply by 100 and divide by 4.\n\n32 x 25: 3200 / 4 = 800.\n48 x 25: 4800 / 4 = 1200.\n\nNo tables needed.",
    ctaText: "Try 44 x 25.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Square any number that ends in 1.",
    bodyContent:
      "Take 41. Split it as 40 + 1. The square is 1600, plus 80 (twice 40), plus 1. Answer: 1681.\n\n51 squared: 2500 + 100 + 1 = 2601.\n31 squared: 900 + 60 + 1 = 961.\n\nThe round square, twice the round number, and 1.",
    ctaText: "Try 61 squared.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "A quick test for divisibility by 3.",
    bodyContent:
      "Add the digits. If the sum is divisible by 3, so is the number.\n\n582: 5 + 8 + 2 = 15. 15 is divisible by 3, so 582 is too (582 / 3 = 194).\n\n731: 7 + 3 + 1 = 11. Not divisible.\n\nThe same idea works for 9: check whether the digit sum is divisible by 9.",
    ctaText: "Is 4,317 divisible by 3?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Divisibility by 4 only needs the last two digits.",
    bodyContent:
      "A number is divisible by 4 if its last two digits are.\n\n3,716: the last two digits are 16, divisible by 4. So the whole number is (3,716 / 4 = 929).\n\n5,422: 22 is not divisible by 4, so neither is the number.\n\nWhy? Because 100 is divisible by 4, so everything before the last two digits is already taken care of.",
    ctaText: "Is 8,364 divisible by 4?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "A neat trick when the tens match and the units add up to 10.",
    bodyContent:
      "Take 43 x 47. The tens digit is the same (4). The units add to 10 (3 + 7).\n\nMultiply the tens digit by one more than itself: 4 x 5 = 20. Multiply the units: 3 x 7 = 21. Join them: 2021.\n\nTry 62 x 68: 6 x 7 = 42 and 2 x 8 = 16. Answer: 4216.",
    ctaText: "Try 84 x 86.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Add a long list in your head by hunting for pairs of 10.",
    bodyContent:
      "7 + 8 + 3 + 2 + 9 + 1. Look for pairs that make 10: 7 + 3, 8 + 2, 9 + 1.\n\nThree tens: 30.\n\nTraining the eye to see friendly pairs is the whole trick.",
    ctaText: "Add 6 + 4 + 5 + 5 + 7 + 3 + 8 + 2.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Multiply by 99 without long multiplication.",
    bodyContent:
      "99 is 100 minus 1. So multiply by 100, then subtract the number.\n\n34 x 99: 3400 - 34 = 3366.\n57 x 99: 5700 - 57 = 5643.\n\nSame family as the multiply-by-9 trick.",
    ctaText: "Try 26 x 99.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Halve and double.",
    bodyContent:
      "To multiply 16 x 35, halve one number and double the other until it is easy.\n\n16 x 35 becomes 8 x 70, then 4 x 140, then 2 x 280, then 1 x 560. Answer: 560.\n\nThe product stays the same at every step. You are just moving it into a friendlier shape.",
    ctaText: "Try 14 x 45 with halve and double.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Find a percentage rise in two steps.",
    bodyContent:
      "A price goes from 80 to 100. By what percent did it rise?\n\nStep 1: the difference is 20.\nStep 2: divide by where you started. 20 / 80 = 1/4 = 25%.\n\nAlways divide by where you started.",
    ctaText: "A mark goes from 50 to 60. What is the percent rise?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "The cubes of 1 to 10 are worth simply knowing.",
    bodyContent:
      "1, 8, 27, 64, 125, 216, 343, 512, 729, 1000.\n\nKnowing them cold saves time on every cube root and volume question.\n\nA quick way to learn them: say them aloud once a day for a week.",
    ctaText: "What is the cube of 7?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Squares from 11 to 20: a ten-second drill.",
    bodyContent:
      "11 squared is 121, 12 is 144, 13 is 169, 14 is 196, 15 is 225, 16 is 256, 17 is 289, 18 is 324, 19 is 361, 20 is 400.\n\nWrite them on a card and keep it near the study table. Quiz each other at dinner.\n\nSpeed on squares speeds up everything that comes after.",
    ctaText: "Which square do you always forget?",
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

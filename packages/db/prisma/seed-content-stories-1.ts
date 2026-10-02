import { PrismaClient, type ContentBlockBrand, type ContentBlockCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Batch 1 of the LinkedIn story library. Every story is framed as an
// illustration ("Imagine...", "Picture...", or addressed to the reader) and
// never claims a personal event that did not happen. Product claims are
// limited to what the apps really do. Lint below rejects banned buzzwords
// and em dashes before anything is written.
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

const BLOCKS: SeedBlock[] = [
  {
    brand: NEEV,
    category: AUTO,
    hookText: "It is 11:40 PM. Meena ma'am is still checking OMR sheets.",
    bodyContent:
      "Imagine her. Fourth pile of the night. Tea gone cold. Her daughter asked her at 8 to read a story. She said, five minutes. That was three hours ago.\n\nTomorrow 120 parents will see the results. Not one of them will know what the night cost.\n\nShe is a good teacher. That is the problem. Good teachers are the ones who sit up checking, because they care about getting it right.\n\nNobody went into teaching to become a human answer key.\n\nThis is the picture we keep in mind when we build VedicNeev. Not \"automation\". A teacher who gets her evening back, and a report that is right the first time.",
    ctaText: "If this is your staff room, tell me in the comments. No pitch, just a nod.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "A child stares at a maths problem for 40 seconds and writes nothing. What is going on in there?",
    bodyContent:
      "Imagine her. Pencil still. Eyes on the page. The teacher thinks she is lazy. Her mother thinks she is shy.\n\nOften, neither. Her mind has run out of room. It is holding the first step while trying to read the second, and one of them slipped away.\n\nThat is working memory, and it is trainable. Not talent. Not intelligence. Practice.\n\nSeeing that changes how you respond. You stop asking \"why are you not trying?\" and start asking \"what is too heavy to hold?\"",
    ctaText: "Teachers and parents, have you seen that stare? Comment \"STARE\".",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "A parent asks one question after every test: \"Why did my child get 62?\"",
    bodyContent:
      "Imagine you run an institute. The parent is standing at your desk, not angry, just worried.\n\nYou have a number. 62. You have a rank. You do not have an answer.\n\nWas it careless mistakes? Time running out in the last section? A concept that never landed?\n\nA score tells a parent what happened. It never tells them what to do next.\n\nThe institutes parents stay loyal to are the ones that can answer the second question. Not the ones with the best score on the notice board.\n\nThat is why we built a Mistake Vault: every wrong answer tagged by why it happened.",
    ctaText: "How does your institute answer \"why 62\"? Genuinely curious.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Abacus teaches a child to move beads. Vedic maths teaches a child to see numbers.",
    bodyContent:
      "Both build speed. They do it differently.\n\nAbacus gives a child a mental picture of beads and trains fast visual movement. It can be very good, for the right child.\n\nVedic maths gives a child methods: for squares, for numbers near 100, for multiplying by 11. Each one is a different way of looking at the number itself.\n\nParents often ask which is \"better\". Wrong question. Ask which one your child will still use at 14, when the problems stop being sums and start being percentages, ratios and word problems.\n\nWe are Vedic. We think the methods travel further. But we would rather you chose with your eyes open.",
    ctaText: "Parents, what did you pick for your child, and why?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "The most expensive thing in a coaching institute is a student who quietly stops coming.",
    bodyContent:
      "Imagine Rohan. Class 6 batch, JNVST prep. Scores flat for four tests. Nobody called him because nobody noticed. Results were ready on day five, by which time the next test was already running.\n\nHe did not complain. Kids like Rohan never do. His father just stopped sending him one Monday.\n\nFlat scores are a signal. But a signal that arrives five days late is only a post-mortem.\n\nSame-day results turn a post-mortem into a phone call: \"Rohan seems stuck on arithmetic. Can we sit with him for 20 minutes?\"\n\nThat call keeps a family. The spreadsheet does not.",
    ctaText: "How fast do your test results reach the student? Same day, next day, next week?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Why does a bright child suddenly get scared of numbers?",
    bodyContent:
      "Imagine a Class 4 child who was quick in Class 2. Then one day a teacher said \"be faster\". Then a classmate finished first. Then a test came back red.\n\nNumbers did not get harder. They got loaded: with speed, with comparison, with fear.\n\nThe fix is rarely more worksheets. It is making a number feel small and friendly again. One trick that works, one win, then another.\n\nConfidence is built in tiny reps.",
    ctaText: "What helped a child you know feel good about numbers again?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Your best teacher is spending her Sunday doing what a phone camera can do.",
    bodyContent:
      "Imagine the scene. Saturday mock test. Sheets in a bag next to the sofa. Sunday evening, still not touched.\n\nShe is not lazy for wanting it done. She is not \"resistant to technology\". She just has not been shown a tool that works in her classroom, on the phone she already owns, in under three seconds a sheet.\n\nMost software for institutes is built by people who have never stood in one.\n\nWe are trying to build the other kind.",
    ctaText: "Teachers: what is the one task you wish someone would just take off your plate?",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Try this: 96 x 94. Do not reach for a pencil.",
    bodyContent:
      "Both numbers are close to 100. Take each one's gap: 4 and 6.\n\nCross-subtract: 96 - 6 = 90. Multiply the gaps: 4 x 6 = 24. Put them together: 9024.\n\nThat is the Nikhilam method. It works because 96 x 94 is just (100 - 4)(100 - 6) in disguise.\n\nThe moment a child sees \"in disguise\", maths stops being a pile of rules and becomes a puzzle they can crack.",
    ctaText: "Now try 97 x 95 and post your answer.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "\"Sir, my score is wrong.\"",
    bodyContent:
      "Four words that can ruin a Monday.\n\nImagine a parent, a re-check request, and four teachers who now have to find one sheet in a pile of 300, re-add 100 answers by hand and hope the second count matches the first.\n\nIf it does not, you have lost more than marks. You have lost the parent's trust in every score you have ever given.\n\nSo here is what is worth designing for: a result you can show, line by line, in front of the parent. Every answer, every bubble, one scan.\n\nDisputes do not disappear. They get shorter.",
    ctaText: "Ever had a re-check turn awkward? Tell me how you handled it.",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "The 90-second rule for homework.",
    bodyContent:
      "If a child is stuck on one question for more than 90 seconds, stop. Not forever. Just stop.\n\nWrite \"stuck\" next to it and move on.\n\nThis does two things. It stops one hard question from eating the whole hour. And it teaches the child that being stuck is information, not failure.\n\nExams reward children who can leave a question and come back. Homework is the cheapest place to practise that.",
    ctaText: "Does your child skip and return, or stay stuck? Tell me below.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Three kinds of institutes. Which one are you?",
    bodyContent:
      "1. The one that ticks sheets and announces marks.\n\n2. The one that also tells every student which topic cost them the most marks.\n\n3. The one that tells the parent what to practise this week, before the next test.\n\nThe gap between 1 and 3 is not money. It is not talent. It is about two evenings a week of checking time that nobody has left for analysis.\n\nGive those evenings back and most institutes quietly move up a level.",
    ctaText: "Be honest. 1, 2 or 3? I will not tell anyone.",
  },
  {
    brand: MIND,
    category: MATH,
    hookText: "Speed is not the opposite of accuracy. Panic is.",
    bodyContent:
      "Parents fear that fast means careless. But watch a skilled cricketer: fast hands, clean timing.\n\nSpeed built on a method is calm. The brain is not scrambling, it is following a path it has walked many times.\n\nPanic speed is different. It is guessing under a clock.\n\nSo the goal is never \"go faster\". It is \"make the method so familiar that fast happens on its own\".",
    ctaText: "Fast and careless, or fast and calm? Which describes your child in tests?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Photocopying one OMR sheet 300 times is a bad idea. Here is why it still happens.",
    bodyContent:
      "A single master sheet is cheap. A different sheet for every student is a headache. So institutes photocopy. Then results get mixed, scans clash, and nobody can say which sheet belonged to whom.\n\nSo we flipped it. Every student gets a numbered sheet with its own token. The grader knows exactly whose sheet it is, and a second scan of the same sheet is rejected.\n\nIt takes a little setup before the test. It saves a lot of arguments after.",
    ctaText: "How do you assign sheets to students today?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Three habits that quietly build a better mind at home. None needs a screen.",
    bodyContent:
      "1. Ask \"how did you get that?\" instead of \"is it right?\". The explaining is the learning.\n\n2. Five minutes of mental sums at dinner. Shopping bills, bus fares, change.\n\n3. Let them be wrong out loud, without a fix. Wait ten seconds. They often find it themselves.\n\nNone of this is a programme. All of it compounds.",
    ctaText: "Which one will you try tonight? Reply with 1, 2 or 3.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Who actually reads the toppers' list?",
    bodyContent:
      "Imagine two parents at the same results board. One child is ranked 3rd. The other is ranked 187th.\n\nThe parent of 3 reads the board. The parent of 187 reads it too, then goes quiet, because the board says what happened and nothing about what to do.\n\nThe quiet parent is your real audience. Their child is the one who needs the next hour of your time.\n\nA topic-wise report for every child, not just the toppers, is how you speak to that parent.",
    ctaText: "Do your lower-ranked families get as much attention as your toppers?",
  },
  {
    brand: MIND,
    category: COG,
    hookText: "Why \"practise more\" is bad advice for a child who keeps making the same mistake.",
    bodyContent:
      "Practice repeats what the child already does. If the method is shaky, more practice makes the shakiness permanent.\n\nImagine a child who always forgets to carry. Fifty more sums means fifty more forgotten carries.\n\nWhat helps is spotting the pattern once, naming it, and drilling only that. A mistake log beats a bigger worksheet.\n\nThis is the idea behind everything we build: find the why, then fix only the why.",
    ctaText: "Does your child have one mistake that keeps coming back? What is it?",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "What does a \"free trial\" mean to a coaching owner? Usually: more work.",
    bodyContent:
      "Everyone has a demo. A 40-minute call, a login you will never use, a PDF.\n\nSo we tried to make ours smaller. Take one real test batch from your own institute. We grade it. You look at the result and decide if it saved you an evening.\n\nNo contract. No walkthrough to schedule. Ten free grading credits and one batch.\n\nIf it does not save you time, we both learned something quickly.",
    ctaText: "Run a JNVST, Sainik or RMS batch? Comment \"BATCH\" and I will send the steps.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Tier-2 and tier-3 towns do not need fancy. They need it to work on a phone.",
    bodyContent:
      "A lot of ed-tech assumes a laptop, fast internet and a dedicated admin. The institute down the road has one smartphone, a patchy connection and a teacher who is also the receptionist.\n\nIf a tool needs training before it helps, it will not survive the first week.\n\nWe build for the second institute. Open camera, scan, done. Everything else is a bonus.",
    ctaText: "Where is your institute based? I would like to hear what the internet is like where you work.",
  },
  {
    brand: NEEV,
    category: AUTO,
    hookText: "Imagine one wrong total.",
    bodyContent:
      "One teacher. One tired evening. One misadded column that moves a student from 4th to 7th.\n\nThe student does not know. The teacher does not know. The parent hears \"seventh\" and wonders what went wrong at home.\n\nHuman checking is not the problem. Human checking at 11 PM, after teaching all day, is.\n\nMachines should do the adding. People should do the caring.",
    ctaText: "Has a miscount ever changed a result in your institute?",
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
    console.log(`  created [${block.brand}]: ${block.hookText.slice(0, 55)}`);
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

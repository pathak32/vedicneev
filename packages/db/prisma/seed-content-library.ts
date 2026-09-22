import { PrismaClient, type ContentBlockBrand, type ContentBlockCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Founder-voice outbound copy for the /admin/content -> /api/linkedin/publish
// pipeline. Every hookText opens on a real operational observation or
// coaching pain point (never a generic marketing lede), every block is
// written first-person as the founder, and none of them use the banned
// AI-buzzword list (delve, revolutionize, synergy, paradigm, leverage,
// testament, beacon, landscape, game-changer, unlock). VEDIC_NEEV blocks
// are written as the practical execution layer of VEDIC_MIND's cognitive
// philosophy, per the brand hierarchy in CLAUDE.md.
interface SeedBlock {
  brand: ContentBlockBrand;
  category: ContentBlockCategory;
  hookText: string;
  bodyContent: string;
  ctaText: string;
}

const BLOCKS: SeedBlock[] = [
  // ── Vedic Mind AI: Cognitive Mastery ────────────────────────────────
  {
    brand: "VEDIC_MIND",
    category: "COGNITIVE_MASTERY",
    hookText: "Most kids don't fail a word problem because they don't know the math.",
    bodyContent:
      "They fail because the problem has two steps, and their working memory drops the first one before they get to the second.\n\nI've watched this happen with my own students, over and over. The kid can multiply fine. The kid can subtract fine. Put both in one question and something breaks.\n\nThat's not a math gap. That's a working-memory gap, and no amount of extra worksheets fixes it. You have to train the memory itself, the same way you'd train a muscle. That's the whole starting point behind Vedic Mind AI.",
    ctaText: "If this sounds like your kid, our free cognitive check takes 8 minutes. Link in bio.",
  },
  {
    brand: "VEDIC_MIND",
    category: "COGNITIVE_MASTERY",
    hookText: "Nobody chokes on the syllabus. They choke on the clock.",
    bodyContent:
      "I've sat with hundreds of parents who say the same thing: \"He knows the chapter, he just freezes in the exam.\"\n\nThat freeze is a real, physical thing. It's the brain switching out of working memory and into panic mode the second it feels rushed. You can't out-study that. You have to practice under exactly that pressure, in small doses, until the clock stops feeling like a threat.\n\nThat's the actual skill we drill at Vedic Mind AI — not more content, just a calmer brain under a ticking timer.",
    ctaText: "We run a free 10-minute timed drill every Saturday. DM us \"DRILL\" to join the next one.",
  },
  {
    brand: "VEDIC_MIND",
    category: "COGNITIVE_MASTERY",
    hookText: "I stopped telling my son to \"focus.\" It never worked once.",
    bodyContent:
      "Telling a distracted 9-year-old to focus is like telling a nervous person to relax. It's not a switch. It's a skill, and skills need reps.\n\nWhat actually moved the needle for him was short, structured attention drills — 90 seconds at a time, building up slowly. Not an app that just gamifies distraction with points and sounds. Real attention training.\n\nThat's the part of Vedic Mind AI I'm most stubborn about. We measure attention span before and after, so you can actually see the number move.",
    ctaText: "Curious what your child's baseline attention span looks like? Comment \"BASELINE\" and I'll send you the free test.",
  },
  // ── Vedic Mind AI: Vedic Math ────────────────────────────────────────
  {
    brand: "VEDIC_MIND",
    category: "VEDIC_MATH",
    hookText: "Squaring a two-digit number shouldn't take longer than saying it out loud.",
    bodyContent:
      "My grandfather taught me the Nikhilam method for numbers close to 100 before I was ten. 96 squared? Answer in under 3 seconds, no paper.\n\nIt's not a trick. It's a base-shift, the same base-10 logic your kid already uses every day, just pointed in the right direction. Once it clicks, they stop dreading multiplication tables and start enjoying the shortcut.\n\nThis is the entire arithmetic layer inside Vedic Mind AI — real sutras, not memorized tables, taught in the order that actually builds intuition.",
    ctaText: "We teach this exact method in lesson 1 of our free trial. Try it this week.",
  },
  {
    brand: "VEDIC_MIND",
    category: "VEDIC_MATH",
    hookText: "My dad taught me a 3-second trick for multiplying by 11 when I was seven.",
    bodyContent:
      "Split the digits, add the middle, done. 34 x 11? Put a 3 and a 4 apart, add them in the middle: 374. No calculator, no long multiplication, no fear.\n\nI still catch myself using it at the grocery store thirty years later. That's the test I hold every Vedic Mind AI lesson to — will this still be useful to the kid as an adult, not just on Friday's test.\n\nMost \"mental math\" content online is flashcards with a game skin on top. Ours is closer to what my father actually taught me at the kitchen table.",
    ctaText: "Watch the 11-times trick in 60 seconds — link in bio.",
  },
  {
    brand: "VEDIC_MIND",
    category: "VEDIC_MATH",
    hookText: "Every mental-math app I tried with my own kids was memorization wearing a costume.",
    bodyContent:
      "Flashy animations, streak counters, leaderboards — and underneath it, still just \"remember this fact.\" That's not speed math. That's a quiz.\n\nReal Vedic math changes how the calculation itself is done, so a kid solves 88 x 12 in two mental moves instead of grinding through four lines of carrying and borrowing. The speed is a side effect of a genuinely simpler method, not a reward for repetition.\n\nWe built Vedic Mind AI around that difference on purpose.",
    ctaText: "See the method, not the mascot — try our free module this week.",
  },
  // ── VedicNeev: Institutional Automation (powered by Vedic Mind AI) ──
  {
    brand: "VEDIC_NEEV",
    category: "INSTITUTIONAL_AUTOMATION",
    hookText: "Stop making teachers check OMR sheets manually.",
    bodyContent:
      "A coaching institute owner messaged me at 11pm once because her staff was still hand-checking 300 OMR sheets for the next morning's mock test. That's four teachers' entire evening, gone, for grading work a phone camera can finish before they've even sat down.\n\nOur scanner reads a full OMR sheet in under 3 seconds from any smartphone. No dedicated hardware, no server room. Section-wise analytics and a Mistake Vault come out the other side automatically, so the teacher's actual job — teaching — doesn't get eaten by grading.\n\nWe built this on the same diagnostic engine behind Vedic Mind AI. VedicNeev is that engine's job on the ground, doing the boring institutional work at scale.",
    ctaText: "10 free grading credits, zero cost to try. DM \"OMR\" and we'll set your institute up today.",
  },
  {
    brand: "VEDIC_NEEV",
    category: "INSTITUTIONAL_AUTOMATION",
    hookText: "A director in a tier-2 town once told me her institute loses two full teaching days every month to answer-sheet checking.",
    bodyContent:
      "Two days a month, every month, is a real cost — not in rupees, in attention her best teachers should be spending on actual students, not red pens.\n\nWe didn't build another OMR scanner gimmick. We built a grading pipeline that takes a photo of a filled sheet and returns a scored, section-wise breakdown before the teacher has finished their chai. For an institute running weekly mocks for JNVST, Sainik School, or RMS aspirants, that's the difference between reviewing mistakes with a student the same day or three days late, when the exam feeling has already faded.\n\nThis is VedicNeev's whole reason to exist: take the cognitive-diagnostics core we built for Vedic Mind AI and put it to work for institutes running these exams every single week.",
    ctaText: "Bring your next mock test batch — we'll grade the first one free. Reply to book a slot.",
  },
  {
    brand: "VEDIC_NEEV",
    category: "INSTITUTIONAL_AUTOMATION",
    hookText: "I've never met a coaching institute owner who enjoys answer-key reconciliation at midnight.",
    bodyContent:
      "It's the least glamorous part of running an institute, and it's exactly the part nobody automates well, because most OMR tools were built for a scanner on a desk, not a teacher's phone in a classroom in a small town.\n\nVedicNeev is built for that second reality. Photo, scan, graded — under 3 seconds, on the same phone the teacher already has. What used to eat a night now takes a break period.\n\nUnder the hood it's the same cognitive-diagnostics engine we run at Vedic Mind AI, just pointed at institutional throughput instead of one child's learning curve.",
    ctaText: "If your team is still checking sheets by hand, message us — first batch is on us.",
  },
];

async function main() {
  console.log(`Seeding ${BLOCKS.length} content blocks...`);
  for (const block of BLOCKS) {
    const existing = await prisma.contentBlock.findFirst({ where: { hookText: block.hookText } });
    if (existing) {
      console.log(`  skip (already exists): ${block.hookText.slice(0, 60)}...`);
      continue;
    }
    await prisma.contentBlock.create({ data: block });
    console.log(`  created [${block.brand}/${block.category}]: ${block.hookText.slice(0, 60)}...`);
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

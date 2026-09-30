import { prisma } from "../src/index";

/**
 * Registers metadata for the 4 externally-authored note sets (see
 * TopicNotePdf's schema comment) — 72 topics each for Class 6 and Class 9,
 * shared numbering across English/Hindi within a class level (confirmed
 * 100% reliable pairing by a full-corpus review pass). This script only
 * writes metadata (title, section, and — where confidently matchable — a
 * real Topic row); it does NOT upload the actual PDFs or set pdfUrlEn/
 * pdfUrlHi. See upload-study-note-pdfs.ts for that (blocked locally until
 * SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL are set).
 *
 * classLevel/topicNumber is the notes pipeline's OWN numbering, independent
 * of and coarser/finer than this schema's Topic granularity in different
 * places — see each TITLES array below for the source-of-truth title per
 * number (extracted directly from each topic-N.md's own header comment).
 */

const CLASS_6_TITLES: string[] = [
  "Recognizing Perfect Square Sequences",
  "Recognizing Perfect Cube & Power Sequences",
  "Alphabet Series — Skipping Letters",
  "Arithmetic Number Series — Constant Difference",
  "Doubling / Geometric Number Series",
  "Odd One Out — By Category (Word Groups)",
  "Odd One Out — By Number Property",
  "The ×11 Shortcut",
  "Squares of Numbers Ending in 5",
  "Nikhilam Near-Base Multiplication",
  "All-from-9, Last-from-10 Subtraction",
  "Vertically-and-Crosswise Multiplication",
  "Punctuation — Ending a Sentence Correctly",
  "Articles (a / an / the)",
  "Subject-Verb Agreement",
  "Parts of Speech — Identifying Nouns and Verbs",
  "Prepositions",
  "Synonyms & Antonyms",
  "Spelling",
  "Correct Sentence Structure (Tense Consistency)",
  "National Symbols of India",
  "World Geography & Capitals",
  "Science & Human Body Basics",
  "Sports General Knowledge",
  "Recognizing 90°/180°/270° Rotations",
  "Recognizing Mirror Flips (No Rotation)",
  "Rotation-Based Figure Series",
  "Growing/Counting Figure Series",
  "Alternating Figure Series",
  "Rotation Analogies (A : B :: C : ?)",
  "Mirror-Flip Analogies (A : B :: C : ?)",
  "Matching the Missing Piece by Shape and Size",
  "Vertical Mirror Reflection — Left-Right Reversal",
  "Combined/Stacked Figures in a Mirror",
  "Water Reflection — Up-Down Reversal",
  "Combined Figures in a Water Reflection",
  "Single Fold, Single Punch",
  "Double Fold (Quarters), Single Punch",
  "Finding a Hidden Shape Among Clutter",
  "Finding the HCF of Two Numbers",
  "Finding the LCM of Two Numbers",
  "Adding & Subtracting Like Fractions",
  "Converting Fractions to Decimals",
  "Multiplying Fractions",
  "Comparing Fractions — Which Is Largest",
  "Dividing Fractions",
  'Fraction Word Problems — "How Many Are Left"',
  "Converting Decimals to Fractions (Simplest Form)",
  "Finding Profit % or Loss %",
  "Finding Cost Price from Selling Price and Profit/Loss %",
  "Finding Selling Price for a Target Profit %",
  "Marked Price, Discount, and Actual Profit",
  "Simple Interest — Finding the Interest",
  "Simple Interest — Finding Principal or Rate",
  "Perimeter of Rectangles & Squares",
  "Area of Rectangles & Squares",
  "Area of a Triangle",
  "Circumference of a Circle",
  "Volume of Cubes & Cuboids",
  "Real-World Perimeter Application (Fencing Cost)",
  "Human Body & Basic Science",
  "Indian Geography",
  "Indian History & Freedom Struggle",
  "Defense, Military & Gallantry Awards",
  "National Days & Observances",
  "National Symbols & Emblems",
  "Defense & Military Institutions",
  "The Constitution of India",
  "Recent National Current Affairs",
  "Finding the Average of a Set of Numbers",
  "Dividing an Amount in a Given Ratio",
  "Finding a Percentage of a Number",
];

const CLASS_9_TITLES: string[] = [
  "Coding-Decoding — Letter & Number Substitution",
  "Blood Relations — Family Tree Problems",
  "Direction & Distance — Map Navigation",
  "Ranking, Order & Arrangement Problems",
  "Verbal & Non-Verbal Analogies — Advanced",
  "Classification — Advanced Odd One Out",
  "Syllogisms & Logical Statements",
  "Venn Diagrams & Set-Based Reasoning",
  "Seating Arrangements & Complex Puzzles",
  "Input-Output Machine Problems",
  "Calendar & Day Calculation Problems",
  "Clock — Angle & Time Problems",
  "Percentage — Advanced Applications & Word Problems",
  "Profit, Loss & Discount — Advanced",
  "Simple & Compound Interest — Advanced",
  "Time & Work — Pipes & Cisterns",
  "Time, Speed & Distance — Trains, Boats & Streams",
  "Ratio, Proportion & Partnership",
  "Mixture & Alligation",
  "Number System — Divisibility Rules & Factors",
  "Square Roots, Cube Roots & Surds",
  "Unitary Method & Variation — Direct & Inverse",
  "Algebraic Expressions — Variables & Simplification",
  "Linear Equations in One Variable",
  "Simultaneous Linear Equations — Two Variables",
  "Algebraic Identities — (a+b)², (a-b)², (a³±b³)",
  "Factorization of Algebraic Expressions",
  "Exponents & Powers — All Laws & Applications",
  "Polynomials — Degree, Zeros & Operations",
  "Word Problems Solved Using Algebra",
  "Lines & Angles — Parallel Lines & Transversals",
  "Triangles — Properties, Congruence & Similarity",
  "Pythagoras Theorem & Its Converse",
  "Quadrilaterals — Properties of All Types",
  "Circles — Chords, Arcs & Inscribed Angles",
  "Coordinate Geometry — Cartesian Plane & Plotting",
  "Practical Geometry — Constructions with Compass",
  "Symmetry, Reflection & Transformation",
  "Area of Composite Figures — Triangles & Quadrilaterals",
  "Area & Perimeter of Circles and Sectors",
  "Surface Area of Cubes, Cuboids & Cylinders",
  "Volume of Cubes, Cuboids & Cylinders",
  "Surface Area & Volume of Cones & Spheres",
  "Heron's Formula for Triangle Area",
  "Bar Graphs, Histograms & Pie Charts",
  "Mean, Median, Mode & Range",
  "Probability — Classical & Experimental",
  "Data Interpretation — Tables & Mixed Charts",
  "Reading Comprehension — Strategies & Practice",
  "Active Voice & Passive Voice Transformation",
  "Direct & Indirect Speech (Reported Speech)",
  "All 12 Tenses — Recognition & Application",
  "Subject-Verb Agreement — Complex Rules",
  "Prepositions, Conjunctions & Connectors",
  "Synonyms, Antonyms & One-Word Substitution",
  "Idioms, Phrases & Proverbs",
  "Error Spotting & Sentence Correction",
  "Formal Letter Writing & Essay Planning",
  "Motion — Speed, Velocity & Acceleration",
  "Force, Work, Power & Energy",
  "Light — Reflection, Refraction & Lenses",
  "Sound — Properties, Echo & Applications",
  "Matter — States, Properties & Changes",
  "Elements, Compounds & Mixtures",
  "Acids, Bases & Salts — Properties & Uses",
  "Chemical vs Physical Changes",
  "Cell — Structure, Types & Functions",
  "Human Body Systems — Digestive, Respiratory & Circulatory",
  "Plants — Photosynthesis, Reproduction & Classification",
  "Indian History — Freedom Movement & Modern India",
  "Indian Constitution, Civics & Government Structure",
  "Defence Forces, Military GK & Current Affairs",
];

// Exact Topic.key matches, verified live against the DB (not from memory) —
// see the two throwaway _check-topics*.ts probes run earlier this session.
// A range maps to a single existing Topic when the note pipeline's several
// topic-N's are all genuinely sub-concepts of that one Topic (mirrors
// ConceptNote's own many-notes-per-topic pattern) — left unmapped
// (undefined) when no existing Topic is granular/specific enough to match
// confidently, so TopicNotePdf.matchedTopicId stays null and a consumer
// falls back to sectionKey-level browsing instead of a false precise link.
interface RangeRule {
  from: number;
  to: number;
  sectionKey: string;
  topicKey?: string;
}

const CLASS_6_RANGES: RangeRule[] = [
  { from: 1, to: 2, sectionKey: "mental_ability", topicKey: "number_series" },
  { from: 3, to: 3, sectionKey: "mental_ability" }, // alphabet series — no matching numeric-series Topic
  { from: 4, to: 5, sectionKey: "mental_ability", topicKey: "number_series" },
  { from: 6, to: 7, sectionKey: "mental_ability", topicKey: "classification" },
  { from: 8, to: 12, sectionKey: "arithmetic", topicKey: "speed_calculation" },
  { from: 13, to: 20, sectionKey: "language", topicKey: "grammar" },
  { from: 21, to: 24, sectionKey: "general_knowledge", topicKey: "general_awareness" },
  { from: 25, to: 25, sectionKey: "mental_ability", topicKey: "geometrical_figure_completion" },
  { from: 26, to: 26, sectionKey: "mental_ability", topicKey: "mirror_imaging" },
  { from: 27, to: 29, sectionKey: "mental_ability", topicKey: "figure_series" },
  { from: 30, to: 30, sectionKey: "mental_ability", topicKey: "analogy" },
  { from: 31, to: 31, sectionKey: "mental_ability" }, // mirror-flip analogy — spans two Topics, left unmapped
  { from: 32, to: 32, sectionKey: "mental_ability", topicKey: "geometrical_figure_completion" },
  { from: 33, to: 34, sectionKey: "mental_ability", topicKey: "mirror_imaging" },
  { from: 35, to: 36, sectionKey: "mental_ability", topicKey: "water_imaging" },
  { from: 37, to: 38, sectionKey: "mental_ability", topicKey: "punched_hole_pattern" },
  { from: 39, to: 39, sectionKey: "mental_ability", topicKey: "embedded_figures" },
  { from: 40, to: 41, sectionKey: "arithmetic", topicKey: "factors_hcf_lcm" },
  { from: 42, to: 48, sectionKey: "arithmetic", topicKey: "fractions_decimals" },
  { from: 49, to: 54, sectionKey: "arithmetic", topicKey: "profit_loss_interest" },
  { from: 55, to: 60, sectionKey: "arithmetic", topicKey: "area_perimeter_volume" },
  { from: 61, to: 69, sectionKey: "general_knowledge", topicKey: "general_awareness" },
  { from: 70, to: 72, sectionKey: "arithmetic", topicKey: "general_arithmetic" },
];

const CLASS_9_RANGES: RangeRule[] = [
  { from: 1, to: 12, sectionKey: "mental_ability" }, // no CLASS_9 mental-ability Topic exists yet
  { from: 13, to: 22, sectionKey: "mathematics", topicKey: "general_mathematics" },
  { from: 23, to: 30, sectionKey: "mathematics", topicKey: "algebra_class9" },
  { from: 31, to: 44, sectionKey: "mathematics", topicKey: "mensuration_class9" },
  { from: 45, to: 48, sectionKey: "mathematics", topicKey: "general_mathematics" },
  { from: 49, to: 58, sectionKey: "language", topicKey: "advanced_english_class9" },
  { from: 59, to: 69, sectionKey: "science", topicKey: "general_science_class9" },
  { from: 70, to: 72, sectionKey: "social_science", topicKey: "social_science_class9" },
];

function resolveRange(ranges: RangeRule[], topicNumber: number): RangeRule {
  const match = ranges.find((r) => topicNumber >= r.from && topicNumber <= r.to);
  if (!match) throw new Error(`No range rule covers topic number ${topicNumber}`);
  return match;
}

async function seedClassLevel(classLevel: 6 | 9, titles: string[], ranges: RangeRule[]) {
  const topicKeysNeeded = Array.from(new Set(ranges.map((r) => r.topicKey).filter((k): k is string => Boolean(k))));
  const topics = await prisma.topic.findMany({ where: { key: { in: topicKeysNeeded } } });
  const topicIdByKey = new Map(topics.map((t) => [t.key, t.id]));

  let created = 0;
  for (let topicNumber = 1; topicNumber <= titles.length; topicNumber++) {
    const titleEn = titles[topicNumber - 1]!;
    const rule = resolveRange(ranges, topicNumber);
    const matchedTopicId = rule.topicKey ? (topicIdByKey.get(rule.topicKey) ?? null) : null;

    await prisma.topicNotePdf.upsert({
      where: { classLevel_topicNumber: { classLevel, topicNumber } },
      update: { titleEn, sectionKey: rule.sectionKey, matchedTopicId },
      create: { classLevel, topicNumber, titleEn, sectionKey: rule.sectionKey, matchedTopicId },
    });
    created++;
  }
  return created;
}

async function main() {
  const c6 = await seedClassLevel(6, CLASS_6_TITLES, CLASS_6_RANGES);
  const c9 = await seedClassLevel(9, CLASS_9_TITLES, CLASS_9_RANGES);
  console.log(`Registered ${c6} Class 6 + ${c9} Class 9 = ${c6 + c9} TopicNotePdf rows (metadata only, no PDF URLs yet).`);
}

main().finally(() => prisma.$disconnect());

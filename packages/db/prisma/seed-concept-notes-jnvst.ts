/**
 * Covers every remaining JNVST Class 6 topic the same way
 * seed-concept-notes-fractions.ts proved on "Fractions & Decimals" — one
 * DRAFT ConceptNote per real sub-concept, grounded in that topic's actual
 * tagged Question rows (verified via live DB queries before writing any
 * content below — every worked example is a real question from the bank,
 * not invented).
 *
 * For the non-verbal reasoning topics (Figure Matching, Mirror Imaging,
 * etc.) individual questions are image-based, but the underlying method
 * (how a rotation/mirror/water-reflection/fold actually works) is the same
 * regardless of which specific figure appears — so each note explains the
 * method itself, with a simple letter/shape example instead of describing
 * one particular image.
 *
 * Every row is DRAFT — nothing reaches a student until reviewed and
 * published at /admin/concept-notes.
 *
 * Idempotent: safe to re-run after editing content below.
 *
 * Run: npx tsx packages/db/prisma/seed-concept-notes-jnvst.ts
 */
import { prisma } from "../src/index";

interface ConceptNoteSeed {
  subConceptKey: string;
  title: string;
  explanation: string;
  workedExample: string;
  commonMistake: string;
}

const NOTES_BY_TOPIC: Record<string, ConceptNoteSeed[]> = {
  "Pattern Completion": [
    {
      subConceptKey: "perfect-square-sequences",
      title: "Recognizing Perfect Square Sequences",
      explanation:
        "Each term is the square of consecutive whole numbers (1², 2², 3², …). Check whether consecutive terms match 1, 4, 9, 16, 25, 36, 49…",
      workedExample: "9, 16, 25, 36, 49, ? — these are 3², 4², 5², 6², 7², so the next term is 8² = 64.",
      commonMistake:
        "Adding a constant difference instead of noticing the gaps between squares grow by 2 each time, leading to a wrong linear guess.",
    },
    {
      subConceptKey: "perfect-cube-and-power-sequences",
      title: "Recognizing Perfect Cube & Power Sequences",
      explanation:
        "Some sequences are cubes of consecutive numbers (1, 8, 27, 64, 125 = 1³..5³) or a fixed multiplier repeated (3, 9, 27, 81 = ×3 each time).",
      workedExample: "3, 9, 27, 81, ? — each term is ×3 of the previous one, so the next term is 81 × 3 = 243.",
      commonMistake:
        "Confusing a multiplying pattern with an adding pattern — checking only the last visible gap instead of the actual multiplier.",
    },
  ],
  "Number & Letter Series": [
    {
      subConceptKey: "alphabet-skip-series",
      title: "Alphabet Series — Skipping Letters",
      explanation: "The series moves through the alphabet skipping a fixed number of letters at every step.",
      workedExample: "A, C, E, G, ? — one letter is skipped each time (B, D, F), so after G comes I (skipping H).",
      commonMistake: "Counting the skip inconsistently, or resetting the count from A instead of from the last shown letter.",
    },
    {
      subConceptKey: "arithmetic-number-series",
      title: "Arithmetic Number Series — Constant Difference",
      explanation:
        "Each term increases (or decreases) by the same fixed amount — find that difference first, then apply it once more.",
      workedExample: "5, 8, 11, 14, 17, ? — the difference is always +3, so the next term is 17 + 3 = 20.",
      commonMistake:
        "Assuming the gap between the first two terms holds throughout without checking it against a second pair.",
    },
    {
      subConceptKey: "doubling-number-series",
      title: "Doubling / Geometric Number Series",
      explanation:
        "Each term is obtained by multiplying the previous one by a fixed number (often 2), not by adding a fixed amount.",
      workedExample: "2, 4, 8, 16, ?, 64 — each term doubles the one before, so the missing term is 16 × 2 = 32.",
      commonMistake:
        "Trying to fit an adding pattern onto a multiplying series, since the gaps between terms keep growing in a way a constant difference can't explain.",
    },
  ],
  "Classification (Odd One Out)": [
    {
      subConceptKey: "odd-one-out-by-category",
      title: "Odd One Out — By Category (Word Groups)",
      explanation:
        "Three items share one category (fruits, shapes, animals, weekdays) and one belongs to a different category — find the shared category first.",
      workedExample: "Apple, Banana, Carrot, Mango — three are fruits, Carrot is a vegetable, so Carrot is the odd one out.",
      commonMistake:
        "Picking based on a surface trait (like word length) instead of the actual category the other three genuinely share.",
    },
    {
      subConceptKey: "odd-one-out-by-number-property",
      title: "Odd One Out — By Number Property",
      explanation:
        "Three numbers share a property (all prime, all multiples of something) and one doesn't — identify the shared property before picking.",
      workedExample: "9, 3, 5, 7 — three of these (3, 5, 7) are prime; 9 is not (3×3), so 9 is the odd one out.",
      commonMistake:
        "Assuming \"odd one out\" always means the even number, when the real shared property might be something else entirely, like being prime.",
    },
  ],
  "Figure Matching": [
    {
      subConceptKey: "recognizing-rotations",
      title: "Recognizing 90°/180°/270° Rotations",
      explanation:
        "The correct option shows the same figure turned by the stated angle — every internal detail rotates together, nothing flips.",
      workedExample:
        "A figure rotated 180° clockwise looks upside-down from the original, with left and right also swapped (a half-turn, not a mirror flip).",
      commonMistake: "Confusing a rotation with a mirror flip — a rotated figure never mirrors any part of itself, it only turns.",
    },
    {
      subConceptKey: "recognizing-mirror-flips",
      title: "Recognizing Mirror Flips (No Rotation)",
      explanation:
        "A mirrored figure is flipped left-to-right (or top-to-bottom) like a reflection — nothing rotates, only the orientation reverses.",
      workedExample: "The letter \"F\" mirrored left-right looks like a backwards F, still standing upright — not tilted or upside down.",
      commonMistake: "Picking an option that's rotated instead of mirrored — the two look similar at a glance but are different transformations.",
    },
  ],
  "Figure Series Completion": [
    {
      subConceptKey: "rotation-based-figure-series",
      title: "Rotation-Based Figure Series",
      explanation: "The same figure turns by a fixed angle at every step — work out that angle from the steps shown, then apply it once more.",
      workedExample: "If each step turns the figure 90° clockwise, four steps bring it back to the original position.",
      commonMistake: "Judging the rotation angle from only two steps instead of confirming it holds across all the steps shown.",
    },
    {
      subConceptKey: "growing-figure-series",
      title: "Growing/Counting Figure Series",
      explanation: "The number of a repeated small shape increases by a fixed amount at each step — count carefully at each step.",
      workedExample: "If a series shows 1 shape, then 2, then 3, the next step should show 4.",
      commonMistake: "Losing count in a busier step with overlapping shapes, undercounting the real increase.",
    },
    {
      subConceptKey: "alternating-figure-series",
      title: "Alternating Figure Series",
      explanation: "The series repeats two or more figures in a fixed back-and-forth order rather than steadily transforming.",
      workedExample: "If the series goes shape-A, shape-B, shape-A, shape-B, the next in line is shape-A again.",
      commonMistake: "Expecting the series to always transform gradually, missing that some series simply alternate a small repeating set.",
    },
  ],
  Analogy: [
    {
      subConceptKey: "rotation-analogies",
      title: "Rotation Analogies (A : B :: C : ?)",
      explanation: "Work out exactly what transformation turns A into B (e.g. a 90° clockwise rotation), then apply that SAME rule to C.",
      workedExample: "If B is A rotated 90° clockwise, the answer is C rotated 90° clockwise the same way.",
      commonMistake: "Guessing an option that merely \"looks similar\" to C instead of actually applying the rule identified from A → B.",
    },
    {
      subConceptKey: "mirror-flip-analogies",
      title: "Mirror-Flip Analogies (A : B :: C : ?)",
      explanation: "When the rule from A to B is a mirror flip rather than a rotation, the answer is C flipped the same way, not turned.",
      workedExample: "If B is A's reflection, the correct answer reflects C the same way — check it isn't a rotated version of C instead.",
      commonMistake: "Mixing up a mirror-flip rule with a rotation rule, since both can look superficially alike for simple shapes.",
    },
  ],
  "Geometrical Figure Completion": [
    {
      subConceptKey: "matching-missing-piece",
      title: "Matching the Missing Piece by Shape and Size",
      explanation: "The correct option must match the missing gap exactly in both outline shape and size, not just look similar at a glance.",
      workedExample: "A missing piece from a circle's edge must curve at exactly the same radius as the rest of the circle.",
      commonMistake: "Picking an option that matches the general shape but is slightly the wrong size, when both width and depth matter.",
    },
  ],
  "Mirror Imaging": [
    {
      subConceptKey: "vertical-mirror-reflection",
      title: "Vertical Mirror Reflection — Left-Right Reversal",
      explanation: "A vertical mirror placed beside a figure reverses left and right, while up and down stay exactly the same.",
      workedExample: "The letter \"b\" reflected in a vertical mirror looks like \"d\" — flipped left-right, not upside down.",
      commonMistake: "Flipping the figure upside-down (a horizontal-mirror effect) instead of left-right.",
    },
    {
      subConceptKey: "combined-figures-in-mirror",
      title: "Combined/Stacked Figures in a Mirror",
      explanation:
        "When two figures are stacked, each is mirrored left-right individually, but their up-down stacking order stays the same in the reflection.",
      workedExample:
        "If shape X sits above shape Y, the mirror image still shows X above Y — each shape is just flipped left-right.",
      commonMistake: "Reversing the top-bottom order of the stacked shapes, which a vertical mirror never does.",
    },
  ],
  "Water Imaging": [
    {
      subConceptKey: "water-reflection-up-down",
      title: "Water Reflection — Up-Down Reversal",
      explanation: "A reflection in still water below a figure flips it upside-down, while left and right stay the same.",
      workedExample: "The letter \"b\" reflected in water looks like \"p\" — flipped top-to-bottom, not left-right.",
      commonMistake: "Applying a left-right flip (a mirror-imaging effect) instead of the up-down flip water reflection actually produces.",
    },
    {
      subConceptKey: "combined-figures-in-water",
      title: "Combined Figures in a Water Reflection",
      explanation: "When two figures are stacked above water, the whole stack order flips top-to-bottom in the reflection.",
      workedExample:
        "If shape X sits above shape Y above the water, the reflection shows Y's flipped version above X's flipped version.",
      commonMistake: "Keeping the same top-bottom order as the original instead of reversing it, which water reflection always does.",
    },
  ],
  "Punched Hole Pattern": [
    {
      subConceptKey: "single-fold-single-punch",
      title: "Single Fold, Single Punch",
      explanation: "Unfolding one fold with one punched hole always produces exactly 2 holes, mirrored across the fold line.",
      workedExample: "A horizontal fold punched once, unfolded, shows one hole above the fold line and its mirror directly below it.",
      commonMistake: "Mirroring the holes across the wrong axis — a horizontal fold mirrors up-down, a vertical fold mirrors left-right.",
    },
    {
      subConceptKey: "double-fold-single-punch",
      title: "Double Fold (Quarters), Single Punch",
      explanation: "Folding into quarters before punching once produces 4 holes when unfolded — one in each quadrant.",
      workedExample: "One punch through paper folded into quarters becomes 4 holes, symmetric around the center where both folds crossed.",
      commonMistake: "Expecting only 2 holes as with a single fold, forgetting a second fold doubles the hole count again.",
    },
  ],
  "Embedded Figures": [
    {
      subConceptKey: "finding-hidden-shape",
      title: "Finding a Hidden Shape Among Clutter",
      explanation:
        "The reference shape's exact outline is hidden inside one option's extra clutter lines — trace its corners, then hunt for that same exact set of corners in each option.",
      workedExample:
        "If the reference is a simple triangle, look for three lines meeting at the same three relative angles, ignoring extra unrelated lines.",
      commonMistake: "Being distracted by clutter and picking an option that merely \"contains a similar shape\" rather than the exact same one.",
    },
  ],
  "Speed Calculation": [
    {
      subConceptKey: "times-eleven-shortcut",
      title: "The ×11 Shortcut",
      explanation: "To multiply a 2-digit number by 11, add its two digits together and place that sum between them (carrying if needed).",
      workedExample: "45 × 11 — add 4+5=9, place it between: 4_9_5 → 495.",
      commonMistake: "Forgetting to carry over when the digit sum is 10 or more, e.g. 89 × 11 (8+9=17, must carry the 1).",
    },
    {
      subConceptKey: "squares-ending-in-five",
      title: "Squares of Numbers Ending in 5",
      explanation: "To square a number ending in 5, multiply the leading digit(s) by (itself + 1), then append 25.",
      workedExample: "15² — the leading digit is 1, so 1×(1+1)=2, then append 25 → 225.",
      commonMistake: "Appending 25 correctly but miscalculating the leading multiplication for 2-digit leading parts, like 25² (2×3=6 → 625).",
    },
    {
      subConceptKey: "nikhilam-near-base-multiplication",
      title: "Nikhilam Near-Base Multiplication",
      explanation:
        "For two numbers close to a round base (like 100), multiply their deficits from the base and combine that with the base minus the sum of the deficits.",
      workedExample: "99 × 96 — deficits from 100 are 1 and 4; 1×4=4 (last digits), 99−4=95 (leading digits) → 9504.",
      commonMistake: "Getting the deficit's sign wrong when a number is ABOVE the base instead of below it.",
    },
    {
      subConceptKey: "all-from-9-last-from-10",
      title: "All-from-9, Last-from-10 Subtraction",
      explanation: "To subtract a number from a power of 10, subtract every digit from 9 except the last digit, subtracted from 10.",
      workedExample: "100 − 38 — subtract 3 from 9 (=6), and 8 from 10 (=2) → 62.",
      commonMistake: "Subtracting the last digit from 9 as well instead of from 10, throwing the final answer off by 1.",
    },
    {
      subConceptKey: "vertically-crosswise-multiplication",
      title: "Vertically-and-Crosswise Multiplication",
      explanation:
        "For two 2-digit numbers: multiply the units digits, cross-multiply and add the digits diagonally, then multiply the tens digits — combine with carrying.",
      workedExample: "21 × 14 — units: 1×4=4; cross: 2×4+1×1=9; tens: 2×1=2 → reading right to left: 294.",
      commonMistake: "Forgetting to carry a digit from the middle (cross) step into the tens result when that sum is 10 or more.",
    },
  ],
  "Factors, HCF & LCM": [
    {
      subConceptKey: "finding-hcf",
      title: "Finding the HCF of Two Numbers",
      explanation: "List the factors of both numbers (or use repeated division) and find the largest factor common to both.",
      workedExample: "HCF of 12 and 18 — factors of 12: 1,2,3,4,6,12; factors of 18: 1,2,3,6,9,18; the largest shared factor is 6.",
      commonMistake: "Picking a common factor that isn't the LARGEST one, stopping the search too early.",
    },
    {
      subConceptKey: "finding-lcm",
      title: "Finding the LCM of Two Numbers",
      explanation: "List multiples of both numbers and find the smallest common one — or use LCM = (a×b) ÷ HCF(a,b).",
      workedExample: "LCM of 8 and 12 — HCF is 4, so LCM = (8×12)÷4 = 24.",
      commonMistake: "Confusing HCF and LCM's direction — HCF is always ≤ both numbers, LCM is always ≥ both numbers.",
    },
  ],
  "Profit, Loss & Simple Interest": [
    {
      subConceptKey: "finding-profit-loss-percent",
      title: "Finding Profit % or Loss %",
      explanation: "Profit or Loss % = (Profit or Loss ÷ Cost Price) × 100 — always divide by the COST price, never the selling price.",
      workedExample: "Bought for ₹200, sold for ₹180 — loss = ₹20, loss % = (20÷200)×100 = 10%.",
      commonMistake: "Dividing by the selling price instead of the cost price, giving a different, wrong percentage.",
    },
    {
      subConceptKey: "finding-cost-price-from-loss",
      title: "Finding Cost Price from Selling Price and Profit/Loss %",
      explanation:
        "Cost Price = Selling Price ÷ (1 ± Profit/Loss % as a decimal) — subtract for a loss, add for a profit.",
      workedExample: "Sold for ₹680 at a 15% loss — Cost Price = 680 ÷ 0.85 = ₹800.",
      commonMistake: "Applying the percentage directly to the Selling Price instead of working backward through division.",
    },
    {
      subConceptKey: "finding-selling-price-for-target-profit",
      title: "Finding Selling Price for a Target Profit %",
      explanation: "Selling Price = Cost Price × (1 + desired profit % as a decimal).",
      workedExample: "Bought for ₹200, want 10% profit — Selling Price = 200 × 1.10 = ₹220.",
      commonMistake: "Adding the percentage to the cost price as a flat number instead of as a proportion of it.",
    },
    {
      subConceptKey: "discount-vs-actual-profit",
      title: "Marked Price, Discount, and Actual Profit",
      explanation:
        "A discount is calculated off the MARKED price, but profit is always calculated against the shopkeeper's own COST price — two separate reference points.",
      workedExample:
        "Marked at ₹500 with a 10% discount sells for ₹450; if it cost ₹400, the real profit is ₹50 on a ₹400 cost — 12.5%, not the 10% discount figure.",
      commonMistake: "Assuming the discount percentage tells you the profit percentage — they answer two different questions.",
    },
    {
      subConceptKey: "simple-interest-finding-interest",
      title: "Simple Interest — Finding the Interest",
      explanation: "Simple Interest = (Principal × Rate × Time) ÷ 100.",
      workedExample: "₹1000 at 5% per annum for 2 years — SI = (1000×5×2)÷100 = ₹100.",
      commonMistake: "Forgetting to divide by 100 at the end, since the rate is a percentage.",
    },
    {
      subConceptKey: "simple-interest-finding-principal-or-rate",
      title: "Simple Interest — Finding Principal or Rate",
      explanation:
        "Rearrange the same formula to solve for whichever value is missing: Principal = (SI×100)÷(Rate×Time), or Rate = (SI×100)÷(Principal×Time).",
      workedExample: "₹480 Simple Interest at 8% over 4 years — Principal = (480×100)÷(8×4) = ₹1500.",
      commonMistake: "Plugging numbers into the wrong slot of the rearranged formula instead of isolating the one unknown value first.",
    },
  ],
  "Area, Perimeter & Volume": [
    {
      subConceptKey: "perimeter-rectangle-square",
      title: "Perimeter of Rectangles & Squares",
      explanation: "Perimeter is the total distance around the shape — 2×(length+width) for a rectangle, 4×side for a square.",
      workedExample: "Rectangle 10×6 — perimeter = 2×(10+6) = 32 units.",
      commonMistake: "Calculating the area formula (length×width) by mistake when perimeter was asked for.",
    },
    {
      subConceptKey: "area-rectangle-square",
      title: "Area of Rectangles & Squares",
      explanation: "Area = length × width for a rectangle (or side × side for a square) — always in SQUARE units.",
      workedExample: "Rectangle 12×7 — area = 12×7 = 84 sq. units.",
      commonMistake: "Forgetting the \"square units\" label, or accidentally computing the perimeter formula instead.",
    },
    {
      subConceptKey: "area-of-triangle",
      title: "Area of a Triangle",
      explanation: "Area of a triangle = ½ × base × height.",
      workedExample: "Base 10, height 8 — area = ½×10×8 = 40 sq. units.",
      commonMistake: "Forgetting the ½, which doubles the answer.",
    },
    {
      subConceptKey: "circumference-of-circle",
      title: "Circumference of a Circle",
      explanation: "Circumference = 2 × π × radius (use π = 22/7 when the radius is a multiple of 7).",
      workedExample: "Radius 21 — circumference = 2×(22/7)×21 = 132 units.",
      commonMistake: "Using the diameter instead of the radius, or forgetting to double it.",
    },
    {
      subConceptKey: "volume-cube-cuboid",
      title: "Volume of Cubes & Cuboids",
      explanation: "Volume = length × width × height for a cuboid (or side³ for a cube) — always in CUBIC units.",
      workedExample: "Cuboid 8×8×8 (a cube) — volume = 8×8×8 = 512 cubic units.",
      commonMistake: "Multiplying only two of the three dimensions, as if finding area, forgetting the third dimension.",
    },
    {
      subConceptKey: "real-world-perimeter-application",
      title: "Real-World Perimeter Application (Fencing Cost)",
      explanation: "For a fencing/boundary cost problem, first find the perimeter, then multiply by the cost per metre.",
      workedExample: "A 30m×20m field, fencing at ₹15/metre — perimeter = 2×(30+20)=100m, cost = 100×15 = ₹1500.",
      commonMistake: "Multiplying the cost per metre by the AREA instead of the perimeter, since fencing only runs along the boundary.",
    },
  ],
  "Averages, Ratio & Percentage": [
    {
      subConceptKey: "finding-average",
      title: "Finding the Average of a Set of Numbers",
      explanation: "Average = (sum of all values) ÷ (number of values).",
      workedExample: "15, 25, 35, 45 — sum=120, count=4, average = 120÷4 = 30.",
      commonMistake: "Dividing by the wrong count, or mistaking the sum itself for the answer.",
    },
    {
      subConceptKey: "dividing-in-a-ratio",
      title: "Dividing an Amount in a Given Ratio",
      explanation: "Split the total into (sum of ratio parts) equal shares, then give each person their number of parts.",
      workedExample: "₹100 in ratio 3:2 — total parts = 5, each part = ₹20, so A (3 parts) gets ₹60.",
      commonMistake: "Dividing the total directly by one of the ratio numbers instead of by the SUM of both numbers.",
    },
    {
      subConceptKey: "finding-percentage-of-a-number",
      title: "Finding a Percentage of a Number",
      explanation: "Percentage of a number = (percentage ÷ 100) × the number.",
      workedExample: "15% of 720 = 0.15×720 = 108.",
      commonMistake: "Multiplying by the percentage number directly without dividing by 100 first.",
    },
  ],
  Grammar: [
    {
      subConceptKey: "sentence-ending-punctuation",
      title: "Punctuation — Ending a Sentence Correctly",
      explanation: "A question ends with a question mark, a statement with a full stop, a strong emotion/command with an exclamation mark.",
      workedExample: "\"What is your name\" needs a question mark: \"What is your name?\"",
      commonMistake: "Using a full stop on a sentence phrased as a question just because it lacks an obvious question word at the start.",
    },
    {
      subConceptKey: "articles-a-an-the",
      title: "Articles (a / an / the)",
      explanation: "Use \"an\" before a vowel SOUND, \"a\" before a consonant sound, and \"the\" for something specific already known.",
      workedExample: "\"I saw an elephant\" — \"elephant\" starts with a vowel sound, so it takes \"an\".",
      commonMistake: "Choosing \"a\"/\"an\" based on the letter instead of the sound (e.g. \"an hour\" despite the silent h).",
    },
    {
      subConceptKey: "subject-verb-agreement",
      title: "Subject-Verb Agreement",
      explanation: "A singular subject takes a singular verb form (goes), and a plural subject takes the plain/plural form (go).",
      workedExample: "\"She ___ to school every day\" — \"She\" is singular, so the verb is \"goes\", not \"go\".",
      commonMistake: "Matching the verb to the noun closest to it in the sentence instead of the actual subject.",
    },
    {
      subConceptKey: "identifying-parts-of-speech",
      title: "Parts of Speech — Identifying Nouns and Verbs",
      explanation: "A noun names a person/place/thing; a verb names an action — ask \"who/what?\" for the noun, \"doing what?\" for the verb.",
      workedExample: "\"The bird sings sweetly\" — \"bird\" is the noun, \"sings\" is the verb.",
      commonMistake: "Picking an adverb (like \"sweetly\", describing HOW) when asked for the verb itself.",
    },
    {
      subConceptKey: "prepositions",
      title: "Prepositions",
      explanation: "Prepositions show relationships of time, place, or direction — \"in\" for years/months, \"on\" for days/dates, \"at\" for exact times.",
      workedExample: "\"I was born ___ 2014\" — a year takes \"in\": \"I was born in 2014.\"",
      commonMistake: "Using \"on\" or \"at\" for a year, a common mix-up since all three describe time but apply to different units.",
    },
    {
      subConceptKey: "synonyms-and-antonyms",
      title: "Synonyms & Antonyms",
      explanation: "A synonym means the same as the given word; an antonym means the opposite — check which one is actually asked for.",
      workedExample: "The antonym of \"brave\" is \"cowardly\", not a word that merely sounds similar or unrelated.",
      commonMistake: "Mixing up synonym and antonym questions under time pressure, picking a same-meaning word when an opposite was asked for.",
    },
    {
      subConceptKey: "spelling",
      title: "Spelling",
      explanation: "Some English spelling rules have tricky exceptions (like \"i before e except after c\") worth knowing directly.",
      workedExample: "The correct spelling is \"receive\" (e before i after c), not \"recieve\".",
      commonMistake: "Applying \"i before e\" without remembering the \"except after c\" exception.",
    },
    {
      subConceptKey: "correct-sentence-structure",
      title: "Correct Sentence Structure (Tense Consistency)",
      explanation: "Both halves of a sentence describing events around the same time need matching, grammatically consistent tenses.",
      workedExample: "\"While I was cooking, the phone rang\" is correct; \"While I cooking, the phone rang\" is missing its helping verb.",
      commonMistake: "Dropping the helping verb (like \"was\") in a continuous-tense clause.",
    },
  ],
  "General Awareness": [
    {
      subConceptKey: "national-symbols-of-india",
      title: "National Symbols of India",
      explanation: "India has official national symbols — an animal (Tiger), a bird (Peacock), a flower (Lotus) — common GK questions.",
      workedExample: "The National Bird of India is the Peacock, not the Parrot or Sparrow.",
      commonMistake: "Confusing India's official symbol with a similar-sounding or commonly-seen animal/bird that isn't the official one.",
    },
    {
      subConceptKey: "world-geography-and-capitals",
      title: "World Geography & Capitals",
      explanation: "Know the capital cities of major countries and basic facts like continent count and where the sun rises from.",
      workedExample: "The capital of France is Paris, not London (the UK's capital).",
      commonMistake: "Mixing up a country with a neighboring or similarly-associated country's capital.",
    },
    {
      subConceptKey: "science-and-human-body-basics",
      title: "Science & Human Body Basics",
      explanation: "Basic solar system facts (planet order and sizes) and human body facts (organs and functions) are common GK questions.",
      workedExample: "Jupiter, not Saturn or Earth, is the largest planet in our solar system.",
      commonMistake: "Confusing \"largest\" with \"closest to the Sun\" or another unrelated superlative about the same planet.",
    },
    {
      subConceptKey: "sports-general-knowledge",
      title: "Sports General Knowledge",
      explanation: "Know the nicknames, player counts, and basic rules of popular sports.",
      workedExample: "Cricket is popularly known as the \"Gentleman's Game\"; a standard football team has 11 players on the field.",
      commonMistake: "Confusing player counts between different sports.",
    },
  ],
};

async function main() {
  let total = 0;
  for (const [topicNameEn, notes] of Object.entries(NOTES_BY_TOPIC)) {
    const topic = await prisma.topic.findFirst({ where: { name: { path: ["en"], equals: topicNameEn } } });
    if (!topic) {
      console.warn(`Topic "${topicNameEn}" not found — skipping ${notes.length} note(s).`);
      continue;
    }

    for (const note of notes) {
      await prisma.conceptNote.upsert({
        where: { topicId_subConceptKey: { topicId: topic.id, subConceptKey: note.subConceptKey } },
        update: {
          title: { en: note.title },
          body: { en: { explanation: note.explanation, workedExample: note.workedExample, commonMistake: note.commonMistake } },
        },
        create: {
          topicId: topic.id,
          subConceptKey: note.subConceptKey,
          title: { en: note.title },
          body: { en: { explanation: note.explanation, workedExample: note.workedExample, commonMistake: note.commonMistake } },
          status: "DRAFT",
        },
      });
      total++;
    }
    console.log(`${topicNameEn}: ${notes.length} note(s) upserted.`);
  }

  console.log(`\nDone — ${total} DRAFT concept notes across ${Object.keys(NOTES_BY_TOPIC).length} topics.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

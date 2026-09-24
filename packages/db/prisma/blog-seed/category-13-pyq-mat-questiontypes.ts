import type { BlogSeedPost } from "./types";

export const posts: BlogSeedPost[] = [
  {
    title: "The JNVST Analogy Question, Solved Three Ways",
    slug: "jnvst-mat-analogy-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Analogy questions don't test if a child sees a resemblance — they test if she can name the exact rule and reuse it cold on a brand-new pair.",
    content: `## What the Question Is Actually Asking

An analogy question gives you a pair of figures or numbers connected by some relationship, then a third item, and asks you to pick the fourth item that completes the pattern the same way. When I sit down with a student over one of these, the first thing I check is whether she can put the relationship into words before she even looks at the answer options. If she can't name it, she's about to guess.

The skill being tested isn't "spotting that two things look similar." It's abstraction — pulling out the one rule that connects the first pair, ignoring everything else about how the shapes happen to look, and applying that same rule to a different starting point.

## A Worked Example

Say the question shows a square with two diagonal lines inside it, paired with a square with four lines inside it (making an X plus a plus sign). Then it gives you a triangle with one line inside it, and asks what goes with it. A student who reasons "the second figure has more lines than the first" is on the right track only if she can say exactly how many more, and why. If the rule is "number of internal lines doubles," a triangle with one line pairs with a triangle with two lines — not three, not four. Naming the rule as a number, not a vibe, is what separates a right answer from a lucky one.

## A Second, Trickier Example

Number analogies hide the same trap in a different costume. 4 is to 16 as 5 is to what? The tempting shortcut is "square it," giving 25, and that's often right — but past papers also use rules like "multiply by 4" (16 = 4×4, so 5×4 = 20) that produce a different, equally clean-looking number. Both 25 and 20 will usually sit among the answer choices, on purpose. The only way to pick correctly is to test your rule against the first pair fully before applying it to the second.

## The Trap Students Fall Into

The most common mistake I see in our own review sessions is a student picking the option that "looks like it belongs" rather than the one that satisfies the actual rule. Exam-setters know this, so at least one wrong option is deliberately designed to be visually or numerically close to the right relationship without matching it exactly.

## How I'd Practice This

- After solving any analogy question, write the rule connecting the first pair in one short sentence before checking the answer
- Deliberately solve the same question two ways when a rule feels ambiguous, and see if both ways land on the same option — if they don't, you haven't found the real rule yet
- Keep a small list of relationship types that repeat across past papers: count of lines/sides, rotation, size change, addition of a new part, and mirror flip

## The Real Fix

Analogy questions reward a student who slows down for one extra second to name the rule out loud, even silently. That single habit fixes most of the errors I see, far more than solving a larger volume of practice questions without that check.`,
  },
  {
    title:
      "Classification and Odd-One-Out: The JNVST MAT Question Type Students Rush Through",
    slug: "jnvst-mat-classification-odd-one-out-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Odd-one-out looks like the easiest MAT question type, which is exactly why students rush it and miss the one attribute that actually matters.",
    content: `## Why This Question Type Gets Treated as "Free Marks"

Classification questions give four or five items and ask which one doesn't belong. Because the format looks simple, I notice students burn through these fastest of all MAT question types — and that speed is exactly where marks go missing. The skill being tested isn't finding a difference; every item is different from every other item in some way. It's finding the one shared attribute that binds the majority together, so the genuine outlier reveals itself against that specific rule.

## A Worked Example

Take four shapes: a square, a rectangle, a rhombus, and a triangle. A student who classifies by "number of sides" will (correctly) flag the triangle. But if the actual shared rule the question is built around is "all have two pairs of parallel sides," the rhombus is fine, the triangle is still out, but so would a trapezium be if it appeared in the set. The point isn't that one grouping is always right — it's that you have to test more than one candidate rule before locking in an answer, because more than one grouping will often "work" on the surface.

## A Number-Based Example

Given 27, 64, 125, 100 — a student who classifies by "perfect cubes" correctly flags 100 (27, 64, 125 are cubes of 3, 4, 5; 100 is not). But a student who classifies by "odd or even" gets confused because three of the four are odd and one is even, coincidentally pointing at the same answer for the wrong reason. That's the trap: sometimes a wrong method still lands on the right answer, which teaches a student the wrong lesson and fails her on the next paper when the coincidence doesn't repeat.

## The Trap Students Fall Into

The temptation is to lock onto the first difference noticed and stop looking. Exam-setters build these sets so that an obvious surface-level difference exists, but the actual grouping rule is one level deeper — shared property of angles, or symmetry, or a mathematical relationship rather than a visual one.

## How I'd Practice This

- For every classification question, write down two different possible grouping rules before picking an answer, and check which one actually holds for three of the four items cleanly
- When practicing number classification, check the items against: odd/even, prime, square, cube, multiples of a common number, and digit sums — in that order
- Slow down specifically on this question type in timed practice, since it's the one most likely to be rushed

## What Actually Builds This Skill

Classification rewards a habit of testing a rule against every item before committing, not just the first one or two. Once a student builds that checking habit, this becomes one of the most reliably scorable question types on the whole paper.`,
  },
  {
    title: "Series Completion in JNVST MAT: The Pattern Behind the Pattern",
    slug: "jnvst-mat-series-completion-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Series completion isn't about spotting one pattern — it's about knowing which of several possible patterns the question is actually built on.",
    content: `## What's Really Being Tested

A series completion question gives you a sequence of figures or numbers with one term missing, usually at the end, and asks you to find it. The obvious skill is pattern recognition, but the deeper skill is knowing that a short sequence can usually be explained by more than one rule — and the exam is testing whether a student checks her rule against every term in the series before answering, not just the first two.

## A Worked Example

Take the number series 2, 6, 12, 20, __. A student who spots "add 4, then add 6" might expect the next difference to be 8, giving 30 — which happens to be right here, but only because she checked the pattern of differences (4, 6, 8...) rather than assuming a single fixed jump. A student who only looked at the first two terms and assumed "add 4 each time" would answer 24, confidently and wrong. The series is built from n(n+1) — 1×2, 2×3, 3×4, 4×5 — and recognizing that underlying structure, not just the surface differences, is what the question is really checking.

## A Figural Example

In a shape series, a figure might rotate 45 degrees clockwise each step while also gaining one extra dot inside it. A student focused only on rotation will get the direction of turn right but miss that the dot count needs to increase too, and pick an option that's correctly rotated but has the wrong number of dots. Figural series questions almost always combine two changes happening at once — rotation plus an added element, or shading plus a size change — and past papers reliably test whether a student tracks both simultaneously.

## The Trap Students Fall Into

The most common mistake is confirming a rule using only the first two terms and stopping there. Any two numbers or figures can fit multiple rules; it's the third and fourth terms that actually distinguish the real pattern from a coincidence. Wrong-answer options are usually built to satisfy that too-hasty, two-term rule.

## How I'd Practice This

- Never lock in a rule until you've checked it against at least three consecutive terms in the given series
- For figural series, list every dimension that could be changing — position, rotation, size, shading, number of parts — and check each one separately
- Practice both increasing and decreasing series, since students who only drill "add each time" patterns get caught by series that shrink or alternate

## Why This Pays Off Beyond MAT

The discipline of testing a hypothesis against more data before trusting it is the same habit that helps with arithmetic word problems too. Series completion, done properly, is quietly training a more careful kind of thinking than the question format lets on.`,
  },
  {
    title: "Pattern Completion Questions in JNVST MAT, Solved Step by Step",
    slug: "jnvst-mat-pattern-completion-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "A pattern completion grid hides its rule across rows AND columns at once — miss one direction and the 'obviously right' answer is wrong.",
    content: `## The Question Format

Pattern completion shows a 3x3 (or 2x2) grid of figures with one cell left blank, and asks which option fills it correctly. It looks like series completion's cousin, and it is, but the added difficulty is that the rule can run across the row, down the column, or both at once — and a student who only checks one direction will miss a rule that only shows up in the other.

## A Worked Example

Picture a 3x3 grid where each row shows a shape with an increasing number of sides — a triangle, square, pentagon — and each column shows the same shape getting progressively more shaded. If the blank cell is in the last row, last column, the correct answer needs the shape appropriate to that row (following the row's shape-progression rule) AND the shading level appropriate to that column (following the column's shading rule) at the same time. A student who only checks the row picks a shape with the right number of sides but the wrong shading, and that option will absolutely be sitting among the choices, ready to catch her.

## A Second Example

Sometimes the rule isn't row-and-column but diagonal — the figure in the top-left, middle, and bottom-right cells share one property that the others don't. This is rarer but shows up enough in past papers that a student who only ever checks rows and columns gets stuck completely on a diagonal-based grid, because she's not looking for it.

## The Trap Students Fall Into

The single biggest mistake is solving the grid using only the row the blank cell sits in, because that's the direction the eye naturally scans first. The exam relies on this. The correct process is to independently verify the row rule and the column rule, and only pick an answer that satisfies both — not just the one that "seems to continue" whichever direction was checked first.

## How I'd Practice This

- For every pattern grid, write out the row rule and the column rule as two separate short notes before looking at the answer choices
- Practice grids where the row rule and column rule involve different properties (one is about shape, the other about shading or size) so you build the habit of checking both, not just repeating the same check twice
- If an answer satisfies one direction but you're unsure about the other, don't submit it — go back and verify

## The Bigger Skill Underneath

Pattern completion is really testing whether a student can hold two conditions in her head at once and check an answer against both. That's a habit worth building slowly with untimed practice before adding a stopwatch.`,
  },
  {
    title:
      "Mirror Imaging in JNVST MAT: Why Students Get It Wrong Even When They Understand It",
    slug: "jnvst-mat-mirror-imaging-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Mirror imaging isn't a knowledge gap — it's asking a child to predict a flip in her head instead of doing it with her hands, and that's harder than it sounds.",
    content: `## The Skill Behind the Question

Mirror imaging shows a figure and a vertical line beside it, and asks what the reflection looks like. The actual skill being tested is whether a student can predict a left-right flip mentally, without physically turning anything over — because in the exam hall, she can't hold the paper up to a mirror. When I watch students attempt these cold, the ones who understand mirrors perfectly well in daily life still get the answer wrong, because translating that intuition into a still image on paper, under time pressure, is a different task.

## A Worked Example

Take a figure that's an arrow pointing to the upper-right, with a small flag at its tail. In a left-right mirror reflection, the arrow now points to the upper-left — that part most students get right instinctively. What trips students up is the flag: it doesn't just move position, its own orientation flips too. If the flag was drawn pointing away from the arrow's shaft on the right side, the mirrored flag points away from the shaft on what is now the left side. Students who mentally flip only the "obvious" main shape and forget to flip every small internal detail the same way pick an answer that's half right and half wrong.

## Why the Wrong Answer Looks Right

The most tempting wrong option in mirror imaging questions is usually the one that rotates the figure 180 degrees instead of reflecting it left-right. A rotation and a reflection can look deceptively similar for simple shapes, but they are different transformations — rotation turns the whole figure around a point, reflection flips it across a line. A letter like "F" rotated looks nothing like its mirror image, but plenty of simpler shapes don't make that difference obvious at a glance, which is exactly why this option gets included.

## How I'd Practice This

- Physically trace the figure on tracing paper or scratch paper and flip it over the line yourself, at least while still building the skill — don't try to do it purely in your head from day one
- Practice specifically with letters and numbers first, since their mirror images are easy to self-check (most people already know what a mirrored "R" or "3" looks like)
- After flipping the main shape, go back and check every small internal detail separately — dots, small lines, shading — since these are where most errors hide

## Building the Instinct Over Time

The goal isn't to stay dependent on tracing paper forever. It's to use it as scaffolding until the mental flip becomes automatic, the same way a student eventually stops sounding out words once she's read enough of them.`,
  },
  {
    title:
      "Water Imaging Questions in JNVST MAT, Explained With Worked Examples",
    slug: "jnvst-mat-water-imaging-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Water imaging flips a figure top-to-bottom, not left-to-right, and that one-word difference from mirror imaging is where most marks are lost.",
    content: `## How Water Imaging Differs From Mirror Imaging

Water imaging asks what a figure would look like reflected in still water below it — which means the flip happens top-to-bottom, along a horizontal line, instead of left-to-right along a vertical one. The two question types sit right next to each other in most practice sets, and the single biggest reason students lose marks here is applying a left-right mirror flip to a question that's actually asking for a top-bottom flip, simply out of habit from having just solved several mirror imaging questions in a row.

## A Worked Example

Picture a figure of a simple house shape sitting above a horizontal line, with a small chimney on its upper-right corner and steps at its base pointing downward. In the water reflection, the whole figure flips upside down below the line: the roof, which was on top, now points downward into the water, and the chimney — which stays attached to the roof — is now on the lower-right, not the upper-right, because "right" and "left" don't swap in a water reflection, but "up" and "down" do. A student who mentally applies a mirror-style left-right swap here will move the chimney to the lower-left instead, which is wrong on both counts.

## A Second Example

Numbers and letters make the distinction obvious once you've seen it: the digit "6" reflected in water becomes a shape resembling "9" turned upside down (not a mirrored 6, which would look different again), because water imaging inverts the whole figure vertically. Practicing with digits and letters where you already know the correct upside-down form is the fastest way to build a reliable check for figural water-imaging questions where you can't just "know" the answer by memory.

## The Trap Students Fall Into

Besides confusing it with mirror imaging, the second common trap is a wrong option that correctly flips the main outline of the figure but keeps small internal details in their original position rather than inverting those too. Every internal mark on the figure needs to move to its vertically-flipped position, not just the outer boundary.

## How I'd Practice This

- Before solving, say out loud (or in your head) "top-bottom, not left-right" to interrupt the habit of defaulting to a mirror-style flip
- Trace the figure and physically flip it upside down over the given line using scratch paper, the same way you would for mirror imaging, until the transformation becomes automatic
- Mix mirror and water imaging questions together in practice sets rather than solving twenty of one type in a row, since the exam mixes them and your practice should too

## Why Mixed Practice Matters Most Here

This is one question type where solving them in isolated blocks actually hurts more than it helps, because the error is about confusing two similar-looking rules, not about not knowing either one.`,
  },
  {
    title: "Embedded Figures in JNVST MAT: Training the Eye to Find What's Hidden",
    slug: "jnvst-mat-embedded-figures-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Embedded figures test visual search under clutter, not shape recognition — the shape is easy, finding it inside a busy figure is the actual challenge.",
    content: `## What the Question Is Really Checking

Embedded figures show a simple shape and then a larger, more complicated figure made up of overlapping lines, and ask whether (and where) the simple shape is hidden inside the complex one. The skill isn't recognizing the simple shape — any student can draw a triangle. It's visual search: holding one clean shape in mind while scanning a cluttered image full of lines that almost, but don't quite, form that same shape in several places.

## A Worked Example

Say the target shape is a small triangle. The complex figure is a five-pointed star drawn with continuous overlapping lines. A star naturally contains several triangular regions formed by its points and the lines crossing through its center — and more than one of these regions will look close to the target triangle's proportions. The correct one matches the target's exact proportions and orientation; the near-misses are triangles that are slightly wider, slightly rotated, or missing one true straight edge because a line inside the star curves or bends where the target's doesn't. Students who stop scanning the moment they spot "a triangle-ish shape" pick the first near-miss rather than the true match.

## Why the Wrong Answer Feels Right

The complex figures in these questions are deliberately drawn so that multiple regions resemble the target shape at a glance. The trap works because the eye is satisfied by "roughly triangular" long before it's checked the actual angles and side proportions, and under time pressure, "roughly right" gets circled as the final answer.

## How I'd Practice This

- Before scanning the complex figure, mentally note two or three specific features of the target shape — is one side clearly longer, is one angle clearly sharper — rather than just "it's a triangle"
- Scan the complex figure in sections rather than all at once — top half, then bottom half, then center — so you don't miss a region simply because your eye jumped past it
- When you think you've found a match, trace its exact outline with a finger or pencil before confirming, checking it against the specific features you noted first

## The Practice Technique That Works Best

Timing this question type separately from the rest of MAT practice helps, because embedded figures reward unhurried, careful scanning far more than quick pattern-matching. I'd rather see a student spend a few extra seconds here and get it right than rush it at the same pace as an odd-one-out question.`,
  },
  {
    title:
      "Punched Hole Pattern Questions: The JNVST MAT Type That Rewards Patience",
    slug: "jnvst-mat-punched-hole-pattern-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Punched hole questions ask a child to unfold a piece of paper in her head — the trap is trying to do it in one jump instead of one fold at a time.",
    content: `## What's Being Asked

A punched hole pattern question shows a square piece of paper folded one or more times, with a hole punched through it at a specific spot after folding, and asks what the paper looks like once fully unfolded — how many holes there are and where. It's one of the harder MAT question types because it asks a student to reverse a physical process entirely in her head, tracking every fold and every layer the hole punch actually passed through.

## A Worked Example

Take a square folded in half once, left edge to right edge, and then punched once near the folded edge. Unfolded, that single punch becomes two holes, mirrored across the vertical center line where the fold was — because the punch went through both layers of paper at once. Now add a second fold: the same square folded left-to-right and then top-to-bottom before punching once near the corner where all folds meet. That single punch now passes through four layers, so unfolding gives four holes, one in each quadrant, each positioned as the mirror image of the punch across both fold lines. Students who track only the first fold and forget the second consistently answer with two holes instead of four.

## The Trap Students Fall Into

The most common mistake is trying to visualize the fully unfolded result in one jump instead of undoing one fold at a time. Skipping straight to the final picture works for simple one-fold questions but breaks down completely once there are two or three folds, because the position of a hole after undoing the first fold changes where it lands relative to the second fold line — the order of unfolding matters, and doing it in reverse, one step at a time, is the only reliable method.

## How I'd Practice This

- Physically fold a square piece of paper, punch it, and unfold it yourself several times before trying to do this purely on paper in your head — there's no substitute for having actually seen the real result a few times
- When solving on paper, undo folds one at a time in reverse order, redrawing the hole's mirrored position after each single unfold rather than guessing the final pattern directly
- Pay attention to how many layers the punch actually went through — that number tells you exactly how many holes to expect before you even work out where they are

## Why This One Needs Real Paper First

Of all the MAT question types, this is the one where I most insist a student handle actual folded paper before attempting it abstractly. The mental model only becomes reliable once the physical version has been seen enough times to trust.`,
  },
  {
    title: "Figure Matching in JNVST MAT, Solved With Real Past-Paper Examples",
    slug: "jnvst-mat-figure-matching-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Figure matching questions hide rotated duplicates among near-identical options — the skill is checking orientation, not just shape.",
    content: `## What This Question Type Tests

Figure matching gives a reference figure and a set of options, asking which option is identical to it — often after some of the options have been rotated. The underlying skill is distinguishing a true rotation of the same figure from a figure that's subtly different in a way that's easy to miss once it's been turned. This is different from mirror imaging: nothing is flipped here, only turned, and a genuinely identical rotated figure is a correct match while a flipped one is not.

## A Worked Example

Say the reference figure is an L-shape with a small dot in its inner corner. One option shows the same L-shape rotated 90 degrees clockwise, dot in the same relative position — that's a correct match. A second option shows the L-shape rotated the same way, but the dot has moved to the outer corner instead of the inner one. At a glance, both options look like "the same L, just turned," and a student scanning quickly will accept the second one because the overall silhouette matches. The dot's position relative to the shape is the actual detail the question is testing, and it's exactly the detail that's easiest to skip when checking quickly.

## A Second Example

With more complex figures — say a shape built from three overlapping smaller shapes with different shading — rotation can also expose a chirality problem: a shape that looks the same rotated but is actually its mirror image, which is not a true rotational match at all. Testing this by imagining the figure spun in place (not flipped) is the only reliable check; if the only way to make it match is to flip it over, it isn't a match.

## The Trap Students Fall Into

The overwhelming trap in figure matching is checking the outer silhouette only and treating that as confirmation. Exam-setters build wrong options that share the exact outer boundary as the reference figure while changing one internal detail — shading, a dot, a small line's direction — specifically because students check the outline first and often only.

## How I'd Practice This

- After matching the outer shape, separately check every internal detail — position of dots, direction of internal lines, shading pattern — one at a time, as if grading a checklist
- Practice physically rotating a cut-out paper shape to build accurate intuition for what a true rotation preserves and what a flip changes
- Be specifically suspicious of any option that "obviously" matches at first glance — those are often the ones built to catch a fast scan

## The Underlying Discipline

Figure matching rewards a slow, checklist-style verification rather than a fast visual impression, and that habit transfers directly to embedded figures and pattern completion too.`,
  },
  {
    title:
      "Geometrical Figure Completion in JNVST MAT: What the Question Is Actually Testing",
    slug: "jnvst-mat-geometrical-figure-completion-solved-examples",
    category: "PYQ Deep-Dives & Exam Patterns",
    excerpt:
      "Figure completion tests whether a student can mentally finish a shape's missing piece using symmetry rules, not just guess what looks balanced.",
    content: `## What the Question Actually Looks Like

Geometrical figure completion shows a shape with a section cut out or missing, and asks which of the given pieces correctly completes it — restoring either the figure's symmetry, its pattern of lines, or both. It's easy to mistake this for a simple jigsaw-piece task, but the real skill is identifying which specific property of the original figure the missing piece needs to restore, since more than one option will "fit" the empty space in terms of size and outline alone.

## A Worked Example

Imagine a circle divided into four quarters by a horizontal and vertical line through its center, with each quarter shaded in an alternating pattern — shaded, unshaded, shaded, unshaded — going around. If one quarter is missing, the correct piece needs to match that quarter's exact size and curve (easy to check) and continue the alternating shading pattern correctly (easy to miss). An option that fits the size and curve perfectly but is shaded the wrong way, breaking the alternating pattern, is the classic trap here — it looks geometrically perfect and is still wrong.

## A Second Example

With figures built from straight lines rather than curves — say a hexagon with internal lines connecting alternating corners to the center, with one section missing — the missing piece has to continue not just the outer boundary but the internal line's angle and endpoint exactly. A piece that completes the outer hexagon edge correctly but has its internal line meeting the center at a slightly different point is wrong, even though the outer silhouette check passes.

## The Trap Students Fall Into

The consistent trap across past papers is an option that completes the outer boundary of the figure correctly while getting an internal detail — shading, an internal line's angle, a small embedded shape — wrong. Because the outer boundary is what the eye checks first and most easily, this is the option that survives a fast, careless scan.

## How I'd Practice This

- Before looking at the answer options, describe out loud what property the missing piece needs to restore: symmetry, a repeating shading pattern, or a continuing internal line
- Check each candidate piece against the outer boundary first, then separately against every internal detail, rather than accepting a piece the moment the outline fits
- Practice with both curved figures (circles, arcs) and straight-edged figures (polygons with internal lines), since the two require slightly different checking habits

## The Bigger Point

This question type is really asking whether a student notices that a shape's identity includes more than its outline. Once that becomes a habit, figure completion turns from one of the trickier MAT types into one of the more consistent scoring opportunities on the paper.`,
  },
];

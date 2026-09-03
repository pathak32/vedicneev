import type { BlogSeedPost } from "./types";

export const posts: BlogSeedPost[] = [
  {
    title: "The ×11 Sandwich Rule: Multiply Any Two-Digit Number Instantly",
    slug: "multiply-by-11-sandwich-rule",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Master the ×11 sandwich rule to multiply any two-digit number in your head — just add the digits and place them, no long multiplication needed.",
    content: `## Why Multiplying by 11 Is Special

Any two-digit number multiplied by 11 can be split using place value: 11 × n = 10n + n. When you line up n and 10n, the digits of n slide one place to the left and overlap with themselves — which is exactly why a simple "sandwich" pattern shows up in the answer.

## The Rule in Three Steps

- Write the two digits of the original number as the outer digits of your answer (the "bread").
- Add the two digits together — that sum is the middle digit (the "filling").
- If the sum is 10 or more, write only the last digit in the middle and carry the 1 to the left digit.

## Worked Example: No Carrying

**45 × 11**
1. Outer digits: 4 and 5
2. Middle digit: 4 + 5 = 9
3. Slide them together: 4, 9, 5 → **495**

## Worked Example: With Carrying

**68 × 11**
1. Outer digits: 6 and 8
2. Middle sum: 6 + 8 = 14 — write the 4, carry the 1
3. Add the carry to the left digit: 6 + 1 = 7
4. Answer: 7, 4, 8 → **748**

## Two More to Lock It In

- **72 × 11** → 7 + 2 = 9, no carry → **792**
- **57 × 11** → 5 + 7 = 12 → write 2, carry 1 → left digit becomes 5 + 1 = 6 → **627**

## Common Mistakes to Avoid

- Forgetting the carry when the digit sum is 10 or higher is the single biggest error students make.
- Double-check with an estimate: 68 × 11 should be a little more than 68 × 10 = 680, and 748 fits that estimate.
- This trick applies directly to two-digit numbers; for three-digit numbers, the same overlapping-addition idea extends, but you add pairs of neighbouring digits instead of just two.

## Where This Helps

Multiplication by 11 shows up constantly in speed tests — quick totals, squaring near-11 quantities, and multi-step arithmetic problems where every second counts. Once the sandwich pattern feels automatic, you can multiply two-digit numbers by 11 as fast as you can write the answer.

Try timing yourself: pick ten random two-digit numbers and multiply each by 11 using this rule. Most students who practice this for a few minutes a day get comfortably under three seconds per question within a week.`,
  },
  {
    title: "Squaring Numbers Ending in 5: A 10-Second Vedic Trick",
    slug: "squaring-numbers-ending-in-5",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Squaring any number ending in 5 takes just one small multiplication and a fixed ending of 25 — here's the simple Vedic rule with worked examples.",
    content: `## The Pattern Behind the Trick

Any number ending in 5 can be written as 10a + 5, where a is the digit (or digits) in front of the 5. Squaring (10a + 5)² algebraically expands to 100a(a + 1) + 25 — which means the answer always ends in 25, and the digits before that are simply a × (a + 1).

## The Rule in Two Steps

- Take the digit(s) before the 5 — call this number a — and multiply it by the next whole number, a + 1.
- Write "25" right after that product. That's your answer.

## Worked Example

**65²**
1. The digit before 5 is a = 6
2. Multiply by the next number: 6 × 7 = 42
3. Attach 25: **4225**

## Another Worked Example

**85²**
1. a = 8
2. 8 × 9 = 72
3. Attach 25: **7225**

## It Works for Bigger Numbers Too

**105²**
1. a = 10 (everything before the final 5)
2. 10 × 11 = 110
3. Attach 25: **11025**

**25²**
1. a = 2
2. 2 × 3 = 6
3. Attach 25: **625**

## Why It's Reliable

Because this comes directly from algebra rather than a memorized shortcut, it works for every number ending in 5 — two-digit, three-digit, or beyond. The only "calculation" you ever do is a × (a + 1), which is one multiplication of consecutive integers, usually easy to do in your head.

## Practice Tip

Write down five numbers ending in 5 — say 15, 35, 45, 75, 95 — and square each one using this method before checking with a calculator. Once a × (a + 1) becomes instant for small values of a, the whole trick takes under ten seconds per question, which is exactly why it's such a favourite for timed arithmetic sections.

Keep a mental list of a × (a + 1) results for a = 1 to 12 handy while practicing; recognizing them instantly is what turns this from a trick into genuine speed.`,
  },
  {
    title: "Nikhilam Multiplication: Multiply Numbers Near a Base Without Long Multiplication",
    slug: "nikhilam-multiplication-near-a-base",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Nikhilam multiplication turns numbers close to 100 or 1000 into a quick two-line calculation — no digit-by-digit long multiplication required.",
    content: `## What "Nikhilam" Means

Nikhilam is a Vedic multiplication method built for numbers that sit close to a round base like 10, 100, or 1000. Instead of multiplying digit by digit, you work with how far each number is from the base — its "deviation" — and combine those deviations in a short, predictable way.

## The Method, Step by Step

- Choose a base (10, 100, 1000...) that both numbers are close to.
- Find each number's deviation from the base (negative if the number is below the base, positive if above).
- Cross-add: add one number's deviation to the other number (either direction gives the same result).
- Multiply that sum by the base.
- Add the product of the two deviations to get the final answer.

## Worked Example: Both Numbers Below the Base

**98 × 97** (base 100)
1. Deviations: 98 − 100 = −2, and 97 − 100 = −3
2. Cross-add: 98 + (−3) = 95 (or equivalently 97 + (−2) = 95)
3. Multiply by base: 95 × 100 = 9500
4. Multiply the deviations: (−2) × (−3) = 6
5. Add: 9500 + 6 = **9506**

## Worked Example: Both Numbers Above the Base

**103 × 104** (base 100)
1. Deviations: +3 and +4
2. Cross-add: 103 + 4 = 107
3. Multiply by base: 107 × 100 = 10700
4. Multiply deviations: 3 × 4 = 12
5. Add: 10700 + 12 = **10712**

## Worked Example: Larger Base

**994 × 998** (base 1000)
1. Deviations: −6 and −2
2. Cross-add: 994 + (−2) = 992
3. Multiply by base: 992 × 1000 = 992000
4. Multiply deviations: (−6) × (−2) = 12
5. Add: 992000 + 12 = **992012**

## Why This Beats Long Multiplication

Long multiplication of 98 × 97 involves multiple rows of digit-by-digit products and careful carrying. Nikhilam replaces all of that with one subtraction, one small multiplication by the base (which is just shifting digits), and one tiny multiplication of small deviations.

## When to Use It

This trick shines whenever both numbers are close to the same round base — a very common situation in speed tests involving numbers near 100 or 1000. Practicing a handful of near-base pairs each day builds the instinct to spot when Nikhilam applies, turning what looks like a hard multiplication into a two-line calculation.`,
  },
  {
    title: "All From 9, Last From 10: The Fastest Way to Subtract From Powers of Ten",
    slug: "all-from-9-last-from-10-subtraction-trick",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Subtract any number from 100, 1000, or 10000 without borrowing — the all-from-9, last-from-10 rule turns it into a quick glance-and-write answer.",
    content: `## The Problem With Ordinary Subtraction

Subtracting a number from 1000, 10000, or any power of ten the standard way usually means borrowing across several zeros — a step where many students make mistakes. The "All from 9, Last from 10" rule removes borrowing entirely.

## The Rule

- Line up the number you're subtracting so it has as many digits as the power of ten has zeros (pad with leading zeros if needed).
- Subtract every digit except the last one from 9.
- Subtract the last digit from 10.
- Read off the digits in order — that's your answer.

## Worked Example

**1000 − 587**
1. Digits of 587: 5, 8, 7
2. All digits except the last, from 9: 9 − 5 = 4, and 9 − 8 = 1
3. Last digit, from 10: 10 − 7 = 3
4. Answer: **413**

## A Bigger Example

**10000 − 4321**
1. Digits: 4, 3, 2, 1
2. From 9 (all but last): 9 − 4 = 5, 9 − 3 = 6, 9 − 2 = 7
3. From 10 (last digit): 10 − 1 = 9
4. Answer: **5679**

## A Shorter Example

**100 − 47**
1. Pad to two digits: 4, 7
2. From 9: 9 − 4 = 5
3. From 10: 10 − 7 = 3
4. Answer: **53**

## Why It Works

A power of ten like 1000 can be thought of as 999 + 1. Subtracting a number from 999 never needs borrowing, since every digit of 999 is 9. So "all from 9" handles the 999 part, and the leftover "+1" is exactly what turns the last digit's subtraction from 9 into subtraction from 10.

## Where Students Go Wrong

- Forgetting to pad with leading zeros when the number being subtracted has fewer digits than the power of ten has zeros (for example, treating 100 − 7 the same as 100 − 47).
- Applying "from 10" to more than just the last digit.

## Practice Tip

Pick a power of ten and subtract five different numbers from it using this rule, then verify one or two with standard subtraction. Once the pattern is automatic, subtracting from powers of ten becomes a glance-and-write calculation rather than a multi-step borrowing exercise — extremely useful whenever a timed test throws a "difference from 1000" style question at you.`,
  },
  {
    title: "Vedic Math for Percentages: Calculating Discounts and Marks in Seconds",
    slug: "vedic-math-for-percentages-discounts-and-marks",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Turn percentages into friendly fractions to calculate discounts and exam marks in seconds — with worked examples for shopping bills and scores.",
    content: `## Percentages Are Just Friendly Fractions

Most percentage calculations become instant once you stop thinking "percent" and start thinking "fraction of 100." Many common percentages convert to simple fractions: 50% = 1/2, 25% = 1/4, 20% = 1/5, 10% = 1/10, 5% = 1/20. Once you see a percentage as its fraction, the calculation is usually a single division.

## Trick 1: Swap the Percentage and the Number

x% of y is always equal to y% of x — and one direction is often much easier than the other.

**8% of 25**
1. Instead of calculating 8% of 25 directly, swap it: 25% of 8
2. 25% is 1/4, so 1/4 of 8 = **2**

## Trick 2: Build Up From 10% and 5%

Any percentage can be built from easy pieces like 10% (divide by 10) and 5% (half of that).

**15% of 240**
1. 10% of 240 = 24
2. 5% of 240 = half of 24 = 12
3. Add: 24 + 12 = **36**

## Trick 3: Discounts, Step by Step

**A shirt costs ₹850 with a 20% discount**
1. 20% is 1/5, so discount = 850 ÷ 5 = ₹170
2. Final price: 850 − 170 = **₹680**

## Trick 4: Converting Marks to Percentage

**A student scores 456 out of 600**
1. Percentage = (456 ÷ 600) × 100
2. Recognize 600 as 6 × 100, so dividing 456 by 6 gives the percentage directly: 456 ÷ 6 = 76
3. Answer: **76%**

## Why This Matters

Percentage questions appear everywhere in school exams — from discount word problems to converting raw scores into percentages. The moment you see a percentage as a fraction (10%, 20%, 25%, and so on all have clean fraction equivalents), you stop needing long division and start solving by simple mental steps.

## Practice Tip

Next time you see a percentage question, pause for two seconds and ask: "What simple fraction is this percentage equal to, and what easy pieces — 10%, 5%, 1% — can I build it from?" That habit alone eliminates most of the slow, error-prone percentage calculations students struggle with under time pressure.`,
  },
  {
    title: "Mental Division Shortcuts Every JNVST Aspirant Should Know",
    slug: "mental-division-shortcuts-for-jnvst",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Skip long division with fast mental shortcuts for dividing by 5, 25, and 9 — plus a quick estimation habit for tackling messier division problems.",
    content: `## Division Doesn't Have to Mean Long Division

Long division is reliable but slow — and in a timed exam, slow costs marks. Most division questions that appear in competitive school entrance exams involve "nice" divisors like 5, 25, or 9, and each has a shortcut that skips long division entirely.

## Dividing by 5: Double and Shift

Dividing by 5 is the same as multiplying by 2 and then dividing by 10.

**84 ÷ 5**
1. Multiply by 2: 84 × 2 = 168
2. Divide by 10: 168 ÷ 10 = **16.8**

## Dividing by 25: Multiply by 4, Shift Twice

Dividing by 25 is the same as multiplying by 4 and then dividing by 100.

**300 ÷ 25**
1. Multiply by 4: 300 × 4 = 1200
2. Divide by 100: 1200 ÷ 100 = **12**

## Dividing by 9: Use the Digit-Sum Check First

Before dividing by 9, a quick digit-sum check tells you whether the division comes out even: if a number's digits add up to a multiple of 9, the number itself divides evenly by 9.

**Quick check: 738 ÷ 9**
1. Digit sum: 7 + 3 + 8 = 18, and 18 is a multiple of 9 — so this divides evenly
2. 738 ÷ 9 = **82**

## Estimating Before You Divide

For messier divisions, round the divisor and dividend to nearby round numbers first, get a ballpark answer, then adjust.

**Estimate 437 ÷ 22**
1. Round to 440 ÷ 22 = 20
2. Since 437 is a little less than 440, the actual answer is a little under 20 — useful for eliminating multiple-choice options fast, even before doing exact division.

## Why These Shortcuts Matter

In a timed section, you rarely need the full long-division process — you need a fast, reliable answer or a fast way to eliminate wrong options. Building fluency with "divide by 5," "divide by 25," and digit-sum checks for 9 covers a large share of the division questions that show up in competitive exams.

## Practice Tip

Pick ten numbers and divide each by 5 and by 25 using the shortcuts above, checking your work with a calculator afterward. Once these become automatic, use the same combination of exact shortcuts and rough estimation as your default approach whenever a division question appears under time pressure.`,
  },
  {
    title: "Speed Squaring: A Shortcut for Numbers Close to a Round Base",
    slug: "speed-squaring-numbers-close-to-a-round-base",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Square numbers near 10, 100, or 1000 almost as fast as you can write them, using the same deviation trick behind Vedic near-base multiplication.",
    content: `## Squaring Without Multiplying Digit by Digit

Squaring a number that's close to a round base (10, 100, 1000...) can be done almost as fast as writing the number itself, using the same deviation idea behind near-base multiplication — applied to a number multiplied by itself.

## The Method

- Find the deviation of the number from a nearby base.
- Add the deviation to the number itself, then multiply by the base.
- Add the square of the deviation.

## Worked Example: Below the Base

**97²** (base 100)
1. Deviation: 97 − 100 = −3
2. Add deviation to the number, multiply by base: (97 − 3) × 100 = 94 × 100 = 9400
3. Add the square of the deviation: (−3)² = 9
4. Answer: 9400 + 9 = **9409**

## Worked Example: Above the Base

**103²** (base 100)
1. Deviation: +3
2. (103 + 3) × 100 = 106 × 100 = 10600
3. Square of deviation: 3² = 9
4. Answer: 10600 + 9 = **10609**

## Worked Example: Small Base

**12²** (base 10)
1. Deviation: +2
2. (12 + 2) × 10 = 140
3. Square of deviation: 2² = 4
4. Answer: 140 + 4 = **144**

**9²** (base 10)
1. Deviation: −1
2. (9 − 1) × 10 = 80
3. Square of deviation: (−1)² = 1
4. Answer: 80 + 1 = **81**

## Why It's Faster Than Multiplying Long-Hand

Normally, squaring a two- or three-digit number means multiplying every digit by every digit. This method replaces that with one addition, one multiplication by a round base (basically shifting digits), and one small square of the deviation — which is almost always a single-digit or small two-digit number.

## Choosing the Right Base

Always pick the base that gives the smallest possible deviation — the smaller the deviation, the smaller and easier the extra squaring step becomes. For 97 and 103, base 100 is the obvious choice; for 12 and 9, base 10 works best.

## Practice Tip

Square every number from 90 to 110 using base 100, and every number from 1 to 20 using base 10. The deviations involved are always small, which makes this one of the fastest mental squaring methods to build genuine speed with — most students can square a two-digit number in under five seconds once the pattern clicks.`,
  },
  {
    title: "How to Practice Speed Math Without Losing Accuracy",
    slug: "how-to-practice-speed-math-without-losing-accuracy",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Speed and accuracy grow together when you practice the right way — a step-by-step routine for building fast, reliable mental calculation skills.",
    content: `## The Speed-Accuracy Trade-off Is a Myth (If You Practice Right)

Many students assume that going faster automatically means making more mistakes. In reality, speed and accuracy grow together when you practice deliberately — the real mistake is rushing before the underlying method is solid.

## Step 1: Learn the Method Slowly First

Before timing yourself, work through a shortcut untimed, writing out every step, until you can explain why it works — not just how to do it.

**Example: 73 × 11**
1. Outer digits: 7 and 3
2. Middle: 7 + 3 = 10 → write 0, carry 1
3. Left digit: 7 + 1 = 8
4. Answer: **803**

Only once this feels obvious — not just memorized — should you start adding time pressure.

## Step 2: Practice in Short, Focused Bursts

Five to ten minutes of focused practice, done daily, builds more reliable speed than one long session once a week. Short bursts keep your attention sharp, which is exactly when accuracy holds up best.

## Step 3: Track Errors, Not Just Time

Keep a simple log: date, number of questions, number correct, and time taken. If accuracy drops below roughly 90% at a given speed, that's a signal to slow down slightly and rebuild the method before pushing pace again.

## Step 4: Mix Easy and Hard Problems

Practicing only easy numbers builds false confidence; practicing only hard numbers builds frustration. A good set mixes both, so your brain learns to recognize when a shortcut applies at a glance — not just when a problem "looks" like the example you memorized.

## Step 5: Always Sanity-Check With Estimation

Before locking in an answer, ask whether it's roughly the right size. For 73 × 11, a quick estimate (73 × 10 = 730, plus a bit more) should land close to 803 — if your calculated answer is wildly different, that's a signal to recheck your steps rather than move on.

## Step 6: Review Mistakes Immediately

When you get something wrong, redo it slowly right away and identify exactly which step broke down — a wrong carry, a misread digit, or a skipped step. Fixing errors immediately, while the problem is fresh, prevents the same mistake from becoming a habit.

## Building the Habit

Speed math is a skill built through repetition, not a talent some students have and others don't. A short daily routine — learn slowly, practice in bursts, track results, and review errors — steadily turns any shortcut into something you can do accurately under real time pressure.`,
  },
  {
    title: "Common Calculation Traps in Arithmetic Word Problems",
    slug: "common-calculation-traps-in-arithmetic-word-problems",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "Most word-problem mistakes come from misreading the question, not bad arithmetic — here are the common traps to watch for and how to avoid them.",
    content: `## The Trap Is Rarely the Arithmetic Itself

Most mistakes in word problems don't come from a wrong multiplication or addition — they come from setting up the wrong calculation in the first place. Knowing the common traps helps you avoid them before you even pick up a pencil.

## Trap 1: Misreading "Of" as an Operation Other Than Multiplication

In percentage and fraction problems, the word "of" almost always means multiply.

**Find 3/4 of 96 students**
1. 3/4 of 96 means (3/4) × 96
2. 96 ÷ 4 = 24, then 24 × 3 = **72**

Students sometimes divide by the wrong number or add instead of multiply when the wording feels unfamiliar — reading "of" as "multiply" every time removes that confusion.

## Trap 2: Confusing Increase and Decrease

"A price increased by 20%" and "a price is 20% less than" lead to very different calculations, and the two are easy to mix up under pressure.

**A ₹500 item increases by 20%**
1. 20% of 500 = 100
2. New price = 500 + 100 = **₹600**

**A ₹500 item decreases by 20%**
1. 20% of 500 = 100
2. New price = 500 − 100 = **₹400**

Always underline the direction word (increase, decrease, more, less, discount, profit, loss) before calculating.

## Trap 3: Mixing Up Units Mid-Problem

Word problems often switch between units — minutes and hours, grams and kilograms, or rupees and paise — inside the same question. Converting everything to one consistent unit before calculating avoids errors that have nothing to do with arithmetic skill.

## Trap 4: Losing Track of What's Actually Being Asked

A problem can involve several steps and ask for something other than the last number you calculated — for example, asking how many items are left after a series of sales, not the total sold.

**A shop has 240 books. It sells 45 in the morning and 38 in the afternoon. How many books are left?**
1. Total sold: 45 + 38 = 83
2. Books left: 240 − 83 = **157**

A common trap here is answering "83" (the total sold) because that's the last number computed, instead of the number actually asked for.

## How to Avoid These Traps

- Reread the question after finishing the calculation to check you answered what was actually asked.
- Underline direction words (more, less, increase, discount) before starting.
- Convert all units to match before calculating.
- Estimate the answer's rough size first, so a calculation error stands out immediately.

Careful reading, not faster arithmetic, is what prevents most word-problem mistakes — pairing that habit with quick calculation shortcuts is what turns accuracy and speed into a single skill rather than a trade-off.`,
  },
  {
    title: "Building Calculation Speed Week by Week: A Practice Framework",
    slug: "building-calculation-speed-week-by-week",
    category: "Speed Math & Vedic Shortcuts",
    excerpt:
      "A five-week framework for building real calculation speed — one shortcut at a time, with gentle timing and a simple log to track your progress.",
    content: `## Why a Framework Beats Random Practice

Practicing calculation shortcuts without a plan often means repeating what's already comfortable and avoiding what actually needs work. A simple week-by-week framework builds real speed by layering one skill at a time.

## Week 1: One Shortcut, Untimed

Pick a single technique — say, squaring numbers ending in 5 — and practice it slowly, writing out every step, until the logic feels automatic rather than memorized.

**Daily target: 10 untimed problems**

Example: 35² → a = 3, 3 × 4 = 12, attach 25 → **1225**

## Week 2: Add a Timer, Keep It Gentle

Introduce a relaxed time limit — enough to complete each problem without rushing, but enough to notice hesitation. If accuracy drops below about 90%, slow back down before adding more pressure.

**Daily target: 10 problems, 20 seconds each**

## Week 3: Mix in a Second Shortcut

Add a second technique — for example, the ×11 sandwich rule — while continuing to practice the first. Mixing techniques forces your brain to recognize which shortcut applies to which problem, which is the real skill being tested in exams.

**Daily target: 10 problems each, alternating techniques**

Example check: 54 × 11 → 5 + 4 = 9, no carry → **594**

## Week 4: Tighten the Time, Track Accuracy

Reduce the time limit slightly and start logging results: date, technique, number correct out of ten, and average time per question. This log is what turns vague progress into something measurable.

**Sample log entry**
- Date: Day 22
- Technique: Squaring numbers ending in 5
- Score: 9/10 correct
- Average time: 7 seconds per question

## Week 5 Onward: Rotate and Combine

Once two or three shortcuts feel solid individually, start mixing them into combined problem sets alongside estimation checks, so recognizing which method to use becomes as automatic as applying it.

## Adjusting the Pace

Not every student moves through these stages at the same speed, and that's fine — the framework is meant to be repeated, not rushed. If a technique still feels shaky at the end of a week, stay on it a few more days before adding the next one; a shortcut practiced under pressure before it's solid usually causes more errors than it prevents.

## The Long-Term Payoff

Calculation speed built this way tends to stick, because each new shortcut is layered on a foundation that's already accurate. A few focused minutes a day, tracked over weeks, consistently outperforms occasional long practice sessions — and gives you a reliable base to draw on whenever a timed arithmetic section shows up.`,
  },
];

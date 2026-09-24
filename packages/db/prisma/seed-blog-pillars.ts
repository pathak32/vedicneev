/**
 * Seeds every blog-seed category file for the two newest pillars (PYQ
 * deep-dives, admissions playbooks) — same upsert-by-slug, re-runnable-
 * on-its-own convention as seed-store.ts, so this can run without
 * re-running the whole (much heavier) seed.ts just to pick up new blog
 * posts. seed.ts's own blog loop already includes all of these via
 * blog-seed/index.ts, so a future full reseed stays consistent with this
 * one.
 */
import { PrismaClient } from "@prisma/client";

import { posts as pyqDeepDives } from "./blog-seed/category-11-pyq-deepdives";
import { posts as admissionsPlaybooks } from "./blog-seed/category-12-admissions-playbooks";
import { posts as pyqMatQuestionTypes } from "./blog-seed/category-13-pyq-mat-questiontypes";
import { posts as pyqArithmeticTopics } from "./blog-seed/category-14-pyq-arithmetic-topics";
import { posts as pyqLanguageAndAissee6 } from "./blog-seed/category-15-pyq-language-and-aissee6";
import { posts as pyqRmsAndCrosscutting } from "./blog-seed/category-16-pyq-rms-and-crosscutting";
import { posts as admissionsReservationAndPlanners } from "./blog-seed/category-17-admissions-reservation-and-planners";
import { posts as admissionsPaperworkAndPostselection } from "./blog-seed/category-18-admissions-paperwork-and-postselection";
import { posts as admissionsDecisionsAndResults } from "./blog-seed/category-19-admissions-decisions-and-results";

const prisma = new PrismaClient();

const POSTS = [
  ...pyqDeepDives,
  ...admissionsPlaybooks,
  ...pyqMatQuestionTypes,
  ...pyqArithmeticTopics,
  ...pyqLanguageAndAissee6,
  ...pyqRmsAndCrosscutting,
  ...admissionsReservationAndPlanners,
  ...admissionsPaperworkAndPostselection,
  ...admissionsDecisionsAndResults,
];

async function main() {
  let created = 0;
  for (const post of POSTS) {
    const result = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        status: "DRAFT",
      },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
  }
  console.log(`Blog pillar seed: ${POSTS.length} posts processed, ${created} newly created.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

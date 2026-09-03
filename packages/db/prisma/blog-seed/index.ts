import type { BlogSeedPost } from "./types";
import { posts as eligibility } from "./category-01-eligibility";
import { posts as syllabus } from "./category-02-syllabus";
import { posts as speedMath } from "./category-03-speedmath";
import { posts as myths } from "./category-04-myths";
import { posts as mistakes } from "./category-05-mistakes";
import { posts as cutoffs } from "./category-06-cutoffs";
import { posts as parents } from "./category-07-parents";
import { posts as examDay } from "./category-08-examday";
import { posts as stories } from "./category-09-stories";
import { posts as afterSelection } from "./category-10-afterselection";

export const blogSeedPosts: BlogSeedPost[] = [
  ...eligibility,
  ...syllabus,
  ...speedMath,
  ...myths,
  ...mistakes,
  ...cutoffs,
  ...parents,
  ...examDay,
  ...stories,
  ...afterSelection,
];

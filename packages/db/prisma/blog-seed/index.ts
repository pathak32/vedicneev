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
import { posts as pyqDeepDives } from "./category-11-pyq-deepdives";
import { posts as admissionsPlaybooks } from "./category-12-admissions-playbooks";
import { posts as pyqMatQuestionTypes } from "./category-13-pyq-mat-questiontypes";
import { posts as pyqArithmeticTopics } from "./category-14-pyq-arithmetic-topics";
import { posts as pyqLanguageAndAissee6 } from "./category-15-pyq-language-and-aissee6";
import { posts as pyqRmsAndCrosscutting } from "./category-16-pyq-rms-and-crosscutting";
import { posts as admissionsReservationAndPlanners } from "./category-17-admissions-reservation-and-planners";
import { posts as admissionsPaperworkAndPostselection } from "./category-18-admissions-paperwork-and-postselection";
import { posts as admissionsDecisionsAndResults } from "./category-19-admissions-decisions-and-results";

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

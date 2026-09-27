import { prisma, type ExamType } from "@vedicneev/db";

export interface BankTopicOption {
  id: string;
  name: string;
  questionCount: number;
}

export interface BankSectionOption {
  key: string;
  name: string;
  topics: BankTopicOption[];
}

const KNOWN_EXAM_TYPES: readonly ExamType[] = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"];

function parseExamType(examCategory: string | null | undefined): ExamType | null {
  if (!examCategory) return null;
  const normalized = examCategory.trim().toUpperCase();
  return (KNOWN_EXAM_TYPES as readonly string[]).includes(normalized) ? (normalized as ExamType) : null;
}

/** Only classes the shared Question bank actually has content for — see ContentClassLevel. */
function parseContentClassLevel(classLevel: string | null | undefined): "CLASS_6" | "CLASS_9" | null {
  const trimmed = classLevel?.trim();
  if (trimmed === "6") return "CLASS_6";
  if (trimmed === "9") return "CLASS_9";
  return null;
}

/**
 * Lists every Topic (grouped by Section) available to generate questions
 * from for this batch's exam board + class, with a live count of how many
 * Question rows are actually in the pool — so the paper-generator UI can
 * show real ceilings instead of letting an institute ask for more
 * questions on a topic than exist.
 *
 * Returns an empty section list (never throws) when the batch's
 * examCategory/classLevel don't match anything the shared bank covers —
 * "generate from bank" is an optional alternative to manual upload, never
 * a hard requirement.
 */
export async function getAvailableBankTopics(
  examCategory: string | null | undefined,
  classLevel: string | null | undefined
): Promise<BankSectionOption[]> {
  const examType = parseExamType(examCategory);
  const contentClassLevel = parseContentClassLevel(classLevel);
  if (!examType || !contentClassLevel) return [];

  const topics = await prisma.topic.findMany({
    where: {
      OR: [{ targetExam: null }, { targetExam: examType }],
      AND: [{ OR: [{ targetClass: null }, { targetClass: contentClassLevel }] }],
    },
    include: {
      section: true,
      _count: {
        select: {
          questions: {
            where: {
              OR: [{ targetExam: null }, { targetExam: examType }],
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const sectionsByKey = new Map<string, BankSectionOption>();
  for (const topic of topics) {
    if (topic._count.questions === 0) continue;
    let section = sectionsByKey.get(topic.section.key);
    if (!section) {
      section = {
        key: topic.section.key,
        name: (topic.section.name as unknown as Record<string, string>).en ?? topic.section.key,
        topics: [],
      };
      sectionsByKey.set(topic.section.key, section);
    }
    section.topics.push({
      id: topic.id,
      name: (topic.name as unknown as Record<string, string>).en ?? topic.key,
      questionCount: topic._count.questions,
    });
  }

  return [...sectionsByKey.values()];
}

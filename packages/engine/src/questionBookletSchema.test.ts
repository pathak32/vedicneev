import { describe, expect, it } from "vitest";

import { extractTopicTitle, scanForSelfCorrectionArtifacts, scanForUnsupportedGlyphs, validateQuestionBookletTopic } from "./questionBookletSchema";

const GOOD_QUESTION = {
  questionNumber: 1,
  question: "What is 7 x 8?",
  options: { A: "54", B: "56", C: "58", D: "64" },
  correctOption: "B",
  explanation: "7 x 8 = 56.",
};

describe("validateQuestionBookletTopic", () => {
  it("accepts a well-formed array of questions", () => {
    const result = validateQuestionBookletTopic([GOOD_QUESTION]);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]).toEqual(GOOD_QUESTION);
  });

  it("accepts an object with a `questions` array", () => {
    const result = validateQuestionBookletTopic({ questions: [GOOD_QUESTION] });
    expect(result.ok).toBe(true);
    expect(result.questions).toHaveLength(1);
  });

  it("tolerates common field-name aliases", () => {
    const aliased = {
      number: 2,
      text: "What is the capital of India?",
      choices: [
        { id: "a", text: "Mumbai" },
        { id: "b", text: "New Delhi" },
        { id: "c", text: "Kolkata" },
        { id: "d", text: "Chennai" },
      ],
      answer: "b",
      solution: "New Delhi is the capital of India.",
    };
    const result = validateQuestionBookletTopic([aliased]);
    expect(result.ok).toBe(true);
    expect(result.questions[0]).toEqual({
      questionNumber: 2,
      question: "What is the capital of India?",
      options: { A: "Mumbai", B: "New Delhi", C: "Kolkata", D: "Chennai" },
      correctOption: "B",
      explanation: "New Delhi is the capital of India.",
    });
  });

  it("accepts the real corpus shape: string options with letter prefixes, id, topicName", () => {
    const real = {
      topicId: 1,
      topicName: "Recognizing Perfect Square Sequences",
      questions: [
        {
          difficulty: "easy",
          question: "What is 8² (8 squared)?",
          options: ["A. 16", "B. 54", "C. 64", "D. 72"],
          answer: "C",
          explanation: "8² = 8 × 8 = 64.",
          id: 3,
        },
      ],
    };
    const result = validateQuestionBookletTopic(real);
    expect(result.ok).toBe(true);
    expect(result.questions[0]).toEqual({
      questionNumber: 3,
      question: "What is 8² (8 squared)?",
      options: { A: "16", B: "54", C: "64", D: "72" },
      correctOption: "C",
      explanation: "8² = 8 × 8 = 64.",
      difficulty: "EASY",
    });
    expect(extractTopicTitle(real, 1)).toBe("Recognizing Perfect Square Sequences");
  });

  it("normalizes difficulty case/synonyms and ignores unrecognized values", () => {
    const withDifficulty = (difficulty: unknown) =>
      validateQuestionBookletTopic([{ ...GOOD_QUESTION, difficulty }]).questions[0]?.difficulty;
    expect(withDifficulty("Hard")).toBe("HARD");
    expect(withDifficulty("moderate")).toBe("MEDIUM");
    expect(withDifficulty("tough")).toBe("HARD");
    expect(withDifficulty("nonsense")).toBeUndefined();
    expect(withDifficulty(undefined)).toBeUndefined();
  });

  it("rejects neither an array nor a {questions: []} object", () => {
    const result = validateQuestionBookletTopic({ foo: "bar" });
    expect(result.ok).toBe(false);
    expect(result.errors[0]!.message).toMatch(/Expected a JSON array/);
  });

  it("collects one error per malformed question without aborting the rest", () => {
    const result = validateQuestionBookletTopic([
      GOOD_QUESTION,
      { questionNumber: 2, question: "Missing options" },
      { questionNumber: 3, question: "Bad answer", options: { A: "1", B: "2", C: "3", D: "4" }, correctOption: "E", explanation: "x" },
    ]);
    expect(result.ok).toBe(false);
    expect(result.questions).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toEqual({ questionNumber: 2, message: "Missing or incomplete options (need all of A/B/C/D)." });
    expect(result.errors[1]!.message).toMatch(/correctOption/);
  });
});

describe("scanForSelfCorrectionArtifacts", () => {
  it("finds nothing in a clean explanation", () => {
    const { questions } = validateQuestionBookletTopic([GOOD_QUESTION]);
    expect(scanForSelfCorrectionArtifacts(questions)).toEqual([]);
  });

  it("flags the documented self-correction failure pattern (topic-1.json Q59/Q72 style)", () => {
    const { questions } = validateQuestionBookletTopic([
      {
        ...GOOD_QUESTION,
        questionNumber: 59,
        explanation: "7 x 8 = 56. Wait, let me reconsider — actually the answer should be C.",
      },
    ]);
    const flags = scanForSelfCorrectionArtifacts(questions);
    expect(flags).toHaveLength(1);
    expect(flags[0]!.questionNumber).toBe(59);
    expect(flags[0]!.matchedPhrase).toBe("wait,");
  });

  it("flags at most once per question even with multiple matching phrases", () => {
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, explanation: "Wait, actually, i made a mistake here." },
    ]);
    expect(scanForSelfCorrectionArtifacts(questions)).toHaveLength(1);
  });
});

describe("scanForUnsupportedGlyphs", () => {
  it("finds nothing in clean plain-ASCII content", () => {
    const { questions } = validateQuestionBookletTopic([GOOD_QUESTION]);
    expect(scanForUnsupportedGlyphs(questions)).toEqual([]);
  });

  it("allows curated safe typography extras", () => {
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, question: "A triangle has a 90° angle; its hypotenuse is 5 cm. 3 × 4 = ? (½ credit for working)." },
    ]);
    expect(scanForUnsupportedGlyphs(questions)).toEqual([]);
  });

  it("flags a Wingdings/Symbol-paste character even though it decodes as a printable letter (the Q80 UPSS Set 1 failure)", () => {
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, question: "In the analogy ™™ Ç ?, what is the missing figure? (Vertical mirror)" },
    ]);
    const findings = scanForUnsupportedGlyphs(questions);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]!.field).toBe("question");
    expect(findings[0]!.char).toBe("™");
  });

  it("flags a bad character in options or explanation too, keyed by field", () => {
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, options: { A: "54", B: "56", C: "58Æ", D: "64" } },
    ]);
    const findings = scanForUnsupportedGlyphs(questions);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.field).toBe("options");
    expect(findings[0]!.char).toBe("Æ");
  });
});

describe("extractTopicTitle", () => {
  it("reads topicTitle/title/name off the file's top level", () => {
    expect(extractTopicTitle({ topicTitle: "Fractions", questions: [] }, 42)).toBe("Fractions");
    expect(extractTopicTitle({ title: "Fractions", questions: [] }, 42)).toBe("Fractions");
    expect(extractTopicTitle({ name: "Fractions", questions: [] }, 42)).toBe("Fractions");
  });

  it("falls back to a generic label when no title field or a bare array", () => {
    expect(extractTopicTitle([GOOD_QUESTION], 42)).toBe("Topic 42");
    expect(extractTopicTitle({ questions: [] }, 7)).toBe("Topic 7");
  });
});

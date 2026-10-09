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
      { ...GOOD_QUESTION, question: "A triangle has a 90° angle; its hypotenuse is 5 cm. 3 × 4 = ? (½ credit for working). What is 5³ and 8²?" },
    ]);
    expect(scanForUnsupportedGlyphs(questions)).toEqual([]);
  });

  it("does not flag ₹/π/√/≈/≠/≤/≥/∞ — sanitizeForPdf already substitutes every one of these before rendering, and they're routine in profit/loss and area/perimeter content (regression: an earlier version of this scanner wrongly excluded 70-80+ questions each from several real topics over exactly this)", () => {
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, question: "A shopkeeper bought an item for ₹500. If π ≈ 3.14 and √16 = 4, and the profit is ≥10% but ≤20% (never ∞ or ≠ the cost price), find the selling price." },
    ]);
    expect(scanForUnsupportedGlyphs(questions)).toEqual([]);
  });

  it("does not flag the full real-corpus set found across class6/en + class9/en — arrows, minus sign, check/cross marks, set/geometry notation, Greek variable names, super/subscripts, Latin-1 Supplement letters, or newlines (regression: a full-corpus scan after the ₹/π/√ fix found ~55 more unhandled characters across thousands of questions)", () => {
    const { questions } = validateQuestionBookletTopic([
      {
        ...GOOD_QUESTION,
        question: "A(1) → C(3), gap = −2. Reverse cipher: A↔Z. ∠AEF = 3x; lines AB ∥ CD; A ⊆ B; x ∈ A; café.\nNext line.",
        explanation: "Check: 3×2+2=8 ✓, 9≠8 ✗. θ=48°, λ=500nm, μ=2, aᵏ×aⁿ=aᵏ⁺ⁿ, H₂SO₄ → H₂O + SO₃↑. 33⅓% and ∛216. Angle of incidence θᵢ equals angle of reflection θᵣ.",
      },
    ]);
    expect(scanForUnsupportedGlyphs(questions)).toEqual([]);
  });

  it("does not flag the class6/en non-verbal-reasoning glyph set found in a second full-corpus scan — directional arrows, shape glyphs, mirror-letter/Hangul analogy puzzles, floor brackets, currency, repeating-decimal macron, and uppercase Greek letters (regression: a scan after the first fix round still found 206 flags in class6/en alone)", () => {
    const { questions } = validateQuestionBookletTopic([
      {
        ...GOOD_QUESTION,
        question: "Leftward (←), Downward (↓), up-left (↖), up-right (↗), down-right (↘), down-left (↙). A star (★☆✦), heart (♥♡), diamond (◆◇◈◊), circle (●○◯), square (■□☐).",
        explanation:
          "Triangles: ▲△▼▽∇◀◁▶◊◷◸◹◺. Arc/corner: ⌐⌢⌣⌜⌝⌞⌟┌. Mirror puzzle: P : Ԁ :: E : Ǝ, N : И :: C : Ɔ, b : ƃ, B : Ḃ, E : Ę, F : Ⅎ, L : ⅂ : ⅃. Hangul: ㄱ:ㄴ::ㄷ:ㄹ. Floor: ⌊7÷2⌋. Brackets: ⟨x⟩. ⊙ ∂ ⊃ ≡. Greek: Γ Φ Ω Ψ Η. Currency: € ₨. Repeating: 0.83̄.",
      },
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
    // Ж (Cyrillic) rather than Æ — Æ is Latin-1 Supplement and genuinely
    // renders fine in WinAnsi, so it's correctly no longer flagged; this
    // test just needs any character outside every safe range.
    const { questions } = validateQuestionBookletTopic([
      { ...GOOD_QUESTION, options: { A: "54", B: "56", C: "58Ж", D: "64" } },
    ]);
    const findings = scanForUnsupportedGlyphs(questions);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.field).toBe("options");
    expect(findings[0]!.char).toBe("Ж");
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

import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Area/Perimeter/Volume pool (Arithmetic ->
 * "area_perimeter_volume" topic, JNVST): 10 Easy / 15 Moderate / 15 Hard.
 * Every correct answer is computed by the real mensuration formulas
 * (perimeter/area of rectangles/squares/triangles/circles, volume of
 * cuboids/cubes) — never hand-typed — and assertDistinctOptions guards
 * against a construction bug seeding a broken question. Circle
 * calculations use π = 22/7 throughout (the standard Class 6 convention),
 * chosen consistently so a distractor built from the "wrong constant"
 * mistake (3.14 vs 22/7) is always a genuinely different number.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;
const PI = 22 / 7;

function unitText(n: number, unit: string): LangText {
  const rounded = Math.round(n * 100) / 100;
  return { en: `${rounded} ${unit}`, hi: `${rounded} ${unit}` };
}

function padDistinctNumbers(base: number[], target: number, correct: number, step: number, min = 0): number[] {
  const values = Array.from(new Set(base.filter((v) => v !== correct && v >= min)));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = Math.max(min, Math.round((correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1)) * 100) / 100);
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctNumbers: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

function buildQuestion(
  correctIndex: number,
  correctValue: number,
  distractorValues: [number, number, number],
  distractorReasons: [LangText, LangText, LangText],
  unit: string
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctValue,
    distractorValues,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: unitText(contents[i]!, unit) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×10): perimeter of a rectangle or square ────────────────────────
function perimeterQuestions(): GeneratedQuestion[] {
  const params: { l: number; w: number }[] = [
    { l: 10, w: 6 }, { l: 8, w: 8 }, { l: 15, w: 9 }, { l: 12, w: 12 }, { l: 20, w: 14 },
    { l: 7, w: 7 }, { l: 18, w: 11 }, { l: 25, w: 16 }, { l: 9, w: 9 }, { l: 22, w: 13 },
  ];
  return params.map(({ l, w }, i) => {
    const isSquare = l === w;
    const correct = 2 * (l + w);
    const distractorBase = [l * w, l + w, correct + 4];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 4, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "This is the AREA (length × width), not the perimeter.", hi: "यह क्षेत्रफल (लंबाई × चौड़ाई) है, परिमाप नहीं।" },
        { en: "Adds length and width once, but forgets that a rectangle has TWO of each side.", hi: "लंबाई और चौड़ाई को एक बार जोड़ता है, पर भूल जाता है कि आयत में प्रत्येक भुजा दो-दो होती हैं।" },
        { en: "Off by a small amount — an arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में एक अंकगणितीय गलती।" },
      ],
      "units"
    );
    const key = `bank-ar-apv-perimeter-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `Find the perimeter of a ${isSquare ? "square" : "rectangle"} with length ${l} units and width ${w} units.`,
        hi: `${l} इकाई लंबाई और ${w} इकाई चौड़ाई वाले ${isSquare ? "वर्ग" : "आयत"} का परिमाप ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `Perimeter = 2 × (length + width) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${correct} units.`,
        hi: `परिमाप = 2 × (लंबाई + चौड़ाई) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${correct} इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: area of a rectangle or square ──────────────────
function areaRectangleQuestions(): GeneratedQuestion[] {
  const params: { l: number; w: number }[] = [
    { l: 12, w: 7 }, { l: 9, w: 9 }, { l: 16, w: 10 }, { l: 14, w: 14 }, { l: 20, w: 8 },
  ];
  return params.map(({ l, w }, i) => {
    const isSquare = l === w;
    const correct = l * w;
    const distractorBase = [2 * (l + w), l + w, correct + l];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, l, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: "This is the PERIMETER (2 × (length + width)), not the area.", hi: "यह परिमाप (2 × (लंबाई + चौड़ाई)) है, क्षेत्रफल नहीं।" },
        { en: "Just adds length and width instead of multiplying them.", hi: "लंबाई और चौड़ाई को गुणा करने के बजाय बस जोड़ देता है।" },
        { en: "Off by a small amount — an arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में एक अंकगणितीय गलती।" },
      ],
      "sq. units"
    );
    const key = `bank-ar-apv-arearect-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `Find the area of a ${isSquare ? "square" : "rectangle"} with length ${l} units and width ${w} units.`,
        hi: `${l} इकाई लंबाई और ${w} इकाई चौड़ाई वाले ${isSquare ? "वर्ग" : "आयत"} का क्षेत्रफल ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `Area = length × width = ${l} × ${w} = ${correct} sq. units.`,
        hi: `क्षेत्रफल = लंबाई × चौड़ाई = ${l} × ${w} = ${correct} वर्ग इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: area of a triangle ─────────────────────────────
function areaTriangleQuestions(): GeneratedQuestion[] {
  const params: { base: number; height: number }[] = [
    { base: 10, height: 8 }, { base: 14, height: 6 }, { base: 12, height: 9 }, { base: 16, height: 5 }, { base: 20, height: 7 },
  ];
  return params.map(({ base, height }, i) => {
    const correct = (base * height) / 2;
    const distractorBase = [base * height, (base + height) / 2, correct + base / 2];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, base / 2, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Forgets to divide by 2 — this is base × height, the area of a rectangle with the same base and height, not a triangle.", hi: "2 से भाग देना भूल जाता है — यह आधार × ऊँचाई है, समान आधार और ऊँचाई वाले आयत का क्षेत्रफल, त्रिभुज का नहीं।" },
        { en: "Averages the base and height instead of using the triangle area formula.", hi: "त्रिभुज क्षेत्रफल सूत्र का उपयोग करने के बजाय आधार और ऊँचाई का औसत निकाल लेता है।" },
        { en: "Off by a small amount — an arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में एक अंकगणितीय गलती।" },
      ],
      "sq. units"
    );
    const key = `bank-ar-apv-areatriangle-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `Find the area of a triangle with base ${base} units and height ${height} units.`, hi: `${base} इकाई आधार और ${height} इकाई ऊँचाई वाले त्रिभुज का क्षेत्रफल ज्ञात करें।` },
      options,
      correctOption,
      explanation: {
        en: `Area = ½ × base × height = ½ × ${base} × ${height} = ${correct} sq. units.`,
        hi: `क्षेत्रफल = ½ × आधार × ऊँचाई = ½ × ${base} × ${height} = ${correct} वर्ग इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: circumference of a circle (π = 22/7) ──────────
function circumferenceQuestions(): GeneratedQuestion[] {
  const radii = [7, 14, 21, 28, 35];
  return radii.map((r, i) => {
    const correct = Math.round(2 * PI * r * 100) / 100;
    const distractorBase = [
      Math.round(PI * r * r * 100) / 100, // uses the area formula instead
      Math.round(2 * 3.14 * r * 100) / 100, // uses 3.14 instead of 22/7 — genuinely different since r is a multiple of 7
      Math.round((correct + 2 * r) * 100) / 100, // forgets the ×2 (uses just π×r instead of 2πr)
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, r, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "This is the formula for AREA (π × r²), not circumference.", hi: "यह क्षेत्रफल का सूत्र है (π × r²), परिधि का नहीं।" },
        { en: "Uses 3.14 for π instead of 22/7 — close, but not the exact value expected here.", hi: "π के लिए 22/7 के बजाय 3.14 का उपयोग करता है — करीब है, पर यहाँ अपेक्षित सटीक मान नहीं।" },
        { en: "Forgets to double the result — uses π × r instead of 2 × π × r.", hi: "परिणाम को दोगुना करना भूल जाता है — 2 × π × r के बजाय केवल π × r का उपयोग करता है।" },
      ],
      "units"
    );
    const key = `bank-ar-apv-circumference-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `Find the circumference of a circle with radius ${r} units. (Use π = 22/7)`, hi: `${r} इकाई त्रिज्या वाले वृत्त की परिधि ज्ञात करें। (π = 22/7 का उपयोग करें)` },
      options,
      correctOption,
      explanation: {
        en: `Circumference = 2 × π × r = 2 × 22/7 × ${r} = ${correct} units.`,
        hi: `परिधि = 2 × π × r = 2 × 22/7 × ${r} = ${correct} इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: volume of a cuboid ───────────────────────────────
function volumeCuboidQuestions(): GeneratedQuestion[] {
  const params: { l: number; w: number; h: number }[] = [
    { l: 10, w: 6, h: 4 }, { l: 12, w: 8, h: 5 }, { l: 15, w: 9, h: 6 }, { l: 8, w: 8, h: 8 }, { l: 20, w: 10, h: 7 },
  ];
  return params.map(({ l, w, h }, i) => {
    const correct = l * w * h;
    const distractorBase = [2 * (l * w + w * h + h * l), l * w, correct + l * w];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, l * w, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: "This is the SURFACE AREA formula (2 × (lw + wh + hl)), not the volume.", hi: "यह पृष्ठीय क्षेत्रफल का सूत्र है (2 × (lw + wh + hl)), आयतन का नहीं।" },
        { en: "Only multiplies two of the three dimensions, forgetting the height entirely.", hi: "तीन में से केवल दो विमाओं को गुणा करता है, ऊँचाई को पूरी तरह भूल जाता है।" },
        { en: "Off by one extra layer — an arithmetic slip in the final multiplication.", hi: "एक अतिरिक्त परत की चूक — अंतिम गुणा में एक अंकगणितीय गलती।" },
      ],
      "cu. units"
    );
    const key = `bank-ar-apv-volumecuboid-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `Find the volume of a cuboid with length ${l}, width ${w}, and height ${h} units.`, hi: `${l} लंबाई, ${w} चौड़ाई, और ${h} ऊँचाई (इकाई में) वाले घनाभ का आयतन ज्ञात करें।` },
      options,
      correctOption,
      explanation: {
        en: `Volume = length × width × height = ${l} × ${w} × ${h} = ${correct} cu. units.`,
        hi: `आयतन = लंबाई × चौड़ाई × ऊँचाई = ${l} × ${w} × ${h} = ${correct} घन इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: volume of a cube ─────────────────────────────────
function volumeCubeQuestions(): GeneratedQuestion[] {
  const sides = [4, 5, 6, 7, 8];
  return sides.map((s, i) => {
    const correct = s * s * s;
    const distractorBase = [6 * s * s, s * s, correct + s * s];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, s * s, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "This is the total SURFACE AREA of the cube (6 × side²), not the volume.", hi: "यह घन का कुल पृष्ठीय क्षेत्रफल है (6 × भुजा²), आयतन नहीं।" },
        { en: "This is the area of just ONE face of the cube (side²), not the full 3D volume.", hi: "यह घन के केवल एक फलक का क्षेत्रफल है (भुजा²), पूर्ण 3D आयतन नहीं।" },
        { en: "Off by one extra layer — an arithmetic slip in the final multiplication.", hi: "एक अतिरिक्त परत की चूक — अंतिम गुणा में एक अंकगणितीय गलती।" },
      ],
      "cu. units"
    );
    const key = `bank-ar-apv-volumecube-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `Find the volume of a cube with side length ${s} units.`, hi: `${s} इकाई भुजा वाले घन का आयतन ज्ञात करें।` },
      options,
      correctOption,
      explanation: {
        en: `Volume = side³ = ${s} × ${s} × ${s} = ${correct} cu. units.`,
        hi: `आयतन = भुजा³ = ${s} × ${s} × ${s} = ${correct} घन इकाई।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: word problem — cost of fencing (perimeter × rate) ─
function fencingWordProblemQuestions(): GeneratedQuestion[] {
  const params: { l: number; w: number; rate: number }[] = [
    { l: 30, w: 20, rate: 15 }, { l: 25, w: 18, rate: 20 }, { l: 40, w: 25, rate: 12 }, { l: 22, w: 22, rate: 18 }, { l: 35, w: 15, rate: 25 },
  ];
  return params.map(({ l, w, rate }, i) => {
    const perimeter = 2 * (l + w);
    const correct = perimeter * rate;
    const distractorBase = [l * w * rate, perimeter, correct + rate * 4];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, rate * 4, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Multiplies the AREA by the rate instead of the perimeter — fencing goes around the boundary, not over the surface.", hi: "परिमाप के बजाय क्षेत्रफल को दर से गुणा कर देता है — बाड़ सीमा के चारों ओर लगती है, सतह पर नहीं।" },
        { en: "Computes the perimeter correctly but forgets to multiply by the rate per unit — that's just the fence's length, not its cost.", hi: "परिमाप तो सही निकालता है, पर प्रति इकाई दर से गुणा करना भूल जाता है — यह केवल बाड़ की लंबाई है, उसकी लागत नहीं।" },
        { en: "Off by one extra length-unit's worth of rate — a small arithmetic slip.", hi: "दर की एक अतिरिक्त लंबाई-इकाई की चूक — एक छोटी सी अंकगणितीय गलती।" },
      ],
      "rupees"
    );
    const key = `bank-ar-apv-fencing-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `A rectangular field is ${l}m long and ${w}m wide. Find the cost of fencing it at ₹${rate} per metre.`,
        hi: `एक आयताकार मैदान ${l}मीटर लंबा और ${w}मीटर चौड़ा है। इसमें ₹${rate} प्रति मीटर की दर से बाड़ लगाने की लागत ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `Perimeter = 2 × (${l} + ${w}) = ${perimeter}m. Cost = ${perimeter} × ₹${rate} = ₹${correct}.`,
        hi: `परिमाप = 2 × (${l} + ${w}) = ${perimeter}मीटर। लागत = ${perimeter} × ₹${rate} = ₹${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildAreaPerimeterVolumeQuestions(): GeneratedQuestion[] {
  const all = [
    ...perimeterQuestions(),
    ...areaRectangleQuestions(),
    ...areaTriangleQuestions(),
    ...circumferenceQuestions(),
    ...volumeCuboidQuestions(),
    ...volumeCubeQuestions(),
    ...fencingWordProblemQuestions(),
  ].map((q) => ({ ...q, targetExam: "JNVST" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Area/Perimeter/Volume pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}

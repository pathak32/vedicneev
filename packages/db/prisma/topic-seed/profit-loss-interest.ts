import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Profit & Loss / Simple Interest pool
 * (Arithmetic -> "profit_loss_interest" topic, JNVST): 10 Easy / 15
 * Moderate / 15 Hard. Every correct answer is computed by the real
 * commercial-math formulas (profit% = (SP-CP)/CP × 100, SI = PRT/100,
 * etc.) — never hand-typed — and assertDistinctOptions guards against a
 * construction bug seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function money(n: number): LangText {
  const rounded = Math.round(n * 100) / 100;
  return { en: `₹${rounded}`, hi: `₹${rounded}` };
}
function percent(n: number): LangText {
  const rounded = Math.round(n * 100) / 100;
  return { en: `${rounded}%`, hi: `${rounded}%` };
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
  formatter: (n: number) => LangText = (n) => ({ en: String(n), hi: String(n) })
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctValue,
    distractorValues,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: formatter(contents[i]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×10): find profit or loss PERCENT given CP and SP ──────────────
function profitLossPercentQuestions(): GeneratedQuestion[] {
  const params: { cp: number; sp: number }[] = [
    { cp: 100, sp: 120 }, { cp: 200, sp: 180 }, { cp: 250, sp: 300 }, { cp: 400, sp: 360 }, { cp: 150, sp: 165 },
    { cp: 500, sp: 450 }, { cp: 80, sp: 100 }, { cp: 600, sp: 540 }, { cp: 120, sp: 150 }, { cp: 300, sp: 270 },
  ];
  return params.map(({ cp, sp }, i) => {
    const isProfit = sp > cp;
    const correct = Math.round((Math.abs(sp - cp) / cp) * 10000) / 100;
    const distractorBase = [
      Math.round((Math.abs(sp - cp) / sp) * 10000) / 100, // divides by SP instead of CP
      Math.round((Math.abs(sp - cp) / 100) * 10000) / 100, // divides by 100 instead of CP
      Math.round((correct + 5) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 3, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Divides by the Selling Price instead of the Cost Price — profit/loss percent is always calculated on the ORIGINAL cost.", hi: "क्रय मूल्य के बजाय विक्रय मूल्य से भाग देता है — लाभ/हानि प्रतिशत हमेशा मूल क्रय मूल्य पर निकाला जाता है।" },
        { en: "Divides the difference by 100 directly instead of by the Cost Price.", hi: "अंतर को क्रय मूल्य के बजाय सीधे 100 से भाग देता है।" },
        { en: "Off by a few percentage points — a small arithmetic slip in the final calculation.", hi: "कुछ प्रतिशत अंकों की चूक — अंतिम गणना में एक छोटी सी अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-percent-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `A shopkeeper buys an item for ₹${cp} and sells it for ₹${sp}. What is the ${isProfit ? "profit" : "loss"} percent?`,
        hi: `एक दुकानदार एक वस्तु ₹${cp} में खरीदता है और ₹${sp} में बेचता है। ${isProfit ? "लाभ" : "हानि"} प्रतिशत क्या है?`,
      },
      options: options.map((o) => ({ id: o.id, text: percent(Number(o.text.en.replace("%", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `${isProfit ? "Profit" : "Loss"} = |₹${sp} − ₹${cp}| = ₹${Math.abs(sp - cp)}. ${isProfit ? "Profit" : "Loss"}% = (${Math.abs(sp - cp)} ÷ ${cp}) × 100 = ${correct}%.`,
        hi: `${isProfit ? "लाभ" : "हानि"} = |₹${sp} − ₹${cp}| = ₹${Math.abs(sp - cp)}। ${isProfit ? "लाभ" : "हानि"}% = (${Math.abs(sp - cp)} ÷ ${cp}) × 100 = ${correct}%।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: find SP given CP and profit% ───────────────────
function findSPQuestions(): GeneratedQuestion[] {
  const params: { cp: number; profitPct: number }[] = [
    { cp: 200, profitPct: 10 }, { cp: 500, profitPct: 20 }, { cp: 350, profitPct: 8 }, { cp: 800, profitPct: 15 }, { cp: 250, profitPct: 12 },
  ];
  return params.map(({ cp, profitPct }, i) => {
    const correct = Math.round(cp * (1 + profitPct / 100) * 100) / 100;
    const distractorBase = [
      Math.round(cp * (profitPct / 100) * 100) / 100, // forgets to add CP back — just the profit amount
      Math.round(cp * (1 - profitPct / 100) * 100) / 100, // treats profit% as loss%
      Math.round((correct + 10) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 10, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: "This is just the PROFIT amount, not the final Selling Price — forgets to add it back to the Cost Price.", hi: "यह केवल लाभ की राशि है, अंतिम विक्रय मूल्य नहीं — इसे क्रय मूल्य में वापस जोड़ना भूल जाता है।" },
        { en: "Subtracts the percentage instead of adding it — treats a profit like a loss.", hi: "प्रतिशत को जोड़ने के बजाय घटा देता है — लाभ को हानि जैसा मान लेता है।" },
        { en: "Off by a small amount — a rounding or arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-findsp-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A shopkeeper buys an item for ₹${cp} and wants to make a profit of ${profitPct}%. At what price should they sell it?`,
        hi: `एक दुकानदार एक वस्तु ₹${cp} में खरीदता है और ${profitPct}% लाभ कमाना चाहता है। उसे इसे किस मूल्य पर बेचना चाहिए?`,
      },
      options: options.map((o) => ({ id: o.id, text: money(Number(o.text.en.replace("₹", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `SP = CP × (1 + Profit%/100) = ₹${cp} × (1 + ${profitPct}/100) = ₹${cp} × ${1 + profitPct / 100} = ₹${correct}.`,
        hi: `SP = CP × (1 + लाभ%/100) = ₹${cp} × (1 + ${profitPct}/100) = ₹${cp} × ${1 + profitPct / 100} = ₹${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: find CP given SP and loss% ──────────────────────
function findCPQuestions(): GeneratedQuestion[] {
  const params: { sp: number; lossPct: number }[] = [
    { sp: 180, lossPct: 10 }, { sp: 460, lossPct: 8 }, { sp: 342, lossPct: 5 }, { sp: 680, lossPct: 15 }, { sp: 216, lossPct: 10 },
  ];
  return params.map(({ sp, lossPct }, i) => {
    const correct = Math.round((sp / (1 - lossPct / 100)) * 100) / 100;
    const distractorBase = [
      Math.round(sp * (1 - lossPct / 100) * 100) / 100, // multiplies by the loss factor instead of dividing
      Math.round(sp * (1 + lossPct / 100) * 100) / 100, // treats loss% as profit%
      Math.round((correct - 10) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 10, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Multiplies SP by the loss factor instead of dividing by it — the loss is a percentage OF the cost price, not of the selling price.", hi: "हानि कारक से विक्रय मूल्य को भाग देने के बजाय गुणा कर देता है — हानि विक्रय मूल्य का नहीं, क्रय मूल्य का प्रतिशत होती है।" },
        { en: "Adds the percentage instead of subtracting it — treats a loss like a profit.", hi: "प्रतिशत को घटाने के बजाय जोड़ देता है — हानि को लाभ जैसा मान लेता है।" },
        { en: "Off by a small amount — a rounding or arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-findcp-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A shopkeeper sells an item for ₹${sp}, incurring a loss of ${lossPct}%. What was the Cost Price?`,
        hi: `एक दुकानदार एक वस्तु ₹${sp} में बेचता है, जिसमें उसे ${lossPct}% की हानि होती है। क्रय मूल्य क्या था?`,
      },
      options: options.map((o) => ({ id: o.id, text: money(Number(o.text.en.replace("₹", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `SP = CP × (1 − Loss%/100), so CP = SP ÷ (1 − Loss%/100) = ₹${sp} ÷ ${1 - lossPct / 100} = ₹${correct}.`,
        hi: `SP = CP × (1 − हानि%/100), इसलिए CP = SP ÷ (1 − हानि%/100) = ₹${sp} ÷ ${1 - lossPct / 100} = ₹${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: basic Simple Interest, SI = PRT/100 ───────────
function basicSIQuestions(): GeneratedQuestion[] {
  const params: { p: number; r: number; t: number }[] = [
    { p: 1000, r: 5, t: 2 }, { p: 2000, r: 6, t: 3 }, { p: 1500, r: 4, t: 4 }, { p: 5000, r: 8, t: 2 }, { p: 800, r: 10, t: 3 },
  ];
  return params.map(({ p, r, t }, i) => {
    const correct = Math.round(((p * r * t) / 100) * 100) / 100;
    const distractorBase = [
      Math.round(((p * r) / 100) * 100) / 100, // forgets to multiply by time
      Math.round(((p * t) / 100) * 100) / 100, // uses time instead of rate
      Math.round((correct + p * 0.01) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, Math.max(10, p * 0.01), 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: `Forgets to multiply by the time period (${t} years) — only computes interest for a single year.`, hi: `समय अवधि (${t} वर्ष) से गुणा करना भूल जाता है — केवल एक वर्ष का ब्याज निकालता है।` },
        { en: "Uses the time period in place of the rate of interest — mixes up the two numbers in the formula.", hi: "ब्याज दर के स्थान पर समय अवधि का उपयोग कर देता है — सूत्र में दोनों संख्याओं को गड़बड़ा देता है।" },
        { en: "Off by a small amount — a rounding or arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-basicsi-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `Find the Simple Interest on ₹${p} at ${r}% per annum for ${t} years.`,
        hi: `₹${p} पर ${r}% वार्षिक दर से ${t} वर्षों का साधारण ब्याज ज्ञात करें।`,
      },
      options: options.map((o) => ({ id: o.id, text: money(Number(o.text.en.replace("₹", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `SI = (P × R × T) ÷ 100 = (${p} × ${r} × ${t}) ÷ 100 = ₹${correct}.`,
        hi: `SI = (P × R × T) ÷ 100 = (${p} × ${r} × ${t}) ÷ 100 = ₹${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: find Principal given SI, rate, and time ─────────
function findPrincipalQuestions(): GeneratedQuestion[] {
  const params: { si: number; r: number; t: number }[] = [
    { si: 300, r: 6, t: 5 }, { si: 480, r: 8, t: 4 }, { si: 225, r: 5, t: 3 }, { si: 640, r: 10, t: 2 }, { si: 360, r: 6, t: 6 },
  ];
  return params.map(({ si, r, t }, i) => {
    const correct = Math.round(((si * 100) / (r * t)) * 100) / 100;
    const distractorBase = [
      Math.round(si * r * t * 100) / 100, // multiplies instead of dividing
      Math.round(((si * 100) / r) * 100) / 100, // forgets to divide by time too
      Math.round((correct + 100) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 100, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: "Multiplies SI by rate and time instead of dividing — inverts the rearranged formula.", hi: "भाग देने के बजाय SI को दर और समय से गुणा कर देता है — पुनर्व्यवस्थित सूत्र को उल्टा कर देता है।" },
        { en: "Divides by the rate only, forgetting to also divide by the time period.", hi: "केवल दर से भाग देता है, समय अवधि से भी भाग देना भूल जाता है।" },
        { en: "Off by a small amount — a rounding or arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-findprincipal-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `A sum of money earns a Simple Interest of ₹${si} at ${r}% per annum over ${t} years. What was the Principal?`,
        hi: `एक धनराशि पर ${r}% वार्षिक दर से ${t} वर्षों में ₹${si} का साधारण ब्याज मिलता है। मूलधन क्या था?`,
      },
      options: options.map((o) => ({ id: o.id, text: money(Number(o.text.en.replace("₹", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `SI = (P × R × T) ÷ 100, so P = (SI × 100) ÷ (R × T) = (${si} × 100) ÷ (${r} × ${t}) = ₹${correct}.`,
        hi: `SI = (P × R × T) ÷ 100, इसलिए P = (SI × 100) ÷ (R × T) = (${si} × 100) ÷ (${r} × ${t}) = ₹${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: find rate given SI, Principal, and time ─────────
function findRateQuestions(): GeneratedQuestion[] {
  const params: { p: number; si: number; t: number }[] = [
    { p: 2000, si: 400, t: 4 }, { p: 1500, si: 270, t: 3 }, { p: 4000, si: 480, t: 2 }, { p: 2500, si: 500, t: 5 }, { p: 3000, si: 360, t: 3 },
  ];
  return params.map(({ p, si, t }, i) => {
    const correct = Math.round(((si * 100) / (p * t)) * 100) / 100;
    const distractorBase = [
      Math.round(((si * 100) / p) * 100) / 100, // forgets to divide by time
      Math.round(((si * t) / p) * 100) / 100, // forgets the ×100
      Math.round((correct + 2) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 2, 0) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Forgets to also divide by the time period, giving a rate several times too large.", hi: "समय अवधि से भी भाग देना भूल जाता है, जिससे दर कई गुना अधिक बड़ी हो जाती है।" },
        { en: "Forgets to multiply by 100 when converting to a percentage rate.", hi: "प्रतिशत दर में बदलते समय 100 से गुणा करना भूल जाता है।" },
        { en: "Off by a small amount — a rounding or arithmetic slip in the final calculation.", hi: "थोड़ी सी चूक — अंतिम गणना में पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-findrate-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `A Principal of ₹${p} earns ₹${si} Simple Interest over ${t} years. What is the annual rate of interest?`,
        hi: `₹${p} के मूलधन पर ${t} वर्षों में ₹${si} का साधारण ब्याज मिलता है। वार्षिक ब्याज दर क्या है?`,
      },
      options: options.map((o) => ({ id: o.id, text: percent(Number(o.text.en.replace("%", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `SI = (P × R × T) ÷ 100, so R = (SI × 100) ÷ (P × T) = (${si} × 100) ÷ (${p} × ${t}) = ${correct}%.`,
        hi: `SI = (P × R × T) ÷ 100, इसलिए R = (SI × 100) ÷ (P × T) = (${si} × 100) ÷ (${p} × ${t}) = ${correct}%।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: marked price + discount + profit combined ───────
function markedPriceDiscountQuestions(): GeneratedQuestion[] {
  const params: { mp: number; discountPct: number; cp: number }[] = [
    { mp: 500, discountPct: 10, cp: 400 }, { mp: 800, discountPct: 15, cp: 600 }, { mp: 1000, discountPct: 20, cp: 720 },
    { mp: 600, discountPct: 5, cp: 500 }, { mp: 1200, discountPct: 25, cp: 800 },
  ];
  return params.map(({ mp, discountPct, cp }, i) => {
    const sp = Math.round(mp * (1 - discountPct / 100) * 100) / 100;
    const correct = Math.round(((sp - cp) / cp) * 10000) / 100;
    const distractorBase = [
      Math.round(((mp - cp) / cp) * 10000) / 100, // forgets the discount, uses marked price instead of selling price
      Math.round(((sp - cp) / mp) * 10000) / 100, // divides by marked price instead of cost price
      Math.round((correct + 5) * 100) / 100,
    ];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 3, -100) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Uses the Marked Price instead of the actual Selling Price (after discount) to compute profit — ignores the discount entirely.", hi: "लाभ की गणना के लिए वास्तविक विक्रय मूल्य (छूट के बाद) के बजाय अंकित मूल्य का उपयोग करता है — छूट को पूरी तरह नज़रअंदाज़ कर देता है।" },
        { en: "Divides by the Marked Price instead of the Cost Price — profit percent is always on the cost price.", hi: "क्रय मूल्य के बजाय अंकित मूल्य से भाग देता है — लाभ प्रतिशत हमेशा क्रय मूल्य पर होता है।" },
        { en: "Off by a few percentage points — a small arithmetic slip in the final calculation.", hi: "कुछ प्रतिशत अंकों की चूक — अंतिम गणना में एक छोटी सी अंकगणितीय गलती।" },
      ]
    );
    const key = `bank-ar-plinterest-markedprice-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `An item is marked at ₹${mp} with a ${discountPct}% discount, and cost the shopkeeper ₹${cp}. What is the shopkeeper's profit percent on the actual sale?`,
        hi: `एक वस्तु का अंकित मूल्य ₹${mp} है जिस पर ${discountPct}% की छूट है, और दुकानदार को यह ₹${cp} में मिली थी। वास्तविक बिक्री पर दुकानदार का लाभ प्रतिशत क्या है?`,
      },
      options: options.map((o) => ({ id: o.id, text: percent(Number(o.text.en.replace("%", ""))) })) as [
        OptionSeed,
        OptionSeed,
        OptionSeed,
        OptionSeed
      ],
      correctOption,
      explanation: {
        en: `Selling Price after discount = ₹${mp} × (1 − ${discountPct}/100) = ₹${sp}. Profit% = ((${sp} − ${cp}) ÷ ${cp}) × 100 = ${correct}%.`,
        hi: `छूट के बाद विक्रय मूल्य = ₹${mp} × (1 − ${discountPct}/100) = ₹${sp}। लाभ% = ((${sp} − ${cp}) ÷ ${cp}) × 100 = ${correct}%।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildProfitLossInterestQuestions(): GeneratedQuestion[] {
  const all = [
    ...profitLossPercentQuestions(),
    ...findSPQuestions(),
    ...findCPQuestions(),
    ...basicSIQuestions(),
    ...findPrincipalQuestions(),
    ...findRateQuestions(),
    ...markedPriceDiscountQuestions(),
  ].map((q) => ({ ...q, targetExam: "JNVST" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Profit & Loss / Simple Interest pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}

import type { PyqSeedItem } from "./types";

// JNVST Class 9, Gemini-drafted sample paper 1 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
//
// Corrected at ingestion: item 1 (0-based, source array index)
// had a stale correctOptionIndex left over from the source explanation's own
// self-correction — the explanation text derives the right answer but the
// index field was never updated to match. Fixed here to the index the
// explanation itself arrives at (independently re-verified by hand).
export const posts: PyqSeedItem[] = [
  {
    key: "jnvst9-gem1-mt-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    questionJson: { en: "Find the simplified value of (2/3)^(-3) * (2/3)^(5).", hi: "(2/3)^(-3) * (2/3)^(5) का सरलीकृत मान ज्ञात कीजिए।" },
    optionsJson: [
      { en: "4/9", hi: "4/9" },
      { en: "9/4", hi: "9/4" },
      { en: "8/27", hi: "8/27" },
      { en: "27/8", hi: "27/8" }
    ],
    correctAnswer: 0,
    explanation: { en: "Using the exponent law a^m * a^n = a^(m+n): (2/3)^(-3+5) = (2/3)^2 = 4/9.", hi: "घातांक नियम a^m * a^n = a^(m+n) का उपयोग करने पर: (2/3)^(-3+5) = (2/3)^2 = 4/9।" },
  },
  {
    key: "jnvst9-gem1-mt-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: { en: "Solve for x: (3x + 5) / 2 = (2x + 8) / 3.", hi: "x का मान ज्ञात कीजिए: (3x + 5) / 2 = (2x + 8) / 3।" },
    optionsJson: [
      { en: "x = 1", hi: "x = 1" },
      { en: "x = 2", hi: "x = 2" },
      { en: "x = 1/5", hi: "x = 1/5" },
      { en: "x = 3", hi: "x = 3" }
    ],
    correctAnswer: 2,
    explanation: { en: "Cross-multiplying: 3(3x + 5) = 2(2x + 8) => 9x + 15 = 4x + 16 => 5x = 1 => x = 1/5.", hi: "तिर्यक गुणा करने पर: 3(3x + 5) = 2(2x + 8) => 9x + 15 = 4x + 16 => 5x = 1 => x = 1/5।" },
  },
  {
    key: "jnvst9-gem1-mt-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    questionJson: { en: "The diagonals of a rhombus are 16 cm and 12 cm long. Find the length of each side of the rhombus.", hi: "एक समचतुर्भुज (Rhombus) के विकर्णों की लंबाई 16 सेमी और 12 सेमी है। समचतुर्भुज की प्रत्येक भुजा की लंबाई ज्ञात कीजिए।" },
    optionsJson: [
      { en: "8 cm", hi: "8 सेमी" },
      { en: "10 cm", hi: "10 सेमी" },
      { en: "14 cm", hi: "14 सेमी" },
      { en: "20 cm", hi: "20 सेमी" }
    ],
    correctAnswer: 1,
    explanation: { en: "Diagonals of a rhombus bisect each other at right angles (90°). Half-diagonals are d1/2 = 8 cm and d2/2 = 6 cm. By Pythagoras theorem, Side = sqrt(8^2 + 6^2) = sqrt(64 + 36) = sqrt(100) = 10 cm.", hi: "समचतुर्भुज के विकर्ण एक-दूसरे को समकोण (90°) पर समद्विभाजित करते हैं। आधे विकर्ण: d1/2 = 8 सेमी और d2/2 = 6 सेमी। पाइथागोरस प्रमेय से: भुजा = sqrt(8^2 + 6^2) = sqrt(100) = 10 सेमी।" },
  },
  {
    key: "jnvst9-gem1-sc-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    questionJson: { en: "Which organelle is known as the 'Powerhouse of the Cell'?", hi: "किस कोशिकांग (Cell Organelle) को 'कोशिका का पावरहाउस' कहा जाता है?" },
    optionsJson: [
      { en: "Ribosome", hi: "राइबोसोम" },
      { en: "Mitochondria", hi: "माइटोकॉन्ड्रिया" },
      { en: "Lysosome", hi: "लाइसोसोम" },
      { en: "Golgi Apparatus", hi: "गॉल्जी काय" }
    ],
    correctAnswer: 1,
    explanation: { en: "Mitochondria are responsible for generating energy in the form of ATP molecules through cellular respiration, making them the powerhouse of the cell.", hi: "माइटोकॉन्ड्रिया कोशिकीय श्वसन के माध्यम से ATP अणुओं के रूप में ऊर्जा का उत्पादन करते हैं, इसलिए इन्हें कोशिका का पावरहाउस कहा जाता है।" },
  },
  {
    key: "jnvst9-gem1-sc-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "MEDIUM",
    questionJson: { en: "Which type of friction comes into play when one body rolls over the surface of another body?", hi: "जब एक पिंड दूसरे पिंड की सतह पर लुढ़कता है, तो किस प्रकार का घर्षण बल कार्य करता है?" },
    optionsJson: [
      { en: "Static Friction", hi: "स्थैतिक घर्षण" },
      { en: "Sliding Friction", hi: "सर्पी घर्षण" },
      { en: "Rolling Friction", hi: "लूटनिक (बेलन) घर्षण" },
      { en: "Fluid Friction", hi: "द्रव घर्षण" }
    ],
    correctAnswer: 2,
    explanation: { en: "Rolling friction occurs when an object rolls over a surface. It is significantly smaller in magnitude than static or sliding friction.", hi: "लूटनिक घर्षण तब होता है जब कोई वस्तु किसी सतह पर लुढ़कती है। इसका मान स्थैतिक या सर्पी घर्षण की तुलना में बहुत कम होता है।" },
  },
  {
    key: "jnvst9-gem1-sc-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "HARD",
    questionJson: { en: "During the electroplating of copper onto an iron key, which electrode should the iron key be attached to?", hi: "लोहे की चाबी पर तांबे (कॉपर) का विद्युत लेपन करते समय लोहे की चाबी को किस इलेक्ट्रोड से जोड़ा जाना चाहिए?" },
    optionsJson: [
      { en: "Positive Terminal (Anode)", hi: "धनात्मक टर्मिनल (ऐनोड)" },
      { en: "Negative Terminal (Cathode)", hi: "ऋणात्मक टर्मिनल (कैथोड)" },
      { en: "Any terminal can be used", hi: "किसी भी टर्मिनल से जोड़ा जा सकता है" },
      { en: "Disconnected from current", hi: "धारा से अलग रखा जाना चाहिए" }
    ],
    correctAnswer: 1,
    explanation: { en: "The article to be electroplated is always connected to the negative terminal (cathode), so positively charged metal ions (Cu2+) move towards it and deposit on its surface.", hi: "जिस वस्तु पर विद्युत लेपन करना होता है, उसे हमेशा ऋणात्मक टर्मिनल (कैथोड) से जोड़ा जाता है, ताकि धनावेशित तांबे के आयन (Cu2+) उसकी ओर आकर्षित होकर उस पर जमा हो सकें।" },
  },
  {
    key: "jnvst9-gem1-ss-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "EASY",
    questionJson: { en: "Which Right under the Indian Constitution guarantees freedom against discrimination on grounds of religion, race, caste, sex, or place of birth?", hi: "भारतीय संविधान का कौन सा अधिकार धर्म, मूलवंश, जाति, लिंग या जन्म स्थान के आधार पर भेदभाव के खिलाफ स्वतंत्रता की गारंटी देता है?" },
    optionsJson: [
      { en: "Right to Equality", hi: "समता का अधिकार" },
      { en: "Right to Freedom of Religion", hi: "धार्मिक स्वतंत्रता का अधिकार" },
      { en: "Cultural and Educational Rights", hi: "संस्कृति और शिक्षा संबंधी अधिकार" },
      { en: "Right Against Exploitation", hi: "शोषण के विरुद्ध अधिकार" }
    ],
    correctAnswer: 0,
    explanation: { en: "Article 15 under the Right to Equality guarantees non-discrimination on grounds of religion, race, caste, sex, or place of birth.", hi: "समता के अधिकार के तहत अनुच्छेद 15 धर्म, मूलवंश, जाति, लिंग या जन्म स्थान के आधार पर भेदभाव का निषेध करता है।" },
  },
  {
    key: "jnvst9-gem1-ss-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "MEDIUM",
    questionJson: { en: "Who led the Revolt of 1857 in Kanpur?", hi: "कानपुर में 1857 के विद्रोह का नेतृत्व किसने किया था?" },
    optionsJson: [
      { en: "Rani Lakshmibai", hi: "रानी लक्ष्मीबाई" },
      { en: "Begum Hazrat Mahal", hi: "बेगम हज़रत महल" },
      { en: "Nana Saheb", hi: "नाना साहेब" },
      { en: "Kunwar Singh", hi: "कुंवर सिंह" }
    ],
    correctAnswer: 2,
    explanation: { en: "Nana Saheb, the adopted son of Peshwa Baji Rao II, led the revolt in Kanpur along with his general Tatya Tope.", hi: "पेशवा बाजीराव द्वितीय के दत्तक पुत्र नाना साहेब ने अपने सेनापति तात्या टोपे के साथ कानपुर में विद्रोह का नेतृत्व किया था।" },
  },
  {
    key: "jnvst9-gem1-ss-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "HARD",
    questionJson: { en: "Which soil type, also known as 'Regur Soil', is ideal for growing cotton crops in India?", hi: "किस मिट्टी को 'रेगुर मिट्टी' के नाम से भी जाना जाता है और जो भारत में कपास की खेती के लिए सबसे उपयुक्त है?" },
    optionsJson: [
      { en: "Alluvial Soil", hi: "जलोढ़ मिट्टी" },
      { en: "Black Soil", hi: "काली मिट्टी" },
      { en: "Red and Yellow Soil", hi: "लाल और पीली मिट्टी" },
      { en: "Laterite Soil", hi: "लैटेराइट मिट्टी" }
    ],
    correctAnswer: 1,
    explanation: { en: "Black Soil (Regur Soil) has high moisture retention capacity and rich mineral content, making it optimal for cotton cultivation in the Deccan Plateau region.", hi: "काली मिट्टी (रेगुर मिट्टी) में नमी धारण करने की उच्च क्षमता होती है, जो दक्कन के पठार में कपास की खेती के लिए सर्वोत्तम है।" },
  },
  {
    key: "jnvst9-gem1-mt-04",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: { en: "An item marked at ₹800 is sold for ₹680. What is the discount percentage offered?", hi: "₹800 के अंकित मूल्य वाली वस्तु को ₹680 में बेचा जाता है। दी जाने वाली छूट का प्रतिशत क्या है?" },
    optionsJson: [
      { en: "12%", hi: "12%" },
      { en: "15%", hi: "15%" },
      { en: "18%", hi: "18%" },
      { en: "20%", hi: "20%" }
    ],
    correctAnswer: 1,
    explanation: { en: "Discount = Marked Price - Selling Price = 800 - 680 = ₹120. Discount % = (120 / 800) * 100 = 15%.", hi: "छूट = अंकित मूल्य - विक्रय मूल्य = 800 - 680 = ₹120। छूट % = (120 / 800) * 100 = 15%।" },
  }
];

import type { PyqSeedItem } from "./types";

// RMS Class 9, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
//
// Corrected at ingestion: item 7 (0-based, source array index)
// had a stale correctOptionIndex left over from the source explanation's own
// self-correction — the explanation text derives the right answer but the
// index field was never updated to match. Fixed here to the index the
// explanation itself arrives at (independently re-verified by hand).
export const posts: PyqSeedItem[] = [
  {
    key: "rms9-gem2-mt-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Find the range of the given data set: 14, 25, 38, 9, 42, 18, 31.", hi: "दिए गए डेटा सेट का परास (Range) ज्ञात कीजिए: 14, 25, 38, 9, 42, 18, 31।" },
    optionsJson: [
      { en: "31", hi: "31" },
      { en: "33", hi: "33" },
      { en: "35", hi: "35" },
      { en: "42", hi: "42" }
    ],
    correctAnswer: 1,
    explanation: { en: "Range = Maximum Value - Minimum Value = 42 - 9 = 33.", hi: "परास (Range) = अधिकतम मान - न्यूनतम मान = 42 - 9 = 33।" },
  },
  {
    key: "rms9-gem2-mt-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Find the square root of 0.000529.", hi: "0.000529 का वर्गमूल (Square Root) ज्ञात कीजिए।" },
    optionsJson: [
      { en: "0.023", hi: "0.023" },
      { en: "0.23", hi: "0.23" },
      { en: "0.0023", hi: "0.0023" },
      { en: "2.3", hi: "2.3" }
    ],
    correctAnswer: 0,
    explanation: { en: "sqrt(0.000529) = sqrt(529 / 1,000,000) = 23 / 1000 = 0.023.", hi: "sqrt(0.000529) = sqrt(529 / 1000000) = 23 / 1000 = 0.023।" },
  },
  {
    key: "rms9-gem2-mt-03",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "A circular racetrack has an inner radius of 14 m and an outer radius of 21 m. Find the area of the track path.", hi: "एक वृत्ताकार रेसट्रैक की आंतरिक त्रिज्या 14 मीटर और बाहरी त्रिज्या 21 मीटर है। ट्रैक का क्षेत्रफल ज्ञात कीजिए।" },
    optionsJson: [
      { en: "770 m^2", hi: "770 मीटर^2" },
      { en: "616 m^2", hi: "616 मीटर^2" },
      { en: "1,386 m^2", hi: "1,386 मीटर^2" },
      { en: "1,540 m^2", hi: "1,540 मीटर^2" }
    ],
    correctAnswer: 0,
    explanation: { en: "Track Area = pi * (R^2 - r^2) = (22/7) * (21^2 - 14^2) = (22/7) * (441 - 196) = (22/7) * 245 = 22 * 35 = 770 m^2.", hi: "ट्रैक का क्षेत्रफल = pi * (R^2 - r^2) = (22/7) * (441 - 196) = (22/7) * 245 = 22 * 35 = 770 मीटर^2।" },
  },
  {
    key: "rms9-gem2-ma-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which geometric relationship best represents the categories: 'Planes, Aircrafts, Helicopters'?", hi: "कौन सा तार्किक आरेख श्रेणियों का सबसे अच्छा प्रतिनिधित्व करता है: 'विमान (Aircrafts), हवाई जहाज़ (Planes), और हेलीकॉप्टर'?" },
    optionsJson: [
      { en: "Two non-overlapping circles inside one larger outer circle", hi: "एक बड़े बाहरी वृत्त के अंदर दो गैर-अतिव्यापी वृत्त" },
      { en: "Three completely separate independent circles", hi: "तीन पूरी तरह से अलग स्वतंत्र वृत्त" },
      { en: "Three concentric nested circles", hi: "तीन संकेंद्री वृत्त" },
      { en: "Three overlapping intersecting circles", hi: "तीन प्रतिच्छेदी वृत्त" }
    ],
    correctAnswer: 0,
    explanation: { en: "Both Planes and Helicopters are distinct types of Aircrafts. So they form two separate circles inside the larger Aircrafts set.", hi: "हवाई जहाज और हेलीकॉप्टर दोनों विमान (Aircrafts) के अंतर्गत आने वाले दो अलग-अलग प्रकार हैं।" },
  },
  {
    key: "rms9-gem2-ma-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "When a vertical mirror is placed on the right of the word 'NAVY', what is the reversed letter sequence of its mirror image?", hi: "जब 'NAVY' शब्द के दाईं ओर एक लंबवत दर्पण रखा जाता है, तो इसकी दर्पण छवि (Mirror Image) का अक्षर क्रम क्या होगा?" },
    optionsJson: [
      { en: "YVAN", hi: "YVAN (दर्पण परावर्तित अक्षरों के साथ)" },
      { en: "NAVY", hi: "NAVY" },
      { en: "VAYN", hi: "VAYN" },
      { en: "AYVN", hi: "AYVN" }
    ],
    correctAnswer: 0,
    explanation: { en: "A vertical mirror reverses the horizontal sequence starting from the rightmost letter Y to A, V, and N (with horizontal letter orientation flipped).", hi: "लंबवत दर्पण क्षैतिज क्रम को दाएं से बाएं (Y से N) बदल देता है।" },
  },
  {
    key: "rms9-gem2-sc-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which soft alkali metal can be easily cut with a butter knife and is stored in kerosene oil?", hi: "कौन सी मुलायम क्षार धातु चाकू से आसानी से काटी जा सकती है और इसे मिट्टी के तेल (केरोसिन) में रखा जाता है?" },
    optionsJson: [
      { en: "Iron", hi: "लोहा" },
      { en: "Sodium", hi: "सोडियम" },
      { en: "Aluminum", hi: "एल्युमिनियम" },
      { en: "Copper", hi: "तांबा" }
    ],
    correctAnswer: 1,
    explanation: { en: "Sodium (and Potassium) is so soft that it can be cut with a knife. It reacts violently with air and water, so it is kept submerged in kerosene.", hi: "सोडियम एक अत्यधिक क्रियाशील और मुलायम धातु है जिसे मिट्टी के तेल में रखा जाता है।" },
  },
  {
    key: "rms9-gem2-sc-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the SI unit of Pressure equal to one Newton per square meter (1 N/m^2)?", hi: "एक न्यूटन प्रति वर्ग मीटर (1 N/m^2) के बराबर दाब (Pressure) का SI मात्रक क्या है?" },
    optionsJson: [
      { en: "Joule", hi: "जूल" },
      { en: "Pascal", hi: "पास्कल (Pascal)" },
      { en: "Watt", hi: "वाट" },
      { en: "Newton", hi: "न्यूटन" }
    ],
    correctAnswer: 1,
    explanation: { en: "Pressure = Force / Area. Its SI unit N/m^2 is named Pascal (Pa) in honor of Blaise Pascal.", hi: "दाब = बल / क्षेत्रफल। इसका SI मात्रक N/m^2 है, जिसे पास्कल (Pa) कहा जाता है।" },
  },
  {
    key: "rms9-gem2-gk-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which is the highest mountain peak located entirely within India?", hi: "पूर्णतः भारत के भीतर स्थित सबसे ऊंची पर्वत चोटी कौन सी है?" },
    optionsJson: [
      { en: "K2 (Godwin-Austen)", hi: "के2 (गॉडविन-ऑस्टिन)" },
      { en: "Kangchenjunga", hi: "कंचनजंगा" },
      { en: "Nanda Devi", hi: "नंदा देवी" },
      { en: "Anamudi", hi: "अनामुडी" }
    ],
    correctAnswer: 2,
    explanation: { en: "The peak must lie entirely within Indian territory. K2 lies in Pakistan-administered Kashmir, Kangchenjunga's summit sits directly on the India-Nepal border, and Everest is in Nepal. Nanda Devi (7,816 m, Uttarakhand) is the highest peak located wholly within India.", hi: "इस चोटी का पूर्णतः भारतीय क्षेत्र में होना आवश्यक है। के2 पाकिस्तान-अधिकृत कश्मीर में है, कंचनजंगा का शिखर भारत-नेपाल सीमा पर स्थित है, और एवरेस्ट नेपाल में है। नंदा देवी (7,816 मीटर, उत्तराखंड) पूर्णतः भारत के भीतर स्थित सबसे ऊंची चोटी है।" },
  },
  {
    key: "rms9-gem2-gk-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the name of the official aerobatic formation display team of the Indian Air Force?", hi: "भारतीय वायु सेना की आधिकारिक एरोबेटिक फॉर्मेशन डिस्प्ले टीम का क्या नाम है?" },
    optionsJson: [
      { en: "Sarang", hi: "सारंग" },
      { en: "Surya Kiran", hi: "सूर्य किरण (Surya Kiran)" },
      { en: "Garud", hi: "गरुड़" },
      { en: "Thunderbolts", hi: "थंडरबोल्ट्स" }
    ],
    correctAnswer: 1,
    explanation: { en: "Surya Kiran Aerobatic Team (SKAT) is the famous 9-aircraft formation display team of the IAF.", hi: "सूर्य किरण एरोबेटिक टीम (SKAT) भारतीय वायु सेना की प्रसिद्ध 9-विमान प्रदर्शन टीम है।" },
  },
  {
    key: "rms9-gem2-gk-03",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Fundamental Duties were added to Part IV-A of the Indian Constitution by which Constitutional Amendment Act in 1976?", hi: "1976 में किस संवैधानिक संशोधन अधिनियम द्वारा भारतीय संविधान के भाग IV-A में मौलिक कर्तव्यों को जोड़ा गया था?" },
    optionsJson: [
      { en: "42nd Constitutional Amendment", hi: "42वां संविधान संशोधन" },
      { en: "44th Constitutional Amendment", hi: "44वां संविधान संशोधन" },
      { en: "86th Constitutional Amendment", hi: "86वां संविधान संशोधन" },
      { en: "73rd Constitutional Amendment", hi: "73वां संविधान संशोधन" }
    ],
    correctAnswer: 0,
    explanation: { en: "The 42nd Amendment Act of 1976 introduced Article 51A establishing Fundamental Duties upon Swaran Singh Committee recommendations.", hi: "1976 के 42वें संविधान संशोधन अधिनियम द्वारा अनुच्छेद 51A में मौलिक कर्तव्यों को शामिल किया गया था।" },
  }
];

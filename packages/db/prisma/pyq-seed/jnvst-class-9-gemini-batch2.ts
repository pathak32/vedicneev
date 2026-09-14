import type { PyqSeedItem } from "./types";

// JNVST Class 9, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "jnvst9-gem2-mt-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the smallest natural number by which 392 must be multiplied so that the product becomes a perfect cube?", hi: "वह सबसे छोटी प्राकृतिक संख्या कौन सी है जिससे 392 को गुणा करने पर गुणनफल एक पूर्ण घन बन जाए?" },
    optionsJson: [
      { en: "2", hi: "2" },
      { en: "3", hi: "3" },
      { en: "7", hi: "7" },
      { en: "5", hi: "5" }
    ],
    correctAnswer: 2,
    explanation: { en: "Prime factorization of 392 = 2 * 2 * 2 * 7 * 7 = 2^3 * 7^2. To form a cube, 7 needs one more factor (7^3). Thus, multiplying by 7 makes it a perfect cube (2744 = 14^3).", hi: "392 का अभाज्य गुणनखंडन = 2 * 2 * 2 * 7 * 7 = 2^3 * 7^2। घन बनाने के लिए 7 का एक और गुणनखंड चाहिए। अतः 7 से गुणा करने पर यह पूर्ण घन (2744 = 14^3) बन जाएगा।" },
  },
  {
    key: "jnvst9-gem2-mt-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "If (x + 1/x) = 5, find the value of (x^2 + 1/x^2).", hi: "यदि (x + 1/x) = 5 है, तो (x^2 + 1/x^2) का मान ज्ञात कीजिए।" },
    optionsJson: [
      { en: "23", hi: "23" },
      { en: "25", hi: "25" },
      { en: "27", hi: "27" },
      { en: "21", hi: "21" }
    ],
    correctAnswer: 0,
    explanation: { en: "Squaring both sides: (x + 1/x)^2 = 5^2 => x^2 + 1/x^2 + 2 = 25 => x^2 + 1/x^2 = 25 - 2 = 23.", hi: "दोनों पक्षों का वर्ग करने पर: (x + 1/x)^2 = 5^2 => x^2 + 1/x^2 + 2 = 25 => x^2 + 1/x^2 = 25 - 2 = 23।" },
  },
  {
    key: "jnvst9-gem2-mt-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Factorise completely: 4a^2 - 12ab + 9b^2 - 16c^2.", hi: "पूर्ण गुणनखंड कीजिए: 4a^2 - 12ab + 9b^2 - 16c^2।" },
    optionsJson: [
      { en: "(2a - 3b - 4c)(2a - 3b + 4c)", hi: "(2a - 3b - 4c)(2a - 3b + 4c)" },
      { en: "(2a + 3b - 4c)(2a - 3b + 4c)", hi: "(2a + 3b - 4c)(2a - 3b + 4c)" },
      { en: "(2a - 3b - 16c)(2a - 3b + 16c)", hi: "(2a - 3b - 16c)(2a - 3b + 16c)" },
      { en: "(4a - 3b - 4c)(4a + 3b + 4c)", hi: "(4a - 3b - 4c)(4a + 3b + 4c)" }
    ],
    correctAnswer: 0,
    explanation: { en: "Grouping the first 3 terms: (2a - 3b)^2 - (4c)^2. Using identity x^2 - y^2 = (x - y)(x + y): (2a - 3b - 4c)(2a - 3b + 4c).", hi: "प्रथम 3 पदों का समूह बनाने पर: (2a - 3b)^2 - (4c)^2। सर्वसमिका x^2 - y^2 = (x - y)(x + y) का प्रयोग करने पर: (2a - 3b - 4c)(2a - 3b + 4c)।" },
  },
  {
    key: "jnvst9-gem2-sc-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which non-metal is stored under water to prevent it from reacting with atmospheric oxygen?", hi: "किस अधातु को वायुमंडलीय ऑक्सीजन के साथ प्रतिक्रिया करने से रोकने के लिए पानी के नीचे संग्रहित किया जाता है?" },
    optionsJson: [
      { en: "Sodium", hi: "सोडियम" },
      { en: "White Phosphorus", hi: "सफेद फास्फोरस" },
      { en: "Sulphur", hi: "सल्फर" },
      { en: "Graphite", hi: "ग्रेफाइट" }
    ],
    correctAnswer: 1,
    explanation: { en: "Phosphorus is a very reactive non-metal that catches fire if exposed to air. It does not react with water, so it is safely stored submerged in water.", hi: "फास्फोरस एक अत्यधिक क्रियाशील अधातु है जो हवा में संपर्क में आने पर आग पकड़ लेता है। यह पानी के साथ प्रतिक्रिया नहीं करता, इसलिए इसे जल में डुबोकर रखा जाता है।" },
  },
  {
    key: "jnvst9-gem2-sc-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "The frequency of a sound wave determines which characteristic of sound?", hi: "ध्वनि तरंग की आवृत्ति (Frequency) ध्वनि की किस विशेषता को निर्धारित करती है?" },
    optionsJson: [
      { en: "Loudness", hi: "प्रबलता (Loudness)" },
      { en: "Pitch or Shrillness", hi: "तारत्व या तीक्ष्णता (Pitch)" },
      { en: "Speed", hi: "चाल (Speed)" },
      { en: "Amplitude", hi: "आयाम (Amplitude)" }
    ],
    correctAnswer: 1,
    explanation: { en: "The pitch or shrillness of a sound is directly proportional to its vibration frequency. Higher frequency results in a higher-pitched sound.", hi: "ध्वनि का तारत्व (Pitch) उसके कंपन की आवृत्ति के समानुपाती होता है। उच्च आवृत्ति की ध्वनि का तारत्व अधिक होता है।" },
  },
  {
    key: "jnvst9-gem2-sc-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which zone of a candle flame is the hottest and undergoes complete combustion?", hi: "मोमबत्ती की लौ का कौन सा क्षेत्र सबसे गर्म होता है और जहाँ पूर्ण दहन होता है?" },
    optionsJson: [
      { en: "Innermost Dark Zone", hi: "आंतरिक काला क्षेत्र" },
      { en: "Middle Luminous Yellow Zone", hi: "मध्यम दीप्त पीला क्षेत्र" },
      { en: "Outermost Non-Luminous Blue Zone", hi: "बाहरी अदीप्त नीला क्षेत्र" },
      { en: "Base Zone", hi: "आधार क्षेत्र" }
    ],
    correctAnswer: 2,
    explanation: { en: "The outermost non-luminous blue zone receives plenty of oxygen from surrounding air, leading to complete combustion. It is the hottest part of the candle flame.", hi: "बाहरी अदीप्त नीले क्षेत्र को पर्याप्त ऑक्सीजन मिलती है, जिससे पूर्ण दहन होता है। यह मोमबत्ती की लौ का सबसे गर्म भाग होता है।" },
  },
  {
    key: "jnvst9-gem2-ss-01",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "In which vegetation zone are coniferous trees like Chir, Pine, and Deodar predominantly found?", hi: "चीड़ (Chir), पाइन (Pine) और देवदार (Deodar) जैसे शंकुधारी वृक्ष मुख्य रूप से किस वनस्पति क्षेत्र में पाए जाते हैं?" },
    optionsJson: [
      { en: "Tropical Rainforests", hi: "उष्णकटिबंधीय वर्षावन" },
      { en: "Montane Temperate Forests", hi: "पर्वतीय समशीतोष्ण वन" },
      { en: "Mangrove Forests", hi: "मैंग्रोव वन" },
      { en: "Thorn Forests and Scrubs", hi: "कंटीले वन और झाड़ियां" }
    ],
    correctAnswer: 1,
    explanation: { en: "Coniferous trees with needle-shaped leaves are found at high altitudes in Montane or Himalayan mountain forest belts.", hi: "सुई के आकार की पत्तियों वाले शंकुधारी वृक्ष पर्वतीय या हिमालीय वन बेल्ट में उच्च ऊंचाई पर पाए जाते हैं।" },
  },
  {
    key: "jnvst9-gem2-ss-02",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which is the apex judicial body in India whose decisions are binding on all other courts across the nation?", hi: "भारत में शीर्ष न्यायिक संस्था कौन सी है जिसके फैसले देश की अन्य सभी अदालतों पर बाध्यकारी होते हैं?" },
    optionsJson: [
      { en: "High Court", hi: "उच्च न्यायालय" },
      { en: "District Court", hi: "ज़िला अदालत" },
      { en: "Supreme Court of India", hi: "भारत का सर्वोच्च न्यायालय (Supreme Court)" },
      { en: "Tribunal Court", hi: "न्यायाधिकरण (Tribunal)" }
    ],
    correctAnswer: 2,
    explanation: { en: "The Supreme Court of India, located in New Delhi, is the highest constitutional court and final court of appeal under Article 141.", hi: "नई दिल्ली स्थित भारत का सर्वोच्च न्यायालय सर्वोच्च संवैधानिक अदालत है और अनुच्छेद 141 के तहत इसके निर्णय सभी अदालतों के लिए बाध्यकारी हैं।" },
  },
  {
    key: "jnvst9-gem2-ss-03",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "social_science",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Birsa Munda led a famous tribal uprising against British land policies and local zamindars in which region of India?", hi: "बिरसा मुंडा ने भारत के किस क्षेत्र में ब्रिटिश भू-नीतियों और स्थानीय ज़मींदारों के खिलाफ प्रसिद्ध आदिवासी विद्रोह का नेतृत्व किया था?" },
    optionsJson: [
      { en: "Santhal Parganas", hi: "संथाल परगना" },
      { en: "Chota Nagpur Plateau (Jharkhand)", hi: "छोटानागपुर पठार (झारखंड)" },
      { en: "Bastar (Chhattisgarh)", hi: "बस्तर (छत्तीसगढ़)" },
      { en: "Jaintia Hills (Meghalaya)", hi: "जयंतिया पहाड़ियां (मेघालय)" }
    ],
    correctAnswer: 1,
    explanation: { en: "Birsa Munda spearheaded the 'Ulgulan' (Great Tumult) rebellion during the late 19th century in the Chota Nagpur region of present-day Jharkhand.", hi: "बिरसा मुंडा ने 19वीं सदी के अंत में वर्तमान झारखंड के छोटानागपुर क्षेत्र में 'उलगुलान' (महान हलचल) विद्रोह का नेतृत्व किया था।" },
  },
  {
    key: "jnvst9-gem2-mt-04",
    examType: "JNVST",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "12 workers can build a wall in 8 days. How many days will 16 workers take to build the exact same wall working at the same pace?", hi: "12 मजदूर एक दीवार को 8 दिनों में बना सकते हैं। उसी दीवार को उसी गति से बनाने में 16 मजदूरों को कितना समय लगेगा?" },
    optionsJson: [
      { en: "5 days", hi: "5 दिन" },
      { en: "6 days", hi: "6 दिन" },
      { en: "10 days", hi: "10 दिन" },
      { en: "10.5 days", hi: "10.5 दिन" }
    ],
    correctAnswer: 1,
    explanation: { en: "This is a case of inverse proportion: x1 * y1 = x2 * y2 => 12 * 8 = 16 * Days => Days = 96 / 16 = 6 days.", hi: "यह व्युत्क्रमानुपाती (Inverse Proportion) का उदाहरण है: x1 * y1 = x2 * y2 => 12 * 8 = 16 * दिन => दिन = 96 / 16 = 6 दिन।" },
  }
];

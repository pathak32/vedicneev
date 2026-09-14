import type { PyqSeedItem } from "./types";

// JNVST Class 6 — first Gemini-drafted batch (10 items across Mental
// Ability/Arithmetic/Language), reviewed against the item-authoring brief
// before ingestion: verified every option/explanation by hand, checked
// for duplicates against the existing 148-row pool (none found), and
// fixed one real error caught in review — the coding-decoding item
// (gem1-ma-04) originally stated "MNT is coded as 39", which doesn't
// match the sum-of-alphabet-positions rule the explanation and the other
// clue (CAT=24) actually use (M+N+T = 13+14+20 = 47, not 39); corrected to
// 47 in both languages so the given clue is internally consistent with
// the rule being taught. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "jnvst6-gem1-ma-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Four word-pairs are given below. Three of them are alike in a certain way, while one is different. Find the odd one out.",
      hi: "नीचे चार शब्द-युग्म दिए गए हैं। इनमें से तीन किसी तरह समान हैं, जबकि एक अलग है। विषम को चुनें।",
      mr: "खाली चार शब्द-जोड्या दिल्या आहेत. त्यांपैकी तीन एका विशिष्ट पद्धतीने सारख्या आहेत, तर एक वेगळी आहे. वेगळी जोडी ओळखा.",
    },
    optionsJson: [
      { en: "Cow : Calf", hi: "गाय : बछड़ा", mr: "गाय : वासरू" },
      { en: "Hen : Chick", hi: "मुर्गी : चूजा", mr: "कोंबडी : कोंबडीचे पिल्लू" },
      { en: "Dog : Puppy", hi: "कुत्ता : पिल्ला", mr: "कुत्रा : कुत्र्याचे पिल्लू" },
      { en: "Cat : Cub", hi: "बिल्ली : शावक", mr: "मांजर : शावक" },
    ],
    correctAnswer: 3,
    explanation: {
      en: "In options A, B, and C, the second word represents the offspring of the first animal. For a cat, the offspring is called a 'kitten', whereas 'cub' is the offspring of a lion/tiger/bear.",
      hi: "विकल्प A, B और C में दूसरा शब्द पहले जानवर का बच्चा है। बिल्ली के बच्चे को 'किटन' (Kitten) कहते हैं, जबकि 'शावक' शेर/बाघ/भालू के बच्चे को कहते हैं।",
      mr: "विकल्प A, B आणि C मध्ये दुसरा शब्द हा पहिल्या प्राण्याच्या पिल्लाला दर्शवतो. मांजरीच्या पिल्लाला 'किटन' (kitten) म्हणतात, तर 'शावक' (cub) सिंह/वाघ/अस्वलाच्या पिल्लाला म्हणतात.",
    },
  },
  {
    key: "jnvst6-gem1-ma-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Select the option that completes the analogy: Newspaper : Press :: Cloth : ?",
      hi: "उस विकल्प का चयन करें जो सादृश्यता को पूरा करता है: समाचार पत्र : प्रेस :: कपड़ा : ?",
      mr: "सादृश्य पूर्ण करणारा योग्य विकल्प निवडा: वृत्तपत्र : प्रेस :: कापड : ?",
    },
    optionsJson: [
      { en: "Tailor", hi: "दर्जी", mr: "शिंपी" },
      { en: "Cotton", hi: "कपास", mr: "कापूस" },
      { en: "Mill", hi: "मिल", mr: "गिरणी" },
      { en: "Thread", hi: "धागा", mr: "धागा" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "Newspaper is printed/manufactured in a press. Similarly, cloth is manufactured in a mill.",
      hi: "समाचार पत्र प्रेस में छपता/बनता है। उसी प्रकार, कपड़ा मिल में निर्मित होता है।",
      mr: "वृत्तपत्र प्रेसमध्ये छापले/तयार केले जाते. त्याचप्रमाणे, कापड गिरणीत तयार केले जाते.",
    },
  },
  {
    key: "jnvst6-gem1-ma-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
      hi: "श्रृंखला में लुप्त संख्या ज्ञात कीजिए: 3, 7, 15, 31, 63, ?",
      mr: "मालिकेतील लुप्त संख्या शोधा: 3, 7, 15, 31, 63, ?",
    },
    optionsJson: [
      { en: "95", hi: "95", mr: "95" },
      { en: "111", hi: "111", mr: "111" },
      { en: "127", hi: "127", mr: "127" },
      { en: "128", hi: "128", mr: "128" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "The pattern is (Previous Number × 2) + 1. So, (63 × 2) + 1 = 126 + 1 = 127.",
      hi: "पैटर्न है (पिछली संख्या × 2) + 1। इसलिए, (63 × 2) + 1 = 126 + 1 = 127।",
      mr: "नियम असा आहे: (आधीची संख्या × 2) + 1. त्यामुळे, (63 × 2) + 1 = 126 + 1 = 127.",
    },
  },
  {
    key: "jnvst6-gem1-ma-04",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: {
      // Fixed in review: was "coded as '39'" — inconsistent with the
      // sum-of-alphabet-positions rule (M+N+T = 13+14+20 = 47), which the
      // explanation and the CAT=24 clue both actually rely on.
      en: "In a certain code language, if 'MNT' is coded as '47' and 'CAT' is coded as '24', how will 'DOG' be coded?",
      hi: "एक निश्चित कूट भाषा में यदि 'MNT' को '47' और 'CAT' को '24' लिखा जाता है, तो 'DOG' को क्या लिखा जाएगा?",
      mr: "एका विशिष्ट कोड भाषेत, जर 'MNT' ला '47' आणि 'CAT' ला '24' असे कोड केले असेल, तर 'DOG' ला कसे कोड केले जाईल?",
    },
    optionsJson: [
      { en: "26", hi: "26", mr: "26" },
      { en: "28", hi: "28", mr: "28" },
      { en: "30", hi: "30", mr: "30" },
      { en: "32", hi: "32", mr: "32" },
    ],
    correctAnswer: 0,
    explanation: {
      en: "The code is the sum of the alphabetical positions of each letter: D (4) + O (15) + G (7) = 26.",
      hi: "कोड प्रत्येक अक्षर के वर्णमाला स्थान का योग है: D (4) + O (15) + G (7) = 26।",
      mr: "कोड म्हणजे प्रत्येक अक्षराच्या वर्णमालेतील स्थानाची बेरीज: D (4) + O (15) + G (7) = 26.",
    },
  },
  {
    key: "jnvst6-gem1-ar-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Find the HCF (Highest Common Factor) of 24 and 36.",
      hi: "24 और 36 का म.स.प. (HCF) ज्ञात कीजिए।",
      mr: "24 आणि 36 चा म.सा.वि. (HCF) काढा.",
    },
    optionsJson: [
      { en: "6", hi: "6", mr: "6" },
      { en: "8", hi: "8", mr: "8" },
      { en: "12", hi: "12", mr: "12" },
      { en: "72", hi: "72", mr: "72" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "Factors of 24 = 1, 2, 3, 4, 6, 8, 12, 24. Factors of 36 = 1, 2, 3, 4, 6, 9, 12, 18, 36. The highest common factor is 12.",
      hi: "24 के गुणनखंड = 1, 2, 3, 4, 6, 8, 12, 24। 36 के गुणनखंड = 1, 2, 3, 4, 6, 9, 12, 18, 36। उच्चतम उभयनिष्ठ गुणनखंड (HCF) 12 है।",
      mr: "24 चे अवयव = 1, 2, 3, 4, 6, 8, 12, 24. 36 चे अवयव = 1, 2, 3, 4, 6, 9, 12, 18, 36. महत्तम साधारण विभाजक (म.सा.वि.) 12 आहे.",
    },
  },
  {
    key: "jnvst6-gem1-ar-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "What is the value of 3/4 + 5/6 - 1/3?",
      hi: "3/4 + 5/6 - 1/3 का मान क्या है?",
      mr: "3/4 + 5/6 - 1/3 ची किंमत किती आहे?",
    },
    optionsJson: [
      { en: "1/2", hi: "1/2", mr: "1/2" },
      { en: "5/4", hi: "5/4", mr: "5/4" },
      { en: "11/12", hi: "11/12", mr: "11/12" },
      { en: "1 1/4", hi: "1 1/4", mr: "1 1/4" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "LCM of denominators (4, 6, 3) = 12. Converting fractions: 9/12 + 10/12 - 4/12 = (9 + 10 - 4)/12 = 15/12 = 5/4.",
      hi: "हरों (4, 6, 3) का ल.स.प. = 12। भिन्नों का रूपांतरण: 9/12 + 10/12 - 4/12 = (9 + 10 - 4)/12 = 15/12 = 5/4।",
      mr: "छेदांचा (4, 6, 3) ल.सा.वि. = 12. भिन्नांचे रूपांतर: 9/12 + 10/12 - 4/12 = (9 + 10 - 4)/12 = 15/12 = 5/4.",
    },
  },
  {
    key: "jnvst6-gem1-ar-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "A shopkeeper buys an article for ₹400 and sells it for ₹500. Find his profit percentage.",
      hi: "एक दुकानदार ₹400 में एक वस्तु खरीदता है और उसे ₹500 में बेचता है। उसका लाभ प्रतिशत ज्ञात कीजिए।",
      mr: "एक दुकानदार ₹400 मध्ये एक वस्तू खरेदी करतो आणि ती ₹500 मध्ये विकतो. त्याचा नफा टक्केवारी काढा.",
    },
    optionsJson: [
      { en: "20%", hi: "20%", mr: "20%" },
      { en: "25%", hi: "25%", mr: "25%" },
      { en: "30%", hi: "30%", mr: "30%" },
      { en: "15%", hi: "15%", mr: "15%" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "Profit = Selling Price - Cost Price = 500 - 400 = ₹100. Profit % = (Profit / Cost Price) × 100 = (100 / 400) × 100 = 25%.",
      hi: "लाभ = विक्रय मूल्य - क्रय मूल्य = 500 - 400 = ₹100। लाभ % = (लाभ / क्रय मूल्य) × 100 = (100 / 400) × 100 = 25%।",
      mr: "नफा = विक्री किंमत - खरेदी किंमत = 500 - 400 = ₹100. नफा % = (नफा / खरेदी किंमत) × 100 = (100 / 400) × 100 = 25%.",
    },
  },
  {
    key: "jnvst6-gem1-la-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Choose the correct synonym of the word 'ANCIENT'.",
      hi: "'ANCIENT' (प्राचीन) शब्द का सही पर्यायवाची चुनें।",
      mr: "'ANCIENT' (प्राचीन) या शब्दाचा योग्य समानार्थी शब्द निवडा.",
    },
    optionsJson: [
      { en: "Modern", hi: "आधुनिक", mr: "आधुनिक" },
      { en: "Old", hi: "पुराना / प्राचीन", mr: "जुना / प्राचीन" },
      { en: "New", hi: "नया", mr: "नवीन" },
      { en: "Fresh", hi: "ताज़ा", mr: "ताजे" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "'Ancient' means belonging to the distant past (very old). Thus, 'Old' is the correct synonym.",
      hi: "'Ancient' का अर्थ सुदूर अतीत का (बहुत पुराना) होता है। अतः 'Old' इसका सही पर्यायवाची है।",
      mr: "'Ancient' याचा अर्थ खूप जुन्या काळातील (अतिप्राचीन) असा होतो. त्यामुळे 'Old' हा त्याचा योग्य समानार्थी शब्द आहे.",
    },
  },
  {
    key: "jnvst6-gem1-la-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "What is the opposite (antonym) of the word 'BRAVE'?",
      hi: "'BRAVE' (साहसी) शब्द का विलोम (विपरीतार्थक) शब्द क्या है?",
      mr: "'BRAVE' (साहसी) या शब्दाचा विरुद्धार्थी शब्द काय आहे?",
    },
    optionsJson: [
      { en: "Bold", hi: "निडर", mr: "निर्भय" },
      { en: "Cowardly", hi: "कायर", mr: "भित्रा" },
      { en: "Heroic", hi: "वीर", mr: "वीर" },
      { en: "Strong", hi: "मजबूत", mr: "बलवान" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "'Brave' means showing courage. Its direct opposite is 'Cowardly' (lacking courage).",
      hi: "'Brave' का अर्थ साहस दिखाना होता है। इसका प्रत्यक्ष विलोम 'Cowardly' (कायर) है।",
      mr: "'Brave' याचा अर्थ धाडस दाखवणे असा होतो. त्याचा प्रत्यक्ष विरुद्धार्थी शब्द 'Cowardly' (भित्रा) आहे.",
    },
  },
  {
    key: "jnvst6-gem1-la-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: {
      en: "Choose one word for: 'A person who looks at the positive side of things'.",
      hi: "'जो व्यक्ति चीजों के सकारात्मक पहलू को देखता है' के लिए एक शब्द चुनें।",
      mr: "'जो व्यक्ती गोष्टींच्या सकारात्मक बाजूकडे पाहतो' यासाठी एक शब्द निवडा.",
    },
    optionsJson: [
      { en: "Pessimist", hi: "निराशावादी", mr: "निराशावादी" },
      { en: "Optimist", hi: "आशावादी", mr: "आशावादी" },
      { en: "Atheist", hi: "नास्तिक", mr: "नास्तिक" },
      { en: "Orphan", hi: "अनाथ", mr: "अनाथ" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "An 'Optimist' is someone who holds hope and sees the positive side. A 'Pessimist' sees the negative side.",
      hi: "'Optimist' (आशावादी) वह व्यक्ति है जो सकारात्मक दृष्टिकोण रखता है। 'Pessimist' (निराशावादी) नकारात्मक पक्ष देखता है।",
      mr: "'Optimist' (आशावादी) म्हणजे असा व्यक्ती जो आशा ठेवतो आणि सकारात्मक बाजू पाहतो. 'Pessimist' (निराशावादी) नकारात्मक बाजू पाहतो.",
    },
  },
];

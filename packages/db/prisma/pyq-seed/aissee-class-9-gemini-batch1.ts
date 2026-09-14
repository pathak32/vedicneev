import type { PyqSeedItem } from "./types";

// AISSEE Class 9, Gemini-drafted sample paper 1 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "aissee9-gem1-mt-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    questionJson: { en: "Find the compound interest on ₹10,000 at 10% per annum for 2 years compounded annually.", hi: "₹10,000 पर 10% वार्षिक दर से 2 वर्षों के लिए चक्रवृद्धि ब्याज (Compound Interest) ज्ञात कीजिए।" },
    optionsJson: [
      { en: "₹2,000", hi: "₹2,000" },
      { en: "₹2,100", hi: "₹2,100" },
      { en: "₹2,200", hi: "₹2,200" },
      { en: "₹2,500", hi: "₹2,500" }
    ],
    correctAnswer: 1,
    explanation: { en: "Amount = P(1 + R/100)^n = 10000*(1.1)^2 = 10000*1.21 = ₹12,100. CI = Amount - Principal = 12100 - 10000 = ₹2,100.", hi: "मिश्रधन = P(1 + R/100)^n = 10000*(1.1)^2 = 10000*1.21 = ₹12,100। चक्रवृद्धि ब्याज = 12100 - 10000 = ₹2,100।" },
  },
  {
    key: "aissee9-gem1-mt-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: { en: "The interior angles of a pentagon are in the ratio 1 : 2 : 3 : 4 : 5. What is the measure of the largest interior angle?", hi: "एक पंचभुज (Pentagon) के आंतरिक कोणों का अनुपात 1 : 2 : 3 : 4 : 5 है। सबसे बड़े आंतरिक कोण का माप क्या है?" },
    optionsJson: [
      { en: "144°", hi: "144°" },
      { en: "180°", hi: "180°" },
      { en: "108°", hi: "108°" },
      { en: "120°", hi: "120°" }
    ],
    correctAnswer: 1,
    explanation: { en: "Sum of interior angles of a pentagon = (5 - 2) * 180° = 540°. Total ratio parts = 1+2+3+4+5 = 15. Value of 1 part = 540 / 15 = 36°. Largest angle = 5 * 36° = 180°.", hi: "पंचभुज के आंतरिक कोणों का योग = (5 - 2) * 180° = 540°। अनुपात का योग = 15। 1 भाग = 36°। सबसे बड़ा कोण = 5 * 36° = 180°।" },
  },
  {
    key: "aissee9-gem1-mt-03",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    questionJson: { en: "A metallic sphere of radius 6 cm is melted and recast into small solid cones of base radius 3 cm and height 2 cm. Find the number of cones formed.", hi: "6 सेमी त्रिज्या वाले धातु के एक गोले को पिघलाकर 3 सेमी आधार त्रिज्या और 2 सेमी ऊंचाई वाले छोटे ठोस शंकुओं में ढाला जाता है। निर्मित शंकुओं की संख्या ज्ञात कीजिए।" },
    optionsJson: [
      { en: "24", hi: "24" },
      { en: "36", hi: "36" },
      { en: "48", hi: "48" },
      { en: "64", hi: "64" }
    ],
    correctAnswer: 2,
    explanation: { en: "Volume of Sphere = (4/3)*pi*r^3 = (4/3)*pi*216 = 288*pi. Volume of Cone = (1/3)*pi*R^2*h = (1/3)*pi*9*2 = 6*pi. Number of cones = (288*pi) / (6*pi) = 48.", hi: "गोले का आयतन = (4/3)*pi*216 = 288*pi। शंकु का आयतन = (1/3)*pi*9*2 = 6*pi। शंकुओं की संख्या = 288 / 6 = 48।" },
  },
  {
    key: "aissee9-gem1-ma-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: { en: "If 'MILK' is coded as '13-9-12-11' based on English alphabetical order, how is 'WATER' coded?", hi: "यदि अंग्रेजी वर्णमाला के क्रम के अनुसार 'MILK' को '13-9-12-11' के रूप में कोडित किया गया है, तो 'WATER' को कैसे कोडित किया जाएगा?" },
    optionsJson: [
      { en: "23-1-20-5-18", hi: "23-1-20-5-18" },
      { en: "22-1-20-5-18", hi: "22-1-20-5-18" },
      { en: "23-2-20-5-19", hi: "23-2-20-5-19" },
      { en: "24-1-19-5-18", hi: "24-1-19-5-18" }
    ],
    correctAnswer: 0,
    explanation: { en: "Each letter corresponds directly to its 1-indexed position in the alphabet: W=23, A=1, T=20, E=5, R=18.", hi: "प्रत्येक अक्षर वर्णमाला में अपने स्थान के सीधे संगत है: W=23, A=1, T=20, E=5, R=18।" },
  },
  {
    key: "aissee9-gem1-ma-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: { en: "Statements: 'All apples are fruits. All fruits are healthy.' Which conclusion is DEFINITELY TRUE?", hi: "कथन: 'सभी सेब फल हैं। सभी फल स्वस्थ हैं।' कौन सा निष्कर्ष निश्चित रूप से सत्य है?" },
    optionsJson: [
      { en: "All healthy items are apples.", hi: "सभी स्वस्थ वस्तुएं सेब हैं।" },
      { en: "All apples are healthy.", hi: "सभी सेब स्वस्थ हैं।" },
      { en: "No fruits are healthy.", hi: "कोई भी फल स्वस्थ नहीं है।" },
      { en: "Some healthy items are not fruits.", hi: "कुछ स्वस्थ वस्तुएं फल नहीं हैं।" }
    ],
    correctAnswer: 1,
    explanation: { en: "Since the set of apples lies inside fruits, and the set of fruits lies inside healthy items, by transitive property, 'All apples are healthy' is logically valid.", hi: "चूंकि सेब का समुच्चय फल के अंतर्गत आता है, और फल का समुच्चय स्वस्थ वस्तुओं के अंतर्गत आता है, इसलिए 'सभी सेब स्वस्थ हैं' तार्किक रूप से सत्य है।" },
  },
  {
    key: "aissee9-gem1-sc-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    questionJson: { en: "Which Newton's Law of Motion explains the recoil of a gun when a bullet is fired from it?", hi: "न्यूटन के गति का कौन सा नियम बंदूक से गोली चलाए जाने पर बंदूक के पीछे हटने (Recoil) की व्याख्या करता है?" },
    optionsJson: [
      { en: "First Law of Motion", hi: "गति का प्रथम नियम" },
      { en: "Second Law of Motion", hi: "गति का द्वितीय नियम" },
      { en: "Third Law of Motion", hi: "गति का तृतीय नियम" },
      { en: "Law of Gravitation", hi: "गुरुत्वाकर्षण का नियम" }
    ],
    correctAnswer: 2,
    explanation: { en: "Newton's Third Law states that 'To every action there is an equal and opposite reaction'. The bullet moving forward (action) causes the gun to recoil backward (reaction).", hi: "न्यूटन का तीसरा नियम कहता है कि 'प्रत्येक क्रिया के बराबर और विपरीत प्रतिक्रिया होती है'। गोली आगे बढ़ती है (क्रिया) जिससे बंदूक पीछे की ओर हटती है (प्रतिक्रिया)।" },
  },
  {
    key: "aissee9-gem1-sc-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "MEDIUM",
    questionJson: { en: "What gas is evolved at the anode (positive electrode) during the electrolysis of acidified water?", hi: "अम्लीकृत जल के विद्युत अपघटन (Electrolysis) के दौरान ऐनोड (धनात्मक इलेक्ट्रोड) पर कौन सी गैस निकलती है?" },
    optionsJson: [
      { en: "Hydrogen gas", hi: "हाइड्रोजन गैस" },
      { en: "Oxygen gas", hi: "ऑक्सीजन गैस" },
      { en: "Nitrogen gas", hi: "नाइट्रोजन गैस" },
      { en: "Carbon dioxide gas", hi: "कार्बन डाइऑक्साइड गैस" }
    ],
    correctAnswer: 1,
    explanation: { en: "During electrolysis of H2O, negatively charged oxide ions move to the positive anode to release Oxygen gas, while positively charged hydrogen ions release Hydrogen gas at the negative cathode.", hi: "जल के विद्युत अपघटन में ऑक्सीजन गैस धनात्मक ऐनोड पर और हाइड्रोजन गैस ऋणात्मक कैथोड पर मुक्त होती है।" },
  },
  {
    key: "aissee9-gem1-gk-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: { en: "Who led the famous Dandi Salt March in March 1930 against the British salt monopoly?", hi: "मार्च 1930 में ब्रिटिश नमक एकाधिकार के खिलाफ प्रसिद्ध दांडी नमक मार्च का नेतृत्व किसने किया था?" },
    optionsJson: [
      { en: "Subhash Chandra Bose", hi: "सुभाष चंद्र बोस" },
      { en: "Mahatma Gandhi", hi: "महात्मा गांधी" },
      { en: "Bhagat Singh", hi: "भगत सिंह" },
      { en: "Bal Gangadhar Tilak", hi: "बाल गंगाधर तिलक" }
    ],
    correctAnswer: 1,
    explanation: { en: "Mahatma Gandhi embarked on the 240-mile march from Sabarmati Ashram to Dandi from March 12 to April 6, 1930, launching the Civil Disobedience Movement.", hi: "महात्मा गांधी ने 12 मार्च से 6 अप्रैल 1930 तक साबरमती आश्रम से दांडी तक 240 मील की यात्रा कर सविनय अवज्ञा आंदोलन का शुभारंभ किया।" },
  },
  {
    key: "aissee9-gem1-gk-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: { en: "Where is the headquarters of the United Nations Educational, Scientific and Cultural Organization (UNESCO) situated?", hi: "संयुक्त राष्ट्र शैक्षिक, वैज्ञानिक एवं सांस्कृतिक संगठन (UNESCO) का मुख्यालय कहाँ स्थित है?" },
    optionsJson: [
      { en: "Geneva, Switzerland", hi: "जेनेवा, स्विट्जरलैंड" },
      { en: "New York, USA", hi: "न्यूयॉर्क, अमेरिका" },
      { en: "Paris, France", hi: "पेरिस, फ्रांस" },
      { en: "Vienna, Austria", hi: "विएना, ऑस्ट्रिया" }
    ],
    correctAnswer: 2,
    explanation: { en: "UNESCO's global headquarters is situated in Paris, France.", hi: "यूनेस्को का वैश्विक मुख्यालय पेरिस, फ्रांस में स्थित है।" },
  },
  {
    key: "aissee9-gem1-gk-03",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    questionJson: { en: "Which ISRO mission successfully landed the 'Vikram' lander and 'Pragyan' rover near the lunar South Pole in August 2023?", hi: "किस इसरो (ISRO) मिशन ने अगस्त 2023 में चंद्रमा के दक्षिणी ध्रुव के पास 'विक्रम' लैंडर और 'प्रज्ञान' रोवर को सफलतापूर्वक उतारा?" },
    optionsJson: [
      { en: "Chandrayaan-1", hi: "चंद्रयान-1" },
      { en: "Chandrayaan-2", hi: "चंद्रयान-2" },
      { en: "Chandrayaan-3", hi: "चंद्रयान-3" },
      { en: "Aditya-L1", hi: "आदित्य-L1" }
    ],
    correctAnswer: 2,
    explanation: { en: "Chandrayaan-3 achieved a historic soft landing on the lunar south pole on August 23, 2023, making India the 4th nation to soft-land on the Moon.", hi: "चंद्रयान-3 ने 23 अगस्त 2023 को चंद्रमा के दक्षिणी ध्रुव पर ऐतिहासिक सॉफ्ट लैंडिंग की।" },
  }
];

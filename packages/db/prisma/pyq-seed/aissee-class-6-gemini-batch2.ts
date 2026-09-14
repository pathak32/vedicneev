import type { PyqSeedItem } from "./types";

// AISSEE Class 6, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "aissee6-gem2-ar-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    questionJson: { en: "Find the perimeter of a rectangle whose length is 15 cm and breadth is 10 cm.", hi: "उस आयत का परिमाप ज्ञात कीजिए जिसकी लंबाई 15 सेमी और चौड़ाई 10 सेमी है।", mr: "ज्या आयताची लांबी 15 सेंमी आणि रुंदी 10 सेंमी आहे, त्याची परिमिती काढा." },
    optionsJson: [
      { en: "25 cm", hi: "25 सेमी", mr: "25 सेंमी" },
      { en: "50 cm", hi: "50 सेमी", mr: "50 सेंमी" },
      { en: "150 cm^2", hi: "150 सेमी^2", mr: "150 सेंमी^2" },
      { en: "60 cm", hi: "60 सेमी", mr: "60 सेंमी" }
    ],
    correctAnswer: 1,
    explanation: { en: "Perimeter of rectangle = 2 * (Length + Breadth) = 2 * (15 + 10) = 2 * 25 = 50 cm.", hi: "आयत का परिमाप = 2 * (लंबाई + चौड़ाई) = 2 * (15 + 10) = 2 * 25 = 50 सेमी।", mr: "आयताची परिमिती = 2 * (लांबी + रुंदी) = 2 * (15 + 10) = 2 * 25 = 50 सेंमी." },
  },
  {
    key: "aissee6-gem2-ar-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    questionJson: { en: "The average marks obtained by 5 students in a mathematics test is 24. If the marks of a 6th student (36) are added, what is the new average?", hi: "गणित की परीक्षा में 5 छात्रों द्वारा प्राप्त अंकों का औसत 24 है। यदि छठे छात्र के अंक (36) भी जोड़ दिए जाएं, तो नया औसत क्या होगा?", mr: "गणिताच्या परीक्षेत 5 विद्यार्थ्यांनी मिळवलेल्या गुणांची सरासरी 24 आहे. जर सहाव्या विद्यार्थ्याचे गुण (36) त्यात मिळवले, तर नवी सरासरी किती होईल?" },
    optionsJson: [
      { en: "25", hi: "25", mr: "25" },
      { en: "26", hi: "26", mr: "26" },
      { en: "28", hi: "28", mr: "28" },
      { en: "30", hi: "30", mr: "30" }
    ],
    correctAnswer: 1,
    explanation: { en: "Sum of marks of 5 students = 5 * 24 = 120. New sum = 120 + 36 = 156. New average = 156 / 6 = 26.", hi: "5 छात्रों के अंकों का योग = 5 * 24 = 120। नया योग = 120 + 36 = 156। नया औसत = 156 / 6 = 26।", mr: "5 विद्यार्थ्यांच्या गुणांची बेरीज = 5 * 24 = 120. नवी बेरीज = 120 + 36 = 156. नवी सरासरी = 156 / 6 = 26." },
  },
  {
    key: "aissee6-gem2-ar-03",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    questionJson: { en: "Divide ₹1,200 among A, B, and C in the ratio 2 : 3 : 5. Find the share of B.", hi: "₹1,200 को A, B और C के बीच 2 : 3 : 5 के अनुपात में विभाजित कीजिए। B का हिस्सा ज्ञात कीजिए।", mr: "₹1,200 हे A, B आणि C यांच्यामध्ये 2 : 3 : 5 या प्रमाणात विभागा. B चा वाटा काढा." },
    optionsJson: [
      { en: "₹240", hi: "₹240", mr: "₹240" },
      { en: "₹360", hi: "₹360", mr: "₹360" },
      { en: "₹600", hi: "₹600", mr: "₹600" },
      { en: "₹480", hi: "₹480", mr: "₹480" }
    ],
    correctAnswer: 1,
    explanation: { en: "Total ratio parts = 2 + 3 + 5 = 10. Value of 1 part = 1200 / 10 = ₹120. B's share = 3 parts * 120 = ₹360.", hi: "अनुपात के भागों का योग = 2 + 3 + 5 = 10। 1 भाग का मान = 1200 / 10 = ₹120। B का हिस्सा = 3 भाग * 120 = ₹360।", mr: "प्रमाणाच्या भागांची बेरीज = 2 + 3 + 5 = 10. एका भागाचे मूल्य = 1200 / 10 = ₹120. B चा वाटा = 3 भाग * 120 = ₹360." },
  },
  {
    key: "aissee6-gem2-ma-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: { en: "Find the next letter in the series: B, E, H, K, ?", hi: "श्रृंखला में अगला अक्षर ज्ञात कीजिए: B, E, H, K, ?", mr: "श्रेणीतील पुढील अक्षर शोधा: B, E, H, K, ?" },
    optionsJson: [
      { en: "M", hi: "M", mr: "M" },
      { en: "N", hi: "N", mr: "N" },
      { en: "O", hi: "O", mr: "O" },
      { en: "L", hi: "L", mr: "L" }
    ],
    correctAnswer: 1,
    explanation: { en: "The alphabetical position advances by +3: B(2) -> E(5) -> H(8) -> K(11) -> N(14).", hi: "अक्षरों का स्थान +3 बढ़ता है: B(2) -> E(5) -> H(8) -> K(11) -> N(14)।", mr: "अक्षरांचे स्थान +3 ने वाढते: B(2) -> E(5) -> H(8) -> K(11) -> N(14)." },
  },
  {
    key: "aissee6-gem2-ma-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: { en: "If '+' means 'x' and '-' means '+', evaluate: 15 + 4 - 10.", hi: "यदि '+' का अर्थ 'x' और '-' का अर्थ '+' है, तो हल करें: 15 + 4 - 10।", mr: "जर '+' चा अर्थ 'x' आणि '-' चा अर्थ '+' असेल, तर सोडवा: 15 + 4 - 10." },
    optionsJson: [
      { en: "70", hi: "70", mr: "70" },
      { en: "50", hi: "50", mr: "50" },
      { en: "60", hi: "60", mr: "60" },
      { en: "29", hi: "29", mr: "29" }
    ],
    correctAnswer: 0,
    explanation: { en: "Substituting signs: 15 * 4 + 10 = 60 + 10 = 70.", hi: "चिह्नों को बदलने पर: 15 * 4 + 10 = 60 + 10 = 70।", mr: "चिन्हे बदलल्यावर: 15 * 4 + 10 = 60 + 10 = 70." },
  },
  {
    key: "aissee6-gem2-la-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    questionJson: { en: "Choose the correct form of the verb: 'She _____ to school on foot every morning.'", hi: "क्रिया का सही रूप चुनें: 'She _____ to school on foot every morning.'", mr: "क्रियापदाचे योग्य रूप निवडा: 'She _____ to school on foot every morning.'" },
    optionsJson: [
      { en: "go", hi: "go", mr: "go" },
      { en: "goes", hi: "goes", mr: "goes" },
      { en: "went", hi: "went", mr: "went" },
      { en: "going", hi: "going", mr: "going" }
    ],
    correctAnswer: 1,
    explanation: { en: "A habitual action in the simple present tense with a singular subject ('She') takes the verb form 'goes'.", hi: "एकवचन कर्ता ('She') के साथ सामान्य वर्तमान काल में 'goes' का प्रयोग होता है।", mr: "एकवचनी कर्त्यासोबत ('She') साध्या वर्तमानकाळात 'goes' हे क्रियापदाचे रूप वापरले जाते." },
  },
  {
    key: "aissee6-gem2-la-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    questionJson: { en: "Give a one-word substitution for: 'A person who looks at the bright side of things.'", hi: "वाक्यांश के लिए एक शब्द चुनें: 'वह व्यक्ति जो चीज़ों के उज्ज्वल पक्ष को देखता है।'", mr: "खालील वाक्यांशासाठी एक शब्द सांगा: 'अशी व्यक्ती जी गोष्टींची चांगली बाजू पाहते.'" },
    optionsJson: [
      { en: "Pessimist", hi: "निराशावादी", mr: "निराशावादी" },
      { en: "Optimist", hi: "आशावादी", mr: "आशावादी" },
      { en: "Atheist", hi: "नास्तिक", mr: "नास्तिक" },
      { en: "Orphan", hi: "अनाथ", mr: "अनाथ" }
    ],
    correctAnswer: 1,
    explanation: { en: "An 'Optimist' is a person who tends to be hopeful and confident about the future.", hi: "'Optimist' (आशावादी) वह व्यक्ति है जो जीवन के सकारात्मक और उज्ज्वल पक्ष को देखता है।", mr: "'Optimist' (आशावादी) ही अशी व्यक्ती असते जी भविष्याबद्दल आशावादी आणि आत्मविश्वासू असते." },
  },
  {
    key: "aissee6-gem2-gk-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: { en: "Which river is known as the 'Sorrow of Bengal' due to its devastating historical floods?", hi: "ऐतिहासिक विनाशकारी बाढ़ों के कारण किस नदी को 'बंगाल का शोक' कहा जाता है?", mr: "इतिहासातील विनाशकारी पुरांमुळे कोणत्या नदीला 'बंगालचे दुःख' म्हटले जाते?" },
    optionsJson: [
      { en: "Damodar River", hi: "दामोदर नदी", mr: "दामोदर नदी" },
      { en: "Kosi River", hi: "कोसी नदी", mr: "कोसी नदी" },
      { en: "Brahmaputra River", hi: "ब्रह्मपुत्र नदी", mr: "ब्रह्मपुत्रा नदी" },
      { en: "Hooghly River", hi: "हुगली नदी", mr: "हुगळी नदी" }
    ],
    correctAnswer: 0,
    explanation: { en: "The Damodar River was historically named the 'Sorrow of Bengal' before the Damodar Valley Corporation multipurpose dams regulated its floods.", hi: "दामोदर नदी को ऐतिहासिक रूप से 'बंगाल का शोक' कहा जाता था।", mr: "दामोदर व्हॅली कॉर्पोरेशनच्या बहुउद्देशीय धरणांनी पुरांवर नियंत्रण मिळवण्यापूर्वी दामोदर नदीला इतिहासात 'बंगालचे दुःख' म्हटले जात असे." },
  },
  {
    key: "aissee6-gem2-gk-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: { en: "Who among the following was the Chairman of the Drafting Committee of the Indian Constitution?", hi: "निम्नलिखित में से कौन भारतीय संविधान की प्रारूप समिति (Drafting Committee) के अध्यक्ष थे?", mr: "खालीलपैकी कोण भारतीय संविधानाच्या मसुदा समितीचे (Drafting Committee) अध्यक्ष होते?" },
    optionsJson: [
      { en: "Dr. Rajendra Prasad", hi: "डॉ. राजेंद्र प्रसाद", mr: "डॉ. राजेंद्र प्रसाद" },
      { en: "Dr. B.R. Ambedkar", hi: "डॉ. बी.आर. अम्बेडकर", mr: "डॉ. बी.आर. आंबेडकर" },
      { en: "Sardar Vallabhbhai Patel", hi: "सरदार वल्लभभाई पटेल", mr: "सरदार वल्लभभाई पटेल" },
      { en: "Jawaharlal Nehru", hi: "जवाहरलाल नेहरू", mr: "जवाहरलाल नेहरू" }
    ],
    correctAnswer: 1,
    explanation: { en: "Dr. Bhimrao Ramji Ambedkar served as the Chairman of the Drafting Committee set up on 29 August 1947.", hi: "डॉ. भीमराव रामजी अम्बेडकर 29 अगस्त 1947 को गठित संविधान प्रारूप समिति के अध्यक्ष थे।", mr: "डॉ. भीमराव रामजी आंबेडकर हे 29 ऑगस्ट 1947 रोजी स्थापन झालेल्या मसुदा समितीचे अध्यक्ष होते." },
  },
  {
    key: "aissee6-gem2-gk-03",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    questionJson: { en: "The prestigious 'Durand Cup' is associated with which sport in India?", hi: "भारत में प्रसिद्ध 'डूरंड कप' (Durand Cup) किस खेल से संबंधित है?", mr: "भारतातील प्रतिष्ठित 'डूरंड कप' (Durand Cup) कोणत्या खेळाशी संबंधित आहे?" },
    optionsJson: [
      { en: "Cricket", hi: "क्रिकेट", mr: "क्रिकेट" },
      { en: "Field Hockey", hi: "हॉकी", mr: "हॉकी" },
      { en: "Football", hi: "फुटबॉल", mr: "फुटबॉल" },
      { en: "Badminton", hi: "बैडमिंटन", mr: "बॅडमिंटन" }
    ],
    correctAnswer: 2,
    explanation: { en: "The Durand Cup is Asia's oldest football tournament, first held in 1888 at Shimla.", hi: "डूरंड कप एशिया का सबसे पुराना फुटबॉल टूर्नामेंट है, जो पहली बार 1888 में शिमला में आयोजित किया गया था।", mr: "डूरंड कप ही आशियातील सर्वात जुनी फुटबॉल स्पर्धा आहे, जी पहिल्यांदा 1888 मध्ये शिमला येथे खेळवली गेली." },
  }
];

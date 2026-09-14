import type { PyqSeedItem } from "./types";

// JNVST Class 6, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "jnvst6-gem2-ma-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Select the number pair that is different from the other three options.", hi: "उस संख्या युग्म का चयन करें जो अन्य तीन विकल्पों से भिन्न है।", mr: "इतर तीन पर्यायांपेक्षा वेगळी असलेली संख्या-जोडी निवडा." },
    optionsJson: [
      { en: "14 - 196", hi: "14 - 196", mr: "14 - 196" },
      { en: "12 - 144", hi: "12 - 144", mr: "12 - 144" },
      { en: "15 - 225", hi: "15 - 225", mr: "15 - 225" },
      { en: "13 - 179", hi: "13 - 179", mr: "13 - 179" }
    ],
    correctAnswer: 3,
    explanation: { en: "In options A, B, and C, the second number is the exact square of the first number (14^2 = 196, 12^2 = 144, 15^2 = 225). In option D, 13^2 = 169, but 179 is given, making it the odd one out.", hi: "विकल्प A, B और C में दूसरी संख्या पहली संख्या का पूर्ण वर्ग है (14^2 = 196, 12^2 = 144, 15^2 = 225)। विकल्प D में 13^2 = 169 होता है, जबकि 179 दिया गया है, जो इसे भिन्न बनाता है।", mr: "पर्याय A, B आणि C मध्ये दुसरी संख्या ही पहिल्या संख्येचा पूर्ण वर्ग आहे (14^2 = 196, 12^2 = 144, 15^2 = 225). पर्याय D मध्ये 13^2 = 169 होतो, पण इथे 179 दिलेला आहे, म्हणून तो वेगळा आहे." },
  },
  {
    key: "jnvst6-gem2-ma-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Select the option that completes the letter analogy: BCD : EFG :: PQR : ?", hi: "उस विकल्प का चयन करें जो अक्षर सादृश्यता को पूरा करता है: BCD : EFG :: PQR : ?", mr: "अक्षर-सादृश्य पूर्ण करणारा पर्याय निवडा: BCD : EFG :: PQR : ?" },
    optionsJson: [
      { en: "STU", hi: "STU", mr: "STU" },
      { en: "TUV", hi: "TUV", mr: "TUV" },
      { en: "RST", hi: "RST", mr: "RST" },
      { en: "SUV", hi: "SUV", mr: "SUV" }
    ],
    correctAnswer: 0,
    explanation: { en: "Each letter in BCD is shifted forward by +3 positions in the alphabet to get EFG (B+3=E, C+3=F, D+3=G). Similarly, shifting PQR forward by +3 gives STU (P+3=S, Q+3=T, R+3=U).", hi: "BCD के प्रत्येक अक्षर को वर्णमाला में +3 स्थान आगे बढ़ाने पर EFG प्राप्त होता है (B+3=E, C+3=F, D+3=G)। उसी प्रकार PQR को +3 आगे बढ़ाने पर STU प्राप्त होता है।", mr: "BCD मधील प्रत्येक अक्षर वर्णमालेत +3 स्थान पुढे सरकवले की EFG मिळते (B+3=E, C+3=F, D+3=G). त्याचप्रमाणे PQR मधील प्रत्येक अक्षर +3 स्थान पुढे सरकवले की STU मिळते (P+3=S, Q+3=T, R+3=U)." },
  },
  {
    key: "jnvst6-gem2-ma-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Find the missing number in the series: 5, 11, 23, 47, ?", hi: "श्रृंखला में लुप्त संख्या ज्ञात कीजिए: 5, 11, 23, 47, ?", mr: "श्रेणीतील लुप्त संख्या शोधा: 5, 11, 23, 47, ?" },
    optionsJson: [
      { en: "91", hi: "91", mr: "91" },
      { en: "95", hi: "95", mr: "95" },
      { en: "99", hi: "99", mr: "99" },
      { en: "101", hi: "101", mr: "101" }
    ],
    correctAnswer: 1,
    explanation: { en: "The pattern follows (Previous Term x 2) + 1: (5 x 2) + 1 = 11; (11 x 2) + 1 = 23; (23 x 2) + 1 = 47; (47 x 2) + 1 = 95.", hi: "यह पैटर्न (पिछला पद x 2) + 1 का अनुसरण करता है: (5 x 2) + 1 = 11; (11 x 2) + 1 = 23; (23 x 2) + 1 = 47; (47 x 2) + 1 = 95।", mr: "हा पॅटर्न (आधीचे पद x 2) + 1 या नियमानुसार आहे: (5 x 2) + 1 = 11; (11 x 2) + 1 = 23; (23 x 2) + 1 = 47; (47 x 2) + 1 = 95." },
  },
  {
    key: "jnvst6-gem2-ma-04",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "In a series of numbers based on geometric progression, what is the 7th term of the sequence 3, 6, 12, 24, ...?", hi: "गुणोत्तर श्रेणी पर आधारित संख्याओं की श्रृंखला 3, 6, 12, 24, ... का 7वां पद क्या होगा?", mr: "गुणोत्तर श्रेणीवर आधारित 3, 6, 12, 24, ... या संख्याश्रेणीचे 7वे पद काय असेल?" },
    optionsJson: [
      { en: "96", hi: "96", mr: "96" },
      { en: "144", hi: "144", mr: "144" },
      { en: "192", hi: "192", mr: "192" },
      { en: "384", hi: "384", mr: "384" }
    ],
    correctAnswer: 2,
    explanation: { en: "The sequence doubles at each step (ratio r = 2). The terms are: T1=3, T2=6, T3=12, T4=24, T5=48, T6=96, T7=192. Using formula Tn = a * r^(n-1) = 3 * 2^6 = 3 * 64 = 192.", hi: "प्रत्येक पद में 2 का गुणा हो रहा है। पद हैं: T1=3, T2=6, T3=12, T4=24, T5=48, T6=96, T7=192। सूत्र Tn = a * r^(n-1) = 3 * 2^6 = 3 * 64 = 192।", mr: "प्रत्येक पदात आधीच्या पदाच्या दुप्पट (गुणोत्तर r = 2) होते. पदे अशी आहेत: T1=3, T2=6, T3=12, T4=24, T5=48, T6=96, T7=192. सूत्र Tn = a * r^(n-1) = 3 * 2^6 = 3 * 64 = 192 वापरून." },
  },
  {
    key: "jnvst6-gem2-ar-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Find the Least Common Multiple (LCM) of 12, 18, and 24.", hi: "12, 18 और 24 का लघुत्तम समापवर्त्य (LCM) ज्ञात कीजिए।", mr: "12, 18 आणि 24 चा लघुत्तम सामाईक विभाज्य (LCM) शोधा." },
    optionsJson: [
      { en: "48", hi: "48", mr: "48" },
      { en: "72", hi: "72", mr: "72" },
      { en: "96", hi: "96", mr: "96" },
      { en: "108", hi: "108", mr: "108" }
    ],
    correctAnswer: 1,
    explanation: { en: "Prime factorizations: 12 = 2^2 x 3; 18 = 2 x 3^2; 24 = 2^3 x 3. LCM = 2^3 x 3^2 = 8 x 9 = 72.", hi: "अभाज्य गुणनखंडन: 12 = 2^2 x 3; 18 = 2 x 3^2; 24 = 2^3 x 3। LCM = 2^3 x 3^2 = 8 x 9 = 72।", mr: "अभाज्य अवयव: 12 = 2^2 x 3; 18 = 2 x 3^2; 24 = 2^3 x 3. LCM = 2^3 x 3^2 = 8 x 9 = 72." },
  },
  {
    key: "jnvst6-gem2-ar-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Simplify the fractional expression: (3/4 + 2/5) - 1/2.", hi: "भिन्न व्यंजक को सरल कीजिए: (3/4 + 2/5) - 1/2।", mr: "भिन्न व्यंजक सोपे करा: (3/4 + 2/5) - 1/2." },
    optionsJson: [
      { en: "13/20", hi: "13/20", mr: "13/20" },
      { en: "23/20", hi: "23/20", mr: "23/20" },
      { en: "7/20", hi: "7/20", mr: "7/20" },
      { en: "11/20", hi: "11/20", mr: "11/20" }
    ],
    correctAnswer: 0,
    explanation: { en: "First find LCM of denominators 4, 5, 2 which is 20. 3/4 = 15/20, 2/5 = 8/20, 1/2 = 10/20. So (15/20 + 8/20) - 10/20 = 23/20 - 10/20 = 13/20.", hi: "सर्वप्रथम हर 4, 5, 2 का LCM = 20 ज्ञात करें। 3/4 = 15/20, 2/5 = 8/20, 1/2 = 10/20। अतः (15/20 + 8/20) - 10/20 = 23/20 - 10/20 = 13/20।", mr: "प्रथम छेद 4, 5, 2 चा LCM = 20 शोधा. 3/4 = 15/20, 2/5 = 8/20, 1/2 = 10/20. म्हणून (15/20 + 8/20) - 10/20 = 23/20 - 10/20 = 13/20." },
  },
  {
    key: "jnvst6-gem2-ar-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "A sum of ₹4,000 earns a simple interest of ₹960 in 3 years. What is the annual rate of interest?", hi: "₹4,000 की राशि पर 3 वर्षों में ₹960 का साधारण ब्याज मिलता है। वार्षिक ब्याज दर क्या है?", mr: "₹4,000 च्या रकमेवर 3 वर्षांत ₹960 इतके सरळ व्याज मिळते. वार्षिक व्याजदर किती आहे?" },
    optionsJson: [
      { en: "6%", hi: "6%", mr: "6%" },
      { en: "7.5%", hi: "7.5%", mr: "7.5%" },
      { en: "8%", hi: "8%", mr: "8%" },
      { en: "10%", hi: "10%", mr: "10%" }
    ],
    correctAnswer: 2,
    explanation: { en: "Simple Interest Formula: SI = (P x R x T) / 100. Plugging values: 960 = (4000 x R x 3) / 100 => 960 = 120 x R => R = 960 / 120 = 8%.", hi: "साधारण ब्याज सूत्र: SI = (P x R x T) / 100। मान रखने पर: 960 = (4000 x R x 3) / 100 => 960 = 120 x R => R = 960 / 120 = 8%।", mr: "सरळ व्याजाचे सूत्र: SI = (P x R x T) / 100. मूल्ये ठेवल्यास: 960 = (4000 x R x 3) / 100 => 960 = 120 x R => R = 960 / 120 = 8%." },
  },
  {
    key: "jnvst6-gem2-la-01",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Read the sentence and identify the synonym of the word 'ANCIENT': 'The museum housed several ancient manuscripts from the Vedic era.'", hi: "वाक्य को पढ़ें और 'ANCIENT' शब्द का पर्यायवाची चुनें: 'संग्रहालय में वैदिक काल की कई प्राचीन पांडुलिपियां थीं।'", mr: "वाक्य वाचा आणि 'ANCIENT' या शब्दाचा समानार्थी शब्द ओळखा: 'संग्रहालयात वैदिक काळातील अनेक प्राचीन हस्तलिखिते होती.'" },
    optionsJson: [
      { en: "Modern", hi: "आधुनिक", mr: "आधुनिक" },
      { en: "Very Old", hi: "बहुत पुराना (प्राचीन)", mr: "खूप जुना (प्राचीन)" },
      { en: "Fragile", hi: "नाज़ुक", mr: "ठिसूळ" },
      { en: "Expensive", hi: "महंगा", mr: "महाग" }
    ],
    correctAnswer: 1,
    explanation: { en: "'Ancient' refers to belonging to the distant past or very old times. Thus, 'Very Old' is the correct synonym.", hi: "'Ancient' का अर्थ सुदूर अतीत या बहुत पुराने समय से संबंधित होना है। अतः 'Very Old' (बहुत पुराना) सही पर्यायवाची है।", mr: "'Ancient' चा अर्थ दूरच्या भूतकाळातील किंवा खूप जुन्या काळातील असणे असा होतो. त्यामुळे 'Very Old' (खूप जुना) हा योग्य समानार्थी शब्द आहे." },
  },
  {
    key: "jnvst6-gem2-la-02",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Select the correct article to fill in the blank: 'He returned after _____ hour of intensive study.'", hi: "रिक्त स्थान भरने के लिए सही आर्टिकल का चयन करें: 'He returned after _____ hour of intensive study.'", mr: "रिकाम्या जागी भरण्यासाठी योग्य आर्टिकल निवडा: 'He returned after _____ hour of intensive study.'" },
    optionsJson: [
      { en: "a", hi: "a", mr: "a" },
      { en: "an", hi: "an", mr: "an" },
      { en: "the", hi: "the", mr: "the" },
      { en: "no article required", hi: "किसी आर्टिकल की आवश्यकता नहीं", mr: "कोणत्याही आर्टिकलची आवश्यकता नाही" }
    ],
    correctAnswer: 1,
    explanation: { en: "The word 'hour' begins with a silent 'h' and produces a vowel sound (/aʊər/), so the indefinite article 'an' is required before it.", hi: "'hour' शब्द मौन 'h' से शुरू होता है और स्वर ध्वनि उत्पन्न करता है, इसलिए इसके आगे अनिश्चित आर्टिकल 'an' का उपयोग होता है।", mr: "'hour' हा शब्द मौन 'h' ने सुरू होतो आणि स्वरध्वनी (/aʊər/) निर्माण करतो, त्यामुळे त्याआधी अनिश्चित आर्टिकल 'an' वापरावा लागतो." },
  },
  {
    key: "jnvst6-gem2-la-03",
    examType: "JNVST",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Choose the correct ANTONYM for the word 'GENEROUS'.", hi: "'GENEROUS' (उदार) शब्द का सही विलोम (ANTONYM) शब्द चुनें।", mr: "'GENEROUS' (उदार) या शब्दाचा योग्य विलोम शब्द (ANTONYM) निवडा." },
    optionsJson: [
      { en: "Kind", hi: "दयालु", mr: "दयाळू" },
      { en: "Stingy", hi: "संजूस/कृपण", mr: "कंजूस" },
      { en: "Noble", hi: "महान", mr: "थोर" },
      { en: "Humble", hi: "विनम्र", mr: "नम्र" }
    ],
    correctAnswer: 1,
    explanation: { en: "'Generous' means willing to give and share unselfishly. Its exact opposite is 'Stingy' (unwilling to spend or give).", hi: "'Generous' का अर्थ दूसरों को खुलकर देने वाला या उदार होता है। इसका सटीक विलोम 'Stingy' (कंजूस) है।", mr: "'Generous' म्हणजे स्वार्थाशिवाय खुल्या मनाने देणे व वाटणे. याचा नेमका विलोम शब्द 'Stingy' (कंजूस, म्हणजे खर्च करण्यास किंवा देण्यास तयार नसणारा) आहे." },
  }
];

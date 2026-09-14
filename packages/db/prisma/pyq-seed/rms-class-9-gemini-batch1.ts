import type { PyqSeedItem } from "./types";

// RMS Class 9, Gemini-drafted sample paper 1 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "rms9-gem1-mt-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    questionJson: { en: "The sum of three consecutive odd natural numbers is 57. Find the largest number.", hi: "तीन क्रमागत विषम प्राकृतिक संख्याओं का योग 57 है। सबसे बड़ी संख्या ज्ञात कीजिए।" },
    optionsJson: [
      { en: "17", hi: "17" },
      { en: "19", hi: "19" },
      { en: "21", hi: "21" },
      { en: "23", hi: "23" }
    ],
    correctAnswer: 2,
    explanation: { en: "Let the numbers be x, x+2, x+4. x + (x+2) + (x+4) = 57 => 3x + 6 = 57 => 3x = 51 => x = 17. Largest number = x + 4 = 17 + 4 = 21.", hi: "माना संख्याएँ x, x+2, x+4 हैं। 3x + 6 = 57 => 3x = 51 => x = 17। सबसे बड़ी संख्या = 17 + 4 = 21।" },
  },
  {
    key: "rms9-gem1-mt-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: { en: "A can complete a piece of work alone in 10 days, and B can complete the same work in 15 days. Working together, in how many days can they finish the work?", hi: "A किसी काम को अकेले 10 दिनों में पूरा कर सकता है, और B उसी काम को 15 दिनों में पूरा कर सकता है। एक साथ काम करते हुए वे इस काम को कितने दिनों में समाप्त कर सकते हैं?" },
    optionsJson: [
      { en: "5 days", hi: "5 दिन" },
      { en: "6 days", hi: "6 दिन" },
      { en: "8 days", hi: "8 दिन" },
      { en: "12.5 days", hi: "12.5 दिन" }
    ],
    correctAnswer: 1,
    explanation: { en: "A's 1 day work = 1/10; B's 1 day work = 1/15. Combined 1 day work = 1/10 + 1/15 = 5/30 = 1/6. Days required = 6 days.", hi: "A का 1 दिन का काम = 1/10; B का 1 दिन का काम = 1/15। संयुक्त 1 दिन का काम = 1/10 + 1/15 = 5/30 = 1/6। आवश्यक दिन = 6 दिन।" },
  },
  {
    key: "rms9-gem1-mt-03",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    questionJson: { en: "A right circular cylinder has a height of 14 cm and a curved surface area of 264 cm^2. Find the radius of its circular base.", hi: "एक लम्ब वृत्तीय बेलन की ऊँचाई 14 सेमी और वक्र पृष्ठीय क्षेत्रफल 264 सेमी^2 है। इसके वृत्ताकार आधार की त्रिज्या ज्ञात कीजिए।" },
    optionsJson: [
      { en: "2 cm", hi: "2 सेमी" },
      { en: "3 cm", hi: "3 सेमी" },
      { en: "3.5 cm", hi: "3.5 सेमी" },
      { en: "4 cm", hi: "4 सेमी" }
    ],
    correctAnswer: 1,
    explanation: { en: "Curved Surface Area = 2 * pi * r * h. 264 = 2 * (22/7) * r * 14 => 264 = 88 * r => r = 264 / 88 = 3 cm.", hi: "वक्र पृष्ठीय क्षेत्रफल = 2 * pi * r * h। 264 = 2 * (22/7) * r * 14 => 264 = 88 * r => r = 264 / 88 = 3 सेमी।" },
  },
  {
    key: "rms9-gem1-ma-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: { en: "What is the angle between the hour hand and minute hand of an analog clock at 3:00 sharp?", hi: "एक एनालॉग घड़ी में ठीक 3:00 बजे घंटे की सुई और मिनट की सुई के बीच कितने अंश (Degree) का कोण बनता है?" },
    optionsJson: [
      { en: "45°", hi: "45°" },
      { en: "60°", hi: "60°" },
      { en: "90°", hi: "90°" },
      { en: "120°", hi: "120°" }
    ],
    correctAnswer: 2,
    explanation: { en: "At 3:00, the minute hand points to 12 and the hour hand points to 3, forming a right angle (90°).", hi: "3:00 बजे मिनट की सुई 12 पर और घंटे की सुई 3 पर होती है, जो समकोण (90°) बनाती है।" },
  },
  {
    key: "rms9-gem1-ma-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: { en: "In a standard die, the sum of numbers on opposite faces is always 7. If the top face shows 2, what number is on the bottom face?", hi: "एक मानक पासे में विपरीत फलकों पर बनी संख्याओं का योग हमेशा 7 होता है। यदि ऊपरी फलक पर 2 दिखे, तो निचले फलक पर कौन सी संख्या होगी?" },
    optionsJson: [
      { en: "3", hi: "3" },
      { en: "4", hi: "4" },
      { en: "5", hi: "5" },
      { en: "6", hi: "6" }
    ],
    correctAnswer: 2,
    explanation: { en: "In a standard die, opposite sum = 7. Bottom face = 7 - 2 = 5.", hi: "मानक पासे में विपरीत फलकों का योग = 7 होता है। निचला फलक = 7 - 2 = 5।" },
  },
  {
    key: "rms9-gem1-sc-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    questionJson: { en: "Which bacterium is responsible for promoting the formation of curd from milk?", hi: "दूध से दही जमने की प्रक्रिया को बढ़ावा देने के लिए कौन सा जीवाणु (Bacterium) जिम्मेदार है?" },
    optionsJson: [
      { en: "Rhizobium", hi: "राइजोबियम" },
      { en: "Lactobacillus", hi: "लैक्टोबैसिलस" },
      { en: "E. coli", hi: "ई. कोलाई" },
      { en: "Salmonella", hi: "सालमोनेला" }
    ],
    correctAnswer: 1,
    explanation: { en: "Lactobacillus bacteria convert lactose sugar in milk into lactic acid, resulting in curd formation.", hi: "लैक्टोबैसिलस जीवाणु दूध में लैक्टोज शर्करा को लैक्टिक एसिड में परिवर्तित करते हैं जिससे दही बनता है।" },
  },
  {
    key: "rms9-gem1-sc-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "MEDIUM",
    questionJson: { en: "Which tough, porous, black substance obtained during the destructive distillation of coal is an almost pure form of carbon?", hi: "कोयले के भंजक आसवन (Destructive Distillation) के दौरान प्राप्त कौन सा कठोर, सरंध्र, काला पदार्थ कार्बन का लगभग शुद्ध रूप है?" },
    optionsJson: [
      { en: "Coal Tar", hi: "कोलतार" },
      { en: "Coal Gas", hi: "कोयला गैस" },
      { en: "Coke", hi: "कोक (Coke)" },
      { en: "Bitumen", hi: "बिटुमेन" }
    ],
    correctAnswer: 2,
    explanation: { en: "Coke is a tough, porous, black residue containing around 98% carbon, used in steel manufacturing.", hi: "कोक (Coke) कोयले से प्राप्त एक कठोर, काला पदार्थ है जो कार्बन का लगभग शुद्ध रूप है।" },
  },
  {
    key: "rms9-gem1-gk-01",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: { en: "Who gave the famous slogan 'Swaraj is my birthright and I shall have it'?", hi: "'स्वराज्य मेरा जन्मसिद्ध अधिकार है और मैं इसे लेकर रहूँगा' का प्रसिद्ध नारा किसने दिया था?" },
    optionsJson: [
      { en: "Lala Lajpat Rai", hi: "लाला लाजपत राय" },
      { en: "Bal Gangadhar Tilak", hi: "बाल गंगाधर तिलक" },
      { en: "Bipin Chandra Pal", hi: "विपिन चंद्र पाल" },
      { en: "Gopal Krishna Gokhale", hi: "गोपाल कृष्ण गोखले" }
    ],
    correctAnswer: 1,
    explanation: { en: "Lokmanya Bal Gangadhar Tilak coined this historic slogan during the Indian independence movement.", hi: "लोकमान्य बाल गंगाधर तिलक ने भारतीय स्वतंत्रता संग्राम के दौरान यह ऐतिहासिक नारा दिया था।" },
  },
  {
    key: "rms9-gem1-gk-02",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: { en: "Which celestial body in our solar system is known as the 'Morning Star' or 'Evening Star'?", hi: "हमारे सौर मंडल में किस खगोलीय पिंड को 'सुबह का तारा' या 'शाम का तारा' कहा जाता है?" },
    optionsJson: [
      { en: "Mars", hi: "मंगल" },
      { en: "Venus", hi: "शुक्र (Venus)" },
      { en: "Mercury", hi: "बुध" },
      { en: "Jupiter", hi: "बृहस्पति" }
    ],
    correctAnswer: 1,
    explanation: { en: "Venus is the brightest planet visible in the sky before sunrise or after sunset, earning it the moniker Morning/Evening Star.", hi: "शुक्र (Venus) सूर्योदय से पहले या सूर्यास्त के बाद आकाश में दिखने वाला सबसे चमकीला ग्रह है।" },
  },
  {
    key: "rms9-gem1-gk-03",
    examType: "RMS",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    questionJson: { en: "In which year was the historic First Battle of Panipat fought between Babur and Ibrahim Lodi?", hi: "बाबर और इब्राहिम लोदी के बीच पानीपत का ऐतिहासिक प्रथम युद्ध किस वर्ष लड़ा गया था?" },
    optionsJson: [
      { en: "1526 AD", hi: "1526 ई." },
      { en: "1556 AD", hi: "1556 ई." },
      { en: "1761 AD", hi: "1761 ई." },
      { en: "1192 AD", hi: "1192 ई." }
    ],
    correctAnswer: 0,
    explanation: { en: "The First Battle of Panipat was fought on April 21, 1526, laying the foundation of the Mughal Empire in India.", hi: "पानीपत का पहला युद्ध 21 अप्रैल 1526 को लड़ा गया था, जिसने भारत में मुगल साम्राज्य की नींव रखी।" },
  }
];

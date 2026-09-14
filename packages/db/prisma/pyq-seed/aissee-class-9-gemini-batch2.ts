import type { PyqSeedItem } from "./types";

// AISSEE Class 9, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "aissee9-gem2-mt-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Find the remainder when the polynomial x^3 - 3x^2 + 4x - 5 is divided by (x - 1).", hi: "बहुपद x^3 - 3x^2 + 4x - 5 को (x - 1) से विभाजित करने पर शेषफल ज्ञात कीजिए।" },
    optionsJson: [
      { en: "-3", hi: "-3" },
      { en: "-1", hi: "-1" },
      { en: "3", hi: "3" },
      { en: "5", hi: "5" }
    ],
    correctAnswer: 0,
    explanation: { en: "By Remainder Theorem, substituting x = 1 into P(x): P(1) = 1^3 - 3(1)^2 + 4(1) - 5 = 1 - 3 + 4 - 5 = -3.", hi: "शेषफल प्रमेय द्वारा, P(x) में x = 1 रखने पर: P(1) = 1 - 3 + 4 - 5 = -3।" },
  },
  {
    key: "aissee9-gem2-mt-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "A fair die with faces numbered 1 to 6 is rolled once. What is the probability of getting a prime number?", hi: "1 से 6 तक फलकों वाला एक निष्पक्ष पासा फेंका जाता है। अभाज्य संख्या (Prime Number) आने की प्रायिकता क्या है?" },
    optionsJson: [
      { en: "1/6", hi: "1/6" },
      { en: "1/3", hi: "1/3" },
      { en: "1/2", hi: "1/2" },
      { en: "2/3", hi: "2/3" }
    ],
    correctAnswer: 2,
    explanation: { en: "Total outcomes = 6 {1, 2, 3, 4, 5, 6}. Favourable prime outcomes = {2, 3, 5} (3 numbers). Probability = 3/6 = 1/2.", hi: "कुल परिणाम = 6। अभाज्य परिणाम = {2, 3, 5} (3 संख्याएं)। प्रायिकता = 3/6 = 1/2।" },
  },
  {
    key: "aissee9-gem2-mt-03",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mathematics",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "The hypotenuse of a right-angled triangle is 25 cm. If one of the remaining sides is 7 cm, find the area of the triangle.", hi: "एक समकोण त्रिभुज का कर्ण 25 सेमी है। यदि शेष भुजाओं में से एक भुजा 7 सेमी है, तो त्रिभुज का क्षेत्रफल ज्ञात कीजिए।" },
    optionsJson: [
      { en: "84 cm^2", hi: "84 सेमी^2" },
      { en: "168 cm^2", hi: "168 सेमी^2" },
      { en: "175 cm^2", hi: "175 सेमी^2" },
      { en: "96 cm^2", hi: "96 सेमी^2" }
    ],
    correctAnswer: 0,
    explanation: { en: "Other side = sqrt(25^2 - 7^2) = sqrt(625 - 49) = sqrt(576) = 24 cm. Area = (1/2) * Base * Height = (1/2) * 24 * 7 = 84 cm^2.", hi: "दूसरी भुजा = sqrt(625 - 49) = sqrt(576) = 24 सेमी। क्षेत्रफल = (1/2) * आधार * ऊंचाई = (1/2) * 24 * 7 = 84 सेमी^2।" },
  },
  {
    key: "aissee9-gem2-ma-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Five students A, B, C, D, and E are sitting in a row facing North. C is sitting in the middle. A is to the immediate left of C. E is at the extreme right end. Who is sitting between C and E?", hi: "पांच छात्र A, B, C, D और E उत्तर की ओर मुख करके एक पंक्ति में बैठे हैं। C बीच में बैठा है। A, C के तुरंत बाईं ओर है। E सुदूर दाहिने छोर पर है। C और E के बीच में कौन बैठा है?" },
    optionsJson: [
      { en: "B", hi: "B" },
      { en: "D", hi: "D" },
      { en: "Either B or D", hi: "या तो B या D" },
      { en: "Cannot be determined", hi: "निर्धारित नहीं किया जा सकता" }
    ],
    correctAnswer: 2,
    explanation: { en: "Arrangement positions: 1 2 3(C) 4 5(E). Position 2 is A. Remaining positions 1 and 4 can be occupied by B or D. So the person at position 4 (between C and E) is either B or D.", hi: "स्थान: 1 2 3(C) 4 5(E)। स्थान 2 पर A है। शेष स्थान 1 और 4 पर B या D हो सकते हैं। अतः C और E के बीच (स्थान 4 पर) B या D होगा।" },
  },
  {
    key: "aissee9-gem2-ma-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Seismograph : Earthquake :: Anemometer : ?", hi: "सिस्मोग्राफ : भूकम्प :: एनेमोमीटर : ?" },
    optionsJson: [
      { en: "Atmospheric Pressure", hi: "वायुमंडलीय दाब" },
      { en: "Wind Speed", hi: "पवन की गति" },
      { en: "Ocean Depth", hi: "समुद्र की गहराई" },
      { en: "Electric Current", hi: "विद्युत धारा" }
    ],
    correctAnswer: 1,
    explanation: { en: "A seismograph measures earthquake intensity; an anemometer measures wind speed.", hi: "सिस्मोग्राफ भूकंप की तीव्रता मापता है; एनेमोमीटर हवा की गति मापता है।" },
  },
  {
    key: "aissee9-gem2-sc-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which synthetic polymer is a thermosetting plastic that is a poor conductor of heat and electricity, widely used for making electrical switches?", hi: "कौन सा संश्लेषित बहुलक थर्मोसेटिंग प्लास्टिक का उदाहरण है जो ऊष्मा और बिजली का कुचालक है तथा बिजली के स्विच बनाने में व्यापक रूप से उपयोग होता है?" },
    optionsJson: [
      { en: "Polyethylene", hi: "पॉलीथीन" },
      { en: "PVC", hi: "पीवीसी" },
      { en: "Bakelite", hi: "बेकेलाइट" },
      { en: "Nylon", hi: "नायलॉन" }
    ],
    correctAnswer: 2,
    explanation: { en: "Bakelite is a thermosetting plastic that does not soften on heating and resists electricity, making it ideal for switches and plug boards.", hi: "बेकेलाइट एक थर्मोसेटिंग प्लास्टिक है जो गर्म करने पर नरम नहीं होता और बिजली का कुचालक है।" },
  },
  {
    key: "aissee9-gem2-sc-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "science",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Two plane mirrors are placed parallel to each other at a distance. How many images of an object placed between them will be formed?", hi: "दो समतल दर्पणों को एक-दूसरे के समानांतर रखा गया है। उनके बीच रखी किसी वस्तु के कितने प्रतिबिंब बनेंगे?" },
    optionsJson: [
      { en: "2", hi: "2" },
      { en: "4", hi: "4" },
      { en: "8", hi: "8" },
      { en: "Infinite", hi: "अनंत (Infinite)" }
    ],
    correctAnswer: 3,
    explanation: { en: "For parallel mirrors, angle theta = 0°. Number of images N = (360 / 0) - 1 = Infinity due to repeated multiple reflections.", hi: "समानांतर दर्पणों के बीच का कोण = 0° होता है। बार-बार परावर्तन के कारण अनंत (Infinite) प्रतिबिंब बनते हैं।" },
  },
  {
    key: "aissee9-gem2-gk-01",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the traditional indigenous agricultural practice of slash-and-burn farming known as in the North-Eastern region of India?", hi: "भारत के पूर्वोत्तर क्षेत्र में 'कर्तन एवं दहन' (Slash-and-burn) कृषि की पारंपरिक स्वदेशी पद्धति को किस नाम से जाना जाता है?" },
    optionsJson: [
      { en: "Jhum Cultivation", hi: "झूम खेती (Jhum)" },
      { en: "Terrace Farming", hi: "सीढ़ीदार खेती" },
      { en: "Commercial Plantation", hi: "व्यावसायिक रोपण" },
      { en: "Hydroponics", hi: "हाइड्रोपोनिक्स" }
    ],
    correctAnswer: 0,
    explanation: { en: "Slash-and-burn shifting agriculture is locally termed 'Jhuming' or 'Jhum Cultivation' in Assam, Meghalaya, Mizoram, and Nagaland.", hi: "भारत के पूर्वोत्तर राज्यों (असम, मेघालय, मिजोरम, नागालैंड) में कर्तन एवं दहन स्थानांतरण कृषि को स्थानीय स्तर पर 'झूम खेती' कहा जाता है।" },
  },
  {
    key: "aissee9-gem2-gk-02",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Who acts as the ex-officio Chairman of the Rajya Sabha (Upper House of Indian Parliament)?", hi: "राज्यसभा (भारतीय संसद के उच्च सदन) के पदेन सभापति (Ex-officio Chairman) के रूप में कौन कार्य करता है?" },
    optionsJson: [
      { en: "President of India", hi: "भारत के राष्ट्रपति" },
      { en: "Vice-President of India", hi: "भारत के उपराष्ट्रपति" },
      { en: "Speaker of Lok Sabha", hi: "लोकसभा के अध्यक्ष" },
      { en: "Prime Minister of India", hi: "भारत के प्रधानमंत्री" }
    ],
    correctAnswer: 1,
    explanation: { en: "Under Article 64 of the Indian Constitution, the Vice-President of India is the ex-officio Chairman of the Council of States (Rajya Sabha).", hi: "भारतीय संविधान के अनुच्छेद 64 के तहत, भारत के उपराष्ट्रपति राज्यसभा के पदेन सभापति होते हैं।" },
  },
  {
    key: "aissee9-gem2-gk-03",
    examType: "AISSEE",
    classLevel: 9,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "Project Tiger was launched by the Government of India in which year to promote tiger conservation?", hi: "बाघ संरक्षण को बढ़ावा देने के लिए भारत सरकार द्वारा 'प्रोजेक्ट टाइगर' (Project Tiger) किस वर्ष शुरू किया गया था?" },
    optionsJson: [
      { en: "1951", hi: "1951" },
      { en: "1973", hi: "1973" },
      { en: "1986", hi: "1986" },
      { en: "1992", hi: "1992" }
    ],
    correctAnswer: 1,
    explanation: { en: "Project Tiger was inaugurated on April 1, 1973, from Jim Corbett National Park during Prime Minister Indira Gandhi's tenure.", hi: "प्रोजेक्ट टाइगर का शुभारंभ 1 अप्रैल 1973 को जिम कॉर्बेट नेशनल पार्क से किया गया था।" },
  }
];

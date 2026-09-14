import type { PyqSeedItem } from "./types";

// RMS Class 6, Gemini-drafted sample paper 2 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
//
// Corrected at ingestion: item 3 (0-based, source array index)
// had a stale correctOptionIndex left over from the source explanation's own
// self-correction — the explanation text derives the right answer but the
// index field was never updated to match. Fixed here to the index the
// explanation itself arrives at (independently re-verified by hand).
export const posts: PyqSeedItem[] = [
  {
    key: "rms6-gem2-ar-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    questionJson: { en: "Convert the decimal 0.375 into an irreducible simple fraction.", hi: "दशमलव 0.375 को एक सरलतम भिन्न (Irreducible Fraction) में बदलिए।", mr: "0.375 या दशांश संख्येला सर्वात सोप्या (अविभाज्य) अपूर्णांकात रूपांतरित करा." },
    optionsJson: [
      { en: "3/8", hi: "3/8", mr: "3/8" },
      { en: "3/4", hi: "3/4", mr: "3/4" },
      { en: "5/8", hi: "5/8", mr: "5/8" },
      { en: "7/20", hi: "7/20", mr: "7/20" }
    ],
    correctAnswer: 0,
    explanation: { en: "0.375 = 375 / 1000. Dividing numerator and denominator by HCF 125 gives 3 / 8.", hi: "0.375 = 375 / 1000। अंश और हर को 125 से विभाजित करने पर 3 / 8 प्राप्त होता है।", mr: "0.375 = 375 / 1000. अंश आणि छेद यांना मसावि (HCF) 125 ने भागल्यास 3 / 8 मिळते." },
  },
  {
    key: "rms6-gem2-ar-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    questionJson: { en: "At what rate of simple interest per annum will a principal sum of ₹2,000 double itself in 8 years?", hi: "साधारण ब्याज की किस वार्षिक दर से ₹2,000 का मूलधन 8 वर्षों में दोगुना हो जाएगा?", mr: "साध्या व्याजाच्या कोणत्या वार्षिक दराने ₹2,000 ची मूळ रक्कम 8 वर्षांत दुप्पट होईल?" },
    optionsJson: [
      { en: "10%", hi: "10%", mr: "10%" },
      { en: "12.5%", hi: "12.5%", mr: "12.5%" },
      { en: "15%", hi: "15%", mr: "15%" },
      { en: "8%", hi: "8%", mr: "8%" }
    ],
    correctAnswer: 1,
    explanation: { en: "To double, SI must equal Principal P = ₹2,000. SI = (P * R * T) / 100 => 2000 = (2000 * R * 8) / 100 => R = 100 / 8 = 12.5%.", hi: "दोगुना होने के लिए, ब्याज SI = मूलधन P होना चाहिए। 2000 = (2000 * R * 8) / 100 => R = 100 / 8 = 12.5%।", mr: "रक्कम दुप्पट होण्यासाठी, व्याज (SI) मूळ रकमेइतके म्हणजे ₹2,000 असावे लागेल. SI = (P × R × T) / 100 => 2000 = (2000 × R × 8) / 100 => R = 100 / 8 = 12.5%." },
  },
  {
    key: "rms6-gem2-ar-03",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    questionJson: { en: "A bus covers a distance of 180 km in 4 hours. How much distance will it cover in 7 hours running at the same speed?", hi: "एक बस 4 घंटे में 180 किमी की दूरी तय करती है। उसी गति से चलते हुए वह 7 घंटे में कितनी दूरी तय करेगी?", mr: "एक बस 4 तासांत 180 किमी अंतर पार करते. तेवढ्याच वेगाने ती 7 तासांत किती अंतर पार करेल?" },
    optionsJson: [
      { en: "285 km", hi: "285 किमी", mr: "285 किमी" },
      { en: "315 km", hi: "315 किमी", mr: "315 किमी" },
      { en: "340 km", hi: "340 किमी", mr: "340 किमी" },
      { en: "360 km", hi: "360 किमी", mr: "360 किमी" }
    ],
    correctAnswer: 1,
    explanation: { en: "Speed = Distance / Time = 180 / 4 = 45 km/h. Distance in 7 hours = Speed * Time = 45 * 7 = 315 km.", hi: "चाल = दूरी / समय = 180 / 4 = 45 किमी/घंटा। 7 घंटे में दूरी = 45 * 7 = 315 किमी।", mr: "वेग = अंतर / वेळ = 180 / 4 = 45 किमी/तास. 7 तासांतील अंतर = वेग × वेळ = 45 × 7 = 315 किमी." },
  },
  {
    key: "rms6-gem2-ma-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: { en: "If 'ARMY' is coded as 'BSNZ', how will 'NAVY' be coded in that same pattern?", hi: "यदि 'ARMY' को 'BSNZ' के रूप में कोडित किया गया है, तो उसी पैटर्न में 'NAVY' को कैसे कोडित किया जाएगा?", mr: "जर 'ARMY' ला 'BSNZ' असे कोड केले असेल, तर त्याच पद्धतीने 'NAVY' ला कसे कोड केले जाईल?" },
    optionsJson: [
      { en: "OBWZ", hi: "OBWZ", mr: "OBWZ" },
      { en: "OBWA", hi: "OBWA", mr: "OBWA" },
      { en: "MBUX", hi: "MBUX", mr: "MBUX" },
      { en: "PBXA", hi: "PBXA", mr: "PBXA" }
    ],
    correctAnswer: 0,
    explanation: { en: "Each letter is shifted forward by +1: N+1=O, A+1=B, V+1=W, Y+1=Z. So NAVY becomes OBWZ.", hi: "प्रत्येक अक्षर +1 आगे बढ़ता है: N+1=O, A+1=B, V+1=W, Y+1=Z => OBWZ।", mr: "प्रत्येक अक्षर +1 पुढे सरकते: N+1=O, A+1=B, V+1=W, Y+1=Z. त्यामुळे NAVY चे OBWZ होते." },
  },
  {
    key: "rms6-gem2-ma-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: { en: "Find the missing term in the sequence: 4, 9, 19, 39, ?", hi: "अनुक्रम में लुप्त पद ज्ञात कीजिए: 4, 9, 19, 39, ?", mr: "या क्रमवारीतील (sequence) लुप्त पद शोधा: 4, 9, 19, 39, ?" },
    optionsJson: [
      { en: "69", hi: "69", mr: "69" },
      { en: "79", hi: "79", mr: "79" },
      { en: "89", hi: "89", mr: "89" },
      { en: "99", hi: "99", mr: "99" }
    ],
    correctAnswer: 1,
    explanation: { en: "Pattern is (Previous Term * 2) + 1: (4*2)+1=9; (9*2)+1=19; (19*2)+1=39; (39*2)+1=79.", hi: "पैटर्न (पिछला पद * 2) + 1 है: (4*2)+1=9; (9*2)+1=19; (19*2)+1=39; (39*2)+1=79।", mr: "पद्धत आहे (आधीचे पद × 2) + 1: (4×2)+1=9; (9×2)+1=19; (19×2)+1=39; (39×2)+1=79." },
  },
  {
    key: "rms6-gem2-la-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    questionJson: { en: "Fill in the blank with the correct article: 'Ganga is _____ sacred river of India.'", hi: "सही आर्टिकल से रिक्त स्थान भरें: 'Ganga is _____ sacred river of India.'", mr: "योग्य आर्टिकल (article) वापरून रिकामी जागा भरा: 'Ganga is _____ sacred river of India.'" },
    optionsJson: [
      { en: "a", hi: "a", mr: "a" },
      { en: "an", hi: "an", mr: "an" },
      { en: "the", hi: "the", mr: "the" },
      { en: "no article", hi: "कोई आर्टिकल नहीं", mr: "कोणतेही आर्टिकल नाही" }
    ],
    correctAnswer: 0,
    explanation: { en: "Before 'sacred' starting with consonant sound /s/, indefinite article 'a' is used ('a sacred river').", hi: "'sacred' शब्द से पहले अनिश्चित आर्टिकल 'a' का प्रयोग होता है।", mr: "व्यंजन ध्वनी /s/ ने सुरू होणाऱ्या 'sacred' या शब्दापूर्वी अनिश्चित आर्टिकल 'a' वापरले जाते ('a sacred river')." },
  },
  {
    key: "rms6-gem2-la-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    questionJson: { en: "Choose the correct SYNONYM of the word 'COURAGEOUS'.", hi: "'COURAGEOUS' (साहसी) शब्द का सही पर्यायवाची (SYNONYM) चुनें।", mr: "'COURAGEOUS' या शब्दाचा योग्य समानार्थी शब्द (SYNONYM) निवडा." },
    optionsJson: [
      { en: "Fearful", hi: "डरा हुआ", mr: "घाबरलेला" },
      { en: "Brave / Valiant", hi: "बहादुर / साहसी", mr: "शूर / साहसी" },
      { en: "Timid", hi: "डरपोक", mr: "भित्रा" },
      { en: "Weak", hi: "कमज़ोर", mr: "कमकुवत" }
    ],
    correctAnswer: 1,
    explanation: { en: "'Courageous' means possessing or showing bravery; 'Brave' or 'Valiant' is its exact synonym.", hi: "'Courageous' का अर्थ बहादुर या साहसी होना है, अतः 'Brave' इसका पर्यायवाची है।", mr: "'Courageous' म्हणजे शौर्य किंवा धैर्य असणे किंवा दाखवणे; 'Brave' किंवा 'Valiant' हा त्याचा नेमका समानार्थी शब्द आहे." },
  },
  {
    key: "rms6-gem2-gk-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: { en: "Which military rank in the Indian Air Force is equivalent to a Colonel in the Indian Army?", hi: "भारतीय वायु सेना (IAF) का कौन सा रैंक भारतीय सेना के कर्नल (Colonel) के बराबर है?", mr: "भारतीय हवाई दलातील (IAF) कोणता लष्करी हुद्दा भारतीय लष्करातील कर्नल (Colonel) च्या समान आहे?" },
    optionsJson: [
      { en: "Wing Commander", hi: "विंग कमांडर", mr: "विंग कमांडर" },
      { en: "Group Captain", hi: "ग्रुप कैप्टन", mr: "ग्रुप कॅप्टन" },
      { en: "Air Commodore", hi: "एयर कमोडोर", mr: "एअर कमोडोर" },
      { en: "Squadron Leader", hi: "स्क्वाड्रन लीडर", mr: "स्क्वाड्रन लीडर" }
    ],
    correctAnswer: 1,
    explanation: { en: "In equivalent rank structures, Group Captain (Air Force) = Colonel (Army) = Captain (Navy).", hi: "समकक्ष रैंक संरचना में, ग्रुप कैप्टन (वायु सेना) = कर्नल (थल सेना) = कैप्टन (नौसेना) होता है।", mr: "समान हुद्दा रचनेत, ग्रुप कॅप्टन (हवाई दल) = कर्नल (लष्कर) = कॅप्टन (नौदल) असतो." },
  },
  {
    key: "rms6-gem2-gk-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: { en: "What does the abbreviation DRDO stand for in India's defence establishment?", hi: "भारत के रक्षा प्रतिष्ठान में संक्षिप्त नाम DRDO का क्या अर्थ है?", mr: "भारताच्या संरक्षण व्यवस्थेत DRDO या संक्षिप्त नावाचा पूर्ण अर्थ काय आहे?" },
    optionsJson: [
      { en: "Defence Research and Development Organisation", hi: "रक्षा अनुसंधान एवं विकास संगठन", mr: "संरक्षण संशोधन आणि विकास संघटना" },
      { en: "Department of Railway and Defence Operations", hi: "रेलवे एवं रक्षा परिचालन विभाग", mr: "रेल्वे आणि संरक्षण कार्यवाही विभाग" },
      { en: "Defence Resources and Ordnance Office", hi: "रक्षा संसाधन और आयुध कार्यालय", mr: "संरक्षण संसाधन आणि शस्त्रास्त्र कार्यालय" },
      { en: "Digital Research and Defence Office", hi: "डिजिटल अनुसंधान एवं रक्षा कार्यालय", mr: "डिजिटल संशोधन आणि संरक्षण कार्यालय" }
    ],
    correctAnswer: 0,
    explanation: { en: "DRDO stands for Defence Research and Development Organisation, charged with military R&D.", hi: "DRDO का पूर्ण रूप Defence Research and Development Organisation (रक्षा अनुसंधान एवं विकास संगठन) है।", mr: "DRDO चा पूर्ण अर्थ Defence Research and Development Organisation (संरक्षण संशोधन आणि विकास संघटना) असा आहे, जी लष्करी संशोधन व विकासाचे काम पाहते." },
  },
  {
    key: "rms6-gem2-gk-03",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    questionJson: { en: "Which main organ in the human body is responsible for filtering metabolic waste products from the blood to produce urine?", hi: "मानव शरीर में कौन सा मुख्य अंग मूत्र बनाने के लिए रक्त से चयापचय अपशिष्ट उत्पादों को छानने के लिए जिम्मेदार है?", mr: "मानवी शरीरातील कोणता मुख्य अवयव रक्तातील चयापचय टाकाऊ पदार्थ गाळून मूत्र तयार करण्यासाठी जबाबदार आहे?" },
    optionsJson: [
      { en: "Liver", hi: "यकृत (Liver)", mr: "यकृत (Liver)" },
      { en: "Kidneys", hi: "गुर्दे (Kidneys)", mr: "मूत्रपिंड (Kidneys)" },
      { en: "Lungs", hi: "फेफड़े (Lungs)", mr: "फुफ्फुसे (Lungs)" },
      { en: "Pancreas", hi: "अग्न्याशय (Pancreas)", mr: "स्वादुपिंड (Pancreas)" }
    ],
    correctAnswer: 1,
    explanation: { en: "The paired kidneys contain millions of nephrons that filter blood to extract urea and excrete it as urine.", hi: "गुर्दे (Kidneys) रक्त को छानकर यूरिया और अतिरिक्त लवणों को मूत्र के रूप में बाहर निकालते हैं।", mr: "जोडीने असणाऱ्या मूत्रपिंडांमध्ये लाखो नेफ्रॉन असतात, जे रक्त गाळून त्यातील युरिया वेगळे करतात आणि मूत्राच्या रूपात बाहेर टाकतात." },
  }
];

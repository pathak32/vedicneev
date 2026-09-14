import type { PyqSeedItem } from "./types";

// RMS Class 6, Gemini-drafted sample paper 1 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "rms6-gem1-ar-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Simplify using BODMAS rule: 50 - [20 + {15 - (8 - 3)}].", hi: "BODMAS नियम का उपयोग करके सरल कीजिए: 50 - [20 + {15 - (8 - 3)}]।", mr: "BODMAS नियम वापरून सुलभ करा: 50 - [20 + {15 - (8 - 3)}]." },
    optionsJson: [
      { en: "20", hi: "20", mr: "20" },
      { en: "25", hi: "25", mr: "25" },
      { en: "30", hi: "30", mr: "30" },
      { en: "35", hi: "35", mr: "35" }
    ],
    correctAnswer: 0,
    explanation: { en: "Innermost bracket: (8 - 3) = 5. Curly bracket: {15 - 5} = 10. Square bracket: [20 + 10] = 30. Expression = 50 - 30 = 20.", hi: "सबसे अंदर का कोष्ठक: (8 - 3) = 5। मंझला कोष्ठक: {15 - 5} = 10। बड़ा कोष्ठक: [20 + 10] = 30। व्यंजक = 50 - 30 = 20।", mr: "सर्वात आतील कंस: (8 - 3) = 5. मधला कंस: {15 - 5} = 10. मोठा कंस: [20 + 10] = 30. उदाहरण = 50 - 30 = 20." },
  },
  {
    key: "rms6-gem1-ar-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "In a school with 600 students, 45% are girls. How many boys are there in the school?", hi: "600 छात्रों वाले एक स्कूल में 45% लड़कियां हैं। स्कूल में लड़कों की संख्या कितनी है?", mr: "600 विद्यार्थी असलेल्या एका शाळेत 45% मुली आहेत. शाळेत मुलांची संख्या किती आहे?" },
    optionsJson: [
      { en: "270", hi: "270", mr: "270" },
      { en: "330", hi: "330", mr: "330" },
      { en: "350", hi: "350", mr: "350" },
      { en: "360", hi: "360", mr: "360" }
    ],
    correctAnswer: 1,
    explanation: { en: "Percentage of boys = 100% - 45% = 55%. Number of boys = 55% of 600 = (55 / 100) * 600 = 55 * 6 = 330.", hi: "लड़कों का प्रतिशत = 100% - 45% = 55%। लड़कों की संख्या = 600 का 55% = 55 * 6 = 330।", mr: "मुलांची टक्केवारी = 100% - 45% = 55%. मुलांची संख्या = 600 च्या 55% = (55/100) * 600 = 55 * 6 = 330." },
  },
  {
    key: "rms6-gem1-ar-03",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "If 15 pens cost ₹225, how much will 24 such pens cost?", hi: "यदि 15 पेन का मूल्य ₹225 है, तो ऐसे ही 24 पेन का मूल्य कितना होगा?", mr: "जर 15 पेनांची किंमत ₹225 असेल, तर तशाच 24 पेनांची किंमत किती असेल?" },
    optionsJson: [
      { en: "₹320", hi: "₹320", mr: "₹320" },
      { en: "₹360", hi: "₹360", mr: "₹360" },
      { en: "₹380", hi: "₹380", mr: "₹380" },
      { en: "₹400", hi: "₹400", mr: "₹400" }
    ],
    correctAnswer: 1,
    explanation: { en: "Cost of 1 pen = 225 / 15 = ₹15. Cost of 24 pens = 24 * 15 = ₹360.", hi: "1 पेन का मूल्य = 225 / 15 = ₹15। 24 पेन का मूल्य = 24 * 15 = ₹360।", mr: "1 पेनाची किंमत = 225 / 15 = ₹15. 24 पेनांची किंमत = 24 * 15 = ₹360." },
  },
  {
    key: "rms6-gem1-ma-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Rohan ranks 7th from the top and 26th from the bottom in a class. How many total students are there in the class?", hi: "रोहन एक कक्षा में ऊपर से 7वें और नीचे से 26वें स्थान पर है। कक्षा में कुल कितने छात्र हैं?", mr: "रोहन एका वर्गात वरून 7व्या आणि खालून 26व्या क्रमांकावर आहे. वर्गात एकूण किती विद्यार्थी आहेत?" },
    optionsJson: [
      { en: "31", hi: "31", mr: "31" },
      { en: "32", hi: "32", mr: "32" },
      { en: "33", hi: "33", mr: "33" },
      { en: "34", hi: "34", mr: "34" }
    ],
    correctAnswer: 1,
    explanation: { en: "Total Students = (Rank from top + Rank from bottom) - 1 = (7 + 26) - 1 = 33 - 1 = 32.", hi: "कुल छात्र = (ऊपर से स्थान + नीचे से स्थान) - 1 = (7 + 26) - 1 = 33 - 1 = 32।", mr: "एकूण विद्यार्थी = (वरून क्रमांक + खालून क्रमांक) - 1 = (7 + 26) - 1 = 33 - 1 = 32." },
  },
  {
    key: "rms6-gem1-ma-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Archers : Bow :: Soldiers : ?", hi: "धनुर्धर : धनुष :: सैनिक : ?", mr: "धनुर्धारी : धनुष्य :: सैनिक : ?" },
    optionsJson: [
      { en: "Bullet", hi: "गोली", mr: "गोळी" },
      { en: "Rifle / Gun", hi: "राइफल / बंदूक", mr: "रायफल / बंदूक" },
      { en: "Uniform", hi: "वर्दी", mr: "गणवेश" },
      { en: "Cannon", hi: "तोप", mr: "तोफ" }
    ],
    correctAnswer: 1,
    explanation: { en: "An archer's primary weapon is a bow; a soldier's primary handheld weapon is a rifle.", hi: "धनुर्धर का मुख्य हथियार धनुष है; सैनिक का मुख्य व्यक्तिगत हथियार राइफल है।", mr: "धनुर्धाऱ्याचे मुख्य शस्त्र धनुष्य असते; सैनिकाचे मुख्य वैयक्तिक शस्त्र रायफल असते." },
  },
  {
    key: "rms6-gem1-la-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "Choose the correct comparative degree of adjective: 'Prevention is _____ than cure.'", hi: "विशेषण की सही तुलनात्मक डिग्री (Comparative Degree) चुनें: 'Prevention is _____ than cure.'", mr: "विशेषणाची योग्य तुलनात्मक पदवी (Comparative Degree) निवडा: 'Prevention is _____ than cure.'" },
    optionsJson: [
      { en: "good", hi: "good", mr: "good" },
      { en: "better", hi: "better", mr: "better" },
      { en: "best", hi: "best", mr: "best" },
      { en: "more good", hi: "more good", mr: "more good" }
    ],
    correctAnswer: 1,
    explanation: { en: "Comparing two ideas ('prevention' vs 'cure') requires the comparative form 'better' (good -> better -> best).", hi: "दो चीज़ों की तुलना के लिए 'good' की तुलनात्मक डिग्री 'better' का प्रयोग होता है।", mr: "दोन गोष्टींची ('prevention' आणि 'cure') तुलना करताना 'good' या विशेषणाचे तुलनात्मक रूप 'better' वापरले जाते (good -> better -> best)." },
  },
  {
    key: "rms6-gem1-la-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Identify the CORRECTLY spelt word among the given options.", hi: "दिए गए विकल्पों में से सही वर्तनी (Correct Spelling) वाला शब्द पहचानिए।", mr: "दिलेल्या विकल्पांपैकी योग्य स्पेलिंग (Correct Spelling) असलेला शब्द ओळखा." },
    optionsJson: [
      { en: "Lieutenant", hi: "Lieutenant", mr: "Lieutenant" },
      { en: "Leiutenant", hi: "Leiutenant", mr: "Leiutenant" },
      { en: "Lietenant", hi: "Lietenant", mr: "Lietenant" },
      { en: "Lieutnant", hi: "Lieutnant", mr: "Lieutnant" }
    ],
    correctAnswer: 0,
    explanation: { en: "The correct spelling of the military rank is L-I-E-U-T-E-N-A-N-T.", hi: "सैन्य पद 'Lieutenant' की सही वर्तनी L-I-E-U-T-E-N-A-N-T है।", mr: "लष्करी पदनाम 'Lieutenant' चे योग्य स्पेलिंग L-I-E-U-T-E-N-A-N-T आहे." },
  },
  {
    key: "rms6-gem1-gk-01",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the official motto of the Indian Army?", hi: "भारतीय सेना (Indian Army) का आधिकारिक ध्येय वाक्य (Motto) क्या है?", mr: "भारतीय सेनेचे (Indian Army) अधिकृत ध्येयवाक्य (Motto) काय आहे?" },
    optionsJson: [
      { en: "Touch the Sky with Glory", hi: "नभः स्पृशं दीप्तम्", mr: "नभः स्पृशं दीप्तम्" },
      { en: "Service Before Self (Seva Paramo Dharma)", hi: "सेवा परमो धर्मः (Service Before Self)", mr: "सेवा परमो धर्मः (Service Before Self)" },
      { en: "Sham No Varunah", hi: "शं नो वरुणः", mr: "शं नो वरुणः" },
      { en: "Valour and Wisdom", hi: "वीरता और विवेक", mr: "शौर्य आणि विवेक" }
    ],
    correctAnswer: 1,
    explanation: { en: "The official motto of the Indian Army is 'Service Before Self' ('Seva Paramo Dharma' in Sanskrit).", hi: "भारतीय सेना का आधिकारिक ध्येय वाक्य 'सेवा परमो धर्मः' (Service Before Self) है।", mr: "भारतीय सेनेचे अधिकृत ध्येयवाक्य 'सेवा परमो धर्मः' (Service Before Self) आहे." },
  },
  {
    key: "rms6-gem1-gk-02",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    reviewStatus: "DRAFT",
    questionJson: { en: "Which is India's highest military decoration awarded for highest degree of valour or self-sacrifice in the presence of the enemy during wartime?", hi: "युद्ध के दौरान दुश्मन की उपस्थिति में अदम्य साहस और आत्मबलिदान के लिए दिया जाने वाला भारत का सर्वोच्च सैन्य पुरस्कार कौन सा है?", mr: "युद्धकाळात शत्रूसमोर दाखवलेल्या अत्युच्च शौर्यासाठी किंवा आत्मबलिदानासाठी दिला जाणारा भारताचा सर्वोच्च लष्करी सन्मान कोणता आहे?" },
    optionsJson: [
      { en: "Maha Vir Chakra", hi: "महावीर चक्र", mr: "महावीर चक्र" },
      { en: "Param Vir Chakra", hi: "परमवीर चक्र", mr: "परमवीर चक्र" },
      { en: "Kirti Chakra", hi: "कीर्ति चक्र", mr: "कीर्ती चक्र" },
      { en: "Ashok Chakra", hi: "अशोक चक्र", mr: "अशोक चक्र" }
    ],
    correctAnswer: 1,
    explanation: { en: "The Param Vir Chakra (PVC) is India's highest wartime military award for bravery.", hi: "परमवीर चक्र (PVC) युद्धकाल में सर्वोच्च वीरता का भारत का सर्वोच्च सैन्य सम्मान है।", mr: "परमवीर चक्र (PVC) हा युद्धकाळातील शौर्यासाठी भारताचा सर्वोच्च लष्करी सन्मान आहे." },
  },
  {
    key: "rms6-gem1-gk-03",
    examType: "RMS",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    reviewStatus: "DRAFT",
    questionJson: { en: "What is the official capital city of the North-Eastern state of Nagaland?", hi: "भारत के पूर्वोत्तर राज्य नागालैंड की आधिकारिक राजधानी कौन सी है?", mr: "भारताच्या पूर्वोत्तर राज्य नागालँडची अधिकृत राजधानी कोणती आहे?" },
    optionsJson: [
      { en: "Imphal", hi: "इम्फाल", mr: "इम्फाळ" },
      { en: "Kohima", hi: "कोहिमा", mr: "कोहिमा" },
      { en: "Shillong", hi: "शिलांग", mr: "शिलाँग" },
      { en: "Agartala", hi: "अगरतला", mr: "आगरतळा" }
    ],
    correctAnswer: 1,
    explanation: { en: "Kohima is the capital city of Nagaland (Imphal is Manipur's capital; Shillong is Meghalaya's; Agartala is Tripura's).", hi: "कोहिमा नागालैंड की राजधानी है (इम्फाल मणिपुर की; शिलांग मेघालय की; अगरतला त्रिपुरा की है)।", mr: "कोहिमा ही नागालँडची राजधानी आहे (इम्फाळ मणिपूरची, शिलाँग मेघालयची आणि आगरतळा त्रिपुराची राजधानी आहे)." },
  }
];

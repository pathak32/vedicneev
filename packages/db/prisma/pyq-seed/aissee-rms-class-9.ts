import type { LangText, PyqSeedItem } from "./types";

// AISSEE/RMS Class 9 lateral-entry PYQ-bank sample set. AISSEE and RMS
// Class 6 already share one structural pattern in prisma/seed.ts (the
// Class 6 template literally reuses `aisseeSections` as `rmsSections`) —
// this file follows the same convention for Class 9: one base content
// pool, seeded twice under each board's own examType/key so the two
// boards' PYQ pools stay independent rows even though the content is
// shared. Original items modeled on the commonly cited Mathematics /
// Intelligence / General Science / General Knowledge pattern that
// replaces Class 6's "Language" section — NOT verbatim reproductions of
// any official paper; confidence here is lower than the Class 6 content.

interface BasePyqItem {
  key: string;
  sectionKey: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionJson: LangText;
  optionsJson: [LangText, LangText, LangText, LangText];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: LangText;
}

const basePool: BasePyqItem[] = [
  // ── Mathematics (2) ─────────────────────────────────────────────────
  {
    key: "math-01",
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: {
      en: "The LCM of 12 and 18 is:",
      hi: "12 और 18 का लघुत्तम समापवर्त्य (LCM) है:",
      mr: "12 आणि 18 चा लघुत्तम सामाईक पट (LCM) आहे:",
      bn: "12 এবং 18-এর ল.সা.গু (LCM) হল:",
      ta: "12 மற்றும் 18 இன் மீச்சிறு பொது மடங்கு (LCM):",
      gu: "12 અને 18 નો લ.સા.અ (LCM) છે:",
    },
    optionsJson: [
      { en: "24", hi: "24", mr: "24", bn: "24", ta: "24", gu: "24" },
      { en: "36", hi: "36", mr: "36", bn: "36", ta: "36", gu: "36" },
      { en: "48", hi: "48", mr: "48", bn: "48", ta: "48", gu: "48" },
      { en: "72", hi: "72", mr: "72", bn: "72", ta: "72", gu: "72" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "12 = 2²×3, 18 = 2×3². LCM takes the highest powers: 2²×3² = 36.",
      hi: "12 = 2²×3, 18 = 2×3²। LCM में उच्चतम घातें ली जाती हैं: 2²×3² = 36।",
      mr: "12 = 2²×3, 18 = 2×3². LCM मध्ये सर्वोच्च घात घेतले जातात: 2²×3² = 36.",
      bn: "12 = 2²×3, 18 = 2×3²। LCM-এ সর্বোচ্চ ঘাত নেওয়া হয়: 2²×3² = 36।",
      ta: "12 = 2²×3, 18 = 2×3². LCM உயர் அடுக்குகளை எடுக்கும்: 2²×3² = 36.",
      gu: "12 = 2²×3, 18 = 2×3². LCMમાં સૌથી વધુ ઘાત લેવાય છે: 2²×3² = 36.",
    },
  },
  {
    key: "math-02",
    sectionKey: "mathematics",
    difficulty: "MEDIUM",
    questionJson: {
      en: "A train covers 300 km in 5 hours. What is its speed?",
      hi: "एक रेलगाड़ी 5 घंटे में 300 किमी की दूरी तय करती है। उसकी चाल क्या है?",
      mr: "एक रेल्वे 5 तासांत 300 किमी अंतर कापते. तिचा वेग किती?",
      bn: "একটি ট্রেন 5 ঘণ্টায় 300 কিমি অতিক্রম করে। এর গতিবেগ কত?",
      ta: "ஒரு ரயில் 5 மணி நேரத்தில் 300 கிமீ தூரம் செல்கிறது. அதன் வேகம் என்ன?",
      gu: "એક ટ્રેન 5 કલાકમાં 300 કિમી અંતર કાપે છે. તેની ઝડપ કેટલી છે?",
    },
    optionsJson: [
      { en: "50 km/h", hi: "50 किमी/घंटा", mr: "50 किमी/तास", bn: "50 কিমি/ঘণ্টা", ta: "50 கிமீ/மணி", gu: "50 કિમી/કલાક" },
      { en: "60 km/h", hi: "60 किमी/घंटा", mr: "60 किमी/तास", bn: "60 কিমি/ঘণ্টা", ta: "60 கிமீ/மணி", gu: "60 કિમી/કલાક" },
      { en: "65 km/h", hi: "65 किमी/घंटा", mr: "65 किमी/तास", bn: "65 কিমি/ঘণ্টা", ta: "65 கிமீ/மணி", gu: "65 કિમી/કલાક" },
      { en: "75 km/h", hi: "75 किमी/घंटा", mr: "75 किमी/तास", bn: "75 কিমি/ঘণ্টা", ta: "75 கிமீ/மணி", gu: "75 કિમી/કલાક" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "Speed = distance ÷ time = 300 ÷ 5 = 60 km/h.",
      hi: "चाल = दूरी ÷ समय = 300 ÷ 5 = 60 किमी/घंटा।",
      mr: "वेग = अंतर ÷ वेळ = 300 ÷ 5 = 60 किमी/तास.",
      bn: "গতিবেগ = দূরত্ব ÷ সময় = 300 ÷ 5 = 60 কিমি/ঘণ্টা।",
      ta: "வேகம் = தூரம் ÷ நேரம் = 300 ÷ 5 = 60 கிமீ/மணி.",
      gu: "ઝડપ = અંતર ÷ સમય = 300 ÷ 5 = 60 કિમી/કલાક.",
    },
  },
  // ── Mental Ability / Intelligence (2) ────────────────────────────────
  {
    key: "ma-01",
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: {
      en: "Find the odd one out: Triangle, Pentagon, Cube, Hexagon",
      hi: "असंगत को चुनें: त्रिभुज, पंचभुज, घन, षट्भुज",
      mr: "विसंगत निवडा: त्रिकोण, पंचकोन, घन, षटकोन",
      bn: "বেমানানটি খুঁজুন: ত্রিভুজ, পঞ্চভুজ, ঘনক, ষড়ভুজ",
      ta: "பொருந்தாததைக் கண்டறியவும்: முக்கோணம், ஐங்கோணம், கனசதுரம், அறுகோணம்",
      gu: "અસંગત શોધો: ત્રિકોણ, પંચકોણ, ઘન, ષટકોણ",
    },
    optionsJson: [
      { en: "Triangle", hi: "त्रिभुज", mr: "त्रिकोण", bn: "ত্রিভুজ", ta: "முக்கோணம்", gu: "ત્રિકોણ" },
      { en: "Pentagon", hi: "पंचभुज", mr: "पंचकोन", bn: "পঞ্চভুজ", ta: "ஐங்கோணம்", gu: "પંચકોણ" },
      { en: "Cube", hi: "घन", mr: "घन", bn: "ঘনক", ta: "கனசதுரம்", gu: "ઘન" },
      { en: "Hexagon", hi: "षट्भुज", mr: "षटकोन", bn: "ষড়ভুজ", ta: "அறுகோணம்", gu: "ષટકોણ" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "Triangle, Pentagon, and Hexagon are flat (2D) polygons; a Cube is a solid (3D) shape.",
      hi: "त्रिभुज, पंचभुज और षट्भुज समतल (2D) बहुभुज हैं; घन एक ठोस (3D) आकृति है।",
      mr: "त्रिकोण, पंचकोन आणि षटकोन सपाट (2D) बहुभुज आहेत; घन हा घन (3D) आकार आहे.",
      bn: "ত্রিভুজ, পঞ্চভুজ এবং ষড়ভুজ সমতল (2D) বহুভুজ; ঘনক একটি নিরেট (3D) আকৃতি।",
      ta: "முக்கோணம், ஐங்கோணம், அறுகோணம் ஆகியவை தட்டையான (2D) பலகோணங்கள்; கனசதுரம் ஒரு திண்மையான (3D) வடிவம்.",
      gu: "ત્રિકોણ, પંચકોણ અને ષટકોણ સપાટ (2D) બહુકોણ છે; ઘન એક ઘન (3D) આકાર છે.",
    },
  },
  {
    key: "ma-02",
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: {
      en: "Complete the series: 5, 10, 20, 40, ?",
      hi: "श्रृंखला पूरी करें: 5, 10, 20, 40, ?",
      mr: "मालिका पूर्ण करा: 5, 10, 20, 40, ?",
      bn: "ধারাটি সম্পূর্ণ করুন: 5, 10, 20, 40, ?",
      ta: "தொடரை நிறைவு செய்யவும்: 5, 10, 20, 40, ?",
      gu: "શ્રેણી પૂર્ણ કરો: 5, 10, 20, 40, ?",
    },
    optionsJson: [
      { en: "60", hi: "60", mr: "60", bn: "60", ta: "60", gu: "60" },
      { en: "70", hi: "70", mr: "70", bn: "70", ta: "70", gu: "70" },
      { en: "80", hi: "80", mr: "80", bn: "80", ta: "80", gu: "80" },
      { en: "50", hi: "50", mr: "50", bn: "50", ta: "50", gu: "50" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "Each number doubles the previous one: 5×2=10, 10×2=20, 20×2=40, 40×2=80.",
      hi: "प्रत्येक संख्या पिछली संख्या से दोगुनी है: 5×2=10, 10×2=20, 20×2=40, 40×2=80।",
      mr: "प्रत्येक संख्या मागील संख्येच्या दुप्पट आहे: 5×2=10, 10×2=20, 20×2=40, 40×2=80.",
      bn: "প্রতিটি সংখ্যা আগেরটির দ্বিগুণ: 5×2=10, 10×2=20, 20×2=40, 40×2=80।",
      ta: "ஒவ்வொரு எண்ணும் முந்தையதின் இரட்டிப்பு: 5×2=10, 10×2=20, 20×2=40, 40×2=80.",
      gu: "દરેક સંખ્યા પાછલી સંખ્યાની બમણી છે: 5×2=10, 10×2=20, 20×2=40, 40×2=80.",
    },
  },
  // ── General Science (2) — replaces Class 6's "Language" section ─────
  {
    key: "sci-01",
    sectionKey: "science",
    difficulty: "MEDIUM",
    questionJson: {
      en: "Which organ in the human body pumps blood throughout the body?",
      hi: "मानव शरीर का कौन-सा अंग पूरे शरीर में रक्त पंप करता है?",
      mr: "मानवी शरीरातील कोणता अवयव संपूर्ण शरीरात रक्त पंप करतो?",
      bn: "মানবদেহের কোন অঙ্গ সারা শরীরে রক্ত পাম্প করে?",
      ta: "மனித உடலில் எந்த உறுப்பு உடல் முழுவதும் இரத்தத்தை பம்ப் செய்கிறது?",
      gu: "માનવ શરીરનું કયું અંગ સમગ્ર શરીરમાં લોહી પંપ કરે છે?",
    },
    optionsJson: [
      { en: "Lungs", hi: "फेफड़े", mr: "फुफ्फुसे", bn: "ফুসফুস", ta: "நுரையீரல்", gu: "ફેફસાં" },
      { en: "Heart", hi: "हृदय", mr: "हृदय", bn: "হৃদয়", ta: "இதயம்", gu: "હૃદય" },
      { en: "Kidney", hi: "गुर्दा", mr: "मूत्रपिंड", bn: "কিডনি", ta: "சிறுநீரகம்", gu: "કિડની" },
      { en: "Liver", hi: "यकृत", mr: "यकृत", bn: "যকৃৎ", ta: "கல்லீரல்", gu: "યકૃત" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "The heart pumps blood through the circulatory system; lungs handle gas exchange, kidneys filter blood, and the liver processes nutrients/toxins.",
      hi: "हृदय परिसंचरण तंत्र में रक्त पंप करता है; फेफड़े गैस विनिमय करते हैं, गुर्दे रक्त को छानते हैं, और यकृत पोषक तत्वों/विषाक्त पदार्थों को संसाधित करता है।",
      mr: "हृदय अभिसरण संस्थेत रक्त पंप करते; फुफ्फुसे वायू विनिमय करतात, मूत्रपिंड रक्त गाळतात, आणि यकृत पोषक/विषारी घटकांवर प्रक्रिया करते.",
      bn: "হৃদয় সংবহনতন্ত্রে রক্ত পাম্প করে; ফুসফুস গ্যাস বিনিময় করে, কিডনি রক্ত ছাঁকে, এবং যকৃৎ পুষ্টি/বিষাক্ত পদার্থ প্রক্রিয়া করে।",
      ta: "இதயம் இரத்த ஓட்ட மண்டலத்தில் இரத்தத்தை பம்ப் செய்கிறது; நுரையீரல் வாயு பரிமாற்றத்தை, சிறுநீரகம் இரத்தத்தை வடிகட்டுவதை, கல்லீரல் ஊட்டச்சத்து/நச்சுகளை செயலாக்குகிறது.",
      gu: "હૃદય પરિભ્રમણ તંત્રમાં લોહી પંપ કરે છે; ફેફસાં ગેસ વિનિમય કરે છે, કિડની લોહી ગાળે છે, અને યકૃત પોષક તત્વો/ઝેરી પદાર્થોની પ્રક્રિયા કરે છે.",
    },
  },
  {
    key: "sci-02",
    sectionKey: "science",
    difficulty: "EASY",
    questionJson: {
      en: "Sound cannot travel through:",
      hi: "ध्वनि किसके माध्यम से यात्रा नहीं कर सकती?",
      mr: "ध्वनी कशातून प्रवास करू शकत नाही?",
      bn: "শব্দ কীসের মধ্য দিয়ে ভ্রমণ করতে পারে না?",
      ta: "ஒலி எதன் வழியாக பயணிக்க முடியாது?",
      gu: "ધ્વનિ કોના મારફતે મુસાફરી કરી શકતો નથી?",
    },
    optionsJson: [
      { en: "Air", hi: "वायु", mr: "हवा", bn: "বায়ু", ta: "காற்று", gu: "હવા" },
      { en: "Water", hi: "जल", mr: "पाणी", bn: "জল", ta: "நீர்", gu: "પાણી" },
      { en: "Vacuum", hi: "निर्वात", mr: "निर्वात", bn: "শূন্যস্থান", ta: "வெற்றிடம்", gu: "શૂન્યાવકાશ" },
      { en: "Steel", hi: "इस्पात", mr: "पोलाद", bn: "ইস্পাত", ta: "எஃகு", gu: "સ્ટીલ" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "Sound is a mechanical wave — it needs a medium (solid, liquid, or gas) to travel and cannot pass through a vacuum, unlike light.",
      hi: "ध्वनि एक यांत्रिक तरंग है — इसे यात्रा के लिए माध्यम (ठोस, तरल या गैस) चाहिए और यह प्रकाश के विपरीत निर्वात से नहीं गुजर सकती।",
      mr: "ध्वनी ही यांत्रिक लहर आहे — तिला प्रवासासाठी माध्यम (घन, द्रव किंवा वायू) आवश्यक असते आणि ती प्रकाशाप्रमाणे निर्वातातून जाऊ शकत नाही.",
      bn: "শব্দ একটি যান্ত্রিক তরঙ্গ — এর ভ্রমণের জন্য মাধ্যম (কঠিন, তরল বা গ্যাস) প্রয়োজন এবং আলোর বিপরীতে এটি শূন্যস্থান দিয়ে যেতে পারে না।",
      ta: "ஒலி ஒரு இயந்திர அலை — பயணிக்க ஊடகம் (திண்மம், திரவம் அல்லது வாயு) தேவை, ஒளியைப் போலல்லாமல் வெற்றிடத்தின் வழியாக செல்ல முடியாது.",
      gu: "ધ્વનિ એક યાંત્રિક તરંગ છે — તેને મુસાફરી માટે માધ્યમ (ઘન, પ્રવાહી અથવા વાયુ) જોઈએ છે અને પ્રકાશથી વિપરીત તે શૂન્યાવકાશમાંથી પસાર થઈ શકતો નથી.",
    },
  },
  // ── General Knowledge (2) ─────────────────────────────────────────────
  {
    key: "gk-01",
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: {
      en: "Which is the national river of India?",
      hi: "भारत की राष्ट्रीय नदी कौन-सी है?",
      mr: "भारताची राष्ट्रीय नदी कोणती आहे?",
      bn: "ভারতের জাতীয় নদী কোনটি?",
      ta: "இந்தியாவின் தேசிய நதி எது?",
      gu: "ભારતની રાષ્ટ્રીય નદી કઈ છે?",
    },
    optionsJson: [
      { en: "Yamuna", hi: "यमुना", mr: "यमुना", bn: "যমুনা", ta: "யமுனா", gu: "યમુના" },
      { en: "Ganga", hi: "गंगा", mr: "गंगा", bn: "গঙ্গা", ta: "கங்கை", gu: "ગંગા" },
      { en: "Godavari", hi: "गोदावरी", mr: "गोदावरी", bn: "গোদাবরী", ta: "கோதாவரி", gu: "ગોદાવરી" },
      { en: "Brahmaputra", hi: "ब्रह्मपुत्र", mr: "ब्रह्मपुत्रा", bn: "ব্রহ্মপুত্র", ta: "பிரம்மபுத்ரா", gu: "બ્રહ્મપુત્રા" },
    ],
    correctAnswer: 1,
    explanation: {
      en: "The Ganga was declared India's National River in 2008.",
      hi: "गंगा को 2008 में भारत की राष्ट्रीय नदी घोषित किया गया था।",
      mr: "गंगेला 2008 मध्ये भारताची राष्ट्रीय नदी घोषित करण्यात आले.",
      bn: "গঙ্গাকে 2008 সালে ভারতের জাতীয় নদী ঘোষণা করা হয়েছিল।",
      ta: "கங்கை 2008ல் இந்தியாவின் தேசிய நதியாக அறிவிக்கப்பட்டது.",
      gu: "ગંગાને 2008માં ભારતની રાષ્ટ્રીય નદી જાહેર કરવામાં આવી હતી.",
    },
  },
  {
    key: "gk-02",
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: {
      en: "The headquarters of the United Nations is located in:",
      hi: "संयुक्त राष्ट्र का मुख्यालय कहाँ स्थित है?",
      mr: "संयुक्त राष्ट्रांचे मुख्यालय कोठे आहे?",
      bn: "জাতিসংঘের সদর দপ্তর কোথায় অবস্থিত?",
      ta: "ஐக்கிய நாடுகள் அவையின் தலைமையகம் அமைந்துள்ள இடம்:",
      gu: "સંયુક્ત રાષ્ટ્રનું મુખ્યાલય ક્યાં આવેલું છે?",
    },
    optionsJson: [
      { en: "London", hi: "लंदन", mr: "लंडन", bn: "লন্ডন", ta: "லண்டன்", gu: "લંડન" },
      { en: "Geneva", hi: "जिनेवा", mr: "जिनिव्हा", bn: "জেনেভা", ta: "ஜெனீவா", gu: "જિનીવા" },
      { en: "New York", hi: "न्यूयॉर्क", mr: "न्यूयॉर्क", bn: "নিউ ইয়র্ক", ta: "நியூயார்க்", gu: "ન્યુયોર્ક" },
      { en: "Paris", hi: "पेरिस", mr: "पॅरिस", bn: "প্যারিস", ta: "பாரிஸ்", gu: "પેરિસ" },
    ],
    correctAnswer: 2,
    explanation: {
      en: "The UN headquarters is in New York City, USA; Geneva hosts many UN agencies but not the main headquarters.",
      hi: "संयुक्त राष्ट्र का मुख्यालय न्यूयॉर्क शहर, अमेरिका में है; जिनेवा में कई संयुक्त राष्ट्र एजेंसियाँ हैं लेकिन मुख्य मुख्यालय नहीं।",
      mr: "संयुक्त राष्ट्रांचे मुख्यालय न्यूयॉर्क शहर, अमेरिका येथे आहे; जिनिव्हामध्ये अनेक संयुक्त राष्ट्र संस्था आहेत पण मुख्य मुख्यालय नाही.",
      bn: "জাতিসংঘের সদর দপ্তর নিউ ইয়র্ক সিটি, আমেরিকায় অবস্থিত; জেনেভায় অনেক জাতিসংঘ সংস্থা আছে কিন্তু মূল সদর দপ্তর নয়।",
      ta: "ஐ.நா தலைமையகம் அமெரிக்காவின் நியூயார்க் நகரில் உள்ளது; ஜெனீவாவில் பல ஐ.நா அமைப்புகள் உள்ளன ஆனால் முதன்மை தலைமையகம் அல்ல.",
      gu: "સંયુક્ત રાષ્ટ્રનું મુખ્યાલય ન્યુયોર્ક શહેર, અમેરિકામાં આવેલું છે; જિનીવામાં ઘણી સંયુક્ત રાષ્ટ્ર એજન્સીઓ છે પણ મુખ્ય મુખ્યાલય નથી.",
    },
  },
];

function toItems(examType: "AISSEE" | "RMS"): PyqSeedItem[] {
  const prefix = examType === "AISSEE" ? "aissee9" : "rms9";
  return basePool.map((item) => ({
    key: `${prefix}-${item.key}`,
    examType,
    classLevel: 9,
    year: 2025,
    sectionKey: item.sectionKey,
    difficulty: item.difficulty,
    questionJson: item.questionJson,
    optionsJson: item.optionsJson,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
  }));
}

export const posts: PyqSeedItem[] = [...toItems("AISSEE"), ...toItems("RMS")];

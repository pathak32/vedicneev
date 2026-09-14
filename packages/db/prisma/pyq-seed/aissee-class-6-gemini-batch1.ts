import type { PyqSeedItem } from "./types";

// AISSEE Class 6, Gemini-drafted sample paper 1 (10 items) —
// reviewed against the item-authoring brief before ingestion: every
// option/explanation verified by hand (math re-solved from scratch, GK/
// history/civics facts independently checked), no duplicate options, no
// unresolved ambiguity. Seeded as DRAFT — excluded from mock assembly
// (jnvstMockService.ts) until an admin publishes it via /admin/mock-papers.
export const posts: PyqSeedItem[] = [
  {
    key: "aissee6-gem1-ar-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "EASY",
    questionJson: { en: "Write the Roman numeral representation for the number 94.", hi: "संख्या 94 के लिए प्रयुक्त होने वाली रोमन संख्यांक (Roman Numeral) लिखिए।", mr: "संख्या 94 साठी रोमन अंक (Roman Numeral) लिहा." },
    optionsJson: [
      { en: "LXIV", hi: "LXIV", mr: "LXIV" },
      { en: "XCIV", hi: "XCIV", mr: "XCIV" },
      { en: "CXIV", hi: "CXIV", mr: "CXIV" },
      { en: "LXXXXIV", hi: "LXXXXIV", mr: "LXXXXIV" }
    ],
    correctAnswer: 1,
    explanation: { en: "90 in Roman numerals is XC (100 - 10) and 4 is IV. Combining them gives XCIV.", hi: "रोमन संख्या में 90 = XC (100 - 10) और 4 = IV है। दोनों को मिलाकर XCIV बनता है।", mr: "रोमन अंकांमध्ये 90 = XC (100 - 10) आणि 4 = IV असे लिहितात. दोन्ही एकत्र केल्यास XCIV हा अंक तयार होतो." },
  },
  {
    key: "aissee6-gem1-ar-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "MEDIUM",
    questionJson: { en: "A shopkeeper bought a bicycle for ₹2,500 and spent ₹300 on its repair. He then sold it for ₹3,220. Find his profit percentage.", hi: "एक दुकानदार ने ₹2,500 में एक साइकिल खरीदी और उसकी मरम्मत पर ₹300 खर्च किए। उसने इसे ₹3,220 में बेच दिया। उसका लाभ प्रतिशत ज्ञात कीजिए।", mr: "एका दुकानदाराने ₹2,500 मध्ये एक सायकल विकत घेतली आणि तिच्या दुरुस्तीसाठी ₹300 खर्च केले. त्यानंतर त्याने ती ₹3,220 मध्ये विकली. त्याचा नफा टक्केवारी काढा." },
    optionsJson: [
      { en: "10%", hi: "10%", mr: "10%" },
      { en: "12%", hi: "12%", mr: "12%" },
      { en: "15%", hi: "15%", mr: "15%" },
      { en: "18%", hi: "18%", mr: "18%" }
    ],
    correctAnswer: 2,
    explanation: { en: "Total Cost Price = ₹2,500 + ₹300 = ₹2,800. Selling Price = ₹3,220. Profit = ₹3,220 - ₹2,800 = ₹420. Profit % = (420 / 2800) * 100 = 15%.", hi: "कुल क्रय मूल्य = ₹2,500 + ₹300 = ₹2,800। विक्रय मूल्य = ₹3,220। लाभ = ₹3,220 - ₹2,800 = ₹420। लाभ % = (420 / 2800) * 100 = 15%।", mr: "एकूण खरेदी किंमत = ₹2,500 + ₹300 = ₹2,800. विक्री किंमत = ₹3,220. नफा = ₹3,220 - ₹2,800 = ₹420. नफा % = (420 / 2800) * 100 = 15%." },
  },
  {
    key: "aissee6-gem1-ar-03",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "arithmetic",
    difficulty: "HARD",
    questionJson: { en: "A train 180 meters long is running at a speed of 54 km/h. How many seconds will it take to cross a railway platform 220 meters long?", hi: "180 मीटर लंबी एक ट्रेन 54 किमी/घंटा की गति से चल रही है। 220 मीटर लंबे रेलवे प्लेटफॉर्म को पार करने में इसे कितने सेकंड का समय लगेगा?", mr: "180 मीटर लांबीची एक रेल्वे 54 किमी/तास वेगाने धावत आहे. 220 मीटर लांबीचा रेल्वे प्लॅटफॉर्म ओलांडण्यासाठी तिला किती सेकंद लागतील?" },
    optionsJson: [
      { en: "20 seconds", hi: "20 सेकंड", mr: "20 सेकंद" },
      { en: "22.5 seconds", hi: "22.5 सेकंड", mr: "22.5 सेकंद" },
      { en: "26.6 seconds", hi: "26.6 सेकंड", mr: "26.6 सेकंद" },
      { en: "30 seconds", hi: "30 सेकंड", mr: "30 सेकंद" }
    ],
    correctAnswer: 2,
    explanation: { en: "Speed = 54 km/h = 54 * (5/18) = 15 m/s. Total Distance = Train Length + Platform Length = 180 + 220 = 400 m. Time = Distance / Speed = 400 / 15 = 26.67 seconds.", hi: "चाल = 54 किमी/घंटे = 54 * (5/18) = 15 मीटर/सेकंड। कुल दूरी = ट्रेन की लंबाई + प्लेटफॉर्म की लंबाई = 180 + 220 = 400 मीटर। समय = दूरी / चाल = 400 / 15 = 26.67 सेकंड।", mr: "वेग = 54 किमी/तास = 54 * (5/18) = 15 मीटर/सेकंद. एकूण अंतर = रेल्वेची लांबी + प्लॅटफॉर्मची लांबी = 180 + 220 = 400 मीटर. वेळ = अंतर / वेग = 400 / 15 = 26.67 सेकंद." },
  },
  {
    key: "aissee6-gem1-ma-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "EASY",
    questionJson: { en: "A boy walks 10 meters towards East, then turns right and walks 5 meters. In which direction is he facing now?", hi: "एक लड़का पूर्व दिशा की ओर 10 मीटर चलता है, फिर दाईं ओर मुड़ता है और 5 मीटर चलता है। अब उसका मुख किस दिशा में है?", mr: "एक मुलगा पूर्व दिशेला 10 मीटर चालतो, नंतर उजवीकडे वळून 5 मीटर चालतो. आता त्याचे तोंड कोणत्या दिशेला आहे?" },
    optionsJson: [
      { en: "North", hi: "उत्तर", mr: "उत्तर" },
      { en: "South", hi: "दक्षिण", mr: "दक्षिण" },
      { en: "East", hi: "पूर्व", mr: "पूर्व" },
      { en: "West", hi: "पश्चिम", mr: "पश्चिम" }
    ],
    correctAnswer: 1,
    explanation: { en: "Facing East initially and turning right (clock-wise by 90°) directs facing towards South.", hi: "प्रारंभ में पूर्व दिशा की ओर मुंह करके दाईं ओर (90° क्लॉकवाइज) मुड़ने पर मुख दक्षिण दिशा की ओर हो जाता है।", mr: "सुरुवातीला पूर्व दिशेला तोंड करून उजवीकडे (90° घड्याळाच्या दिशेने) वळल्यास तोंड दक्षिण दिशेला होते." },
  },
  {
    key: "aissee6-gem1-ma-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "mental_ability",
    difficulty: "MEDIUM",
    questionJson: { en: "Pointing to a man, Neha said, 'His mother is the only daughter of my mother.' How is Neha related to the man?", hi: "एक आदमी की ओर इशारा करते हुए नेहा ने कहा, 'उसकी माँ मेरी माँ की इकलौती बेटी है।' नेहा का उस आदमी से क्या संबंध है?", mr: "एका माणसाकडे बोट दाखवत नेहा म्हणाली, 'त्याची आई माझ्या आईची एकुलती एक मुलगी आहे.' नेहाचा त्या माणसाशी काय संबंध आहे?" },
    optionsJson: [
      { en: "Sister", hi: "बहन", mr: "बहीण" },
      { en: "Mother", hi: "माँ", mr: "आई" },
      { en: "Aunt", hi: "चाची/मामी", mr: "काकू/मामी" },
      { en: "Grandmother", hi: "दादी/नानी", mr: "आजी" }
    ],
    correctAnswer: 1,
    explanation: { en: "'Only daughter of my mother' means Neha herself. So the man's mother is Neha herself. Therefore, Neha is the mother of the man.", hi: "'मेरी माँ की इकलौती बेटी' स्वयं नेहा है। अतः उस व्यक्ति की माँ स्वयं नेहा है। इसलिए नेहा उस आदमी की माँ है।", mr: "'माझ्या आईची एकुलती एक मुलगी' म्हणजे नेहा स्वतः. त्यामुळे त्या माणसाची आई स्वतः नेहा आहे. म्हणून नेहा त्या माणसाची आई आहे." },
  },
  {
    key: "aissee6-gem1-la-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "EASY",
    questionJson: { en: "Fill in the blank with the appropriate preposition: 'The cat jumped _____ the kitchen table.'", hi: "उचित प्रीपोजिशन (Preposition) से रिक्त स्थान भरें: 'The cat jumped _____ the kitchen table.'", mr: "योग्य प्रीपोझिशन (Preposition) वापरून रिकामी जागा भरा: 'The cat jumped _____ the kitchen table.'" },
    optionsJson: [
      { en: "in", hi: "in", mr: "in" },
      { en: "upon", hi: "upon", mr: "upon" },
      { en: "at", hi: "at", mr: "at" },
      { en: "into", hi: "into", mr: "into" }
    ],
    correctAnswer: 1,
    explanation: { en: "'Upon' or 'onto' indicates motion aimed onto a surface. Jumping onto a raised surface uses 'upon'.", hi: "'Upon' किसी सतह पर गति के साथ ऊपर आने का संकेत देता है।", mr: "'Upon' म्हणजे कोणत्या तरी पृष्ठभागावर होणारी हालचाल दर्शवते. उंच पृष्ठभागावर उडी मारताना 'upon' वापरले जाते." },
  },
  {
    key: "aissee6-gem1-la-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "language",
    difficulty: "MEDIUM",
    questionJson: { en: "Select the correct meaning of the underlined idiom: 'His unexpected visit was a <u>bolt from the blue</u>.'", hi: "रेखांकित मुहावरे का सही अर्थ चुनें: 'His unexpected visit was a <u>bolt from the blue</u>.'", mr: "अधोरेखित वाक्प्रचाराचा (idiom) योग्य अर्थ निवडा: 'His unexpected visit was a <u>bolt from the blue</u>.'" },
    optionsJson: [
      { en: "A sudden and shocking event", hi: "अचानक और स्तब्ध करने वाली घटना", mr: "अचानक आणि धक्कादायक घटना" },
      { en: "A blue colored flash", hi: "नीली चमक", mr: "निळ्या रंगाची चमक" },
      { en: "A planned celebration", hi: "नियोजित उत्सव", mr: "नियोजित उत्सव" },
      { en: "A pleasant surprise", hi: "सुखद आश्चर्य", mr: "आनंददायक आश्चर्य" }
    ],
    correctAnswer: 0,
    explanation: { en: "'A bolt from the blue' means a completely unexpected and surprising or shocking event.", hi: "'A bolt from the blue' मुहावरे का अर्थ पूरी तरह अप्रत्याशित या अचानक होने वाली घटना है।", mr: "'A bolt from the blue' या वाक्प्रचाराचा अर्थ पूर्णपणे अनपेक्षित आणि आश्चर्यकारक किंवा धक्कादायक घटना असा होतो." },
  },
  {
    key: "aissee6-gem1-gk-01",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "EASY",
    questionJson: { en: "In which city is the National Defence Academy (NDA) situated?", hi: "राष्ट्रीय रक्षा अकादमी (NDA) किस शहर में स्थित है?", mr: "राष्ट्रीय संरक्षण प्रबोधिनी (NDA) कोणत्या शहरात आहे?" },
    optionsJson: [
      { en: "Dehradun", hi: "देहरादून", mr: "डेहराडून" },
      { en: "Khadakwasla, Pune", hi: "खड़गवासला, पुणे", mr: "खडकवासला, पुणे" },
      { en: "New Delhi", hi: "नई दिल्ली", mr: "नवी दिल्ली" },
      { en: "Wellington", hi: "वेलिंगटन", mr: "वेलिंग्टन" }
    ],
    correctAnswer: 1,
    explanation: { en: "The National Defence Academy (NDA) is the joint defence service training institute located at Khadakwasla near Pune, Maharashtra.", hi: "राष्ट्रीय रक्षा अकादमी (NDA) महाराष्ट्र में पुणे के पास खड़गवासला में स्थित संयुक्त रक्षा सेवा प्रशिक्षण संस्थान है।", mr: "राष्ट्रीय संरक्षण प्रबोधिनी (NDA) ही महाराष्ट्रातील पुण्याजवळ खडकवासला येथे असलेली संयुक्त संरक्षण सेवा प्रशिक्षण संस्था आहे." },
  },
  {
    key: "aissee6-gem1-gk-02",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "MEDIUM",
    questionJson: { en: "Deficiency of which vitamin causes the disease known as 'Scurvy'?", hi: "किस विटामिन की कमी से 'स्कर्वी' (Scurvy) नामक बीमारी होती है?", mr: "कोणत्या व्हिटॅमिनच्या कमतरतेमुळे 'स्कर्व्ही' (Scurvy) हा रोग होतो?" },
    optionsJson: [
      { en: "Vitamin A", hi: "विटामिन A", mr: "व्हिटॅमिन A" },
      { en: "Vitamin B1", hi: "विटामिन B1", mr: "व्हिटॅमिन B1" },
      { en: "Vitamin C", hi: "विटामिन C", mr: "व्हिटॅमिन C" },
      { en: "Vitamin D", hi: "विटामिन D", mr: "व्हिटॅमिन D" }
    ],
    correctAnswer: 2,
    explanation: { en: "Scurvy is caused by a lack of Vitamin C (ascorbic acid) in the diet, leading to bleeding gums and skin spots.", hi: "स्कर्वी रोग भोजन में विटामिन C (एसकोर्बिक एसिड) की कमी के कारण होता है, जिससे मसूड़ों से खून बहने लगता है।", mr: "आहारात व्हिटॅमिन C (एस्कॉर्बिक ऍसिड) च्या कमतरतेमुळे स्कर्व्ही हा रोग होतो, ज्यामुळे हिरड्यांमधून रक्त येणे आणि त्वचेवर डाग येणे असे परिणाम दिसतात." },
  },
  {
    key: "aissee6-gem1-gk-03",
    examType: "AISSEE",
    classLevel: 6,
    year: 2026,
    sectionKey: "general_knowledge",
    difficulty: "HARD",
    questionJson: { en: "Which famous UNESCO World Heritage Monument in Delhi was built by Sultan Qutb-ud-din Aibak starting in 1199 AD?", hi: "दिल्ली में स्थित किस प्रसिद्ध यूनेस्को विश्व धरोहर स्मारक का निर्माण 1199 ई. में सुल्तान कुतुबुद्दीन ऐबक द्वारा शुरू करवाया गया था?", mr: "दिल्लीमधील कोणत्या प्रसिद्ध युनेस्को जागतिक वारसा स्मारकाचे बांधकाम सुलतान कुतुबुद्दीन ऐबकने इ.स. 1199 मध्ये सुरू केले?" },
    optionsJson: [
      { en: "Red Fort", hi: "लाल किला", mr: "लाल किल्ला" },
      { en: "Humayun's Tomb", hi: "हुमायूँ का मक़बरा", mr: "हुमायूनची कबर" },
      { en: "Qutub Minar", hi: "कुतुब मीनार", mr: "कुतुब मिनार" },
      { en: "Jama Masjid", hi: "जामा मस्जिद", mr: "जामा मशीद" }
    ],
    correctAnswer: 2,
    explanation: { en: "Qutub Minar was initiated by Qutb-ud-din Aibak and later completed by his successor Iltutmish.", hi: "कुतुब मीनार का निर्माण कुतुबुद्दीन ऐबक द्वारा शुरू किया गया था और बाद में उसके उत्तराधिकारी इल्तुतमिश ने इसे पूरा करवाया।", mr: "कुतुब मिनारचे बांधकाम कुतुबुद्दीन ऐबकने सुरू केले आणि नंतर त्याचा वारसदार इल्तुतमिशने ते पूर्ण केले." },
  }
];

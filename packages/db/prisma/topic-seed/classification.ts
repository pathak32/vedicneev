import { assertDistinctOptions, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * The 40-question Classification ("odd one out") pool (Mental Ability →
 * "classification" topic): 10 Easy / 15 Moderate / 15 Hard. Unlike
 * Number Series / Speed Calculation / Pattern Completion, classification
 * items are categorical rather than arithmetic — correctness can't be
 * verified by computation, so every item here is hand-authored with a
 * single unambiguous category rule. Each wrong option's distractorAnalysis
 * explains the specific surface trait that could tempt a student to pick a
 * genuine category member instead of the true odd one out.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

interface Item {
  key: string;
  members: [LangText, LangText, LangText]; // the 3 that share the category
  oddOne: LangText; // the correct answer — does not belong
  category: LangText; // what the 3 members have in common, for the explanation
  memberTraps: [LangText, LangText, LangText]; // why each member could tempt a wrong pick, same order as `members`
}

function buildItem(item: Item, difficulty: "EASY" | "MEDIUM" | "HARD"): GeneratedQuestion {
  const rawOptions = [item.oddOne, ...item.members];
  // Deterministic placement so the odd one isn't always first — rotates by the key's char-code sum.
  const shift = item.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
  const rotated = [...rawOptions.slice(shift), ...rawOptions.slice(0, shift)];
  const options: OptionSeed[] = OPTION_IDS.map((id, i) => ({ id, text: rotated[i]! }));
  assertDistinctOptions(item.key, options);
  const correctOption = options.find((o) => o.text.en === item.oddOne.en)!.id;
  const distractorAnalysis: Record<string, LangText> = {};
  item.members.forEach((member, i) => {
    const id = options.find((o) => o.text.en === member.en)!.id;
    distractorAnalysis[id] = item.memberTraps[i]!;
  });
  return {
    key: item.key,
    difficulty,
    content: {
      en: `Find the odd one out: ${rawOptions.map((o) => o.en).join(", ")}`,
      hi: `असंगत को चुनें: ${rawOptions.map((o) => o.hi ?? o.en).join(", ")}`,
    },
    options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
    correctOption,
    explanation: {
      en: `${item.members.map((m) => m.en).join(", ")} are all ${item.category.en}; ${item.oddOne.en} is not.`,
      hi: `${item.members.map((m) => m.hi ?? m.en).join(", ")} सभी ${item.category.hi ?? item.category.en} हैं; ${item.oddOne.hi ?? item.oddOne.en} नहीं है।`,
    },
    distractorAnalysis,
  };
}

// ── EASY (×10): broad, well-known categories ─────────────────────────────
const easyItems: Item[] = [
  {
    key: "bank-ma-classify-easy-01",
    members: [{ en: "Apple", hi: "सेब" }, { en: "Mango", hi: "आम" }, { en: "Banana", hi: "केला" }],
    oddOne: { en: "Carrot", hi: "गाजर" },
    category: { en: "fruits", hi: "फल" },
    memberTraps: [
      { en: "Also a common everyday food, but it's a fruit like the correct group, not the odd one.", hi: "यह भी एक सामान्य भोजन है, लेकिन यह भी एक फल है, असंगत नहीं।" },
      { en: "A tropical fruit, correctly grouped with the others — not the answer.", hi: "एक उष्णकटिबंधीय फल, सही समूह में शामिल — उत्तर नहीं।" },
      { en: "A common fruit like the rest of the group — not the odd one.", hi: "समूह के बाकी हिस्सों की तरह एक सामान्य फल — असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-02",
    members: [{ en: "Triangle", hi: "त्रिभुज" }, { en: "Square", hi: "वर्ग" }, { en: "Circle", hi: "वृत्त" }],
    oddOne: { en: "Sphere", hi: "गोला" },
    category: { en: "flat (2D) shapes", hi: "समतल (2D) आकृतियाँ" },
    memberTraps: [
      { en: "A flat shape with straight sides — correctly a 2D shape, not the odd one.", hi: "सीधी भुजाओं वाली एक समतल आकृति — सही रूप से 2D, असंगत नहीं।" },
      { en: "A flat shape with four equal sides — correctly a 2D shape.", hi: "चार बराबर भुजाओं वाली समतल आकृति — सही रूप से 2D।" },
      { en: "A flat, round shape — correctly a 2D shape, easy to mistake for the 3D sphere by name alone.", hi: "एक समतल, गोल आकृति — सही रूप से 2D, केवल नाम से गोले जैसा भ्रम हो सकता है।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-03",
    members: [{ en: "Monday", hi: "सोमवार" }, { en: "Wednesday", hi: "बुधवार" }, { en: "Friday", hi: "शुक्रवार" }],
    oddOne: { en: "January", hi: "जनवरी" },
    category: { en: "days of the week", hi: "सप्ताह के दिन" },
    memberTraps: [
      { en: "A day of the week, correctly grouped — not the odd one.", hi: "सप्ताह का एक दिन, सही समूह में — असंगत नहीं।" },
      { en: "A day of the week, correctly grouped — not the odd one.", hi: "सप्ताह का एक दिन, सही समूह में — असंगत नहीं।" },
      { en: "A day of the week, correctly grouped — not the odd one.", hi: "सप्ताह का एक दिन, सही समूह में — असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-04",
    members: [{ en: "2", hi: "2" }, { en: "4", hi: "4" }, { en: "8", hi: "8" }],
    oddOne: { en: "9", hi: "9" },
    category: { en: "even numbers", hi: "सम संख्याएँ" },
    memberTraps: [
      { en: "An even number — correctly grouped, not the odd one.", hi: "एक सम संख्या — सही समूह में, असंगत नहीं।" },
      { en: "An even number — correctly grouped, not the odd one.", hi: "एक सम संख्या — सही समूह में, असंगत नहीं।" },
      { en: "An even number — correctly grouped, not the odd one.", hi: "एक सम संख्या — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-05",
    members: [{ en: "Cow", hi: "गाय" }, { en: "Horse", hi: "घोड़ा" }, { en: "Goat", hi: "बकरी" }],
    oddOne: { en: "Sparrow", hi: "गौरैया" },
    category: { en: "land mammals", hi: "थलचर स्तनधारी" },
    memberTraps: [
      { en: "A common farm animal, correctly a land mammal — not the odd one.", hi: "एक सामान्य पालतू पशु, सही रूप से थलचर स्तनधारी — असंगत नहीं।" },
      { en: "A common farm animal, correctly a land mammal — not the odd one.", hi: "एक सामान्य पालतू पशु, सही रूप से थलचर स्तनधारी — असंगत नहीं।" },
      { en: "A common farm animal, correctly a land mammal — not the odd one.", hi: "एक सामान्य पालतू पशु, सही रूप से थलचर स्तनधारी — असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-06",
    members: [{ en: "Guitar", hi: "गिटार" }, { en: "Violin", hi: "वायलिन" }, { en: "Flute", hi: "बांसुरी" }],
    oddOne: { en: "Cricket bat", hi: "क्रिकेट बल्ला" },
    category: { en: "musical instruments", hi: "संगीत वाद्ययंत्र" },
    memberTraps: [
      { en: "A string instrument, correctly a musical instrument — not the odd one.", hi: "एक तार वाद्ययंत्र, सही रूप से संगीत वाद्ययंत्र — असंगत नहीं।" },
      { en: "A string instrument, correctly a musical instrument — not the odd one.", hi: "एक तार वाद्ययंत्र, सही रूप से संगीत वाद्ययंत्र — असंगत नहीं।" },
      { en: "A wind instrument, correctly a musical instrument — not the odd one.", hi: "एक वायु वाद्ययंत्र, सही रूप से संगीत वाद्ययंत्र — असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-07",
    members: [{ en: "India", hi: "भारत" }, { en: "Japan", hi: "जापान" }, { en: "Brazil", hi: "ब्राज़ील" }],
    oddOne: { en: "Asia", hi: "एशिया" },
    category: { en: "countries", hi: "देश" },
    memberTraps: [
      { en: "A country, correctly grouped — not the odd one (Asia is the continent it belongs to, not another country).", hi: "एक देश, सही समूह में — असंगत नहीं (एशिया वह महाद्वीप है जिससे यह संबंधित है, कोई अन्य देश नहीं)।" },
      { en: "A country, correctly grouped — not the odd one.", hi: "एक देश, सही समूह में — असंगत नहीं।" },
      { en: "A country, correctly grouped — not the odd one.", hi: "एक देश, सही समूह में — असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-08",
    members: [{ en: "Eye", hi: "आँख" }, { en: "Ear", hi: "कान" }, { en: "Nose", hi: "नाक" }],
    oddOne: { en: "Heart", hi: "हृदय" },
    category: { en: "sense organs", hi: "ज्ञानेंद्रियाँ" },
    memberTraps: [
      { en: "A sense organ used for seeing — correctly grouped, not the odd one.", hi: "देखने के लिए उपयोग की जाने वाली ज्ञानेंद्रिय — सही समूह में, असंगत नहीं।" },
      { en: "A sense organ used for hearing — correctly grouped, not the odd one.", hi: "सुनने के लिए उपयोग की जाने वाली ज्ञानेंद्रिय — सही समूह में, असंगत नहीं।" },
      { en: "A sense organ used for smelling — correctly grouped, not the odd one.", hi: "सूंघने के लिए उपयोग की जाने वाली ज्ञानेंद्रिय — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-09",
    members: [{ en: "Car", hi: "कार" }, { en: "Bus", hi: "बस" }, { en: "Train", hi: "रेलगाड़ी" }],
    oddOne: { en: "Aeroplane", hi: "हवाई जहाज़" },
    category: { en: "land vehicles", hi: "थल वाहन" },
    memberTraps: [
      { en: "Travels on roads — correctly a land vehicle, not the odd one.", hi: "सड़क पर चलता है — सही रूप से थल वाहन, असंगत नहीं।" },
      { en: "Travels on roads — correctly a land vehicle, not the odd one.", hi: "सड़क पर चलता है — सही रूप से थल वाहन, असंगत नहीं।" },
      { en: "Travels on rails — correctly a land vehicle, not the odd one.", hi: "पटरियों पर चलता है — सही रूप से थल वाहन, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-easy-10",
    members: [{ en: "3", hi: "3" }, { en: "5", hi: "5" }, { en: "7", hi: "7" }],
    oddOne: { en: "9", hi: "9" },
    category: { en: "prime numbers", hi: "अभाज्य संख्याएँ" },
    memberTraps: [
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
    ],
  },
];

// ── MEDIUM (×15): requires more specific category knowledge ─────────────
const mediumItems: Item[] = [
  {
    key: "bank-ma-classify-medium-01",
    members: [{ en: "12", hi: "12" }, { en: "18", hi: "18" }, { en: "24", hi: "24" }],
    oddOne: { en: "20", hi: "20" },
    category: { en: "multiples of 6", hi: "6 के गुणज" },
    memberTraps: [
      { en: "A multiple of 6 — correctly grouped, not the odd one.", hi: "6 का एक गुणज — सही समूह में, असंगत नहीं।" },
      { en: "A multiple of 6 — correctly grouped, not the odd one.", hi: "6 का एक गुणज — सही समूह में, असंगत नहीं।" },
      { en: "A multiple of 6 — correctly grouped, not the odd one.", hi: "6 का एक गुणज — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-02",
    members: [{ en: "Square", hi: "वर्ग" }, { en: "Equilateral triangle", hi: "समबाहु त्रिभुज" }, { en: "Regular hexagon", hi: "सम षट्भुज" }],
    oddOne: { en: "Rectangle", hi: "आयत" },
    category: { en: "regular polygons (all sides and all angles equal)", hi: "सम बहुभुज (सभी भुजाएँ और सभी कोण बराबर)" },
    memberTraps: [
      { en: "All four sides and angles are equal — correctly a regular polygon.", hi: "सभी चार भुजाएँ और कोण बराबर हैं — सही रूप से एक सम बहुभुज।" },
      { en: "All three sides and angles are equal — correctly a regular polygon.", hi: "सभी तीन भुजाएँ और कोण बराबर हैं — सही रूप से एक सम बहुभुज।" },
      { en: "All six sides and angles are equal — correctly a regular polygon.", hi: "सभी छह भुजाएँ और कोण बराबर हैं — सही रूप से एक सम बहुभुज।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-03",
    members: [{ en: "Mercury", hi: "बुध" }, { en: "Venus", hi: "शुक्र" }, { en: "Mars", hi: "मंगल" }],
    oddOne: { en: "Pluto", hi: "प्लूटो" },
    category: { en: "planets of the solar system", hi: "सौरमंडल के ग्रह" },
    memberTraps: [
      { en: "One of the 8 recognized planets — correctly grouped, not the odd one.", hi: "8 मान्यता प्राप्त ग्रहों में से एक — सही समूह में, असंगत नहीं।" },
      { en: "One of the 8 recognized planets — correctly grouped, not the odd one.", hi: "8 मान्यता प्राप्त ग्रहों में से एक — सही समूह में, असंगत नहीं।" },
      { en: "One of the 8 recognized planets — correctly grouped, not the odd one.", hi: "8 मान्यता प्राप्त ग्रहों में से एक — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-04",
    members: [{ en: "Run", hi: "Run" }, { en: "Jump", hi: "Jump" }, { en: "Write", hi: "Write" }],
    oddOne: { en: "Table", hi: "Table" },
    category: { en: "verbs (action words)", hi: "क्रिया (क्रिया-शब्द)" },
    memberTraps: [
      { en: "An action word — correctly a verb, not the odd one.", hi: "एक क्रिया-शब्द — सही रूप से क्रिया, असंगत नहीं।" },
      { en: "An action word — correctly a verb, not the odd one.", hi: "एक क्रिया-शब्द — सही रूप से क्रिया, असंगत नहीं।" },
      { en: "An action word — correctly a verb, not the odd one.", hi: "एक क्रिया-शब्द — सही रूप से क्रिया, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-05",
    members: [{ en: "Ice", hi: "बर्फ़" }, { en: "Iron", hi: "लोहा" }, { en: "Wood", hi: "लकड़ी" }],
    oddOne: { en: "Oxygen", hi: "ऑक्सीजन" },
    category: { en: "solids", hi: "ठोस" },
    memberTraps: [
      { en: "A solid at ordinary room conditions — correctly grouped, not the odd one.", hi: "सामान्य कमरे की स्थितियों में एक ठोस — सही समूह में, असंगत नहीं।" },
      { en: "A solid at ordinary room conditions — correctly grouped, not the odd one.", hi: "सामान्य कमरे की स्थितियों में एक ठोस — सही समूह में, असंगत नहीं।" },
      { en: "A solid at ordinary room conditions — correctly grouped, not the odd one.", hi: "सामान्य कमरे की स्थितियों में एक ठोस — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-06",
    members: [{ en: "Cow", hi: "गाय" }, { en: "Deer", hi: "हिरण" }, { en: "Rabbit", hi: "खरगोश" }],
    oddOne: { en: "Lion", hi: "शेर" },
    category: { en: "herbivores", hi: "शाकाहारी" },
    memberTraps: [
      { en: "Eats only plants — correctly a herbivore, not the odd one.", hi: "केवल पौधे खाता है — सही रूप से शाकाहारी, असंगत नहीं।" },
      { en: "Eats only plants — correctly a herbivore, not the odd one.", hi: "केवल पौधे खाता है — सही रूप से शाकाहारी, असंगत नहीं।" },
      { en: "Eats only plants — correctly a herbivore, not the odd one.", hi: "केवल पौधे खाता है — सही रूप से शाकाहारी, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-07",
    members: [{ en: "Solar energy", hi: "सौर ऊर्जा" }, { en: "Wind energy", hi: "पवन ऊर्जा" }, { en: "Hydropower", hi: "जल विद्युत" }],
    oddOne: { en: "Coal", hi: "कोयला" },
    category: { en: "renewable sources of energy", hi: "ऊर्जा के नवीकरणीय स्रोत" },
    memberTraps: [
      { en: "Naturally replenished and won't run out — correctly renewable, not the odd one.", hi: "प्राकृतिक रूप से पुनःपूर्ति होती है और समाप्त नहीं होती — सही रूप से नवीकरणीय, असंगत नहीं।" },
      { en: "Naturally replenished and won't run out — correctly renewable, not the odd one.", hi: "प्राकृतिक रूप से पुनःपूर्ति होती है और समाप्त नहीं होती — सही रूप से नवीकरणीय, असंगत नहीं।" },
      { en: "Naturally replenished (the water cycle) — correctly renewable, not the odd one.", hi: "प्राकृतिक रूप से पुनःपूर्ति होती है (जल चक्र) — सही रूप से नवीकरणीय, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-08",
    members: [{ en: "Asia", hi: "एशिया" }, { en: "Africa", hi: "अफ्रीका" }, { en: "Europe", hi: "यूरोप" }],
    oddOne: { en: "Pacific", hi: "प्रशांत" },
    category: { en: "continents", hi: "महाद्वीप" },
    memberTraps: [
      { en: "A continent — correctly grouped, not the odd one (the Pacific is an ocean, not a continent).", hi: "एक महाद्वीप — सही समूह में, असंगत नहीं (प्रशांत एक महासागर है, महाद्वीप नहीं)।" },
      { en: "A continent — correctly grouped, not the odd one.", hi: "एक महाद्वीप — सही समूह में, असंगत नहीं।" },
      { en: "A continent — correctly grouped, not the odd one.", hi: "एक महाद्वीप — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-09",
    members: [{ en: "Delhi", hi: "दिल्ली" }, { en: "Puducherry", hi: "पुदुचेरी" }, { en: "Chandigarh", hi: "चंडीगढ़" }],
    oddOne: { en: "Maharashtra", hi: "महाराष्ट्र" },
    category: { en: "Union Territories of India", hi: "भारत के केंद्र शासित प्रदेश" },
    memberTraps: [
      { en: "A Union Territory — correctly grouped, not the odd one (Maharashtra is a full state).", hi: "एक केंद्र शासित प्रदेश — सही समूह में, असंगत नहीं (महाराष्ट्र एक पूर्ण राज्य है)।" },
      { en: "A Union Territory — correctly grouped, not the odd one.", hi: "एक केंद्र शासित प्रदेश — सही समूह में, असंगत नहीं।" },
      { en: "A Union Territory — correctly grouped, not the odd one.", hi: "एक केंद्र शासित प्रदेश — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-10",
    members: [{ en: "Freedom struggle era", hi: "स्वतंत्रता संग्राम काल" }, { en: "Mughal era", hi: "मुग़ल काल" }, { en: "British colonial era", hi: "ब्रिटिश औपनिवेशिक काल" }],
    oddOne: { en: "Vedic era", hi: "वैदिक काल" },
    category: { en: "more recent periods of Indian history (last few centuries)", hi: "भारतीय इतिहास के अपेक्षाकृत हाल के काल (पिछली कुछ शताब्दियाँ)" },
    memberTraps: [
      { en: "A relatively recent historical period — correctly grouped, not the odd one.", hi: "एक अपेक्षाकृत हाल का ऐतिहासिक काल — सही समूह में, असंगत नहीं।" },
      { en: "A relatively recent historical period — correctly grouped, not the odd one.", hi: "एक अपेक्षाकृत हाल का ऐतिहासिक काल — सही समूह में, असंगत नहीं।" },
      { en: "A relatively recent historical period — correctly grouped, not the odd one.", hi: "एक अपेक्षाकृत हाल का ऐतिहासिक काल — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-11",
    members: [{ en: "Water", hi: "जल" }, { en: "Carbon dioxide", hi: "कार्बन डाइऑक्साइड" }, { en: "Salt (sodium chloride)", hi: "नमक (सोडियम क्लोराइड)" }],
    oddOne: { en: "Oxygen", hi: "ऑक्सीजन" },
    category: { en: "compounds (made of two or more elements combined)", hi: "यौगिक (दो या अधिक तत्वों के संयोजन से बने)" },
    memberTraps: [
      { en: "Made of two elements (hydrogen and oxygen) combined — correctly a compound, not the odd one.", hi: "दो तत्वों (हाइड्रोजन और ऑक्सीजन) के संयोजन से बना — सही रूप से एक यौगिक, असंगत नहीं।" },
      { en: "Made of two elements (carbon and oxygen) combined — correctly a compound, not the odd one.", hi: "दो तत्वों (कार्बन और ऑक्सीजन) के संयोजन से बना — सही रूप से एक यौगिक, असंगत नहीं।" },
      { en: "Made of two elements (sodium and chlorine) combined — correctly a compound, not the odd one.", hi: "दो तत्वों (सोडियम और क्लोरीन) के संयोजन से बना — सही रूप से एक यौगिक, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-12",
    members: [{ en: "Granite", hi: "ग्रेनाइट" }, { en: "Basalt", hi: "बेसाल्ट" }, { en: "Pumice", hi: "झांवा" }],
    oddOne: { en: "Sandstone", hi: "बलुआ पत्थर" },
    category: { en: "igneous rocks (formed from cooled magma/lava)", hi: "आग्नेय चट्टानें (ठंडे मैग्मा/लावा से बनी)" },
    memberTraps: [
      { en: "Forms from cooled molten rock — correctly igneous, not the odd one.", hi: "ठंडी पिघली चट्टान से बनती है — सही रूप से आग्नेय, असंगत नहीं।" },
      { en: "Forms from cooled molten rock — correctly igneous, not the odd one.", hi: "ठंडी पिघली चट्टान से बनती है — सही रूप से आग्नेय, असंगत नहीं।" },
      { en: "Forms from cooled molten rock — correctly igneous, not the odd one.", hi: "ठंडी पिघली चट्टान से बनती है — सही रूप से आग्नेय, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-13",
    members: [{ en: "11", hi: "11" }, { en: "13", hi: "13" }, { en: "17", hi: "17" }],
    oddOne: { en: "21", hi: "21" },
    category: { en: "prime numbers", hi: "अभाज्य संख्याएँ" },
    memberTraps: [
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-14",
    members: [{ en: "Mango tree", hi: "आम का पेड़" }, { en: "Neem tree", hi: "नीम का पेड़" }, { en: "Banyan tree", hi: "बरगद का पेड़" }],
    oddOne: { en: "Pine tree", hi: "चीड़ का पेड़" },
    category: { en: "broadleaf trees found in warm Indian climates", hi: "गर्म भारतीय जलवायु में पाए जाने वाले चौड़ी पत्ती वाले पेड़" },
    memberTraps: [
      { en: "A broadleaf tree common in warm regions — correctly grouped, not the odd one.", hi: "गर्म क्षेत्रों में आम एक चौड़ी पत्ती वाला पेड़ — सही समूह में, असंगत नहीं।" },
      { en: "A broadleaf tree common in warm regions — correctly grouped, not the odd one.", hi: "गर्म क्षेत्रों में आम एक चौड़ी पत्ती वाला पेड़ — सही समूह में, असंगत नहीं।" },
      { en: "A broadleaf tree common in warm regions — correctly grouped, not the odd one.", hi: "गर्म क्षेत्रों में आम एक चौड़ी पत्ती वाला पेड़ — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-medium-15",
    members: [{ en: "Lemon juice", hi: "नींबू का रस" }, { en: "Vinegar", hi: "सिरका" }, { en: "Tamarind", hi: "इमली" }],
    oddOne: { en: "Baking soda", hi: "बेकिंग सोडा" },
    category: { en: "acidic substances", hi: "अम्लीय पदार्थ" },
    memberTraps: [
      { en: "A sour, acidic substance — correctly grouped, not the odd one.", hi: "एक खट्टा, अम्लीय पदार्थ — सही समूह में, असंगत नहीं।" },
      { en: "A sour, acidic substance — correctly grouped, not the odd one.", hi: "एक खट्टा, अम्लीय पदार्थ — सही समूह में, असंगत नहीं।" },
      { en: "A sour, acidic substance — correctly grouped, not the odd one.", hi: "एक खट्टा, अम्लीय पदार्थ — सही समूह में, असंगत नहीं।" },
    ],
  },
];

// ── HARD (×15): genuinely subtle, classic exam traps ─────────────────────
const hardItems: Item[] = [
  {
    key: "bank-ma-classify-hard-01",
    members: [{ en: "Sparrow", hi: "गौरैया" }, { en: "Eagle", hi: "चील" }, { en: "Parrot", hi: "तोता" }],
    oddOne: { en: "Bat", hi: "चमगादड़" },
    category: { en: "birds", hi: "पक्षी" },
    memberTraps: [
      { en: "Flies and has feathers — correctly a bird, not the odd one.", hi: "उड़ता है और पंख होते हैं — सही रूप से एक पक्षी, असंगत नहीं।" },
      { en: "Flies and has feathers — correctly a bird, not the odd one.", hi: "उड़ता है और पंख होते हैं — सही रूप से एक पक्षी, असंगत नहीं।" },
      { en: "Flies and has feathers — correctly a bird, not the odd one.", hi: "उड़ता है और पंख होते हैं — सही रूप से एक पक्षी, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-02",
    members: [{ en: "Shark", hi: "शार्क" }, { en: "Salmon", hi: "सैल्मन" }, { en: "Tuna", hi: "टूना" }],
    oddOne: { en: "Whale", hi: "व्हेल" },
    category: { en: "fish (breathe through gills)", hi: "मछलियाँ (गलफड़ों से साँस लेती हैं)" },
    memberTraps: [
      { en: "Lives in water and looks fish-like — correctly a fish (breathes via gills), not the odd one.", hi: "पानी में रहती है और मछली जैसी दिखती है — सही रूप से एक मछली (गलफड़ों से साँस लेती है), असंगत नहीं।" },
      { en: "Lives in water and looks fish-like — correctly a fish, not the odd one.", hi: "पानी में रहती है और मछली जैसी दिखती है — सही रूप से एक मछली, असंगत नहीं।" },
      { en: "Lives in water and looks fish-like — correctly a fish, not the odd one.", hi: "पानी में रहती है और मछली जैसी दिखती है — सही रूप से एक मछली, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-03",
    members: [{ en: "Ant", hi: "चींटी" }, { en: "Housefly", hi: "मक्खी" }, { en: "Butterfly", hi: "तितली" }],
    oddOne: { en: "Spider", hi: "मकड़ी" },
    category: { en: "insects (six legs)", hi: "कीट (छह पैर)" },
    memberTraps: [
      { en: "A small crawling creature with six legs — correctly an insect, not the odd one.", hi: "छह पैरों वाला एक छोटा रेंगने वाला प्राणी — सही रूप से एक कीट, असंगत नहीं।" },
      { en: "A small flying creature with six legs — correctly an insect, not the odd one.", hi: "छह पैरों वाला एक छोटा उड़ने वाला प्राणी — सही रूप से एक कीट, असंगत नहीं।" },
      { en: "A small flying creature with six legs — correctly an insect, not the odd one.", hi: "छह पैरों वाला एक छोटा उड़ने वाला प्राणी — सही रूप से एक कीट, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-04",
    members: [{ en: "Carrot (a root)", hi: "गाजर (एक जड़)" }, { en: "Potato (a stem tuber)", hi: "आलू (एक तना कंद)" }, { en: "Spinach (a leaf)", hi: "पालक (एक पत्ती)" }],
    oddOne: { en: "Tomato (botanically a fruit)", hi: "टमाटर (वानस्पतिक रूप से एक फल)" },
    category: { en: "vegetables — edible root, stem, or leaf parts of a plant", hi: "सब्ज़ियाँ — किसी पौधे की खाने योग्य जड़, तना या पत्ती" },
    memberTraps: [
      { en: "An edible root — botanically a vegetable part, not the odd one.", hi: "एक खाने योग्य जड़ — वानस्पतिक रूप से एक सब्ज़ी भाग, असंगत नहीं।" },
      { en: "An edible underground stem (tuber) — botanically a vegetable part, not the odd one.", hi: "एक खाने योग्य भूमिगत तना (कंद) — वानस्पतिक रूप से एक सब्ज़ी भाग, असंगत नहीं।" },
      { en: "An edible leaf — botanically a vegetable part, not the odd one. Tomato is commonly cooked as a savoury \"vegetable\" too, but botanically it develops from the flower and contains seeds, making it a fruit — the trap is culinary habit versus botanical classification.", hi: "एक खाने योग्य पत्ती — वानस्पतिक रूप से एक सब्ज़ी भाग, असंगत नहीं। टमाटर भी आमतौर पर नमकीन \"सब्ज़ी\" के रूप में पकाया जाता है, लेकिन वानस्पतिक रूप से यह फूल से विकसित होता है और इसमें बीज होते हैं, जो इसे एक फल बनाता है — यहाँ पाक आदत बनाम वानस्पतिक वर्गीकरण का भ्रम है।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-05",
    members: [{ en: "Almond", hi: "बादाम" }, { en: "Cashew", hi: "काजू" }, { en: "Walnut", hi: "अखरोट" }],
    oddOne: { en: "Peanut", hi: "मूँगफली" },
    category: { en: "tree nuts", hi: "वृक्ष मेवे" },
    memberTraps: [
      { en: "Grows on a tree and eaten as a nut — correctly a tree nut, not the odd one.", hi: "पेड़ पर उगता है और मेवे के रूप में खाया जाता है — सही रूप से एक वृक्ष मेवा, असंगत नहीं।" },
      { en: "Grows on a tree and eaten as a nut — correctly a tree nut, not the odd one.", hi: "पेड़ पर उगता है और मेवे के रूप में खाया जाता है — सही रूप से एक वृक्ष मेवा, असंगत नहीं।" },
      { en: "Grows on a tree and eaten as a nut — correctly a tree nut, not the odd one.", hi: "पेड़ पर उगता है और मेवे के रूप में खाया जाता है — सही रूप से एक वृक्ष मेवा, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-06",
    members: [{ en: "Sparrow", hi: "गौरैया" }, { en: "Crow", hi: "कौआ" }, { en: "Pigeon", hi: "कबूतर" }],
    oddOne: { en: "Penguin", hi: "पेंगुइन" },
    category: { en: "birds that can fly", hi: "उड़ने वाले पक्षी" },
    memberTraps: [
      { en: "A bird that can fly — correctly grouped, not the odd one (a penguin is a bird but cannot fly).", hi: "एक पक्षी जो उड़ सकता है — सही समूह में, असंगत नहीं (पेंगुइन एक पक्षी है लेकिन उड़ नहीं सकता)।" },
      { en: "A bird that can fly — correctly grouped, not the odd one.", hi: "एक पक्षी जो उड़ सकता है — सही समूह में, असंगत नहीं।" },
      { en: "A bird that can fly — correctly grouped, not the odd one.", hi: "एक पक्षी जो उड़ सकता है — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-07",
    members: [{ en: "Oxygen", hi: "ऑक्सीजन" }, { en: "Gold", hi: "सोना" }, { en: "Carbon", hi: "कार्बन" }],
    oddOne: { en: "Diamond", hi: "हीरा" },
    category: { en: "chemical elements", hi: "रासायनिक तत्व" },
    memberTraps: [
      { en: "A single, pure chemical element on the periodic table — correctly grouped, not the odd one.", hi: "आवर्त सारणी पर एक अकेला, शुद्ध रासायनिक तत्व — सही समूह में, असंगत नहीं।" },
      { en: "A single, pure chemical element on the periodic table — correctly grouped, not the odd one.", hi: "आवर्त सारणी पर एक अकेला, शुद्ध रासायनिक तत्व — सही समूह में, असंगत नहीं।" },
      { en: "A single, pure chemical element on the periodic table — correctly grouped, not the odd one (diamond is a crystal FORM of carbon, not a separate element).", hi: "आवर्त सारणी पर एक अकेला, शुद्ध रासायनिक तत्व — सही समूह में, असंगत नहीं (हीरा कार्बन का एक क्रिस्टल रूप है, अलग तत्व नहीं)।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-08",
    members: [{ en: "16", hi: "16" }, { en: "25", hi: "25" }, { en: "49", hi: "49" }],
    oddOne: { en: "50", hi: "50" },
    category: { en: "perfect squares", hi: "पूर्ण वर्ग" },
    memberTraps: [
      { en: "A perfect square (4²) — correctly grouped, not the odd one.", hi: "एक पूर्ण वर्ग (4²) — सही समूह में, असंगत नहीं।" },
      { en: "A perfect square (5²) — correctly grouped, not the odd one.", hi: "एक पूर्ण वर्ग (5²) — सही समूह में, असंगत नहीं।" },
      { en: "A perfect square (7²) — correctly grouped, not the odd one.", hi: "एक पूर्ण वर्ग (7²) — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-09",
    members: [{ en: "0.5", hi: "0.5" }, { en: "3/4", hi: "3/4" }, { en: "2", hi: "2" }],
    oddOne: { en: "π (pi)", hi: "π (पाई)" },
    category: { en: "rational numbers (expressible as a simple fraction)", hi: "परिमेय संख्याएँ (एक साधारण भिन्न के रूप में व्यक्त करने योग्य)" },
    memberTraps: [
      { en: "Can be written exactly as a fraction (1/2) — correctly rational, not the odd one.", hi: "इसे सटीक रूप से एक भिन्न (1/2) के रूप में लिखा जा सकता है — सही रूप से परिमेय, असंगत नहीं।" },
      { en: "Already written as an exact fraction — correctly rational, not the odd one.", hi: "पहले से ही एक सटीक भिन्न के रूप में लिखी गई — सही रूप से परिमेय, असंगत नहीं।" },
      { en: "A whole number, which is always rational — correctly grouped, not the odd one.", hi: "एक पूर्ण संख्या, जो हमेशा परिमेय होती है — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-10",
    members: [{ en: "Frog", hi: "मेंढक" }, { en: "Cat", hi: "बिल्ली" }, { en: "Snake", hi: "साँप" }],
    oddOne: { en: "Earthworm", hi: "केंचुआ" },
    category: { en: "vertebrates (have a backbone)", hi: "कशेरुकी (रीढ़ की हड्डी वाले)" },
    memberTraps: [
      { en: "Has an internal backbone — correctly a vertebrate, not the odd one.", hi: "आंतरिक रीढ़ की हड्डी होती है — सही रूप से एक कशेरुकी, असंगत नहीं।" },
      { en: "Has an internal backbone — correctly a vertebrate, not the odd one.", hi: "आंतरिक रीढ़ की हड्डी होती है — सही रूप से एक कशेरुकी, असंगत नहीं।" },
      { en: "Has an internal backbone — correctly a vertebrate, not the odd one (a snake's long body can look segmented like a worm's).", hi: "आंतरिक रीढ़ की हड्डी होती है — सही रूप से एक कशेरुकी, असंगत नहीं (साँप का लंबा शरीर केंचुए जैसा खंडित दिख सकता है)।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-11",
    members: [{ en: "Mango tree", hi: "आम का पेड़" }, { en: "Peepal tree", hi: "पीपल का पेड़" }, { en: "Neem tree", hi: "नीम का पेड़" }],
    oddOne: { en: "Cactus", hi: "कैक्टस" },
    category: { en: "trees", hi: "पेड़" },
    memberTraps: [
      { en: "A tall, woody plant with a single trunk — correctly a tree, not the odd one.", hi: "एक ही तने वाला लंबा, काष्ठीय पौधा — सही रूप से एक पेड़, असंगत नहीं।" },
      { en: "A tall, woody plant with a single trunk — correctly a tree, not the odd one.", hi: "एक ही तने वाला लंबा, काष्ठीय पौधा — सही रूप से एक पेड़, असंगत नहीं।" },
      { en: "A tall, woody plant with a single trunk — correctly a tree, not the odd one.", hi: "एक ही तने वाला लंबा, काष्ठीय पौधा — सही रूप से एक पेड़, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-12",
    members: [{ en: "Lemon", hi: "नींबू" }, { en: "Vinegar", hi: "सिरका" }, { en: "Battery acid", hi: "बैटरी अम्ल" }],
    oddOne: { en: "Soap solution", hi: "साबुन का घोल" },
    category: { en: "acids (pH below 7)", hi: "अम्ल (pH 7 से कम)" },
    memberTraps: [
      { en: "Sour and reacts like an acid — correctly acidic, not the odd one.", hi: "खट्टा है और अम्ल की तरह प्रतिक्रिया करता है — सही रूप से अम्लीय, असंगत नहीं।" },
      { en: "Sour and reacts like an acid — correctly acidic, not the odd one.", hi: "खट्टा है और अम्ल की तरह प्रतिक्रिया करता है — सही रूप से अम्लीय, असंगत नहीं।" },
      { en: "Strongly reactive like an acid — correctly acidic, not the odd one (soap solution is actually a base, pH above 7).", hi: "अम्ल की तरह अत्यधिक प्रतिक्रियाशील — सही रूप से अम्लीय, असंगत नहीं (साबुन का घोल वास्तव में एक क्षार है, pH 7 से अधिक)।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-13",
    members: [{ en: "17", hi: "17" }, { en: "19", hi: "19" }, { en: "23", hi: "23" }],
    oddOne: { en: "27", hi: "27" },
    category: { en: "prime numbers", hi: "अभाज्य संख्याएँ" },
    memberTraps: [
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
      { en: "A prime number — correctly grouped, not the odd one.", hi: "एक अभाज्य संख्या — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-14",
    members: [{ en: "Article 19", hi: "अनुच्छेद 19" }, { en: "Article 21", hi: "अनुच्छेद 21" }, { en: "Article 14", hi: "अनुच्छेद 14" }],
    oddOne: { en: "Article 370", hi: "अनुच्छेद 370" },
    category: { en: "articles guaranteeing Fundamental Rights in Part III of the Indian Constitution", hi: "भारतीय संविधान के भाग III में मौलिक अधिकारों की गारंटी देने वाले अनुच्छेद" },
    memberTraps: [
      { en: "A Fundamental Rights article (freedom of speech etc.) — correctly grouped, not the odd one.", hi: "एक मौलिक अधिकार अनुच्छेद (वाक् स्वतंत्रता आदि) — सही समूह में, असंगत नहीं।" },
      { en: "A Fundamental Rights article (protection of life and liberty) — correctly grouped, not the odd one.", hi: "एक मौलिक अधिकार अनुच्छेद (जीवन और स्वतंत्रता की सुरक्षा) — सही समूह में, असंगत नहीं।" },
      { en: "A Fundamental Rights article (equality before law) — correctly grouped, not the odd one.", hi: "एक मौलिक अधिकार अनुच्छेद (कानून के समक्ष समानता) — सही समूह में, असंगत नहीं।" },
    ],
  },
  {
    key: "bank-ma-classify-hard-15",
    members: [{ en: "Neem tree (sheds old leaves gradually, stays green)", hi: "नीम का पेड़ (धीरे-धीरे पुराने पत्ते गिराता है, हरा रहता है)" }, { en: "Mango tree", hi: "आम का पेड़" }, { en: "Pine tree", hi: "चीड़ का पेड़" }],
    oddOne: { en: "Peepal tree (sheds all its leaves together in a season)", hi: "पीपल का पेड़ (एक मौसम में सभी पत्ते एक साथ गिराता है)" },
    category: { en: "evergreen trees (never fully bare)", hi: "सदाबहार पेड़ (कभी पूरी तरह पत्ती-रहित नहीं होते)" },
    memberTraps: [
      { en: "Stays green through the year — correctly evergreen, not the odd one.", hi: "पूरे वर्ष हरा रहता है — सही रूप से सदाबहार, असंगत नहीं।" },
      { en: "Stays green through the year — correctly evergreen, not the odd one.", hi: "पूरे वर्ष हरा रहता है — सही रूप से सदाबहार, असंगत नहीं।" },
      { en: "Stays green through the year — correctly evergreen, not the odd one.", hi: "पूरे वर्ष हरा रहता है — सही रूप से सदाबहार, असंगत नहीं।" },
    ],
  },
];

export function buildClassificationQuestions(): GeneratedQuestion[] {
  const all = [
    ...easyItems.map((item) => buildItem(item, "EASY")),
    ...mediumItems.map((item) => buildItem(item, "MEDIUM")),
    ...hardItems.map((item) => buildItem(item, "HARD")),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(
      `Classification pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`
    );
  }
  return all;
}

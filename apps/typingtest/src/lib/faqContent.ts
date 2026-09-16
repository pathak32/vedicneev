export interface FaqItem {
  question: { en: string; hi: string };
  answer: { en: string; hi: string };
}

export interface FaqGroup {
  heading: { en: string; hi: string };
  items: FaqItem[];
}

/**
 * Full bilingual FAQ set for /faq + /hi/faq. The homepage's condensed
 * FaqSection reuses the first `HOMEPAGE_FAQ_COUNT` items flattened across
 * groups, so there's exactly one place these questions/answers are
 * authored — not a separate shorter copy that could drift out of sync.
 */
export const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: { en: "Getting Started", hi: "शुरुआत करना" },
    items: [
      {
        question: {
          en: "What is a Target Exam, and can I change it later?",
          hi: "लक्ष्य परीक्षा क्या है, और क्या मैं इसे बाद में बदल सकता हूँ?",
        },
        answer: {
          en: "Your Target Exam is the government exam you're actively preparing for (RRB NTPC, a High Court RO/ARO post, UPSSSC, UP Police, etc.) — it just personalizes your dashboard. You can switch it any time from the dashboard's \"Change\" button, for free, as often as your own exam calendar changes.",
          hi: "आपकी लक्ष्य परीक्षा वह सरकारी परीक्षा है जिसकी आप सक्रिय रूप से तैयारी कर रहे हैं (आरआरबी एनटीपीसी, हाई कोर्ट आरओ/एआरओ पद, यूपीएसएसएससी, यूपी पुलिस आदि) — यह केवल आपके डैशबोर्ड को निजीकृत करता है। आप इसे डैशबोर्ड के \"बदलें\" बटन से जब चाहें, मुफ़्त में बदल सकते हैं।",
        },
      },
      {
        question: {
          en: "How many free typing tests can I take per day?",
          hi: "मैं प्रतिदिन कितने मुफ़्त टंकण परीक्षण दे सकता हूँ?",
        },
        answer: {
          en: "Free accounts get 3 passages per calendar day, across both the catalog and Custom Text Practice combined. Upgrading to Pro removes this daily limit entirely.",
          hi: "मुफ़्त खातों को प्रति कैलेंडर दिन 3 गद्यांश मिलते हैं, कैटलॉग और कस्टम टेक्स्ट प्रैक्टिस दोनों को मिलाकर। प्रो में अपग्रेड करने से यह दैनिक सीमा पूरी तरह हट जाती है।",
        },
      },
    ],
  },
  {
    heading: { en: "Layouts & Languages", hi: "लेआउट और भाषाएँ" },
    items: [
      {
        question: {
          en: "Do you support Hindi Inscript and Remington (Gail) layouts?",
          hi: "क्या आप हिंदी इंस्क्रिप्ट और रेमिंगटन (गेल) लेआउट का समर्थन करते हैं?",
        },
        answer: {
          en: "Yes — every exam in the catalog is tagged with the exact layout it's graded on (English QWERTY, Hindi Inscript, or Hindi Remington/Gail). Switch your own system's input method to match before starting; the exam detail page reminds you which one to use.",
          hi: "हाँ — कैटलॉग की हर परीक्षा उसी सटीक लेआउट के साथ टैग की गई है जिस पर उसे मूल्यांकित किया जाता है (अंग्रेज़ी क्वर्टी, हिंदी इंस्क्रिप्ट, या हिंदी रेमिंगटन/गेल)। शुरू करने से पहले अपने सिस्टम की इनपुट पद्धति को उसी के अनुसार बदल लें; परीक्षा विवरण पृष्ठ आपको याद दिलाता है कि किसका उपयोग करना है।",
        },
      },
      {
        question: {
          en: "Is the backspace rule the same for every exam?",
          hi: "क्या हर परीक्षा के लिए बैकस्पेस नियम समान है?",
        },
        answer: {
          en: "No — some exam boards (like several High Court skill tests) disable backspace entirely to match the real test rules, while others allow it but count every use. Each exam's detail page states its exact backspace policy before you start.",
          hi: "नहीं — कुछ परीक्षा बोर्ड (जैसे कई हाई कोर्ट कौशल परीक्षण) वास्तविक परीक्षा नियमों से मेल खाने के लिए बैकस्पेस को पूरी तरह अक्षम कर देते हैं, जबकि अन्य इसकी अनुमति देते हैं लेकिन हर उपयोग को गिनते हैं। हर परीक्षा का विवरण पृष्ठ शुरू करने से पहले उसकी सटीक बैकस्पेस नीति बताता है।",
        },
      },
    ],
  },
  {
    heading: { en: "Scoring & Scorecards", hi: "स्कोरिंग और स्कोरकार्ड" },
    items: [
      {
        question: {
          en: "How is Net Speed calculated?",
          hi: "नेट गति की गणना कैसे की जाती है?",
        },
        answer: {
          en: "We use the standard government-exam formula: 5 key depressions = 1 word. Net Speed is Gross Speed minus a penalty for full mistakes (omissions/wrong words) and half mistakes (spacing/capitalization/punctuation only) — the same method real skill tests use.",
          hi: "हम मानक सरकारी परीक्षा सूत्र का उपयोग करते हैं: 5 कुंजी दबाव = 1 शब्द। नेट गति, ग्रॉस गति में से पूर्ण गलतियों (चूक/गलत शब्द) और आधी गलतियों (केवल स्पेसिंग/बड़े अक्षर/विराम चिह्न) के लिए दंड घटाकर निकाली जाती है — यही तरीका वास्तविक कौशल परीक्षणों में उपयोग होता है।",
        },
      },
      {
        question: {
          en: "Can I get my scorecard on WhatsApp?",
          hi: "क्या मुझे अपना स्कोरकार्ड व्हाट्सएप पर मिल सकता है?",
        },
        answer: {
          en: "Yes — every results page has a \"Send Scorecard to WhatsApp\" button that delivers your Gross/Net Speed, Accuracy, and Mistakes straight to your registered WhatsApp number.",
          hi: "हाँ — हर परिणाम पृष्ठ पर \"स्कोरकार्ड व्हाट्सएप पर भेजें\" बटन है जो आपकी ग्रॉस/नेट गति, सटीकता और गलतियाँ सीधे आपके पंजीकृत व्हाट्सएप नंबर पर भेज देता है।",
        },
      },
    ],
  },
];

export const HOMEPAGE_FAQ_COUNT = 5;

export function flattenFaqItems(groups: FaqGroup[]): FaqItem[] {
  return groups.flatMap((group) => group.items);
}

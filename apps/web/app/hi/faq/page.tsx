import type { Metadata } from "next";

const title = "सामान्य प्रश्न — JNVST, AISSEE और RMS मॉक टेस्ट";
const description =
  "अभिभावकों और छात्रों के लिए उत्तर: JNVST, AISSEE, और RMS परीक्षा पैटर्न, बहुभाषी मॉक टेस्ट समर्थन, और वेदिक नींव पर व्हाट्सएप साइन-इन कैसे काम करता है।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hi/faq", languages: { en: "/faq", hi: "/hi/faq" } },
  openGraph: { title, description, url: "/hi/faq" },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  heading: string;
  items: FaqItem[];
}

/** Hindi translation of app/faq/page.tsx's FAQ_GROUPS — same source figures/caveats, kept in sync manually. */
const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: "परीक्षा पैटर्न",
    items: [
      {
        question: "JNVST कक्षा 6 परीक्षा पैटर्न क्या है?",
        answer:
          "जवाहर नवोदय विद्यालय चयन परीक्षा (JNVST) कक्षा 6 के लिए 100 अंकों के 80 वस्तुनिष्ठ प्रश्न होते हैं, 120 मिनट के पेपर में बिना नकारात्मक अंकन के: मानसिक योग्यता (40 प्रश्न, 50 अंक, 60 मिनट), अंकगणित (20 प्रश्न, 25 अंक, 30 मिनट), और भाषा (20 प्रश्न, 25 अंक, 30 मिनट)। वेदिक नींव के पूर्ण-लंबाई मॉक टेस्ट इसी संरचना पर बनाए गए हैं। किसी भी अपडेट के लिए हमेशा नवोदय विद्यालय समिति की वर्तमान वर्ष की आधिकारिक अधिसूचना देखें।",
      },
      {
        question: "AISSEE (सैनिक स्कूल) परीक्षा पैटर्न क्या है?",
        answer:
          "आमतौर पर प्रकाशित अखिल भारतीय सैनिक स्कूल प्रवेश परीक्षा (AISSEE) कक्षा 6 पैटर्न 150 मिनट में 300 अंकों के 125 वस्तुनिष्ठ प्रश्न हैं, बिना नकारात्मक अंकन के: गणित (50 प्रश्न, 150 अंक, 60 मिनट), बुद्धि (25 प्रश्न, 50 अंक, 30 मिनट), भाषा (25 प्रश्न, 50 अंक, 30 मिनट), और सामान्य ज्ञान (25 प्रश्न, 50 अंक, 30 मिनट)। चूंकि संचालन निकाय पैटर्न को संशोधित कर सकते हैं, इसे वर्तमान वर्ष की आधिकारिक AISSEE अधिसूचना से सत्यापित करें।",
      },
      {
        question: "RMS (राष्ट्रीय मिलिट्री स्कूल) परीक्षा पैटर्न क्या है?",
        answer:
          "आमतौर पर प्रकाशित राष्ट्रीय मिलिट्री स्कूल (RMS) कक्षा 6 प्रवेश पैटर्न AISSEE की संरचना को प्रतिबिंबित करता है: 150 मिनट में 300 अंकों के 125 वस्तुनिष्ठ प्रश्न, बिना नकारात्मक अंकन के। AISSEE की तरह, इसे गारंटी के बजाय एक अध्ययन मार्गदर्शिका के रूप में लें, और प्रामाणिक विवरण के लिए वर्तमान वर्ष की आधिकारिक RMS अधिसूचना देखें।",
      },
      {
        question: "क्या इन मॉक टेस्ट में नकारात्मक अंकन का उपयोग किया जाता है?",
        answer: "नहीं — ऊपर दिए गए तीनों परीक्षा पैटर्न कक्षा 6 के लिए नकारात्मक अंकन का उपयोग नहीं करते, इसलिए उन पैटर्न पर बने वेदिक नींव के मॉक टेस्ट भी नहीं करते।",
      },
    ],
  },
  {
    heading: "बहुभाषी मॉक टेस्ट",
    items: [
      {
        question: "कौन सी भाषाएँ समर्थित हैं?",
        answer: "अंग्रेज़ी, हिंदी, मराठी, बंगाली, और तमिल। आप मॉक टेस्ट के दौरान किसी भी समय — परीक्षा हेडर के भाषा मेनू से — अपनी प्रगति, टाइमर, या उत्तर खोए बिना भाषा बदल सकते हैं।",
      },
      {
        question: "यदि कोई प्रश्न अभी तक मेरी चुनी हुई भाषा में अनुवादित नहीं हुआ है तो क्या होगा?",
        answer: "यह अंग्रेज़ी में दिखाया जाता है। हमारे बैंक के हर प्रश्न में अंग्रेज़ी संस्करण की गारंटी है; अन्य भाषाएँ धीरे-धीरे जोड़ी जाती हैं, इसलिए आपकी चुनी हुई भाषा में अभी तक न होने वाला प्रश्न टेस्ट को बाधित करने के बजाय अंग्रेज़ी में फ़ॉलबैक हो जाता है।",
      },
      {
        question: "क्या भाषा बदलने से मेरा स्कोर या टाइमर प्रभावित होता है?",
        answer: "नहीं। भाषा केवल एक प्रदर्शन सेटिंग है — आपके चुने गए उत्तर, प्रश्न स्थिति, और शेष समय भाषा बदलने से पूरी तरह अप्रभावित रहते हैं।",
      },
    ],
  },
  {
    heading: "व्हाट्सएप साइन-इन",
    items: [
      {
        question: "मैं व्हाट्सएप से साइन इन कैसे करूँ?",
        answer: "\"साइन इन\" पर टैप करें, अपना 10-अंकों का मोबाइल नंबर दर्ज करें, और हम उस नंबर पर व्हाट्सएप पर एक 6-अंकों का वन-टाइम कोड भेजेंगे। साइन इन पूरा करने के लिए साइट पर कोड दर्ज करें — किसी पासवर्ड की आवश्यकता नहीं।",
      },
      {
        question: "मुझे व्हाट्सएप कोड नहीं मिला। मुझे क्या करना चाहिए?",
        answer: "पहले पुष्टि करें कि आपने जो नंबर दर्ज किया वह व्हाट्सएप पर सक्रिय है। आप थोड़ी प्रतीक्षा के बाद \"OTP पुनः भेजें\" का उपयोग करके नया कोड माँग सकते हैं। यदि कोड फिर भी नहीं आ रहे हैं, तो दोबारा जाँचें कि आपने बिना देश कोड या अतिरिक्त अंकों के नंबर दर्ज किया है, फिर पुनः प्रयास करें।",
      },
      {
        question: "क्या मेरा व्हाट्सएप नंबर किसी और के साथ साझा किया जाता है?",
        answer: "नहीं। आपका नंबर केवल आपका साइन-इन कोड (और, यदि आप सहमति दें, निदान स्कोरकार्ड) Meta के व्हाट्सएप बिज़नेस प्लेटफ़ॉर्म के माध्यम से पहुँचाने के लिए उपयोग किया जाता है। पूरी जानकारी के लिए हमारी गोपनीयता नीति देखें।",
      },
      {
        question: "क्या एक व्हाट्सएप नंबर एक से अधिक बच्चे की प्रोफ़ाइल प्रबंधित कर सकता है?",
        answer: "हाँ — एक अभिभावक खाता कई छात्र प्रोफ़ाइल (भाई-बहन) जोड़ सकता है, प्रत्येक का अपना परीक्षा लक्ष्य, कक्षा, और भाषा वरीयता होती है, सभी एक ही अभिभावक फ़ोन नंबर के तहत साइन इन।",
      },
    ],
  },
  {
    heading: "योजनाएँ और भुगतान",
    items: [
      {
        question: "क्या वेदिक नींव को निःशुल्क आज़माने का कोई तरीका है?",
        answer: "हाँ — Free Explorer स्तर में एक पूर्ण-लंबाई मॉक टेस्ट और एक बुनियादी स्कोर सारांश निःशुल्क शामिल है, ताकि आप सदस्यता लेने से पहले मंच आज़मा सकें। प्रत्येक सशुल्क योजना में क्या शामिल है, इसके लिए मूल्य निर्धारण पृष्ठ देखें।",
      },
      {
        question: "मैं अपनी सदस्यता कैसे अपग्रेड करूँ या प्रबंधित करूँ?",
        answer: "मूल्य निर्धारण पृष्ठ या अपने अभिभावक कमांड सेंटर से, एक योजना चुनें और चेकआउट पूरा करें — भुगतान Razorpay के माध्यम से सुरक्षित रूप से संसाधित किए जाते हैं। आप किसी भी समय अभिभावक कमांड सेंटर से अपनी योजना देख या बदल सकते हैं।",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    }))
  ),
};

export default function FaqPageHindi() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-12 md:px-8">
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          अक्सर पूछे जाने वाले प्रश्न
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          परीक्षा पैटर्न, बहुभाषी मॉक टेस्ट, और साइन इन करने के बारे में अभिभावकों और छात्रों के सामान्य प्रश्न। अभी भी
          अटके हुए हैं? हमारी{" "}
          <a href="/hi/privacy" className="text-primary underline-offset-2 hover:underline">
            गोपनीयता नीति
          </a>{" "}
          या{" "}
          <a href="/hi/terms" className="text-primary underline-offset-2 hover:underline">
            सेवा की शर्तें
          </a>{" "}
          देखें।
        </p>
      </header>

      {FAQ_GROUPS.map((group) => (
        <section key={group.heading} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground md:text-xl">{group.heading}</h2>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {group.items.map((item) => (
              <details key={item.question} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground md:text-base">
                  {item.question}
                  <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        परीक्षा पैटर्न के आंकड़े इस लेखन के समय आमतौर पर प्रकाशित कक्षा 6 पैटर्न को दर्शाते हैं। संचालन निकाय हर
        वर्ष अपने परीक्षा पैटर्न को संशोधित कर सकते हैं — परीक्षा-दिवस के निर्णयों के लिए भरोसा करने से पहले हमेशा
        संबंधित प्राधिकरण (JNVST के लिए नवोदय विद्यालय समिति; AISSEE के लिए सैनिक स्कूल सोसाइटी; RMS के लिए सैन्य
        प्रशिक्षण महानिदेशालय) की वर्तमान आधिकारिक अधिसूचना से सत्यापित करें।
      </p>
    </div>
  );
}

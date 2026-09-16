import type { Metadata } from "next";

const title = "अस्वीकरण";
const description =
  "वेदिकनींव टाइपिंग टेस्ट एक स्वतंत्र अभ्यास मंच है, जो आरआरबी, किसी भी हाई कोर्ट, यूपीएसएसएससी, या किसी अन्य परीक्षा-संचालक प्राधिकरण से संबद्ध नहीं है।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hi/disclaimer", languages: { en: "/disclaimer", hi: "/hi/disclaimer" } },
  openGraph: { title, description, url: "/hi/disclaimer" },
};

export default function DisclaimerPageHindi() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          अस्वीकरण
        </h1>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <h2>स्वतंत्र अभ्यास मंच</h2>
        <p>
          वेदिकनींव टाइपिंग टेस्ट एक स्वतंत्र, निजी रूप से संचालित टंकण अभ्यास मंच है। हम रेलवे भर्ती बोर्ड (आरआरबी),
          इलाहाबाद उच्च न्यायालय, पटना उच्च न्यायालय, उत्तर प्रदेश अधीनस्थ सेवा चयन आयोग (यूपीएसएसएससी), उत्तर
          प्रदेश पुलिस भर्ती एवं पदोन्नति बोर्ड, या टंकण कौशल परीक्षा आयोजित करने वाले किसी अन्य सरकारी निकाय से
          संबद्ध, अनुमोदित, या आधिकारिक रूप से जुड़े नहीं हैं। इस साइट पर संदर्भित परीक्षा नाम केवल पहचान के
          उद्देश्यों के लिए हैं।
        </p>

        <h2>अभ्यास गद्यांश, आधिकारिक परीक्षा सामग्री नहीं</h2>
        <p>
          हमारे कैटलॉग में हर गद्यांश मूल अभ्यास सामग्री है जो हर परीक्षा की ज्ञात अवधि, बैकस्पेस नीति, और लेआउट
          आवश्यकताओं पर आधारित है — कोई लीक या आधिकारिक रूप से जारी परीक्षा गद्यांश नहीं। परीक्षा नियम (अवधि,
          बैकस्पेस नीति, आवश्यक लेआउट) संचालन प्राधिकरण द्वारा किसी भी समय संशोधित किए जा सकते हैं; परीक्षा-दिवस के
          निर्णय से पहले हमेशा वर्तमान आधिकारिक अधिसूचना से सत्यापित करें।
        </p>

        <h2>गति और सटीकता अभ्यास मीट्रिक हैं</h2>
        <p>
          ग्रॉस गति, नेट गति, सटीकता, और गलती गिनती मानक 5-कुंजी-दबाव-प्रति-शब्द सरकारी सूत्र का उपयोग करके हमारे
          अपने गद्यांशों के विरुद्ध गणना की जाती है। ये एक अभ्यास मानदंड हैं, आपकी वास्तविक परीक्षा पर आधिकारिक या
          गारंटीशुदा परिणाम नहीं।
        </p>

        <p className="text-sm text-muted-foreground">
          हमारी <a href="/hi/privacy">गोपनीयता नीति</a> और <a href="/hi/terms">नियम एवं शर्तें</a> भी देखें।
        </p>
      </div>
    </article>
  );
}

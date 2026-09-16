/**
 * Seeds the initial bilingual blog posts for typingtest.vedicneev.com —
 * same upsert-by-slug, re-runnable-on-its-own convention as
 * seed-typing.ts. Content is authored here rather than through an admin
 * CRUD (none exists for this model yet, matching TypingExam's own
 * seed-driven precedent) — see packages/db/prisma/schema.prisma's
 * TypingBlogPost comment for why this is a separate, typingtest-only model.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POSTS = [
  {
    slug: "rrb-ntpc-typing-test-guide",
    category: "RRB NTPC",
    title: {
      en: "RRB NTPC Typing Test: Pattern, Speed Targets & How to Practice",
      hi: "आरआरबी एनटीपीसी टंकण परीक्षा: पैटर्न, गति लक्ष्य और अभ्यास कैसे करें",
    },
    excerpt: {
      en: "Everything you need to know about the RRB NTPC typing skill test — required speed, backspace rules, and a practice plan that actually works.",
      hi: "आरआरबी एनटीपीसी टंकण कौशल परीक्षा के बारे में जो कुछ भी आपको जानना चाहिए — आवश्यक गति, बैकस्पेस नियम, और एक अभ्यास योजना जो वाकई काम करती है।",
    },
    content: {
      en: `The RRB NTPC (Railway Recruitment Board — Non-Technical Popular Categories) skill test is the final hurdle for several NTPC posts, and unlike the CBT stages, it's purely about your typing speed and accuracy — no negotiation, no guesswork.

## What the test actually measures

You'll be given a passage in English (or Hindi, depending on the post and your chosen medium) and a fixed duration, typically **10 minutes**. Your Net Speed — Gross Speed minus a penalty for mistakes — is what determines whether you clear the qualifying threshold, not just how fast you can move your fingers.

## Backspace policy

RRB NTPC's typing test generally **allows backspace but counts every use** — it doesn't disqualify a correction, but every backspace you press is logged. That's a real behavioral difference from a High Court skill test that disables backspace outright, so practicing under the *same* rule your actual exam uses matters more than raw speed drills.

## How to practice on VedicNeev

1. Go to the [RRB NTPC — English practice test](/exams/rrb-ntpc-english) and take a full 10-minute attempt under exam conditions.
2. Check your **Sentence X-Ray** on the results page — it colors every word green/red/yellow so you can see exactly which mistakes cost you Net Speed, not just a raw percentage.
3. Repeat daily. VedicNeev's Today's Passage rotates automatically, so you're not memorizing one paragraph — you're actually building the skill.

Aim to clear your target Net Speed comfortably with a few days of buffer before your actual exam date — a first-attempt-on-exam-day approach is the single most common reason candidates miss the cutoff by a few words per minute.`,
      hi: `आरआरबी एनटीपीसी (रेलवे भर्ती बोर्ड — गैर-तकनीकी लोकप्रिय श्रेणियाँ) कौशल परीक्षा कई एनटीपीसी पदों के लिए अंतिम बाधा है, और सीबीटी चरणों के विपरीत, यह पूरी तरह आपकी टंकण गति और सटीकता के बारे में है — कोई बातचीत नहीं, कोई अनुमान नहीं।

## परीक्षा वास्तव में क्या मापती है

आपको अंग्रेज़ी (या हिंदी, पद और आपके चुने गए माध्यम के आधार पर) में एक गद्यांश और एक निश्चित अवधि, आमतौर पर **10 मिनट**, दी जाएगी। आपकी नेट गति — गलतियों के लिए दंड घटाकर ग्रॉस गति — यह तय करती है कि आप योग्यता सीमा पार करते हैं या नहीं, न कि केवल आप अपनी उंगलियाँ कितनी तेज़ी से चला सकते हैं।

## बैकस्पेस नीति

आरआरबी एनटीपीसी की टंकण परीक्षा आमतौर पर **बैकस्पेस की अनुमति देती है लेकिन हर उपयोग को गिनती है** — यह सुधार को अयोग्य नहीं ठहराती, लेकिन आप जो भी बैकस्पेस दबाते हैं वह लॉग होता है। यह हाई कोर्ट कौशल परीक्षा से एक वास्तविक व्यावहारिक अंतर है जो बैकस्पेस को पूरी तरह अक्षम कर देती है, इसलिए अपनी वास्तविक परीक्षा के *समान* नियम के तहत अभ्यास करना केवल कच्ची गति अभ्यास से अधिक मायने रखता है।

## वेदिकनींव पर अभ्यास कैसे करें

1. [आरआरबी एनटीपीसी — अंग्रेज़ी अभ्यास परीक्षा](/exams/rrb-ntpc-english) पर जाएँ और परीक्षा स्थितियों में एक पूर्ण 10-मिनट का प्रयास करें।
2. परिणाम पृष्ठ पर अपना **सेंटेंस एक्स-रे** जाँचें — यह हर शब्द को हरा/लाल/पीला रंग देता है ताकि आप ठीक-ठीक देख सकें कि किन गलतियों ने आपकी नेट गति को कम किया।
3. प्रतिदिन दोहराएँ। वेदिकनींव का आज का गद्यांश स्वचालित रूप से घूमता है, इसलिए आप एक अनुच्छेद याद नहीं कर रहे — आप वास्तव में कौशल विकसित कर रहे हैं।

अपनी वास्तविक परीक्षा तिथि से कुछ दिन पहले आराम से अपनी लक्ष्य नेट गति हासिल करने का लक्ष्य रखें — परीक्षा-दिवस पर पहला प्रयास करने का दृष्टिकोण ही सबसे आम कारण है जिससे उम्मीदवार कुछ शब्द प्रति मिनट से कटऑफ चूक जाते हैं।`,
    },
  },
  {
    slug: "allahabad-high-court-ro-aro-typing-guide",
    category: "High Court",
    title: {
      en: "Allahabad High Court RO/ARO Typing Exam: Complete Guide",
      hi: "इलाहाबाद उच्च न्यायालय आरओ/एआरओ टंकण परीक्षा: पूर्ण गाइड",
    },
    excerpt: {
      en: "The Allahabad High Court RO/ARO skill test disables backspace entirely and runs on Hindi Remington — here's exactly what that means for your prep.",
      hi: "इलाहाबाद उच्च न्यायालय आरओ/एआरओ कौशल परीक्षा बैकस्पेस को पूरी तरह अक्षम कर देती है और हिंदी रेमिंगटन पर चलती है — यहाँ बताया गया है कि इसका आपकी तैयारी के लिए क्या मतलब है।",
    },
    content: {
      en: `Recruitment for Review Officer (RO) and Assistant Review Officer (ARO) posts under the Allahabad High Court includes one of the strictest typing skill tests among government exams — and candidates who only practice on lenient platforms are routinely caught off guard.

## No backspace, no exceptions

Unlike most typing tests, this exam's skill test **disables the backspace key entirely** to mirror the real strictness of secretarial court work: once a character is typed, it's typed. There's no correcting a slip mid-passage. This single rule changes your entire strategy — deliberate, controlled typing beats fast-but-careless typing every time here.

## Hindi Remington (Gail), not Inscript

This post's skill test runs on the **Remington (Gail)** keyboard layout — the legacy layout still used across many UP court and secretariat postings — not the newer Unicode Inscript standard. If you've only ever practiced Inscript, budget real time to relearn key positions before your exam date; the two layouts place Hindi characters on entirely different physical keys.

## Practice with the real constraints

VedicNeev's [Allahabad High Court — RO/ARO (Hindi)](/exams/allahabad-hc-ro-aro-hindi) practice test is configured with backspace disabled and Remington tagged, so what you practice under is what you'll face on exam day — not a softer, more forgiving simulation. Review your Sentence X-Ray after every attempt to see exactly which words tripped you up, since without backspace, a single slip early in the passage can cascade.`,
      hi: `इलाहाबाद उच्च न्यायालय के तहत समीक्षा अधिकारी (आरओ) और सहायक समीक्षा अधिकारी (एआरओ) पदों की भर्ती में सरकारी परीक्षाओं में सबसे कठोर टंकण कौशल परीक्षाओं में से एक शामिल है — और जो उम्मीदवार केवल नरम मंचों पर अभ्यास करते हैं वे अक्सर बेखबर पकड़े जाते हैं।

## कोई बैकस्पेस नहीं, कोई अपवाद नहीं

अधिकांश टंकण परीक्षाओं के विपरीत, इस परीक्षा की कौशल परीक्षा सचिवीय न्यायालय कार्य की वास्तविक कठोरता को प्रतिबिंबित करने के लिए **बैकस्पेस कुंजी को पूरी तरह अक्षम कर देती है**: एक बार अक्षर टाइप हो जाने पर, वह टाइप हो चुका है। गद्यांश के बीच में कोई चूक सुधारने का मौका नहीं है। यह एक नियम आपकी पूरी रणनीति बदल देता है — यहाँ जानबूझकर, नियंत्रित टंकण, तेज़ लेकिन लापरवाह टंकण को हर बार मात देती है।

## हिंदी रेमिंगटन (गेल), इंस्क्रिप्ट नहीं

इस पद की कौशल परीक्षा **रेमिंगटन (गेल)** कीबोर्ड लेआउट पर चलती है — पुराना लेआउट जो अभी भी कई यूपी न्यायालय और सचिवालय पदों में उपयोग होता है — नए यूनिकोड इंस्क्रिप्ट मानक पर नहीं। यदि आपने केवल कभी इंस्क्रिप्ट का अभ्यास किया है, तो अपनी परीक्षा तिथि से पहले कुंजी स्थितियों को फिर से सीखने के लिए वास्तविक समय निकालें; दोनों लेआउट हिंदी अक्षरों को पूरी तरह अलग भौतिक कुंजियों पर रखते हैं।

## वास्तविक बाधाओं के साथ अभ्यास करें

वेदिकनींव की [इलाहाबाद उच्च न्यायालय — आरओ/एआरओ (हिंदी)](/exams/allahabad-hc-ro-aro-hindi) अभ्यास परीक्षा बैकस्पेस अक्षम और रेमिंगटन टैग के साथ कॉन्फ़िगर की गई है, ताकि आप जिस स्थिति में अभ्यास करें वही परीक्षा-दिवस पर सामना करें — कोई नरम, अधिक क्षमाशील अनुकरण नहीं। हर प्रयास के बाद अपना सेंटेंस एक्स-रे देखें ताकि ठीक-ठीक देख सकें कि किन शब्दों ने आपको उलझाया, क्योंकि बैकस्पेस के बिना, गद्यांश की शुरुआत में एक भी चूक आगे बढ़ सकती है।`,
    },
  },
  {
    slug: "hindi-inscript-vs-remington-typing-layout",
    category: "Hindi Layouts",
    title: {
      en: "Hindi Inscript vs Remington Gail: Which Typing Layout Should You Learn?",
      hi: "हिंदी इंस्क्रिप्ट बनाम रेमिंगटन गेल: आपको कौन सा टंकण लेआउट सीखना चाहिए?",
    },
    excerpt: {
      en: "Government exams don't all use the same Hindi keyboard layout. Here's how to tell which one your target exam actually tests on, before you waste weeks practicing the wrong one.",
      hi: "सभी सरकारी परीक्षाएँ एक ही हिंदी कीबोर्ड लेआउट का उपयोग नहीं करतीं। यहाँ बताया गया है कि अपनी लक्ष्य परीक्षा वास्तव में किस पर परीक्षण करती है यह कैसे पता करें, इससे पहले कि आप गलत पर हफ्तों बर्बाद करें।",
    },
    content: {
      en: `One of the most common — and costly — mistakes candidates make is practicing Hindi typing on the wrong keyboard layout for months, only to discover their actual exam uses a different one entirely.

## Inscript: the modern Unicode standard

**Inscript** is the government-standardized layout for Unicode Devanagari text, used across most newer recruitment exams (UPSSSC and several state subordinate services boards among them). It's phonetically organized and is what most new Hindi typing courses teach today.

## Remington (Gail): the legacy court/secretariat standard

**Remington**, often called "Gail" in this context, is the older typewriter-era layout still mandated by several High Court and state secretariat recruitment boards — including several UP judiciary skill tests. It places Devanagari characters on entirely different physical keys than Inscript, with no meaningful overlap you can rely on.

## Don't guess — check your exam's own layout tag

The single most important step before you start practicing: confirm which layout your specific target exam actually tests on. VedicNeev's catalog tags every Hindi exam with its exact layout — [UPSSSC — Hindi](/exams/upsssc-hindi) and [UPSSSC Junior Assistant — Hindi](/exams/upsssc-junior-assistant-hindi) run on Inscript, while [Allahabad High Court — RO/ARO](/exams/allahabad-hc-ro-aro-hindi) and [RRB NTPC — Hindi (Remington)](/exams/rrb-ntpc-hindi-remington) run on Remington/Gail.

Switch your own system's input method to match before you start a practice attempt — muscle memory built on the wrong layout doesn't transfer, and re-learning under exam pressure is far harder than getting it right from week one.`,
      hi: `उम्मीदवारों की सबसे आम — और महंगी — गलतियों में से एक यह है कि वे महीनों तक गलत कीबोर्ड लेआउट पर हिंदी टंकण का अभ्यास करते हैं, केवल यह पता लगाने के लिए कि उनकी वास्तविक परीक्षा पूरी तरह अलग लेआउट का उपयोग करती है।

## इंस्क्रिप्ट: आधुनिक यूनिकोड मानक

**इंस्क्रिप्ट** यूनिकोड देवनागरी पाठ के लिए सरकार-मानकीकृत लेआउट है, जिसका उपयोग अधिकांश नई भर्ती परीक्षाओं (यूपीएसएसएससी और कई राज्य अधीनस्थ सेवा बोर्डों सहित) में किया जाता है। यह ध्वन्यात्मक रूप से व्यवस्थित है और आज अधिकांश नए हिंदी टंकण पाठ्यक्रम यही सिखाते हैं।

## रेमिंगटन (गेल): पुराना न्यायालय/सचिवालय मानक

**रेमिंगटन**, जिसे इस संदर्भ में अक्सर "गेल" कहा जाता है, पुराने टाइपराइटर-युग का लेआउट है जो अभी भी कई हाई कोर्ट और राज्य सचिवालय भर्ती बोर्डों द्वारा अनिवार्य है — जिसमें कई यूपी न्यायपालिका कौशल परीक्षाएँ शामिल हैं। यह देवनागरी अक्षरों को इंस्क्रिप्ट से पूरी तरह अलग भौतिक कुंजियों पर रखता है, जिसमें कोई सार्थक ओवरलैप नहीं है जिस पर आप भरोसा कर सकें।

## अनुमान न लगाएँ — अपनी परीक्षा का अपना लेआउट टैग जाँचें

अभ्यास शुरू करने से पहले सबसे महत्वपूर्ण कदम: पुष्टि करें कि आपकी विशिष्ट लक्ष्य परीक्षा वास्तव में किस लेआउट पर परीक्षण करती है। वेदिकनींव का कैटलॉग हर हिंदी परीक्षा को उसके सटीक लेआउट के साथ टैग करता है — [यूपीएसएसएससी — हिंदी](/exams/upsssc-hindi) और [यूपीएसएसएससी कनिष्ठ सहायक — हिंदी](/exams/upsssc-junior-assistant-hindi) इंस्क्रिप्ट पर चलती हैं, जबकि [इलाहाबाद उच्च न्यायालय — आरओ/एआरओ](/exams/allahabad-hc-ro-aro-hindi) और [आरआरबी एनटीपीसी — हिंदी (रेमिंगटन)](/exams/rrb-ntpc-hindi-remington) रेमिंगटन/गेल पर चलती हैं।

अभ्यास प्रयास शुरू करने से पहले अपने सिस्टम की इनपुट पद्धति को उसी के अनुसार बदलें — गलत लेआउट पर बनी मांसपेशी स्मृति स्थानांतरित नहीं होती, और परीक्षा के दबाव में फिर से सीखना पहले सप्ताह से ही सही करने की तुलना में कहीं अधिक कठिन है।`,
    },
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const post of POSTS) {
    const existing = await prisma.typingBlogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      await prisma.typingBlogPost.update({
        where: { slug: post.slug },
        data: { title: post.title, excerpt: post.excerpt, content: post.content, category: post.category },
      });
      updated++;
    } else {
      await prisma.typingBlogPost.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      created++;
    }
  }

  console.log(`Typing blog seed: ${created} created, ${updated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

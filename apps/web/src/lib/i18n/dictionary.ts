import type { LanguageCode } from "@/lib/exam/types";

type Entry = Record<LanguageCode, string>;

/**
 * Site-wide chrome copy (header, footer, and homepage's own direct copy) —
 * one flat key -> per-language string map. Page-specific marketing sections
 * (FeatureGrid, TestimonialCarousel, etc.) aren't covered yet; extend this
 * same map and call useT() from them as they're localized next, rather than
 * building a second dictionary.
 *
 * Exam board acronyms (JNVST/AISSEE/RMS) are left untranslated in every
 * language — they're official Government of India exam names with no
 * translated acronym even in the boards' own regional-language materials.
 */
export const DICTIONARY = {
  // Header nav
  navLearn: { en: "Learn", hi: "सीखें", mr: "शिका", bn: "শিখুন", ta: "கற்றுக்கொள்ளுங்கள்", gu: "શીખો" },
  navBlog: { en: "Blog", hi: "ब्लॉग", mr: "ब्लॉग", bn: "ব্লগ", ta: "வலைப்பதிவு", gu: "બ્લોગ" },
  navPricing: { en: "Pricing", hi: "मूल्य निर्धारण", mr: "किंमत", bn: "মূল্য", ta: "விலை நிர்ணயம்", gu: "કિંમત" },
  navDashboard: { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड", bn: "ড্যাশবোর্ড", ta: "டாஷ்போர்டு", gu: "ડેશબોર્ડ" },
  navPractice: { en: "Practice", hi: "अभ्यास", mr: "सराव", bn: "অনুশীলন", ta: "பயிற்சி", gu: "અભ્યાસ" },
  navParent: {
    en: "Parent Command Center",
    hi: "अभिभावक कमांड सेंटर",
    mr: "पालक कमांड सेंटर",
    bn: "অভিভাবক কমান্ড সেন্টার",
    ta: "பெற்றோர் கட்டுப்பாட்டு மையம்",
    gu: "વાલી કમાન્ડ સેન્ટર",
  },
  navMockSeries: {
    en: "Mock Exam Series",
    hi: "मॉक परीक्षा श्रृंखला",
    mr: "मॉक परीक्षा मालिका",
    bn: "মক পরীক্ষা সিরিজ",
    ta: "மாதிரி தேர்வு தொடர்",
    gu: "મોક પરીક્ષા શ્રેણી",
  },
  navFreePractice: {
    en: "Free Practice",
    hi: "मुफ्त अभ्यास",
    mr: "मोफत सराव",
    bn: "বিনামূল্যে অনুশীলন",
    ta: "இலவச பயிற்சி",
    gu: "મફત અભ્યાસ",
  },
  navWeeklyScholarship: {
    en: "Weekly Scholarship",
    hi: "साप्ताहिक छात्रवृत्ति",
    mr: "साप्ताहिक शिष्यवृत्ती",
    bn: "সাপ্তাহিক বৃত্তি",
    ta: "வாராந்திர உதவித்தொகை",
    gu: "સાપ્તાહિક શિષ્યવૃત્તિ",
  },
  navSignIn: { en: "Sign In", hi: "साइन इन करें", mr: "साइन इन करा", bn: "সাইন ইন করুন", ta: "உள்நுழைக", gu: "સાઇન ઇન કરો" },
  navActiveBoards: {
    en: "Active Boards:",
    hi: "सक्रिय बोर्ड:",
    mr: "सक्रिय मंडळे:",
    bn: "সক্রিয় বোর্ড:",
    ta: "செயலில் உள்ள வாரியங்கள்:",
    gu: "સક્રિય બોર્ડ:",
  },

  // Footer
  footerMission: {
    en: "Elite institutional preparation for Jawahar Navodaya Vidyalaya (JNVST), All India Sainik School (AISSEE), and Rashtriya Military Schools (RMS) with multi-lingual support and Vedic mathematics acceleration.",
    hi: "जवाहर नवोदय विद्यालय (JNVST), ऑल इंडिया सैनिक स्कूल (AISSEE), और राष्ट्रीय मिलिट्री स्कूल (RMS) के लिए बहुभाषी सहायता और वैदिक गणित त्वरण के साथ श्रेष्ठ संस्थागत तैयारी।",
    mr: "जवाहर नवोदय विद्यालय (JNVST), ऑल इंडिया सैनिक स्कूल (AISSEE), आणि राष्ट्रीय मिलिटरी स्कूल (RMS) साठी बहुभाषिक सहाय्य आणि वैदिक गणित प्रवेगासह उत्कृष्ट संस्थात्मक तयारी.",
    bn: "জওহর নবোদয় বিদ্যালয় (JNVST), অল ইন্ডিয়া সৈনিক স্কুল (AISSEE), এবং রাষ্ট্রীয় মিলিটারি স্কুল (RMS) এর জন্য বহুভাষিক সহায়তা এবং বৈদিক গণিত ত্বরণসহ অভিজাত প্রাতিষ্ঠানিক প্রস্তুতি।",
    ta: "ஜவஹர் நவோதயா வித்யாலயா (JNVST), அகில இந்திய சைனிக் பள்ளி (AISSEE), மற்றும் ராஷ்டிரிய மிலிட்டரி பள்ளிகள் (RMS) க்கான பன்மொழி ஆதரவு மற்றும் வேத கணித விரைவாக்கத்துடன் உயரிய நிறுவன தயாரிப்பு.",
    gu: "જવાહર નવોદય વિદ્યાલય (JNVST), ઓલ ઇન્ડિયા સૈનિક સ્કૂલ (AISSEE), અને રાષ્ટ્રીય મિલિટરી સ્કૂલ (RMS) માટે બહુભાષી સહાય અને વૈદિક ગણિત પ્રવેગ સાથે ઉત્તમ સંસ્થાકીય તૈયારી.",
  },
  footerCompliance: {
    en: "100% NTA & Sainik School Blueprint Compliant",
    hi: "100% NTA और सैनिक स्कूल ब्लूप्रिंट अनुरूप",
    mr: "100% NTA आणि सैनिक स्कूल ब्लूप्रिंट अनुरूप",
    bn: "১০০% NTA এবং সৈনিক স্কুল ব্লুপ্রিন্ট সম্মত",
    ta: "100% NTA & சைனிக் பள்ளி வடிவமைப்புக்கு இணக்கமானது",
    gu: "100% NTA અને સૈનિક સ્કૂલ બ્લુપ્રિન્ટ સુસંગત",
  },
  footerExamBoards: { en: "Exam Boards", hi: "परीक्षा बोर्ड", mr: "परीक्षा मंडळे", bn: "পরীক্ষা বোর্ড", ta: "தேர்வு வாரியங்கள்", gu: "પરીક્ષા બોર્ડ" },
  footerResources: { en: "Resources", hi: "संसाधन", mr: "संसाधने", bn: "সম্পদ", ta: "வளங்கள்", gu: "સંસાધનો" },
  footerLegal: {
    en: "Compliance & Legal",
    hi: "अनुपालन और कानूनी",
    mr: "अनुपालन आणि कायदेशीर",
    bn: "সম্মতি ও আইনি",
    ta: "இணக்கம் & சட்டப்பூர்வம்",
    gu: "પાલન અને કાનૂની",
  },
  footerVedicMaths: {
    en: "Vedic Maths Shortcuts",
    hi: "वैदिक गणित शॉर्टकट",
    mr: "वैदिक गणित शॉर्टकट",
    bn: "বৈদিক গণিত শর্টকাট",
    ta: "வேத கணித குறுக்குவழிகள்",
    gu: "વૈદિક ગણિત શોર્ટકટ",
  },
  footerBlog: {
    en: "Exam Strategy Blog",
    hi: "परीक्षा रणनीति ब्लॉग",
    mr: "परीक्षा रणनीती ब्लॉग",
    bn: "পরীক্ষার কৌশল ব্লগ",
    ta: "தேர்வு உத்தி வலைப்பதிவு",
    gu: "પરીક્ષા વ્યૂહરચના બ્લોગ",
  },
  footerInstitutionalPricing: {
    en: "Institutional Pricing",
    hi: "संस्थागत मूल्य निर्धारण",
    mr: "संस्थात्मक किंमत",
    bn: "প্রাতিষ্ঠানিক মূল্য",
    ta: "நிறுவன விலை நிர்ணயம்",
    gu: "સંસ્થાકીય કિંમત",
  },
  footerFaq: {
    en: "Parent FAQ",
    hi: "अभिभावक FAQ",
    mr: "पालक FAQ",
    bn: "অভিভাবক জিজ্ঞাসা",
    ta: "பெற்றோர் கேள்விகள்",
    gu: "વાલી FAQ",
  },
  footerPrivacy: { en: "Privacy Policy", hi: "गोपनीयता नीति", mr: "गोपनीयता धोरण", bn: "গোপনীয়তা নীতি", ta: "தனியுரிமைக் கொள்கை", gu: "ગોપનીયતા નીતિ" },
  footerTerms: { en: "Terms of Service", hi: "सेवा की शर्तें", mr: "सेवा अटी", bn: "পরিষেবার শর্তাবলী", ta: "சேவை விதிமுறைகள்", gu: "સેવાની શરતો" },
  footerLocation: {
    en: "New Delhi & Lucknow, India",
    hi: "नई दिल्ली और लखनऊ, भारत",
    mr: "नवी दिल्ली आणि लखनौ, भारत",
    bn: "নয়াদিল্লি ও লখনউ, ভারত",
    ta: "புது தில்லி & லக்னோ, இந்தியா",
    gu: "નવી દિલ્હી અને લખનૌ, ભારત",
  },
  footerSupport: { en: "Support", hi: "सहायता", mr: "सहाय्य", bn: "সহায়তা", ta: "ஆதரவு", gu: "સહાય" },
  footerPrivacyShort: { en: "Privacy", hi: "गोपनीयता", mr: "गोपनीयता", bn: "গোপনীয়তা", ta: "தனியுரிமை", gu: "ગોપનીયતા" },
  footerTermsShort: { en: "Terms", hi: "शर्तें", mr: "अटी", bn: "শর্তাবলী", ta: "விதிமுறைகள்", gu: "શરતો" },
} as const satisfies Record<string, Entry>;

export type DictionaryKey = keyof typeof DICTIONARY;

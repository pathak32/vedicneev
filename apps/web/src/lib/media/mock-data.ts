import type { MediaItem } from "@vedicneev/engine";

/**
 * Standalone demo media catalog, mirroring packages/db/prisma/seed.ts's
 * MediaItem rows (same titles/topics/hacks) so wiring this to @vedicneev/db
 * later is a drop-in swap of the data source — same as the exam mock data.
 *
 * videoUrl/audioUrl/thumbnailUrl are intentionally null: no real media
 * assets are hosted in this project. The players render a clearly-labeled
 * "demo mode" placeholder and drive all their controls (play/pause,
 * progress, mute, speed, skip) off a simulated timer instead, so the actual
 * interactive UI is still fully real and testable — just not attached to a
 * real video/audio file.
 */
export const mediaCatalog: MediaItem[] = [
  {
    id: "media-short-nikhilam",
    mediaType: "SHORT_VIDEO",
    title: { en: "Nikhilam Multiplication in 40 Seconds", hi: "40 सेकंड में निखिलम् गुणा" },
    description: {
      en: "Multiply numbers near a base like 98×97 without long multiplication.",
      hi: "98×97 जैसी आधार के निकट संख्याओं को बिना लंबी गुणा प्रक्रिया के गुणा करें।",
    },
    durationSeconds: 45,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: null,
    topicId: "speed_calculation",
    vedicSpeedHackId: "hack-near-base",
    targetExams: ["JNVST", "AISSEE"],
  },
  {
    id: "media-short-rotation",
    mediaType: "SHORT_VIDEO",
    title: { en: "Spin the Shape: Cracking Rotation Patterns", hi: "आकृति घुमाएं: घूर्णन पैटर्न को समझें" },
    description: {
      en: "Spot the rotation angle in non-verbal reasoning figure sequences.",
      hi: "अशाब्दिक तर्क आकृति अनुक्रमों में घूर्णन कोण पहचानें।",
    },
    durationSeconds: 38,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: null,
    topicId: "pattern_completion",
    vedicSpeedHackId: null,
    targetExams: ["JNVST", "AISSEE", "RMS"],
  },
  {
    id: "media-pod-eleven",
    mediaType: "AUDIO_POD",
    title: { en: "The ×11 Rule, Explained", hi: "×11 का नियम, समझाया गया" },
    description: {
      en: "A 2-minute bilingual walkthrough of the sandwich rule for multiplying by 11.",
      hi: "11 से गुणा करने के सैंडविच नियम का 2 मिनट का द्विभाषी विवरण।",
    },
    durationSeconds: 150,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: {
      en: "To multiply a two-digit number by 11, add its two digits and place the sum between them. If the sum is 10 or more, carry the 1 into the tens digit. For example, 45×11: 4+5=9, so the answer is 495.",
      hi: "किसी दो अंकों की संख्या को 11 से गुणा करने के लिए, उसके दोनों अंकों को जोड़ें और योग को उनके बीच रखें। यदि योग 10 या अधिक है, तो 1 को दहाई के अंक में कैरी करें। उदाहरण: 45×11: 4+5=9, तो उत्तर 495 है।",
    },
    topicId: "speed_calculation",
    vedicSpeedHackId: "hack-x11",
    targetExams: ["JNVST", "AISSEE"],
  },
  {
    id: "media-pod-grammar",
    mediaType: "AUDIO_POD",
    title: { en: "Grammar Formula: Simple Present Tense", hi: "व्याकरण सूत्र: सामान्य वर्तमान काल" },
    description: {
      en: "When to add -s or -es, and the exceptions that trip students up.",
      hi: "-s या -es कब जोड़ें, और वे अपवाद जो छात्रों को उलझाते हैं।",
    },
    durationSeconds: 200,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: {
      en: "Third-person singular subjects — he, she, it, or a single name — take the -s form of the verb in the simple present tense: 'She goes to school.' Verbs ending in -sh, -ch, -x, -s, or -o take -es instead: 'He watches TV.'",
      hi: "तृतीय पुरुष एकवचन कर्ता — he, she, it, या कोई एक नाम — सामान्य वर्तमान काल में क्रिया के -s रूप का प्रयोग करते हैं: 'She goes to school.' -sh, -ch, -x, -s, या -o में समाप्त होने वाली क्रियाएं -es लेती हैं: 'He watches TV.'",
    },
    topicId: "grammar",
    vedicSpeedHackId: null,
    targetExams: ["JNVST", "AISSEE", "DPS"],
  },
  {
    id: "media-clinic-word-problems",
    mediaType: "CONCEPT_CLINIC",
    title: {
      en: "Arithmetic Word Problems: Breaking Them Down",
      hi: "अंकगणितीय शब्द समस्याएं: चरण-दर-चरण समाधान",
    },
    description: {
      en: "A step-by-step remediation clinic for turning word problems into equations.",
      hi: "शब्द समस्याओं को समीकरणों में बदलने के लिए चरण-दर-चरण उपचारात्मक क्लिनिक।",
    },
    durationSeconds: 480,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: null,
    topicId: "speed_calculation",
    vedicSpeedHackId: null,
    targetExams: ["JNVST", "AISSEE"],
  },
  {
    id: "media-clinic-series",
    mediaType: "CONCEPT_CLINIC",
    title: { en: "Mastering Number & Letter Series", hi: "संख्या एवं अक्षर श्रृंखला में महारत" },
    description: {
      en: "A deep dive into spotting the rule behind any series question.",
      hi: "किसी भी श्रृंखला प्रश्न के पीछे के नियम को पहचानने की गहन जानकारी।",
    },
    durationSeconds: 360,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: null,
    topicId: "number_series",
    vedicSpeedHackId: null,
    targetExams: ["JNVST", "AISSEE", "RMS"],
  },
];

import { prisma } from "../src/index";

/**
 * Seeds the NDA question bank + one overview ConceptNote per topic — the
 * "Question bank + concept notes, no OMR yet" tier the user chose for
 * NDA/CDS (see comingSoonBoards.ts for the matching syllabus teaser this
 * extends). Reuses the existing "mathematics" / "language" /
 * "general_knowledge" Sections (Section is just a subject-level display
 * bucket shared across exams) rather than creating NDA-only sections —
 * every Topic below carries targetExam: "NDA" so it's fully isolated from
 * JNVST/AISSEE/RMS's existing content (topicPracticeService.ts's
 * listPracticeTopics ANDs the exam filter, so an NDA-tagged topic can never
 * surface in another exam's catalog). Idempotent: safe to re-run.
 */

interface QuestionSeed {
  key: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  en: string;
  options: string[];
  correctIndex: number;
  explanationEn: string;
}

interface TopicSeed {
  sectionKey: "mathematics" | "language" | "general_knowledge";
  topicKey: string;
  nameEn: string;
  conceptTitleEn: string;
  conceptExplanationEn: string;
  conceptWorkedExampleEn: string;
  conceptCommonMistakeEn: string;
  questions: QuestionSeed[];
}

const OPTION_IDS = ["a", "b", "c", "d"] as const;

const NDA_TOPICS: TopicSeed[] = [
  {
    sectionKey: "mathematics",
    topicKey: "nda_algebra",
    nameEn: "Algebra",
    conceptTitleEn: "Algebra — Sets, Quadratics, Logarithms & Complex Numbers",
    conceptExplanationEn:
      "NDA Algebra covers set theory (subsets, unions, intersections), the quadratic formula and its discriminant b²-4ac (which tells you whether roots are real/equal/imaginary), logarithm rules (log_a(xy) = log_a x + log_a y, log_a(x^n) = n·log_a x), and complex numbers z = a+bi with modulus |z| = √(a²+b²).",
    conceptWorkedExampleEn:
      "Find k so that x² - 6x + k = 0 has equal roots. Equal roots means discriminant = 0: (-6)² - 4(1)(k) = 0 → 36 - 4k = 0 → k = 9.",
    conceptCommonMistakeEn:
      "Students often forget the discriminant condition has three cases (>0 real distinct, =0 equal, <0 imaginary) and only check one direction, or mix up log_a(x+y) with log_a(x) + log_a(y) — logs don't distribute over addition, only over multiplication/division.",
    questions: [
      {
        key: "nda-algebra-01",
        difficulty: "MEDIUM",
        en: "For what value of k does the equation x² − 6x + k = 0 have equal roots?",
        options: ["6", "9", "12", "3"],
        correctIndex: 1,
        explanationEn: "Equal roots ⇒ discriminant = 0: 36 − 4k = 0 ⇒ k = 9.",
      },
      {
        key: "nda-algebra-02",
        difficulty: "EASY",
        en: "log₂(32) = ?",
        options: ["4", "5", "6", "32"],
        correctIndex: 1,
        explanationEn: "2⁵ = 32, so log₂(32) = 5.",
      },
      {
        key: "nda-algebra-03",
        difficulty: "MEDIUM",
        en: "How many subsets does a set with 5 elements have?",
        options: ["10", "16", "32", "25"],
        correctIndex: 2,
        explanationEn: "A set with n elements has 2ⁿ subsets: 2⁵ = 32.",
      },
      {
        key: "nda-algebra-04",
        difficulty: "HARD",
        en: "If z = 3 + 4i, what is |z|?",
        options: ["5", "7", "25", "12"],
        correctIndex: 0,
        explanationEn: "|z| = √(3² + 4²) = √(9+16) = √25 = 5.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_matrices_determinants",
    nameEn: "Matrices & Determinants",
    conceptTitleEn: "Matrices & Determinants — Basics",
    conceptExplanationEn:
      "A matrix is a rectangular array of numbers; its order is (rows × columns). Two matrices can only be multiplied when the first's column count matches the second's row count, giving a result of (first's rows × second's columns). The determinant of a 2×2 matrix [[a,b],[c,d]] is ad − bc; a matrix is singular exactly when its determinant is 0.",
    conceptWorkedExampleEn:
      "For A = [[1,2],[3,4]], det(A) = (1×4) − (2×3) = 4 − 6 = −2. Since this isn't 0, A is non-singular (invertible).",
    conceptCommonMistakeEn:
      "A common slip is computing ad + bc instead of ad − bc for a 2×2 determinant, or trying to multiply two matrices whose inner dimensions don't match.",
    questions: [
      {
        key: "nda-matrices-01",
        difficulty: "EASY",
        en: "What is the determinant of [[1, 2], [3, 4]]?",
        options: ["-2", "2", "10", "-10"],
        correctIndex: 0,
        explanationEn: "det = (1×4) − (2×3) = 4 − 6 = −2.",
      },
      {
        key: "nda-matrices-02",
        difficulty: "MEDIUM",
        en: "A is a 2×3 matrix and B is a 3×4 matrix. What is the order of AB?",
        options: ["3×2", "2×4", "4×2", "3×4"],
        correctIndex: 1,
        explanationEn: "AB takes A's rows (2) and B's columns (4): order 2×4.",
      },
      {
        key: "nda-matrices-03",
        difficulty: "EASY",
        en: "What is the trace of the 3×3 identity matrix?",
        options: ["0", "1", "3", "9"],
        correctIndex: 2,
        explanationEn: "The identity matrix has 1s on its diagonal; trace = sum of diagonal entries = 1+1+1 = 3.",
      },
      {
        key: "nda-matrices-04",
        difficulty: "HARD",
        en: "A square matrix A is called singular when:",
        options: ["det(A) = 1", "det(A) = 0", "det(A) < 0", "A has no rows"],
        correctIndex: 1,
        explanationEn: "A matrix is singular (non-invertible) exactly when its determinant equals 0.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_trigonometry",
    nameEn: "Trigonometry",
    conceptTitleEn: "Trigonometry — Ratios & Identities",
    conceptExplanationEn:
      "The core trigonometric ratios (sin, cos, tan) for standard angles (0°, 30°, 45°, 60°, 90°) should be memorized directly. The Pythagorean identity sin²θ + cos²θ = 1 holds for every angle θ, and tan θ = sin θ / cos θ.",
    conceptWorkedExampleEn:
      "sin(30°) = 1/2 and cos(60°) = 1/2 — note these are equal because 30° and 60° are complementary (sin θ = cos(90° − θ)).",
    conceptCommonMistakeEn:
      "Mixing up sin(30°) = 1/2 with cos(30°) = √3/2 is the single most common NDA trigonometry error — always double-check against the standard-angle table rather than guessing from memory under time pressure.",
    questions: [
      {
        key: "nda-trig-01",
        difficulty: "EASY",
        en: "What is sin(30°)?",
        options: ["1/2", "√3/2", "1", "0"],
        correctIndex: 0,
        explanationEn: "sin(30°) = 1/2, a standard-angle value worth memorizing directly.",
      },
      {
        key: "nda-trig-02",
        difficulty: "EASY",
        en: "What is cos(60°)?",
        options: ["√3/2", "1/2", "0", "1"],
        correctIndex: 1,
        explanationEn: "cos(60°) = 1/2 (equal to sin(30°), since 30° and 60° are complementary).",
      },
      {
        key: "nda-trig-03",
        difficulty: "MEDIUM",
        en: "For any angle θ, sin²θ + cos²θ equals:",
        options: ["0", "1", "2", "It depends on θ"],
        correctIndex: 1,
        explanationEn: "This is the Pythagorean trigonometric identity — it holds for every real θ.",
      },
      {
        key: "nda-trig-04",
        difficulty: "MEDIUM",
        en: "What is tan(45°)?",
        options: ["0", "1", "√3", "Undefined"],
        correctIndex: 1,
        explanationEn: "tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_analytical_geometry",
    nameEn: "Analytical Geometry",
    conceptTitleEn: "Analytical Geometry — Lines, Circles & 3D Basics",
    conceptExplanationEn:
      "The distance between two points (x₁,y₁) and (x₂,y₂) is √((x₂-x₁)² + (y₂-y₁)²). A line's slope-intercept form is y = mx + c. A circle centered at the origin with radius r has equation x² + y² = r². In 3D coordinate geometry, the plane z = 0 is exactly the xy-plane.",
    conceptWorkedExampleEn:
      "Distance from (0,0) to (3,4): √((3-0)² + (4-0)²) = √(9+16) = √25 = 5.",
    conceptCommonMistakeEn:
      "When converting a line like 2x + 3y = 6 to y = mx + c form, students often forget to divide the constant term too, getting the intercept wrong even when the slope is right.",
    questions: [
      {
        key: "nda-geometry-01",
        difficulty: "EASY",
        en: "What is the distance between the points (0,0) and (3,4)?",
        options: ["5", "7", "12", "25"],
        correctIndex: 0,
        explanationEn: "Distance = √(3² + 4²) = √25 = 5.",
      },
      {
        key: "nda-geometry-02",
        difficulty: "MEDIUM",
        en: "What is the slope of the line 2x + 3y = 6?",
        options: ["2/3", "-2/3", "3/2", "-3/2"],
        correctIndex: 1,
        explanationEn: "Rewriting: y = (-2/3)x + 2, so the slope is -2/3.",
      },
      {
        key: "nda-geometry-03",
        difficulty: "EASY",
        en: "What is the equation of a circle centered at the origin with radius 5?",
        options: ["x + y = 5", "x² + y² = 5", "x² + y² = 25", "x² − y² = 25"],
        correctIndex: 2,
        explanationEn: "A circle of radius r at the origin is x² + y² = r²; here r = 5, so x² + y² = 25.",
      },
      {
        key: "nda-geometry-04",
        difficulty: "HARD",
        en: "In 3D coordinate geometry, which equation represents the xy-plane?",
        options: ["x = 0", "y = 0", "z = 0", "x + y + z = 0"],
        correctIndex: 2,
        explanationEn: "Every point on the xy-plane has z-coordinate 0, so z = 0 defines it.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_differential_calculus",
    nameEn: "Differential Calculus",
    conceptTitleEn: "Differential Calculus — Limits & Derivatives",
    conceptExplanationEn:
      "The derivative measures instantaneous rate of change. Key rules: d/dx(xⁿ) = n·xⁿ⁻¹, d/dx(sin x) = cos x, d/dx(constant) = 0. A key limit fact: lim(x→0) sin(x)/x = 1, which underlies many trigonometric derivative proofs.",
    conceptWorkedExampleEn:
      "d/dx(x³) = 3x². Using the power rule: bring the exponent down as a multiplier, then reduce the exponent by 1.",
    conceptCommonMistakeEn:
      "Students frequently forget to reduce the exponent by 1 after multiplying it down, writing d/dx(x³) = 3x³ instead of 3x².",
    questions: [
      {
        key: "nda-calc1-01",
        difficulty: "EASY",
        en: "What is d/dx(x³)?",
        options: ["x²", "3x²", "3x³", "x³/3"],
        correctIndex: 1,
        explanationEn: "Power rule: bring the exponent (3) down and reduce it by 1: 3x².",
      },
      {
        key: "nda-calc1-02",
        difficulty: "MEDIUM",
        en: "What is d/dx(sin x)?",
        options: ["cos x", "-cos x", "sin x", "-sin x"],
        correctIndex: 0,
        explanationEn: "The derivative of sin x is cos x — a standard calculus identity.",
      },
      {
        key: "nda-calc1-03",
        difficulty: "HARD",
        en: "What is lim(x→0) sin(x)/x?",
        options: ["0", "1", "∞", "Undefined"],
        correctIndex: 1,
        explanationEn: "This is a standard limit result: sin(x)/x → 1 as x → 0.",
      },
      {
        key: "nda-calc1-04",
        difficulty: "EASY",
        en: "What is the derivative of a constant, e.g. d/dx(7)?",
        options: ["0", "1", "7", "7x"],
        correctIndex: 0,
        explanationEn: "A constant never changes, so its rate of change (derivative) is 0.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_integral_calculus",
    nameEn: "Integral Calculus & Differential Equations",
    conceptTitleEn: "Integral Calculus — Antiderivatives & Simple DEs",
    conceptExplanationEn:
      "Integration reverses differentiation: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. A definite integral ∫[a,b] f(x)dx evaluates to F(b) − F(a). A differential equation's order is the highest derivative appearing in it.",
    conceptWorkedExampleEn:
      "∫[0,1] 2x dx = [x²] from 0 to 1 = 1² − 0² = 1.",
    conceptCommonMistakeEn:
      "Forgetting the '+C' constant of integration on an indefinite integral is the most common slip — it only drops out because it cancels in a definite integral's subtraction.",
    questions: [
      {
        key: "nda-calc2-01",
        difficulty: "EASY",
        en: "What is ∫x dx?",
        options: ["x + C", "x²/2 + C", "2x + C", "x² + C"],
        correctIndex: 1,
        explanationEn: "Using ∫xⁿ dx = xⁿ⁺¹/(n+1) + C with n=1 gives x²/2 + C.",
      },
      {
        key: "nda-calc2-02",
        difficulty: "MEDIUM",
        en: "What is ∫[0,1] 2x dx?",
        options: ["0", "1", "2", "1/2"],
        correctIndex: 1,
        explanationEn: "∫2x dx = x². Evaluating from 0 to 1: 1² − 0² = 1.",
      },
      {
        key: "nda-calc2-03",
        difficulty: "HARD",
        en: "What is the order of the differential equation d²y/dx² + y = 0?",
        options: ["0", "1", "2", "4"],
        correctIndex: 2,
        explanationEn: "The order is the highest derivative present — here it's the second derivative, so order 2.",
      },
      {
        key: "nda-calc2-04",
        difficulty: "EASY",
        en: "What is ∫cos(x) dx?",
        options: ["sin(x) + C", "-sin(x) + C", "cos(x) + C", "-cos(x) + C"],
        correctIndex: 0,
        explanationEn: "Integration reverses differentiation, and d/dx(sin x) = cos x, so ∫cos(x)dx = sin(x) + C.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_vectors",
    nameEn: "Vectors",
    conceptTitleEn: "Vectors — Magnitude, Dot & Cross Products",
    conceptExplanationEn:
      "A vector has both magnitude and direction. The magnitude of a+bj (using unit vectors i, j) is √(a²+b²). The dot product of two perpendicular vectors is 0; the cross product of two parallel vectors is the zero vector. A unit vector has magnitude exactly 1.",
    conceptWorkedExampleEn:
      "|i + j| = √(1² + 1²) = √2, since i and j are each unit vectors along the x and y axes.",
    conceptCommonMistakeEn:
      "Confusing the dot product (a scalar, zero when vectors are perpendicular) with the cross product (a vector, zero when vectors are parallel) is a frequent mix-up under exam time pressure.",
    questions: [
      {
        key: "nda-vectors-01",
        difficulty: "MEDIUM",
        en: "What is the magnitude of the vector i + j (unit vectors along x and y axes)?",
        options: ["1", "√2", "2", "0"],
        correctIndex: 1,
        explanationEn: "|i+j| = √(1²+1²) = √2.",
      },
      {
        key: "nda-vectors-02",
        difficulty: "EASY",
        en: "The dot product of two perpendicular vectors is:",
        options: ["0", "1", "Undefined", "Equal to their magnitudes' product"],
        correctIndex: 0,
        explanationEn: "a·b = |a||b|cos(θ); at θ = 90°, cos(90°) = 0, so the dot product is 0.",
      },
      {
        key: "nda-vectors-03",
        difficulty: "MEDIUM",
        en: "The cross product of two parallel vectors is:",
        options: ["A vector of magnitude 1", "The zero vector", "Undefined", "Equal to their dot product"],
        correctIndex: 1,
        explanationEn: "a×b has magnitude |a||b|sin(θ); at θ=0° (parallel), sin(0°)=0, giving the zero vector.",
      },
      {
        key: "nda-vectors-04",
        difficulty: "EASY",
        en: "A vector with magnitude exactly 1 is called a:",
        options: ["Zero vector", "Unit vector", "Position vector", "Null vector"],
        correctIndex: 1,
        explanationEn: "By definition, a unit vector is any vector with magnitude 1.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "nda_statistics_probability",
    nameEn: "Statistics & Probability",
    conceptTitleEn: "Statistics & Probability — Central Tendency & Basic Probability",
    conceptExplanationEn:
      "Mean is the sum of values divided by their count. Median is the middle value when data is sorted (for odd counts) or the average of the two middle values (for even counts). Mode is the most frequently occurring value. Basic probability = favorable outcomes ÷ total outcomes.",
    conceptWorkedExampleEn:
      "Mean of 2, 4, 6, 8, 10: sum = 30, count = 5, mean = 30/5 = 6.",
    conceptCommonMistakeEn:
      "For an odd-count dataset, students sometimes average the two middle numbers instead of just picking the single true middle value once the data is sorted.",
    questions: [
      {
        key: "nda-stats-01",
        difficulty: "EASY",
        en: "What is the mean of 2, 4, 6, 8, 10?",
        options: ["5", "6", "8", "30"],
        correctIndex: 1,
        explanationEn: "Sum = 30, count = 5, mean = 30/5 = 6.",
      },
      {
        key: "nda-stats-02",
        difficulty: "EASY",
        en: "What is the probability of getting heads on a single toss of a fair coin?",
        options: ["1/4", "1/3", "1/2", "1"],
        correctIndex: 2,
        explanationEn: "A fair coin has 2 equally likely outcomes; 1 favorable outcome / 2 total = 1/2.",
      },
      {
        key: "nda-stats-03",
        difficulty: "MEDIUM",
        en: "What is the median of 1, 3, 3, 6, 7, 8, 9?",
        options: ["3", "6", "7", "8"],
        correctIndex: 1,
        explanationEn: "With 7 sorted values, the median is the 4th value: 6.",
      },
      {
        key: "nda-stats-04",
        difficulty: "MEDIUM",
        en: "What is the mode of 2, 2, 3, 5, 5, 5, 7?",
        options: ["2", "3", "5", "7"],
        correctIndex: 2,
        explanationEn: "5 appears three times, more than any other value, so it's the mode.",
      },
    ],
  },
  {
    sectionKey: "language",
    topicKey: "nda_english",
    nameEn: "English — Grammar, Vocabulary & Comprehension",
    conceptTitleEn: "English — Grammar, Vocabulary & Comprehension",
    conceptExplanationEn:
      "NDA's English paper tests grammar (subject-verb agreement, tense), vocabulary (synonyms/antonyms), and spelling — all at a Class 11-12 level. Subject-verb agreement means a singular subject takes a singular verb form (he goes, not he go).",
    conceptWorkedExampleEn:
      "\"He ___ to school every day\" needs a present-simple, singular-subject verb: \"goes\", not \"go\" (that's for I/you/we/they).",
    conceptCommonMistakeEn:
      "Third-person-singular present tense verbs need an -s/-es ending (he goes, she watches) — a very common slip is leaving the base form unchanged (he go).",
    questions: [
      {
        key: "nda-english-01",
        difficulty: "MEDIUM",
        en: "Choose the word closest in meaning to \"Ephemeral\":",
        options: ["Temporary", "Permanent", "Huge", "Ancient"],
        correctIndex: 0,
        explanationEn: "Ephemeral means lasting for a very short time — closest to \"temporary\".",
      },
      {
        key: "nda-english-02",
        difficulty: "EASY",
        en: "Which of these is spelled correctly?",
        options: ["Occured", "Ocurred", "Occureed", "Occurred"],
        correctIndex: 3,
        explanationEn: "\"Occurred\" doubles both the 'c' and 'r' — a commonly misspelled word.",
      },
      {
        key: "nda-english-03",
        difficulty: "EASY",
        en: "Fill in the blank: \"He ___ to school every day.\"",
        options: ["go", "goes", "going", "gone"],
        correctIndex: 1,
        explanationEn: "Third-person singular subject (\"he\") in present simple tense takes \"goes\", not the base form \"go\".",
      },
      {
        key: "nda-english-04",
        difficulty: "MEDIUM",
        en: "Choose the antonym of \"Benevolent\":",
        options: ["Malevolent", "Kind", "Generous", "Charitable"],
        correctIndex: 0,
        explanationEn: "Benevolent means kind/well-meaning; its opposite is \"malevolent\" (ill-intentioned).",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_physics",
    nameEn: "General Knowledge — Physics",
    conceptTitleEn: "GK — Physics Essentials",
    conceptExplanationEn:
      "NDA GK Physics covers Class 11-12 level mechanics, electricity, and basic units — SI units for force (Newton), current (Ampere), and key constants like the speed of light.",
    conceptWorkedExampleEn:
      "Newton's second law, F = ma, is why the SI unit of force (Newton) is defined as 1 kg·m/s².",
    conceptCommonMistakeEn:
      "Mixing up mass (kg, a scalar) with weight/force (Newton, mass × gravity) is a very common conceptual slip.",
    questions: [
      {
        key: "nda-gk-physics-01",
        difficulty: "EASY",
        en: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctIndex: 1,
        explanationEn: "Force is measured in Newtons (N), defined via F = ma.",
      },
      {
        key: "nda-gk-physics-02",
        difficulty: "MEDIUM",
        en: "The speed of light in vacuum is approximately:",
        options: ["3 × 10⁵ m/s", "3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s"],
        correctIndex: 2,
        explanationEn: "The speed of light in vacuum is approximately 3 × 10⁸ m/s (about 300,000 km/s).",
      },
      {
        key: "nda-gk-physics-03",
        difficulty: "EASY",
        en: "\"Force equals mass times acceleration\" (F = ma) is:",
        options: ["Newton's first law", "Newton's second law", "Newton's third law", "The law of gravitation"],
        correctIndex: 1,
        explanationEn: "F = ma is Newton's second law of motion.",
      },
      {
        key: "nda-gk-physics-04",
        difficulty: "EASY",
        en: "What is the SI unit of electric current?",
        options: ["Volt", "Ohm", "Ampere", "Watt"],
        correctIndex: 2,
        explanationEn: "Electric current is measured in Amperes (A).",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_chemistry",
    nameEn: "General Knowledge — Chemistry",
    conceptTitleEn: "GK — Chemistry Essentials",
    conceptExplanationEn:
      "NDA GK Chemistry covers basic chemical symbols, the pH scale (0-14, with 7 neutral), and atmospheric/atomic composition facts.",
    conceptWorkedExampleEn:
      "Pure water at 25°C has a pH of 7, the neutral point on the 0-14 scale — below 7 is acidic, above 7 is basic (alkaline).",
    conceptCommonMistakeEn:
      "Confusing chemical symbols that don't match their English name's first letter (e.g. Sodium = Na, from Latin \"Natrium\", not \"So\") is a frequent GK trap.",
    questions: [
      {
        key: "nda-gk-chem-01",
        difficulty: "EASY",
        en: "What is the chemical symbol for Sodium?",
        options: ["So", "Sd", "Na", "S"],
        correctIndex: 2,
        explanationEn: "Sodium's symbol, Na, comes from its Latin name \"Natrium\".",
      },
      {
        key: "nda-gk-chem-02",
        difficulty: "MEDIUM",
        en: "What is the pH of pure water at 25°C?",
        options: ["0", "7", "10", "14"],
        correctIndex: 1,
        explanationEn: "Pure water is neutral, sitting at pH 7 on the 0-14 scale.",
      },
      {
        key: "nda-gk-chem-03",
        difficulty: "EASY",
        en: "What is the most abundant gas in Earth's atmosphere?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
        correctIndex: 2,
        explanationEn: "Nitrogen makes up about 78% of Earth's atmosphere, far more than oxygen (~21%).",
      },
      {
        key: "nda-gk-chem-04",
        difficulty: "EASY",
        en: "What is the atomic number of Hydrogen?",
        options: ["0", "1", "2", "8"],
        correctIndex: 1,
        explanationEn: "Hydrogen has 1 proton, giving it atomic number 1 — the first element on the periodic table.",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_general_science",
    nameEn: "General Knowledge — General Science",
    conceptTitleEn: "GK — General Science (Biology & Environment)",
    conceptExplanationEn:
      "NDA GK General Science covers human biology basics (heart, cell structure) and environmental science fundamentals like greenhouse gases.",
    conceptWorkedExampleEn:
      "The human heart has 4 chambers: two atria (upper) and two ventricles (lower), which keep oxygenated and deoxygenated blood separate.",
    conceptCommonMistakeEn:
      "Students sometimes confuse the mitochondria (the cell's energy-producing \"powerhouse\") with the nucleus (the cell's control center holding DNA).",
    questions: [
      {
        key: "nda-gk-sci-01",
        difficulty: "EASY",
        en: "How many chambers does the human heart have?",
        options: ["2", "3", "4", "6"],
        correctIndex: 2,
        explanationEn: "The human heart has 4 chambers: 2 atria and 2 ventricles.",
      },
      {
        key: "nda-gk-sci-02",
        difficulty: "EASY",
        en: "Which cell organelle is known as the \"powerhouse of the cell\"?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
        correctIndex: 1,
        explanationEn: "Mitochondria generate the cell's usable energy (ATP), earning the \"powerhouse\" nickname.",
      },
      {
        key: "nda-gk-sci-03",
        difficulty: "MEDIUM",
        en: "Which vitamin does the human body produce when skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
        correctIndex: 3,
        explanationEn: "Sunlight exposure triggers Vitamin D synthesis in the skin.",
      },
      {
        key: "nda-gk-sci-04",
        difficulty: "MEDIUM",
        en: "Which gas is the primary contributor to the greenhouse effect from human activity?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"],
        correctIndex: 2,
        explanationEn: "Carbon dioxide, released heavily by burning fossil fuels, is the primary human-driven greenhouse gas.",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_history",
    nameEn: "General Knowledge — History & Freedom Movement",
    conceptTitleEn: "GK — Indian History & Freedom Movement",
    conceptExplanationEn:
      "NDA GK History focuses heavily on India's freedom movement: key organizations, movements, and their dates, from the founding of the Indian National Congress through Independence.",
    conceptWorkedExampleEn:
      "The Indian National Congress, founded in 1885, became the principal vehicle of India's independence movement over the following six decades.",
    conceptCommonMistakeEn:
      "Students often mix up the dates of major movements — Dandi March/Salt Satyagraha (1930), Quit India Movement (1942), and Independence (1947) are three distinct, frequently-confused milestones.",
    questions: [
      {
        key: "nda-gk-history-01",
        difficulty: "EASY",
        en: "In which year was the Indian National Congress founded?",
        options: ["1857", "1885", "1905", "1920"],
        correctIndex: 1,
        explanationEn: "The Indian National Congress was founded in 1885.",
      },
      {
        key: "nda-gk-history-02",
        difficulty: "MEDIUM",
        en: "In which year was the Quit India Movement launched?",
        options: ["1930", "1935", "1942", "1947"],
        correctIndex: 2,
        explanationEn: "The Quit India Movement was launched by Gandhi in August 1942.",
      },
      {
        key: "nda-gk-history-03",
        difficulty: "MEDIUM",
        en: "The Dandi March (Salt Satyagraha) took place in which year?",
        options: ["1920", "1930", "1942", "1946"],
        correctIndex: 1,
        explanationEn: "Gandhi led the Dandi March in 1930 to protest the British salt tax.",
      },
      {
        key: "nda-gk-history-04",
        difficulty: "EASY",
        en: "On which date did India gain independence?",
        options: ["26 January 1950", "15 August 1947", "2 October 1947", "15 August 1950"],
        correctIndex: 1,
        explanationEn: "India gained independence on 15 August 1947 (Republic Day, 26 January 1950, is a separate later milestone).",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_geography",
    nameEn: "General Knowledge — Geography",
    conceptTitleEn: "GK — Physical, Indian & World Geography",
    conceptExplanationEn:
      "NDA GK Geography covers Indian physical geography (rivers, mountains, deserts) alongside major world geography landmarks.",
    conceptWorkedExampleEn:
      "The Ganga is India's longest river, flowing roughly 2,525 km from the Himalayas to the Bay of Bengal.",
    conceptCommonMistakeEn:
      "Students sometimes confuse India's longest river (the Ganga) with its longest river entirely within Indian territory or its largest river by discharge (the Brahmaputra) — these are three different superlatives.",
    questions: [
      {
        key: "nda-gk-geo-01",
        difficulty: "EASY",
        en: "Which is the longest river in India?",
        options: ["Yamuna", "Godavari", "Ganga", "Krishna"],
        correctIndex: 2,
        explanationEn: "The Ganga, at about 2,525 km, is India's longest river.",
      },
      {
        key: "nda-gk-geo-02",
        difficulty: "MEDIUM",
        en: "Which of these lines of latitude passes through India?",
        options: ["Equator", "Tropic of Cancer", "Tropic of Capricorn", "Arctic Circle"],
        correctIndex: 1,
        explanationEn: "The Tropic of Cancer passes through the middle of India, through states like Gujarat, MP, and West Bengal.",
      },
      {
        key: "nda-gk-geo-03",
        difficulty: "EASY",
        en: "What is the highest mountain peak in the world?",
        options: ["K2", "Kangchenjunga", "Mount Everest", "Nanga Parbat"],
        correctIndex: 2,
        explanationEn: "Mount Everest, in the Himalayas on the Nepal-China border, is Earth's highest peak at 8,849 m.",
      },
      {
        key: "nda-gk-geo-04",
        difficulty: "MEDIUM",
        en: "The Thar Desert is located in which Indian state?",
        options: ["Gujarat", "Rajasthan", "Punjab", "Haryana"],
        correctIndex: 1,
        explanationEn: "The Thar Desert (Great Indian Desert) lies mostly in Rajasthan.",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "nda_gk_current_events",
    nameEn: "General Knowledge — Current & National Affairs",
    conceptTitleEn: "GK — National Institutions & Governance",
    conceptExplanationEn:
      "NDA GK Current Events leans heavily on durable civic/institutional facts (who conducts what, how bodies are structured) rather than fast-changing news — the kind of fact an exam can rely on staying stable for years.",
    conceptWorkedExampleEn:
      "The Union Public Service Commission (UPSC) conducts the NDA exam itself, twice a year, alongside CDS, Civil Services, and other national exams.",
    conceptCommonMistakeEn:
      "Students sometimes confuse the Chief of Defence Staff (a single officer post created in 2019, integrating the three services) with the individual service chiefs (Army/Navy/Air Force each have their own separate Chief of Staff).",
    questions: [
      {
        key: "nda-gk-current-01",
        difficulty: "EASY",
        en: "Which organization conducts the NDA entrance exam?",
        options: ["SSC", "UPSC", "NTA", "IB"],
        correctIndex: 1,
        explanationEn: "The Union Public Service Commission (UPSC) conducts the NDA exam twice a year.",
      },
      {
        key: "nda-gk-current-02",
        difficulty: "EASY",
        en: "The Indian Parliament's two houses are the Lok Sabha and the:",
        options: ["Vidhan Sabha", "Rajya Sabha", "Gram Sabha", "Lok Adalat"],
        correctIndex: 1,
        explanationEn: "India's Parliament is bicameral: the Lok Sabha (House of the People) and the Rajya Sabha (Council of States).",
      },
      {
        key: "nda-gk-current-03",
        difficulty: "MEDIUM",
        en: "In which year was the post of Chief of Defence Staff (CDS) created in India?",
        options: ["2014", "2016", "2019", "2021"],
        correctIndex: 2,
        explanationEn: "India created the Chief of Defence Staff post in 2019 to integrate leadership across the three armed services.",
      },
      {
        key: "nda-gk-current-04",
        difficulty: "EASY",
        en: "What is India's national space agency called?",
        options: ["DRDO", "ISRO", "BARC", "NASA"],
        correctIndex: 1,
        explanationEn: "ISRO (Indian Space Research Organisation) is India's national space agency.",
      },
    ],
  },
];

async function main() {
  const sectionCache = new Map<string, string>();
  async function sectionId(key: TopicSeed["sectionKey"]): Promise<string> {
    const cached = sectionCache.get(key);
    if (cached) return cached;
    const section = await prisma.section.findUniqueOrThrow({ where: { key } });
    sectionCache.set(key, section.id);
    return section.id;
  }

  let topicCount = 0;
  let questionCount = 0;
  let noteCount = 0;

  for (const t of NDA_TOPICS) {
    const secId = await sectionId(t.sectionKey);

    const topic = await prisma.topic.upsert({
      where: { sectionId_key: { sectionId: secId, key: t.topicKey } },
      update: { name: { en: t.nameEn }, targetExam: "NDA" },
      create: {
        sectionId: secId,
        key: t.topicKey,
        name: { en: t.nameEn },
        targetExam: "NDA",
      },
    });
    topicCount++;

    for (const q of t.questions) {
      await prisma.question.upsert({
        where: { key: q.key },
        update: {
          topicId: topic.id,
          difficulty: q.difficulty,
          content: { en: q.en },
          options: q.options.map((text, i) => ({ id: OPTION_IDS[i] ?? OPTION_IDS[0], text: { en: text } })),
          correctOption: OPTION_IDS[q.correctIndex] ?? OPTION_IDS[0],
          explanation: { en: q.explanationEn },
          targetExam: "NDA",
        },
        create: {
          key: q.key,
          topicId: topic.id,
          difficulty: q.difficulty,
          content: { en: q.en },
          options: q.options.map((text, i) => ({ id: OPTION_IDS[i] ?? OPTION_IDS[0], text: { en: text } })),
          correctOption: OPTION_IDS[q.correctIndex] ?? OPTION_IDS[0],
          explanation: { en: q.explanationEn },
          targetExam: "NDA",
        },
      });
      questionCount++;
    }

    await prisma.conceptNote.upsert({
      where: { topicId_subConceptKey: { topicId: topic.id, subConceptKey: "overview" } },
      update: {
        title: { en: t.conceptTitleEn },
        body: {
          en: {
            explanation: t.conceptExplanationEn,
            workedExample: t.conceptWorkedExampleEn,
            commonMistake: t.conceptCommonMistakeEn,
          },
        },
      },
      create: {
        topicId: topic.id,
        subConceptKey: "overview",
        title: { en: t.conceptTitleEn },
        body: {
          en: {
            explanation: t.conceptExplanationEn,
            workedExample: t.conceptWorkedExampleEn,
            commonMistake: t.conceptCommonMistakeEn,
          },
        },
        status: "DRAFT",
      },
    });
    noteCount++;
  }

  console.log(`Seeded ${topicCount} NDA topics, ${questionCount} questions, ${noteCount} concept notes.`);
}

main().finally(() => prisma.$disconnect());

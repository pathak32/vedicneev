import type { Metadata } from "next";

const title = "Disclaimer";
const description =
  "VedicNeev Typing Test is an independent practice platform, not affiliated with RRB, any High Court, UPSSSC, or any other exam-conducting authority.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/disclaimer", languages: { en: "/disclaimer", hi: "/hi/disclaimer" } },
  openGraph: { title, description, url: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Disclaimer
        </h1>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <h2>Independent Practice Platform</h2>
        <p>
          VedicNeev Typing Test is an independent, privately-operated typing practice platform. We are not
          affiliated with, endorsed by, or officially connected to the Railway Recruitment Board (RRB), the
          Allahabad High Court, the Patna High Court, the UP Subordinate Services Selection Commission (UPSSSC),
          the UP Police Recruitment and Promotion Board, or any other government body that conducts a typing skill
          test. Exam names referenced on this site are for identification purposes only.
        </p>

        <h2>Practice Passages, Not Official Test Material</h2>
        <p>
          Every passage in our catalog is original practice content modeled on each exam's known duration,
          backspace policy, and layout requirements — not a leaked or officially issued exam passage. Exam rules
          (duration, backspace policy, required layout) can be revised by the conducting authority at any time;
          always verify against the current official notification before an exam-day decision.
        </p>

        <h2>Speed &amp; Accuracy Are Practice Metrics</h2>
        <p>
          Gross Speed, Net Speed, Accuracy, and Mistake counts are computed using the standard
          5-key-depressions-per-word government formula against our own passages. They are a practice benchmark,
          not an official or guaranteed result on your actual exam.
        </p>

        <p className="text-sm text-muted-foreground">
          See also our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms &amp; Conditions</a>.
        </p>
      </div>
    </article>
  );
}

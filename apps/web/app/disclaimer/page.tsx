import type { Metadata } from "next";

const title = "Disclaimer";
const description =
  "Vedic Neev is an independent exam-preparation platform, not affiliated with or endorsed by Navodaya Vidyalaya Samiti, the Sainik Schools Society, or any official exam-conducting body.";

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
          Vedic Neev is an independent, privately-operated exam-preparation platform. We are not affiliated with,
          endorsed by, or officially connected to Navodaya Vidyalaya Samiti (NVS), the Sainik Schools Society, the
          Directorate General of Military Training, or any other government body that conducts JNVST, AISSEE, RMS,
          or comparable school entrance examinations. Any exam names, acronyms, or references used on this site are
          for identification and educational purposes only.
        </p>

        <h2>Practice Content, Not Official Material</h2>
        <p>
          Our question bank, mock tests, and exam-pattern figures are original practice material modeled on each
          exam&apos;s commonly published section structure and difficulty pattern — they are not leaked, licensed,
          or reproduced official past papers, unless a specific item is explicitly labeled otherwise. Exam patterns,
          syllabi, and eligibility criteria can be revised by the conducting authority at any time; always verify
          against the current year&apos;s official notification before relying on anything here for an exam-day
          decision.
        </p>

        <h2>No Guarantee of Outcome</h2>
        <p>
          Scores, percentiles, admission-probability estimates, and Mistake Vault categorizations are study aids
          derived from your responses and, where shown, publicly available historical data. They are estimates, not
          predictions or guarantees, and Vedic Neev makes no representation that using this platform will result in
          selection, admission, or any particular exam outcome.
        </p>

        <p className="text-sm text-muted-foreground">
          See also our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.
        </p>
      </div>
    </article>
  );
}

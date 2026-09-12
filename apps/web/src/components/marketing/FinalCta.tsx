import Link from "next/link";
import { Button } from "@vedicneev/ui";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { useT } from "@/lib/i18n/useT";

export function FinalCta() {
  const t = useT();

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
      <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center md:p-14">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("finalCtaHeading")}</h2>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">{t("finalCtaSubheading")}</p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/#exam-boards">
            {t("finalCtaButton")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}

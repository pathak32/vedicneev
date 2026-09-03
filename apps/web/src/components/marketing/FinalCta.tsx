import Link from "next/link";
import { Button } from "@vedicneev/ui";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
      <Reveal className="flex flex-col items-center gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center md:p-14">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Ready to see where your child actually stands?
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          One free full-length mock test, instant diagnostics, and a Mistake Vault that keeps working
          long after the test is over.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/exam/demo-jnvst">
            Start your free mock test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}

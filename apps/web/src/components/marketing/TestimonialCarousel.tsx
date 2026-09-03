"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, cn } from "@vedicneev/ui";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { SAMPLE_TESTIMONIALS } from "@/lib/marketing/testimonials";

const AUTO_ADVANCE_MS = 6000;

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SAMPLE_TESTIMONIALS.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  function goTo(next: number) {
    setIndex(((next % count) + count) % count);
  }

  if (count === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
      <Reveal className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">What families are saying</h2>
      </Reveal>

      <Reveal className="relative">
        {/* Pause auto-advance while a visitor is actually reading — mouse for desktop, focus for keyboard nav through the buttons/dots. */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Card className="overflow-hidden">
            <CardContent className="relative p-8 md:p-10">
              <Quote className="h-8 w-8 text-primary/30" />
              <div
                className="mt-4 flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {SAMPLE_TESTIMONIALS.map((testimonial) => (
                  <div key={testimonial.name + testimonial.quote} className="w-full shrink-0 grow-0 basis-full">
                    <p className="text-lg leading-relaxed text-foreground md:text-xl">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {testimonial.initials}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {count > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous testimonial"
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                {SAMPLE_TESTIMONIALS.map((testimonial, i) => (
                  <button
                    key={testimonial.name + testimonial.quote}
                    type="button"
                    aria-label={`Show testimonial ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next testimonial"
                onClick={() => goTo(index + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

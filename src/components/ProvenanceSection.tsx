"use client";

import { useRef } from "react";
import Image from "next/image";
import { PROVENANCE } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { revealLines, revealUp, useGsap } from "@/lib/motion";

/**
 * Section 07 — Provenance.
 *
 * The credibility section, so it is built out of restraint: one statement at
 * display size with a champagne rule holding its left edge, the attribution
 * set small in mono beneath it, and the credits and recognition kept as plain
 * hairline-ruled rows. Nothing here competes with the sentence.
 */
export function ProvenanceSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const quoteRef = useRef<HTMLQuoteElement | null>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const creditsRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<HTMLDivElement | null>(null);

  useGsap(
    () => {
      const quote = quoteRef.current;
      if (quote) {
        // The typographic moment of the section: the statement rises out of
        // its own line masks before anything else here moves.
        revealLines(quote.querySelector("[data-quote-text]"), { start: "top 82%" });
        revealUp(quote.querySelectorAll("[data-attribution]"), {
          y: 18,
          stagger: 0.08,
          trigger: quote,
          start: "top 68%",
          delay: 0.25,
        });
      }

      revealUp(figureRef.current, {
        y: 44,
        trigger: figureRef.current,
        start: "top 88%",
      });

      const credits = creditsRef.current;
      if (credits) {
        revealUp(credits.querySelectorAll("[data-credit-row]"), {
          y: 24,
          stagger: 0.09,
          trigger: credits,
          start: "top 86%",
        });
      }

      const recognition = recognitionRef.current;
      if (recognition) {
        revealUp(recognition.querySelectorAll("[data-recognition-row]"), {
          y: 24,
          stagger: 0.1,
          trigger: recognition,
          start: "top 86%",
        });
      }
    },
    rootRef,
    []
  );

  return (
    <section
      ref={rootRef}
      id="provenance"
      className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="07" eyebrow="Provenance" title="Who Built It" className="mb-16" />

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ---------------------------------------------------------- */}
          {/* The statement                                               */}
          {/* ---------------------------------------------------------- */}
          <blockquote ref={quoteRef} className="relative pl-7 md:pl-10 lg:col-span-7">
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-0 w-px bg-gradient-to-b from-champagne via-bronze to-transparent"
            />

            <p
              data-quote-text
              className="font-display max-w-4xl text-[clamp(1.6rem,3.2vw,2.6rem)] font-light italic leading-[1.3] text-bone"
            >
              {PROVENANCE.statement}
            </p>

            <footer className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 md:mt-11">
              <span
                data-attribution
                aria-hidden="true"
                className="h-px w-8 shrink-0 bg-hairline-strong"
              />
              <cite
                data-attribution
                className="font-mono text-[11px] uppercase not-italic tracking-[0.2em] text-bone"
              >
                {PROVENANCE.architect}
              </cite>
              <span
                data-attribution
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-dim"
              >
                {PROVENANCE.role}, {PROVENANCE.studio}
              </span>
            </footer>
          </blockquote>

          {/* ---------------------------------------------------------- */}
          {/* The house itself                                            */}
          {/* ---------------------------------------------------------- */}
          <figure
            ref={figureRef}
            className="rounded-card relative overflow-hidden border border-hairline lg:col-span-5"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[3/2] lg:aspect-[4/5]">
              <Image
                src="/stills/corridor.webp"
                alt="The oak circulation spine running through Villa Horizon."
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
              />
            </div>
          </figure>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Credits and recognition                                       */}
        {/* ------------------------------------------------------------ */}
        <div className="mt-20 grid grid-cols-1 gap-12 border-t border-hairline-soft pt-14 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          <div ref={creditsRef} className="lg:col-span-7">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne">
              Credits
            </h3>

            <dl className="mt-6 border-t border-hairline">
              {PROVENANCE.credits.map((credit) => (
                <div
                  key={credit.label}
                  data-credit-row
                  className="flex items-baseline justify-between gap-6 border-b border-hairline-soft py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-dim">
                    {credit.label}
                  </dt>
                  <dd className="text-sm font-light text-bone md:text-[0.95rem]">{credit.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div ref={recognitionRef} className="lg:col-span-5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne">
              Recognition
            </h3>

            <ul className="mt-6 border-t border-hairline">
              {PROVENANCE.recognition.map((item) => (
                <li
                  key={item}
                  data-recognition-row
                  className="flex items-start gap-4 border-b border-hairline-soft py-4"
                >
                  <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-champagne" />
                  <span className="text-sm font-light leading-relaxed text-stone">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

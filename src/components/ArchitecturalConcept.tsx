"use client";

import React, { useRef, useState } from "react";
import { CONCEPT_FEATURES, type ConceptFeature } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  EASE,
  Flip,
  countUp,
  prefersReducedMotion,
  revealUp,
  transitionPanel,
  useGsap,
} from "@/lib/motion";

/**
 * Two framing figures that sit beside the section headline. They belong to the
 * section rather than to any one principle, so they live here — every piece of
 * feature copy still comes from villa.ts.
 */
const QUICK_STATS = [
  { id: "ceiling", value: 6.5, precision: 1, suffix: " m", label: "Ceiling clearance" },
  { id: "carbon", value: 0, precision: 1, suffix: "", label: "Carbon footprint" },
];

/** Mirrors the formatter inside countUp so SSR and the final frame agree. */
function formatValue(value: number, precision: number, prefix = "", suffix = "") {
  return (
    prefix +
    value.toLocaleString("en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) +
    suffix
  );
}

const formatStat = (feature: ConceptFeature) =>
  formatValue(feature.statValue, feature.statPrecision, feature.statPrefix, feature.statSuffix);

/**
 * Section 01 — the design philosophy, read through three principles.
 *
 * The tab strip carries a single champagne underline that glides between tabs:
 * Flip records the indicator box, the new geometry is written straight to the
 * inline style, and Flip.from covers the distance. One rule travels along the
 * hairline instead of a border blinking from one tab to the next.
 *
 * Panel copy crossfades through transitionPanel, and the key metric re-counts
 * on every switch — immediately, because by then the reader is already looking
 * at it and a scroll trigger would never fire a second time.
 */
export function ArchitecturalConcept() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const quickStripRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const quickRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const statRef = useRef<HTMLParagraphElement | null>(null);
  /** Null until the first layout pass, so mount neither glides nor re-counts. */
  const lastIndexRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = CONCEPT_FEATURES[activeIndex];

  /* Scroll-in behaviour. Mount only — a tab switch must not re-trigger it. */
  useGsap(
    () => {
      const section = sectionRef.current;
      const panel = panelRef.current;
      const strip = quickStripRef.current;
      if (!section || !panel) return;

      revealUp(section.querySelectorAll("[data-reveal]"), {
        y: 24,
        stagger: 0.1,
        trigger: section,
        start: "top 76%",
      });
      revealUp(panel, { y: 40, trigger: panel, start: "top 84%" });

      QUICK_STATS.forEach((stat, i) => {
        countUp(quickRefs.current[i], stat.value, {
          precision: stat.precision,
          suffix: stat.suffix,
          duration: 1.4,
          trigger: strip ?? section,
        });
      });

      const first = CONCEPT_FEATURES[0];
      countUp(statRef.current, first.statValue, {
        prefix: first.statPrefix,
        suffix: first.statSuffix,
        precision: first.statPrecision,
        trigger: panel,
      });

      // The indicator is measured, so it has to be re-measured whenever the
      // strip reflows: on resize, and once the display face has actually loaded.
      const remeasure = () => {
        const el = indicatorRef.current;
        const btn = tabRefs.current[lastIndexRef.current ?? 0];
        if (!el || !btn) return;
        el.style.left = btn.offsetLeft + "px";
        el.style.width = btn.offsetWidth + "px";
      };

      window.addEventListener("resize", remeasure);
      if (typeof document !== "undefined" && document.fonts?.status !== "loaded") {
        document.fonts.ready.then(remeasure);
      }
      return () => window.removeEventListener("resize", remeasure);
    },
    sectionRef,
    []
  );

  /* Indicator glide + metric re-count, once per selection. */
  useGsap(
    () => {
      const indicator = indicatorRef.current;
      const button = tabRefs.current[activeIndex];
      if (!indicator || !button) return;

      const previous = lastIndexRef.current;
      lastIndexRef.current = activeIndex;
      const changed = previous !== null && previous !== activeIndex;

      // Capture before the geometry moves, then let Flip cover the distance.
      // Plain style writes rather than gsap.set: a context revert must never
      // drag the indicator back to where it started the session.
      const state = changed && !prefersReducedMotion() ? Flip.getState(indicator) : null;
      indicator.style.left = button.offsetLeft + "px";
      indicator.style.width = button.offsetWidth + "px";
      if (state) Flip.from(state, { duration: 0.7, ease: EASE.out });

      if (!changed) return;

      const feature = CONCEPT_FEATURES[activeIndex];
      countUp(statRef.current, feature.statValue, {
        prefix: feature.statPrefix,
        suffix: feature.statSuffix,
        precision: feature.statPrecision,
        duration: 1.1,
        immediate: true,
      });
    },
    sectionRef,
    [activeIndex]
  );

  const select = (index: number) => {
    if (index === activeIndex) return;
    transitionPanel(panelRef.current, () => setActiveIndex(index));
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = CONCEPT_FEATURES.length;
    let next = -1;

    if (event.key === "ArrowRight") next = (activeIndex + 1) % count;
    else if (event.key === "ArrowLeft") next = (activeIndex - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;

    if (next < 0) return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    select(next);
  };

  return (
    <section
      ref={sectionRef}
      id="concept"
      className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid gap-12 lg:mb-20 lg:grid-cols-12 lg:items-end lg:gap-16">
          <SectionHeader
            index="01"
            eyebrow="Philosophy & Vision"
            title="Sculpted for Generations"
            lede="Villa Horizon is where precision engineering meets uncompromised natural elegance — a house designed to outlast its owners."
            className="lg:col-span-7"
          />

          <div
            ref={quickStripRef}
            data-reveal
            className="grid grid-cols-2 gap-8 lg:col-span-5 lg:gap-12"
          >
            {QUICK_STATS.map((stat, i) => (
              <div key={stat.id} className="border-t border-hairline-soft pt-5">
                <p
                  ref={(node) => {
                    quickRefs.current[i] = node;
                  }}
                  className="font-display tabular text-[clamp(1.75rem,3vw,2.35rem)] font-light leading-none text-bone"
                >
                  {formatValue(stat.value, stat.precision, "", stat.suffix)}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab strip — one hairline, one travelling champagne rule. */}
        <div data-reveal className="mb-12 md:mb-16">
          <div className="no-scrollbar -mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
            <div
              role="tablist"
              aria-label="Design principles"
              onKeyDown={onTabKeyDown}
              className="relative flex min-w-max items-end gap-8 border-b border-hairline-soft md:min-w-full md:gap-14"
            >
              {CONCEPT_FEATURES.map((feature, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    role="tab"
                    id={"concept-tab-" + feature.id}
                    aria-selected={isActive}
                    aria-controls="concept-panel"
                    tabIndex={isActive ? 0 : -1}
                    data-cursor-hover
                    onClick={() => select(i)}
                    ref={(node) => {
                      tabRefs.current[i] = node;
                    }}
                    className={
                      "group flex min-h-[56px] items-center gap-3 whitespace-nowrap pb-5 pt-4 text-left transition-colors duration-500 md:gap-4 " +
                      (isActive ? "text-champagne" : "text-stone hover:text-bone")
                    }
                  >
                    {/* Line length, not colour alone, carries the state. */}
                    <span aria-hidden="true" className="flex h-4 w-6 flex-none items-center">
                      <span
                        className={
                          "h-px transition-all duration-500 " +
                          (isActive ? "w-6 bg-champagne" : "w-2 bg-stone-dim group-hover:w-4")
                        }
                      />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] md:text-xs">
                      {feature.title}
                    </span>
                  </button>
                );
              })}

              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-champagne"
              />
            </div>
          </div>
        </div>

        <div
          ref={panelRef}
          role="tabpanel"
          id="concept-panel"
          aria-labelledby={"concept-tab-" + active.id}
          tabIndex={0}
          className="glass rounded-card p-8 md:p-12 lg:p-14"
        >
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p data-panel-item className="eyebrow">
                {active.subtitle}
              </p>

              <h3
                data-panel-item
                className="font-display mt-5 max-w-xl text-[clamp(1.75rem,3.2vw,2.5rem)] font-light leading-[1.1] text-bone text-balance"
              >
                {active.title}
              </h3>

              <p
                data-panel-item
                className="mt-6 max-w-xl text-base font-light leading-relaxed text-stone"
              >
                {active.description}
              </p>

              <ul data-panel-item className="mt-10 space-y-4 border-t border-hairline-soft pt-7">
                {active.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-5">
                    <span
                      aria-hidden="true"
                      className="mt-[0.7rem] h-px w-6 flex-none bg-champagne"
                    />
                    <span className="text-[0.95rem] font-light leading-relaxed text-stone">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The separator turns with the layout: a rule above on small
                screens, a rule beside the copy once the columns split. */}
            <div className="flex flex-col justify-between gap-12 border-t border-hairline-soft pt-10 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0 xl:pl-16">
              <div>
                <span aria-hidden="true" className="mb-8 hidden h-px w-16 bg-bronze lg:block" />

                <p
                  ref={statRef}
                  data-panel-item
                  className="font-display tabular text-[clamp(3.5rem,7vw,4.75rem)] font-light leading-[0.92] text-bone"
                >
                  {formatStat(active)}
                </p>

                <p
                  data-panel-item
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-stone"
                >
                  {active.statLabel}
                </p>
              </div>

              <p
                data-panel-item
                className="font-mono tabular text-[10px] uppercase tracking-[0.24em] text-stone-dim"
              >
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(CONCEPT_FEATURES.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

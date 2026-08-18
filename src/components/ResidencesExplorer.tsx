"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SUITES, formatPrice, type ResidenceSuite } from "@/data/villa";
import {
  ScrollTrigger,
  countUp,
  drawPlan,
  gsap,
  magnetic,
  prefersReducedMotion,
  revealBatch,
  revealUp,
  transitionPanel,
  useGsap,
} from "@/lib/motion";

/** Sheet count printed on the drawing caption — derived, never hardcoded. */
const SHEET_TOTAL = String(SUITES.length).padStart(2, "0");

/**
 * The room labels live inside the SVG, so the drawing carries its own
 * description rather than being announced as an unlabelled graphic.
 */
function planAriaLabel(suite: ResidenceSuite) {
  const rooms = suite.plan.labels.map((label) => label.text.toLowerCase()).join(", ");
  return `Floor plan of ${suite.name}. Marked areas: ${rooms}.`;
}

function BedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-bronze"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M2 19V7M2 15h20v4M2 12h9v3M13 12h9" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-bronze"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M2 13h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4zM6 13V6a2 2 0 0 1 4 0M4 21l1-1M20 21l-1-1" />
    </svg>
  );
}

/**
 * Section 02 — the residence tiers.
 *
 * The plan is the centrepiece: shell, partitions and fixtures are separate
 * paths so DrawSVG can line them on in that order ("structure, then rooms"),
 * with the annotations settling in once the ink is down. The same sequence
 * replays on every suite change, and the guide price counts alongside it.
 */
export function ResidencesExplorer() {
  const [activeId, setActiveId] = useState<string>(SUITES[0].id);
  const activeIndex = Math.max(
    0,
    SUITES.findIndex((entry) => entry.id === activeId)
  );
  const suite = SUITES[activeIndex];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const planCardRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const priceRef = useRef<HTMLSpanElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Plan segments in draw order: shell, then partitions, then fixtures. */
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  /** Written only from the click handler, so the scroll trigger can fire late
   *  and still draw whichever tier is on screen. */
  const activeIdRef = useRef(SUITES[0].id);
  const drawnRef = useRef(false);

  const orderedPaths = (target: ResidenceSuite) => {
    const total = 1 + target.plan.partitions.length + target.plan.fixtures.length;
    return pathRefs.current
      .slice(0, total)
      .filter((path): path is SVGPathElement => path !== null);
  };

  const planParts = (selector: string) =>
    svgRef.current ? Array.from(svgRef.current.querySelectorAll<SVGElement>(selector)) : [];

  /**
   * Blank the sheet: strokes lifted, washes and labels dark. Runs pre-paint at
   * mount and on any tier change made before the drawing has been reached, so
   * the plan is never caught half-inked. Left alone under reduced motion.
   */
  const resetPlan = (target: ResidenceSuite) => {
    if (prefersReducedMotion()) return;

    const paths = orderedPaths(target);
    if (paths.length) gsap.set(paths, { drawSVG: "0%" });

    const annotations = [...planParts("[data-plan-wash]"), ...planParts("[data-plan-label]")];
    if (annotations.length) gsap.set(annotations, { autoAlpha: 0 });
  };

  /** Draw the plan, settle the annotations, run the price. */
  const playSuite = (target: ResidenceSuite) => {
    drawPlan(orderedPaths(target), { stagger: 0.12 });

    const washes = planParts("[data-plan-wash]");
    if (washes.length) revealUp(washes, { y: 0, delay: 0.85 });

    const labels = planParts("[data-plan-label]");
    if (labels.length) revealUp(labels, { y: 6, stagger: 0.07, delay: 0.95 });

    countUp(priceRef.current, target.priceValue, {
      prefix: "$",
      precision: 0,
      duration: 1.4,
      immediate: true,
    });
  };

  useGsap(
    (ctx) => {
      const cards = cardRefs.current.filter(
        (card): card is HTMLButtonElement => card !== null
      );
      if (cards.length) revealBatch(cards, { y: 32, stagger: 0.1, start: "top 88%" });

      const columns = detailRef.current
        ? Array.from(detailRef.current.querySelectorAll<HTMLElement>("[data-detail-col]"))
        : [];
      if (columns.length) {
        revealUp(columns, {
          y: 30,
          stagger: 0.12,
          start: "top 84%",
          trigger: detailRef.current,
        });
      }

      resetPlan(suite);

      const trigger = planCardRef.current;
      if (!trigger) return;

      const st = ScrollTrigger.create({
        trigger,
        start: "top 78%",
        once: true,
        onEnter: () => {
          drawnRef.current = true;
          const onScreen = SUITES.find((entry) => entry.id === activeIdRef.current) ?? SUITES[0];
          ctx.add(() => playSuite(onScreen));
        },
      });

      return () => st.kill();
    },
    sectionRef,
    []
  );

  // Every suite change redraws the plan from nothing, in the same order.
  useGsap(
    () => {
      if (drawnRef.current) {
        playSuite(suite);
        return;
      }
      // Switched before the sheet was ever reached — keep it blank for the draw.
      resetPlan(suite);
    },
    sectionRef,
    [activeId]
  );

  useEffect(() => magnetic(ctaRef.current, 0.3), []);

  const selectSuite = (id: string) => {
    if (id === activeId) return;
    activeIdRef.current = id;
    transitionPanel(detailRef.current, () => setActiveId(id));
  };

  return (
    <section id="residences" className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <SectionHeader
          index="02"
          eyebrow="Residences & Floor Plans"
          title="Bespoke Living Spaces"
          lede="Three architectural tiers, each shaped around privacy, natural light and the line of the ridge."
          className="mb-16"
        />

        {/* ----------------------------------------------------------- */}
        {/* Tier selector                                                */}
        {/* ----------------------------------------------------------- */}
        <div
          role="group"
          aria-label="Choose a residence tier"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {SUITES.map((entry, i) => {
            const isActive = entry.id === activeId;
            const isReserved = entry.status === "Reserved";

            return (
              <button
                key={entry.id}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                type="button"
                data-reveal
                data-cursor-hover
                aria-pressed={isActive}
                aria-controls="residence-detail"
                onClick={() => selectSuite(entry.id)}
                className={`group relative flex min-h-[7.5rem] flex-col justify-between gap-6 rounded-card border p-6 text-left transition-colors duration-500 ${
                  isActive
                    ? "border-champagne/55 bg-surface/70"
                    : "border-hairline-soft bg-surface/25 hover:border-hairline hover:bg-surface/45"
                }`}
              >
                {/* Corner registration mark — the active state is a drawn form, not a hue */}
                <span
                  aria-hidden="true"
                  className={`absolute right-3 top-3 block h-5 w-px origin-top bg-champagne transition-transform duration-500 ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute right-3 top-3 block h-px w-5 origin-right bg-champagne transition-transform duration-500 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />

                <span className="block pr-10 font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                  {entry.level}
                </span>

                <span className="block">
                  <span
                    className={`font-display block text-xl font-light leading-tight transition-colors duration-500 ${
                      isActive ? "text-bone" : "text-bone/80 group-hover:text-bone"
                    }`}
                  >
                    {entry.name}
                  </span>

                  <span className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.1em] text-stone-dim">
                      {entry.area}
                    </span>

                    <span
                      className={`inline-flex items-center gap-2 rounded-pill border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                        isReserved
                          ? "border-hairline bg-bone/[0.04] text-stone"
                          : "border-champagne/35 text-champagne"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`block h-1.5 w-1.5 rounded-pill ${
                          isReserved ? "border border-stone" : "bg-champagne"
                        }`}
                      />
                      {entry.status}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Detail — the drawing on the left, the specification right    */}
        {/* ----------------------------------------------------------- */}
        <div
          ref={detailRef}
          id="residence-detail"
          className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12"
        >
          <div data-detail-col className="flex flex-col gap-6 lg:col-span-7">
            {/* Image band — crossfades between tiers */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-hairline-soft bg-ink-deep">
              {SUITES.map((entry) => (
                <Image
                  key={entry.id}
                  src={`/stills/${entry.still}.webp`}
                  alt={`${entry.name} — interior view`}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className={`object-cover transition-opacity duration-1000 ${
                    entry.id === activeId ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 p-5 md:p-6">
                <span
                  data-panel-item
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne"
                >
                  {suite.level}
                </span>
                <span data-panel-item className="font-mono text-[10px] tracking-[0.1em] text-stone">
                  {suite.area}
                </span>
              </div>
            </div>

            {/* The drawing */}
            <figure
              ref={planCardRef}
              className="glass rounded-card relative overflow-hidden p-6 md:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-champagne via-bronze to-transparent"
              />

              <figcaption className="mb-6 flex items-baseline justify-between gap-4 border-b border-hairline-soft pb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Floor plan
                </span>
                <span
                  data-panel-item
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim"
                >
                  Sheet {String(activeIndex + 1).padStart(2, "0")} / {SHEET_TOTAL}
                </span>
              </figcaption>

              <svg
                ref={svgRef}
                viewBox="0 0 400 260"
                role="img"
                aria-label={planAriaLabel(suite)}
                className="block h-auto w-full"
              >
                <defs>
                  <pattern
                    id="residence-plan-grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M20 0H0V20"
                      fill="none"
                      stroke="var(--color-champagne)"
                      strokeOpacity="0.32"
                      strokeWidth="0.6"
                      strokeDasharray="1.5 4.5"
                    />
                  </pattern>

                  <radialGradient id="residence-plan-falloff" cx="50%" cy="50%" r="78%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>

                  <mask id="residence-plan-mask">
                    <rect width="400" height="260" fill="url(#residence-plan-falloff)" />
                  </mask>
                </defs>

                {/* Survey grid, fading away from the centre of the sheet */}
                <rect
                  width="400"
                  height="260"
                  fill="url(#residence-plan-grid)"
                  mask="url(#residence-plan-mask)"
                />

                {/* Floorplate and fixture washes — they settle in with the labels */}
                <g data-plan-wash>
                  <path
                    d={suite.plan.shell}
                    fill="var(--color-champagne)"
                    fillOpacity="0.022"
                    stroke="none"
                  />
                  {suite.plan.fixtures.map((d, i) => (
                    <path
                      key={`wash-${i}`}
                      d={d}
                      fill="var(--color-champagne)"
                      fillOpacity="0.06"
                      stroke="none"
                    />
                  ))}
                </g>

                {/* Sheet furniture: corner ticks, overall dimension, scale bar */}
                {/* vector-effect does not inherit, so it sits on each path */}
                <g stroke="var(--color-champagne)" strokeOpacity="0.28" strokeWidth="1" fill="none">
                  <path
                    d="M12 24h6M24 12v6M388 24h-6M376 12v6M12 236h6M24 248v-6M388 236h-6M376 248v-6"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path d="M24 9v8M376 9v8M24 13h112M264 13h112" vectorEffect="non-scaling-stroke" />
                  <path
                    d="M24 249h60M24 245v8M54 247v4M84 245v8"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>

                <text
                  data-plan-label
                  x="200"
                  y="13"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono"
                  fontSize="7"
                  letterSpacing="0.16em"
                  fill="var(--color-stone-dim)"
                >
                  {suite.area}
                </text>

                <text
                  x="24"
                  y="241"
                  className="font-mono"
                  fontSize="6"
                  letterSpacing="0.14em"
                  fill="var(--color-stone-dim)"
                >
                  0
                </text>
                <text
                  x="84"
                  y="241"
                  textAnchor="end"
                  className="font-mono"
                  fontSize="6"
                  letterSpacing="0.14em"
                  fill="var(--color-stone-dim)"
                >
                  5 M
                </text>

                {/* 1 — the shell */}
                <path
                  ref={(node) => {
                    pathRefs.current[0] = node;
                  }}
                  d={suite.plan.shell}
                  fill="none"
                  stroke="var(--color-champagne)"
                  strokeOpacity="0.9"
                  strokeWidth="1.2"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                />

                {/* 2 — the partitions */}
                {suite.plan.partitions.map((d, i) => (
                  <path
                    key={`partition-${i}`}
                    ref={(node) => {
                      pathRefs.current[1 + i] = node;
                    }}
                    d={d}
                    fill="none"
                    stroke="var(--color-champagne)"
                    strokeOpacity="0.55"
                    strokeWidth="1.2"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* 3 — the fixtures */}
                {suite.plan.fixtures.map((d, i) => (
                  <path
                    key={`fixture-${i}`}
                    ref={(node) => {
                      pathRefs.current[1 + suite.plan.partitions.length + i] = node;
                    }}
                    d={d}
                    fill="none"
                    stroke="var(--color-champagne)"
                    strokeOpacity="0.3"
                    strokeWidth="1.2"
                    strokeLinejoin="miter"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* Room annotations */}
                {suite.plan.labels.map((label) => (
                  <text
                    key={label.text}
                    data-plan-label
                    x={label.x}
                    y={label.y}
                    className="font-mono"
                    fontSize="8"
                    letterSpacing="0.2em"
                    fill="var(--color-stone-dim)"
                  >
                    {label.text}
                  </text>
                ))}
              </svg>
            </figure>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* Specification                                                */}
          {/* ----------------------------------------------------------- */}
          <div data-detail-col className="lg:col-span-5">
            <div className="flex h-full flex-col gap-8">
              <div>
                <span className="eyebrow">Specification</span>
                <h3
                  data-panel-item
                  className="font-display mt-4 text-[clamp(1.6rem,3vw,2.25rem)] font-light leading-tight text-bone"
                >
                  {suite.name}
                </h3>
                <p
                  data-panel-item
                  className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone"
                >
                  {suite.level}
                </p>
              </div>

              <div className="border-t border-hairline-soft pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim">
                  Guide price
                </span>
                <p className="mt-2">
                  <span
                    ref={priceRef}
                    data-panel-item
                    className="font-display tabular text-[clamp(2rem,4vw,2.75rem)] font-light leading-none text-bone"
                  >
                    {formatPrice(suite.priceValue)}
                  </span>
                </p>
              </div>

              <dl className="grid grid-cols-2 border-y border-hairline-soft">
                {/* dt precedes dd in the markup; `order` puts the numeral first on screen */}
                <div className="flex items-center gap-3 py-5 pr-5">
                  <BedIcon />
                  <dt className="order-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-dim">
                    Bedrooms
                  </dt>
                  <dd
                    data-panel-item
                    className="font-display tabular order-1 text-2xl font-light leading-none text-bone"
                  >
                    {suite.bedrooms}
                  </dd>
                </div>
                <div className="flex items-center gap-3 border-l border-hairline-soft py-5 pl-5">
                  <BathIcon />
                  <dt className="order-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-dim">
                    Bathrooms
                  </dt>
                  <dd
                    data-panel-item
                    className="font-display tabular order-1 text-2xl font-light leading-none text-bone"
                  >
                    {suite.bathrooms}
                  </dd>
                </div>
              </dl>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim">
                  Highlights
                </h4>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {suite.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      data-panel-item
                      className="flex gap-4 text-sm font-light leading-relaxed text-stone"
                    >
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-bronze" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sheet footer — sits on the bottom line of the drawing beside it */}
              <div className="mt-auto flex flex-col gap-6 border-t border-hairline-soft pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim">
                    Availability
                  </span>
                  <span
                    data-panel-item
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone"
                  >
                    {suite.status}
                  </span>
                </div>

                <a
                  ref={ctaRef}
                  href="#inquire"
                  data-cursor-hover
                  className="inline-flex min-h-11 w-fit items-center gap-3 rounded-pill bg-champagne px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-champagne-bright"
                >
                  Arrange a private viewing
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

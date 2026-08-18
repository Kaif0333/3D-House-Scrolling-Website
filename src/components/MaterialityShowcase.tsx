"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { flushSync } from "react-dom";
import { MATERIALS } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { revealBatch, revealUp, transitionPanel, useGsap } from "@/lib/motion";

/** Two-digit marker, so the swatches read as a numbered set like the sections do. */
const marker = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Section 05 — Materiality.
 *
 * The point of this section is the surface itself, so each card gives its top
 * 62% to the real photograph at full opacity and keeps every word on the ink
 * panel beneath it. Nothing stands in for stone with a CSS gradient any more;
 * the `tint` from the data file is only the wash sitting behind an image that
 * has not decoded yet.
 *
 * Selecting a swatch promotes it — zoom, a champagne inset ring, a corner index
 * that slides in — and crossfades the detail band below to that material, so
 * the selection finally buys the reader something.
 */
export function MaterialityShowcase() {
  const rootRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>(MATERIALS[0].id);

  const found = MATERIALS.findIndex((m) => m.id === activeId);
  const activeIndex = found === -1 ? 0 : found;
  const active = MATERIALS[activeIndex];

  useGsap(
    () => {
      revealBatch("[data-material-card]", { y: 44, stagger: 0.1, start: "top 88%" });
      revealUp(detailRef.current, { y: 32, start: "top 88%", trigger: detailRef.current });
    },
    rootRef,
    []
  );

  const select = (id: string) => {
    if (id === activeId) return;
    // flushSync so the swap is already in the DOM inside the view-transition
    // callback — otherwise React commits after the snapshot is taken and there
    // is nothing to crossfade between.
    transitionPanel(detailRef.current, () => flushSync(() => setActiveId(id)));
  };

  return (
    <section
      ref={rootRef}
      id="materials"
      className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="05"
          eyebrow="Architectural Materiality"
          title="Tactile Perfection"
          lede="Every raw material is sourced from a single quarry or workshop, then detailed to show its own grain."
          className="mb-16"
        />

        <div
          role="group"
          aria-label="Material swatches"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {MATERIALS.map((material, i) => {
            const isActive = material.id === activeId;

            return (
              <button
                key={material.id}
                type="button"
                data-material-card
                data-cursor-hover
                aria-pressed={isActive}
                aria-controls="materials-detail"
                onClick={() => select(material.id)}
                className={`group relative flex h-[26rem] flex-col overflow-hidden rounded-card border text-left transition-colors duration-500 ease-luxe ${
                  isActive
                    ? "border-champagne/50 bg-surface"
                    : "border-hairline bg-ink hover:border-hairline-strong"
                }`}
              >
                {/* Surface — the actual photograph, full opacity, tint only underneath. */}
                <span
                  className="relative block h-[62%] shrink-0 overflow-hidden"
                  style={{ backgroundColor: material.tint }}
                >
                  <Image
                    src={`/stills/${material.still}.webp`}
                    alt={`${material.name} in the villa — ${material.application.toLowerCase()}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className={`object-cover transition duration-700 ease-luxe ${
                      isActive
                        ? "scale-[1.06]"
                        : "opacity-80 grayscale-[0.35] group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
                    }`}
                  />

                  {/* Just enough gradient at the foot to let the image settle into the ink panel. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 block h-14 bg-gradient-to-t from-ink to-transparent"
                  />

                  {/* Non-colour selection marker: slides into the corner only when chosen. */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-0 top-0 flex h-9 w-9 items-center justify-center bg-champagne font-mono text-[10px] tracking-[0.08em] text-ink transition-transform duration-500 ease-luxe ${
                      isActive ? "translate-y-0" : "-translate-y-full"
                    }`}
                  >
                    {marker(i)}
                  </span>
                </span>

                {/* Ink panel — every word lives here, never over the surface. */}
                <span className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
                  <span className="font-mono text-[10px] uppercase leading-[1.4] tracking-[0.22em] text-champagne">
                    {material.origin}
                  </span>
                  <span className="font-display mt-1.5 text-lg font-light leading-tight text-bone">
                    {material.name}
                  </span>

                  <span className="mt-auto block border-t border-hairline-soft pt-3">
                    <span className="block font-mono text-[10px] uppercase leading-[1.4] tracking-[0.18em] text-stone-dim">
                      {material.application}
                    </span>
                    <span className="mt-2 line-clamp-3 text-xs font-light leading-relaxed text-stone">
                      {material.description}
                    </span>
                  </span>
                </span>

                {/* 1px champagne inset ring on the promoted card. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-card border border-champagne transition-opacity duration-500 ease-luxe ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Detail band — the payoff for the selection above. */}
        <div
          ref={detailRef}
          id="materials-detail"
          className="glass rounded-card mt-6 grid grid-cols-1 overflow-hidden md:mt-8 md:grid-cols-[13rem_1fr] lg:grid-cols-[20rem_1fr]"
        >
          <div
            className="relative h-44 w-full md:h-auto md:min-h-[16rem]"
            style={{ backgroundColor: active.tint }}
          >
            <span data-panel-item className="absolute inset-0 block">
              <Image
                key={active.id}
                src={`/stills/${active.still}.webp`}
                alt=""
                fill
                sizes="(min-width: 1024px) 20rem, (min-width: 768px) 13rem, 100vw"
                className="object-cover"
              />
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 right-0 block h-16 bg-gradient-to-t from-ink/80 to-transparent md:left-auto md:top-0 md:h-auto md:w-20 md:bg-gradient-to-l"
            />
          </div>

          <div aria-live="polite" className="flex flex-col justify-center gap-4 p-7 md:p-10 lg:p-12">
            <div data-panel-item className="flex items-center gap-4">
              <span className="tabular font-mono text-[11px] tracking-[0.24em] text-champagne">
                {marker(activeIndex)}
              </span>
              <span aria-hidden="true" className="h-px w-10 bg-hairline-strong" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone">
                {active.origin}
              </span>
            </div>

            <h3
              data-panel-item
              className="font-display text-[clamp(1.7rem,3vw,2.5rem)] font-light leading-[1.08] text-bone"
            >
              {active.name}
            </h3>

            <p
              data-panel-item
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-dim"
            >
              {active.application}
            </p>

            <p
              data-panel-item
              className="max-w-2xl text-base font-light leading-relaxed text-stone md:text-lg"
            >
              {active.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

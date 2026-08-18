"use client";

import { useRef } from "react";
import Image from "next/image";
import { AMENITIES } from "@/data/villa";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AmenityIcon } from "@/components/ui/AmenityIcons";
import { useGsap, revealBatch } from "@/lib/motion";

/**
 * Section 04 — the amenities bento.
 *
 * The cards that own a still carry it as a full-bleed background under a
 * scrim, so the section proves the house photographically; the ones that do
 * not stay deliberately quiet in glass, which is what gives the grid its
 * light-and-dark rhythm. Spans come from the data file so the bento can be
 * re-cut there without touching this component.
 */
export function LuxuryAmenities() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useGsap(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const cards = Array.from(grid.querySelectorAll("[data-reveal]")) as HTMLElement[];
      if (!cards.length) return;

      revealBatch(cards, { y: 44, stagger: 0.1, start: "top 86%" });
    },
    gridRef,
    []
  );

  return (
    <section id="amenities" className="border-t border-hairline-soft px-6 py-28 md:px-12 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="04"
          eyebrow="Unrivalled Amenities"
          title="A Curated Private Life"
          lede="Every amenity is integrated into the plan rather than appended to it."
          className="mb-16"
        />

        <div ref={gridRef} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {AMENITIES.map((amenity) => {
            const wide = amenity.span.includes("col-span-8");
            const still = amenity.still;

            return (
              <article
                key={amenity.id}
                data-reveal
                className={[
                  "group relative flex flex-col justify-between overflow-hidden rounded-card p-8 md:p-10",
                  amenity.span,
                  wide
                    ? "md:col-span-2 min-h-[24rem] lg:min-h-[26rem]"
                    : "min-h-[20rem] lg:min-h-[22rem]",
                  // Image cards drop the glass so nothing tints the photograph.
                  still ? "border border-hairline bg-ink" : "glass",
                ].join(" ")}
              >
                {still && (
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={`/stills/${still}.webp`}
                      alt=""
                      fill
                      sizes={
                        wide
                          ? "(min-width: 1024px) 62vw, 100vw"
                          : "(min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw"
                      }
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
                    />
                    {/* Scrim — heavy at the foot where the type sits, open at the head. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />
                    {/* A second, shallow wash so the icon and eyebrow hold against a bright sky. */}
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/75 to-transparent" />
                  </div>
                )}

                {/* Champagne hairline that draws across the top edge on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-champagne via-bronze to-transparent transition-transform duration-700 ease-luxe group-hover:scale-x-100"
                />

                <header className="relative z-10 flex items-center gap-3.5">
                  <AmenityIcon
                    name={amenity.icon}
                    className="h-7 w-7 shrink-0 text-champagne transition-colors duration-500 group-hover:text-champagne-bright"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
                    {amenity.category}
                  </span>
                </header>

                <div className="relative z-10 mt-12">
                  <h3 className="font-display text-2xl font-light leading-tight text-bone md:text-3xl">
                    {amenity.title}
                  </h3>
                  <p
                    className={`mt-3.5 text-sm font-light leading-relaxed text-stone md:text-base ${
                      wide ? "max-w-xl" : "max-w-md"
                    }`}
                  >
                    {amenity.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

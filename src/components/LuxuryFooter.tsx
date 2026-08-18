"use client";

import React, { useEffect, useRef } from "react";
import { CONTACT } from "@/data/villa";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { magnetic, revealUp, useGsap } from "@/lib/motion";

const NAV = [
  { href: "#concept", label: "Concept" },
  { href: "#residences", label: "Residences" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
  { href: "#inquire", label: "Enquire" },
];

/** The same monogram as the header — two piers and a lintel inside a thin circle. */
function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity="0.28" />
      <path
        d="M11 9v14M21 9v14M11 16h10"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * The closing plate.
 *
 * A single ghosted wordmark sits behind everything and is cropped by the
 * footer's own edge, so the page ends on the name rather than on a rule.
 */
export function LuxuryFooter() {
  const rootRef = useRef<HTMLElement | null>(null);
  const topRef = useRef<HTMLButtonElement | null>(null);
  const { scrollTo } = useSmoothScroll();

  useGsap(
    () => {
      const root = rootRef.current;
      if (!root) return;

      revealUp(root.querySelectorAll("[data-reveal]"), {
        y: 28,
        stagger: 0.1,
        trigger: root,
        start: "top 92%",
      });
    },
    rootRef,
    []
  );

  useEffect(() => magnetic(topRef.current, 0.22), []);

  return (
    <footer
      ref={rootRef}
      className="relative overflow-hidden border-t border-hairline bg-ink-deep px-6 pt-24 pb-10 md:px-12 md:pt-32"
    >
      {/* Ghosted wordmark, clipped by the footer edge */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute inset-x-0 -bottom-[0.2em] select-none text-center text-[24vw] font-light leading-none text-bone/[0.035]"
      >
        HORIZON
      </span>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------------------------------------------ */}
          {/* Brand                                                         */}
          {/* ------------------------------------------------------------ */}
          <div data-reveal className="sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3">
              <Monogram className="h-10 w-10 text-champagne" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-sm tracking-[0.2em] text-bone">HORIZON</span>
                <span className="mt-1.5 font-mono text-[9px] tracking-[0.26em] text-stone-dim">
                  VILLA RESIDENCE
                </span>
              </span>
            </div>

            <p className="mt-7 max-w-sm text-sm font-light leading-relaxed text-stone">
              A contemporary residence set into the ridge, held privately and shown by appointment
              through the {CONTACT.advisorName}.
            </p>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-dim">
              {CONTACT.location.place}
            </p>

            <div className="mt-7 flex flex-col gap-2">
              <a
                href={CONTACT.phoneHref}
                data-cursor-hover
                className="inline-flex min-h-11 w-fit items-center font-mono text-[11px] uppercase tracking-[0.18em] text-stone transition-colors duration-500 hover:text-champagne"
              >
                {CONTACT.phone}
              </a>
              <a
                href={CONTACT.emailHref}
                data-cursor-hover
                className="inline-flex min-h-11 w-fit items-center font-mono text-[11px] uppercase tracking-[0.18em] text-stone transition-colors duration-500 hover:text-champagne"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Offices                                                       */}
          {/* ------------------------------------------------------------ */}
          <div data-reveal className="lg:col-span-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne">
              Global representation
            </h2>

            <ul className="mt-6 border-t border-hairline">
              {CONTACT.offices.map((office) => (
                <li
                  key={office.city}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline-soft py-3.5"
                >
                  <span className="text-sm font-light text-bone">{office.city}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-dim">
                    {office.street}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Navigation                                                    */}
          {/* ------------------------------------------------------------ */}
          <nav data-reveal aria-label="Footer" className="lg:col-span-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-champagne">
              Navigate
            </h2>

            <ul className="mt-6 flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    data-cursor-hover
                    className="group flex min-h-11 items-center gap-3 border-b border-hairline-soft py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-stone transition-colors duration-500 hover:text-bone"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-3 bg-hairline-strong transition-all duration-500 group-hover:w-6 group-hover:bg-champagne"
                    />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Bottom bar                                                      */}
        {/* -------------------------------------------------------------- */}
        <div
          data-reveal
          className="mt-20 flex flex-col items-start gap-6 border-t border-hairline-soft pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-dim">
            © {new Date().getFullYear()} Villa Horizon. All rights reserved.
          </p>

          <button
            ref={topRef}
            type="button"
            onClick={() => scrollTo(0, { duration: 1.6 })}
            data-cursor-hover
            className="rounded-pill group inline-flex min-h-11 items-center gap-3 border border-hairline px-5 font-mono text-[10px] uppercase tracking-[0.22em] text-stone transition-colors duration-500 hover:border-champagne hover:text-champagne"
          >
            Back to top
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="h-3 w-3 transition-transform duration-500 group-hover:-translate-y-0.5"
            >
              <path
                d="M8 13V3M3.5 7.5L8 3l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

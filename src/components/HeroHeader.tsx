"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGsap, magnetic, EASE } from "@/lib/motion";

const NAV = [
  { href: "#concept", label: "Concept" },
  { href: "#residences", label: "Residences" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
];

/** Bespoke monogram — an H drawn as two piers and a spanning lintel. */
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

export function HeroHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // Backdrop only appears once the viewer has left the hero.
  useGsap(() => {
    const header = headerRef.current;
    if (!header) return;

    const st = ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onToggle: (self) => header.classList.toggle("is-docked", self.isActive),
    });
    return () => st.kill();
  }, undefined, []);

  useEffect(() => magnetic(ctaRef.current, 0.28), []);

  // Mobile menu open/close choreography.
  useGsap(
    () => {
      const menu = menuRef.current;
      if (!menu) return;

      if (open) {
        gsap.set(menu, { display: "flex" });
        gsap.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: EASE.out });
        gsap.fromTo(
          menu.querySelectorAll("[data-menu-item]"),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.out, stagger: 0.07, delay: 0.05 }
        );
      } else {
        gsap.to(menu, {
          autoAlpha: 0,
          duration: 0.28,
          ease: "power2.in",
          onComplete: () => gsap.set(menu, { display: "none" }),
        });
      }
    },
    undefined,
    [open]
  );

  // Escape closes the menu; body scroll locks while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a href="#concept" className="skip-link">
        Skip to content
      </a>

      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
          {/* Wordmark, floated in its own glass */}
          <a
            href="#hero"
            data-cursor-hover
            className="liquid-glass rounded-pill group flex items-center gap-3 py-2 pl-2 pr-5 transition-colors duration-500"
            aria-label="Villa Horizon, back to top"
          >
            <Monogram className="h-9 w-9 shrink-0 text-champagne transition-transform duration-700 group-hover:rotate-180" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm tracking-[0.2em] text-bone">HORIZON</span>
              <span className="mt-1 font-mono text-[9px] tracking-[0.26em] text-stone">
                VILLA RESIDENCE
              </span>
            </span>
          </a>

          {/* Navigation capsule */}
          <nav
            aria-label="Primary"
            className="liquid-glass rounded-pill hidden items-center gap-8 py-2 pl-8 pr-2 transition-colors duration-500 md:flex"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-cursor-hover
                className="relative font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80 transition-colors duration-300 hover:text-bone after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-champagne after:transition-all after:duration-500 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
            <a
              ref={ctaRef}
              href="#inquire"
              data-cursor-hover
              className="rounded-pill border border-champagne/45 bg-champagne/10 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-champagne-bright transition-colors duration-500 hover:bg-champagne hover:text-ink"
            >
              Enquire
            </a>
          </nav>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="liquid-glass flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-full md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span
              className={`block h-px w-5 bg-bone transition-transform duration-300 ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-bone transition-transform duration-300 ${
                open ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className="fixed inset-0 z-[60] hidden flex-col justify-center bg-ink/97 px-8 opacity-0 backdrop-blur-2xl md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              data-menu-item
              onClick={() => setOpen(false)}
              className="border-b border-hairline-soft py-5"
            >
              <span className="mr-4 font-mono text-[10px] tracking-[0.2em] text-champagne">
                0{i + 1}
              </span>
              <span className="font-display text-3xl font-light text-bone">{item.label}</span>
            </a>
          ))}
          <a
            href="#inquire"
            data-menu-item
            onClick={() => setOpen(false)}
            className="mt-8 rounded-pill border border-champagne/50 py-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-champagne"
          >
            Enquire
          </a>
        </nav>
      </div>
    </>
  );
}

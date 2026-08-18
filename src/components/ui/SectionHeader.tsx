"use client";

import React, { useRef } from "react";
import { gsap, useGsap, revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";

interface SectionHeaderProps {
  /** Two-digit section marker — the page really is a numbered sequence. */
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * The one headline treatment used by every section below the hero: a masked
 * line reveal on the display face, with the eyebrow and lede following.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGsap(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const heading = root.querySelector("h2");
      const meta = root.querySelectorAll("[data-header-meta]");

      if (prefersReducedMotion()) {
        gsap.set([heading, ...Array.from(meta)].filter(Boolean), { autoAlpha: 1 });
        return;
      }

      revealLines(heading, { start: "top 84%" });
      revealUp(meta, { y: 20, stagger: 0.1, start: "top 84%", trigger: root, delay: 0.15 });
    },
    rootRef,
    []
  );

  return (
    <div
      ref={rootRef}
      className={`flex flex-col gap-5 ${
        align === "center" ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      <div data-header-meta className="flex items-center gap-4">
        <span className="font-mono text-[11px] tracking-[0.24em] text-champagne">{index}</span>
        <span className="h-px w-10 bg-hairline-strong" />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
          {eyebrow}
        </span>
      </div>

      <h2 className="font-display max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-light leading-[1.06] text-bone text-balance">
        {title}
      </h2>

      {lede && (
        <p
          data-header-meta
          className={`max-w-2xl text-base font-light leading-relaxed text-stone md:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

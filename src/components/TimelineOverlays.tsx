"use client";

import React, { useEffect, useRef } from "react";
import { ROOMS } from "@/data/villa";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";

interface TimelineOverlaysProps {
  /** Card nodes are handed up so the hero timeline can animate them directly. */
  cardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

/**
 * The six room cards that ride along with the walkthrough.
 *
 * Opacity and vertical position belong to the hero's scrubbed timeline — this
 * component only owns the pointer parallax, which runs through gsap.quickTo so
 * no pointer event ever triggers a React render. Crucially there is no CSS
 * transition on transform or opacity: that would fight the scrub and leave the
 * cards permanently trailing the film.
 */
export function TimelineOverlays({ cardsRef }: TimelineOverlaysProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const setters = parallaxRefs.current.filter(Boolean).map((el, i) => {
      const depth = 1 + (i % 3) * 0.35; // slight depth variation between cards
      return {
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: EASE.out }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: EASE.out }),
        depth,
      };
    });

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setters.forEach((s) => {
        s.x(nx * 10 * s.depth);
        s.y(ny * 8 * s.depth);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {ROOMS.map((room, i) => (
        <div
          key={room.id}
          ref={(node) => {
            cardsRef.current[i] = node;
          }}
          className={`absolute bottom-28 w-[calc(100%-3rem)] max-w-sm opacity-0 sm:bottom-24 md:bottom-28 ${
            room.align === "left" ? "left-6 md:left-14" : "right-6 md:right-14"
          }`}
        >
          <div
            ref={(node) => {
              parallaxRefs.current[i] = node;
            }}
          >
            <article className="glass rounded-card relative overflow-hidden p-6 md:p-7">
              {/* Hairline accent along the top edge */}
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-champagne via-bronze to-transparent" />

              <header className="mb-3 flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.24em] text-champagne">
                  {room.index}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  {room.tag}
                </span>
              </header>

              <h3 className="font-display mb-2.5 text-2xl font-light leading-tight text-bone md:text-[1.75rem]">
                {room.title}
              </h3>

              <p className="mb-5 text-sm font-light leading-relaxed text-stone">
                {room.description}
              </p>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline-soft pt-4">
                {room.specs.map((spec) => (
                  <li
                    key={spec}
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-dim"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      ))}
    </div>
  );
}

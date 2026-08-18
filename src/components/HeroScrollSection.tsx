"use client";

import React, { useRef, useState } from "react";
import { CanvasSequence, type CanvasSequenceHandle } from "@/components/CanvasSequence";
import { TimelineOverlays } from "@/components/TimelineOverlays";
import { RoomProgressNav } from "@/components/RoomProgressNav";
import { ROOMS, SEQUENCE } from "@/data/villa";
import { useSmoothScroll } from "@/components/SmoothScroll";
import {
  gsap,
  SplitText,
  useGsap,
  prefersReducedMotion,
  EASE,
} from "@/lib/motion";

const LAST_FRAME = SEQUENCE.totalFrames - 1;

/**
 * The pinned hero.
 *
 * One scrubbed timeline drives everything: the canvas playhead, the six room
 * cards, the title exit and the scroll cue. Nothing scroll-driven passes
 * through React state — the only state here is the active room id, which
 * changes six times across the whole sequence rather than five hundred.
 */
export function HeroScrollSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasApi = useRef<CanvasSequenceHandle | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeIdRef = useRef<string | null>(null);

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { scrollTo } = useSmoothScroll();

  /* ---------------- title entrance, once the curtain lifts ---------------- */

  useGsap(
    () => {
      if (!ready || !titleRef.current) return;
      if (prefersReducedMotion()) {
        gsap.set(titleRef.current, { autoAlpha: 1 });
        return;
      }

      const heading = titleRef.current.querySelector("h1");
      const rest = titleRef.current.querySelectorAll("[data-title-line]");
      gsap.set(titleRef.current, { autoAlpha: 1 });

      const run = () => {
        const tl = gsap.timeline();
        if (heading) {
          const split = SplitText.create(heading, { type: "lines,words", mask: "lines" });
          tl.from(split.words, {
            yPercent: 118,
            duration: 1.3,
            ease: EASE.strong,
            stagger: 0.08,
          });
        }
        tl.from(
          rest,
          { autoAlpha: 0, y: 18, duration: 0.9, ease: EASE.out, stagger: 0.12 },
          "-=0.8"
        );
      };

      if (document.fonts?.status !== "loaded") document.fonts.ready.then(run);
      else run();
    },
    containerRef,
    [ready]
  );

  /* ---------------- the scrubbed master timeline ---------------- */

  useGsap(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const mm = gsap.matchMedia();

      // Motion-sensitive visitors get a still hero and no scroll hijack.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        canvasApi.current?.draw(Math.round(LAST_FRAME * 0.12));
        gsap.set(cardsRef.current.filter(Boolean), { autoAlpha: 0 });
        gsap.set(cueRef.current, { autoAlpha: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const playhead = { frame: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            id: SEQUENCE.triggerId,
            trigger: container,
            start: "top top",
            end: SEQUENCE.scrollLength,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Six transitions across the whole pin, not one per frame.
              const frame = self.progress * LAST_FRAME;
              const room = ROOMS.find((r) => frame >= r.startFrame && frame <= r.endFrame);
              const id = room?.id ?? null;
              if (id !== activeIdRef.current) {
                activeIdRef.current = id;
                setActiveRoom(id);
              }
            },
          },
        });

        // Playhead — drawn synchronously inside GSAP's rAF-aligned ticker.
        tl.to(
          playhead,
          {
            frame: LAST_FRAME,
            ease: "none",
            duration: 1,
            onUpdate: () => canvasApi.current?.draw(playhead.frame),
          },
          0
        );

        // Title tracks out over the opening approach.
        if (titleRef.current) {
          tl.to(
            titleRef.current,
            { autoAlpha: 0, yPercent: -26, letterSpacing: "0.06em", ease: "none", duration: 0.1 },
            0.015
          );
        }

        // Scroll cue retires as soon as scrubbing begins.
        if (cueRef.current) {
          tl.to(cueRef.current, { autoAlpha: 0, ease: "none", duration: 0.04 }, 0.01);
        }

        // Room cards, keyed to the exact frame ranges in the data file.
        ROOMS.forEach((room, i) => {
          const card = cardsRef.current[i];
          if (!card) return;

          const at = (f: number) => f / LAST_FRAME;
          const inStart = at(room.startFrame);
          const inEnd = at(room.peakStartFrame);
          const outStart = at(room.peakEndFrame);
          const outEnd = at(room.endFrame);

          gsap.set(card, { autoAlpha: 0, y: 26 });
          tl.fromTo(
            card,
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: inEnd - inStart },
            inStart
          );
          tl.to(
            card,
            { autoAlpha: 0, y: -16, ease: "power2.in", duration: outEnd - outStart },
            outStart
          );
        });
      });

      return () => mm.revert();
    },
    containerRef,
    []
  );

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      <CanvasSequence
        ref={(node) => {
          canvasApi.current = node;
        }}
        onReady={() => setReady(true)}
      />

      {/* Grade the frame so type stays legible over bright exteriors */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_88%_at_50%_20%,transparent_26%,rgba(8,7,6,0.66)_100%)]"
      />
      {/* Just enough weight at the top for the glass nav to sit on */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[42%] bg-gradient-to-b from-ink/70 via-ink/22 to-transparent"
      />

      {/* Hero typography */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute inset-x-0 top-[11%] z-20 flex flex-col items-center px-6 text-center opacity-0 md:top-[20%]"
      >
        <p data-title-line className="eyebrow mb-4 md:mb-5">
          Atelier Vermeer · Lombardy
        </p>
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.9rem,10.5vw,9.5rem)] font-light leading-[0.88] text-bone drop-shadow-[0_2px_24px_rgba(8,7,6,0.55)]"
        >
          Villa <em className="italic text-champagne">Horizon</em>
        </h1>
        <p
          data-title-line
          className="mt-4 max-w-xs font-display text-base font-light italic leading-snug text-bone/85 drop-shadow-[0_2px_16px_rgba(8,7,6,0.9)] md:mt-6 md:max-w-md md:text-xl md:leading-relaxed"
        >
          A house that admits the ridge was there first.
        </p>
        <p
          data-title-line
          className="mt-4 hidden font-mono text-[11px] tracking-[0.22em] text-stone-dim md:block"
        >
          1,450 m² · THREE RESIDENCES FROM $9.8M
        </p>
      </div>

      {/* Room cards, driven entirely by the scrubbed timeline */}
      <TimelineOverlays cardsRef={cardsRef} />

      {/* Right-hand progress rail */}
      <RoomProgressNav activeRoom={activeRoom} />

      {/* Scroll cue + skip affordance */}
      <div
        ref={cueRef}
        className="absolute inset-x-0 bottom-7 z-30 flex flex-col items-center gap-4"
      >
        <span className="pointer-events-none font-mono text-[10px] tracking-[0.28em] text-stone">
          SCROLL TO WALK THROUGH
        </span>
        <div className="pointer-events-none h-10 w-px overflow-hidden bg-hairline">
          <div className="h-4 w-px animate-[horizon-drift_2.4s_ease-in-out_infinite] bg-champagne" />
        </div>
        <button
          type="button"
          onClick={() => scrollTo("#concept", { duration: 1.4 })}
          data-cursor-hover
          className="pointer-events-auto rounded-pill border border-hairline px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-stone transition-colors duration-300 hover:border-champagne hover:text-champagne"
        >
          SKIP THE TOUR
        </button>
      </div>

      {/* The walkthrough narrative, always in the DOM for assistive tech and crawlers */}
      <div className="sr-only">
        <h2>The walkthrough</h2>
        <ul>
          {ROOMS.map((room) => (
            <li key={room.id}>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

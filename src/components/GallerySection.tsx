"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { GALLERY } from "@/data/villa";
import {
  gsap,
  ScrollTrigger,
  useGsap,
  revealUp,
  prefersReducedMotion,
  EASE,
  DUR,
} from "@/lib/motion";

/**
 * The pin is an enhancement, never the mechanism. These two queries are exact
 * complements, so the strip is either pinned-and-scrubbed or a native swipe
 * lane — it can never fall between the two.
 */
const PIN_QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
const FLAT_QUERY = "(max-width: 899.98px), (prefers-reduced-motion: reduce)";
const TRIGGER_ID = "gallery-strip";

const COUNT = GALLERY.length;
const pad = (n: number) => String(n).padStart(2, "0");

/** Alternating frame shapes give the strip an editorial rhythm. */
const ratioFor = (i: number) => (i % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]");
const offsetFor = (i: number) => (i % 2 === 1 ? "min-[900px]:mt-16" : "");

/* ------------------------------------------------------------------ */
/* Icons — drawn inline so the section carries no icon dependency      */
/* ------------------------------------------------------------------ */

function IconExpand() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
      className="h-3.5 w-3.5"
    >
      <path d="M6 2H2v4M14 6V2h-4M2 10v4h4M10 14h4v-4" />
    </svg>
  );
}

function IconChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
      className="h-4 w-4"
    >
      <path d={direction === "left" ? "M10 2L4 8l6 6" : "M6 2l6 6-6 6"} />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="square"
      className="h-4 w-4"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

/**
 * Section 03 — the horizontal gallery.
 *
 * On a wide, motion-friendly viewport the strip is pinned and the track is
 * translated on x against the scrub, with each frame parallaxing inside its
 * own crop via `containerAnimation`. Everywhere else — and if the pin never
 * initialises at all — the very same track is a native `overflow-x-auto`
 * snap lane. Nothing about the content, the captions or the lightbox depends
 * on which of the two is running.
 */
export function GallerySection() {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  /** The whole card — what gets revealed and what the parallax triggers off. */
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  /** Just the image button — the focus target and the lightbox trigger. */
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef(0);
  const hasOpenedRef = useRef(false);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const { scrollTo, getLenis } = useSmoothScroll();

  /* ---------------- the strip ---------------- */

  useGsap(
    () => {
      const pin = pinRef.current;
      const scroller = scrollerRef.current;
      const track = trackRef.current;
      if (!pin || !scroller || !track) return;

      const cards = cardRefs.current.filter((el): el is HTMLElement => Boolean(el));

      // Cards rise in once, whichever mode the strip ends up in.
      revealUp(cards, { y: 30, stagger: 0.07, start: "top 80%", trigger: pin });

      const setProgress = (value: number) => {
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: value });
      };

      const mm = gsap.matchMedia();

      /* --- wide and motion-friendly: pin, then scrub sideways --- */
      mm.add(PIN_QUERY, () => {
        // Clips the native lane only while the pin is genuinely in charge.
        scroller.dataset.pinned = "true";
        scroller.scrollLeft = 0;

        // Whatever the track carries beyond the viewport is how far it travels.
        const distance = () =>
          Math.max(0, track.scrollWidth - (scroller.clientWidth || window.innerWidth));

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            id: TRIGGER_ID,
            trigger: pin,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
            onRefresh: (self) => setProgress(self.progress),
          },
        });

        pinTriggerRef.current = ScrollTrigger.getById(TRIGGER_ID) ?? null;

        // Each frame drifts inside its own crop as it crosses the viewport.
        cards.forEach((card) => {
          const layer = card.querySelector<HTMLElement>("[data-parallax]");
          if (!layer) return;
          gsap.fromTo(
            layer,
            { xPercent: -5 },
            {
              xPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });

        return () => {
          pinTriggerRef.current = null;
          delete scroller.dataset.pinned;
          setProgress(0);
        };
      });

      /* --- narrow or reduced motion: a real swipe lane --- */
      mm.add(FLAT_QUERY, () => {
        let max = 0;
        const report = () => setProgress(max > 0 ? scroller.scrollLeft / max : 0);
        const measure = () => {
          max = scroller.scrollWidth - scroller.clientWidth;
          report();
        };

        measure();
        scroller.addEventListener("scroll", report, { passive: true });
        window.addEventListener("resize", measure);

        return () => {
          scroller.removeEventListener("scroll", report);
          window.removeEventListener("resize", measure);
          setProgress(0);
        };
      });

      return () => mm.revert();
    },
    pinRef,
    []
  );

  /* ---------------- keyboard travel through the pinned strip ---------------- */

  /**
   * Tabbing to a slide that sits off-screen would have the browser scroll a
   * clipped container and shear the layout. Instead the page is moved to the
   * point in the pin where that slide is on screen.
   */
  const handleSlideFocus = useCallback(
    (index: number, el: HTMLButtonElement) => {
      const scroller = scrollerRef.current;
      const trigger = pinTriggerRef.current;
      if (!trigger || !scroller) return;

      if (scroller.scrollLeft !== 0) scroller.scrollLeft = 0;

      // Pointer focus must never move the page; keyboard focus should.
      try {
        if (!el.matches(":focus-visible")) return;
      } catch {
        return;
      }

      const ratio = COUNT > 1 ? index / (COUNT - 1) : 0;
      scrollTo(trigger.start + (trigger.end - trigger.start) * ratio, { duration: 0.7 });
    },
    [scrollTo]
  );

  /* ---------------- lightbox ---------------- */

  const openAt = useCallback((index: number) => {
    hasOpenedRef.current = true;
    lastTriggerRef.current = index;
    setOpenIndex(index);
  }, []);

  const requestClose = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      setOpenIndex(null);
      return;
    }
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: DUR.quick,
      ease: EASE.inOut,
      overwrite: true,
      onComplete: () => setOpenIndex(null),
    });
  }, []);

  const step = useCallback(
    (direction: number) => {
      if (openIndex === null) return;
      const next = (openIndex + direction + COUNT) % COUNT;
      lastTriggerRef.current = next;
      setOpenIndex(next);
    },
    [openIndex]
  );

  // Escape, arrows and a focus trap, for as long as the dialog is up.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>("button:not([disabled])"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (!activeEl || !panel.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && activeEl === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, requestClose, step]);

  // Scroll lock: Lenis is paused and the document frozen underneath.
  useEffect(() => {
    if (!isOpen) return;

    const lenis = getLenis();
    lenis?.stop();

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      lenis?.start();
    };
  }, [isOpen, getLenis]);

  // Focus moves into the dialog on open, and back to its trigger on close.
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!hasOpenedRef.current) return;
    slideRefs.current[lastTriggerRef.current]?.focus({ preventScroll: true });
  }, [isOpen]);

  // Entrance for the dialog itself.
  useGsap(
    () => {
      if (!isOpen) return;
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      if (!overlay || !panel) return;

      if (prefersReducedMotion()) {
        gsap.set([overlay, panel], { autoAlpha: 1, scale: 1, y: 0 });
        return;
      }

      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.quick, ease: EASE.out });
      gsap.fromTo(
        panel,
        { autoAlpha: 0, scale: 0.94, y: 22 },
        { autoAlpha: 1, scale: 1, y: 0, duration: DUR.base, ease: EASE.strong, delay: 0.04 }
      );
    },
    overlayRef,
    [isOpen]
  );

  // And a quieter crossfade each time the frame changes.
  useGsap(
    () => {
      if (openIndex === null || prefersReducedMotion()) return;
      const frame = frameRef.current;
      if (!frame) return;
      gsap.fromTo(
        frame,
        { autoAlpha: 0.25, scale: 1.015 },
        { autoAlpha: 1, scale: 1, duration: DUR.base, ease: EASE.out, overwrite: "auto" }
      );
    },
    overlayRef,
    [openIndex]
  );

  const activeFrame = openIndex === null ? null : GALLERY[openIndex];

  /* ---------------- markup ---------------- */

  return (
    <section id="gallery" className="border-t border-hairline-soft py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          index="03"
          eyebrow="The Gallery"
          title="Twelve Frames"
          lede="Stills drawn from the walkthrough — the house as it reads at each hour of the day."
          className="mb-16"
        />
      </div>

      <div ref={pinRef} className="relative flex flex-col justify-center min-[900px]:h-screen">
        <div
          ref={scrollerRef}
          aria-label="Gallery frames"
          className="no-scrollbar w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain data-[pinned=true]:overflow-hidden data-[pinned=true]:overscroll-x-auto"
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-6 px-6 pb-2 md:px-12 min-[900px]:gap-10"
          >
            {GALLERY.map((frame, i) => (
              <figure
                key={frame.still}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className={`w-[clamp(280px,34vw,460px)] shrink-0 snap-center ${offsetFor(i)}`}
              >
                <button
                  type="button"
                  data-cursor-hover
                  ref={(node) => {
                    slideRefs.current[i] = node;
                  }}
                  onClick={() => openAt(i)}
                  onFocus={(event) => handleSlideFocus(i, event.currentTarget)}
                  aria-label={`Open frame ${i + 1} of ${COUNT}: ${frame.caption}, ${frame.room}`}
                  className={`group relative block w-full cursor-pointer overflow-hidden rounded-card border border-hairline bg-surface ${ratioFor(i)}`}
                >
                  {/* Oversized on purpose: the parallax never exposes an edge. */}
                  <span data-parallax className="absolute inset-[-7%] block">
                    <Image
                      src={`/stills/${frame.still}.webp`}
                      alt={`${frame.caption} — ${frame.room}`}
                      fill
                      sizes="(max-width: 900px) 78vw, 34vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
                  />

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4"
                  >
                    <span className="tabular font-mono text-[10px] tracking-[0.24em] text-bone">
                      {pad(i + 1)}
                    </span>
                    <span className="flex items-center gap-2 rounded-soft border border-hairline-strong bg-ink/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <IconExpand />
                      View
                    </span>
                  </span>
                </button>

                <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline-soft pt-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-champagne">{frame.room}</span>
                  <span aria-hidden="true" className="text-stone-dim">
                    /
                  </span>
                  <span className="normal-case tracking-[0.12em] text-stone">{frame.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-7xl px-6 md:px-12">
          <span aria-hidden="true" className="block h-px w-full bg-hairline-soft">
            <span
              ref={progressRef}
              className="block h-px w-full origin-left scale-x-0 bg-champagne"
            />
          </span>
          <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-stone-dim">
            <span>Drag or scroll to advance</span>
            <span className="tabular">{pad(COUNT)} frames</span>
          </div>
        </div>
      </div>

      {activeFrame && openIndex !== null && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={overlayRef}
              onClick={(event) => {
                if (event.target === event.currentTarget) requestClose();
              }}
              className="fixed inset-0 z-[68] flex items-center justify-center overflow-y-auto bg-ink/97 px-4 py-6 backdrop-blur-sm md:px-10 md:py-10"
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Gallery viewer, frame ${openIndex + 1} of ${COUNT}`}
                tabIndex={-1}
                className="relative w-full max-w-6xl outline-none"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="tabular font-mono text-[10px] uppercase tracking-[0.24em] text-stone-dim">
                    {pad(openIndex + 1)} / {pad(COUNT)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-cursor-hover
                      onClick={() => step(-1)}
                      aria-label="Previous frame"
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-soft border border-hairline text-stone transition-colors duration-300 hover:border-hairline-strong hover:text-bone"
                    >
                      <IconChevron direction="left" />
                    </button>
                    <button
                      type="button"
                      data-cursor-hover
                      onClick={() => step(1)}
                      aria-label="Next frame"
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-soft border border-hairline text-stone transition-colors duration-300 hover:border-hairline-strong hover:text-bone"
                    >
                      <IconChevron direction="right" />
                    </button>
                    <span aria-hidden="true" className="mx-1 h-6 w-px bg-hairline" />
                    <button
                      type="button"
                      data-cursor-hover
                      onClick={requestClose}
                      aria-label="Close gallery viewer"
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-soft border border-hairline text-stone transition-colors duration-300 hover:border-hairline-strong hover:text-bone"
                    >
                      <IconClose />
                    </button>
                  </div>
                </div>

                <figure>
                  {/* The width cap is what holds the frame inside short viewports. */}
                  <div
                    ref={frameRef}
                    className="relative mx-auto aspect-[16/9] w-full max-w-[110vh] overflow-hidden rounded-card border border-hairline bg-surface"
                  >
                    <Image
                      key={activeFrame.still}
                      src={`/stills/${activeFrame.still}.webp`}
                      alt={`${activeFrame.caption} — ${activeFrame.room}`}
                      fill
                      sizes="(max-width: 1024px) 92vw, 1100px"
                      priority
                      className="object-cover"
                    />
                  </div>

                  <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-hairline-soft pt-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                      {activeFrame.room}
                    </span>
                    <span className="text-base font-light leading-relaxed text-stone">
                      {activeFrame.caption}
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}

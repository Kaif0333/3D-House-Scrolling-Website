"use client";

/**
 * Shared motion layer.
 *
 * Everything scroll-driven in this project goes through here so the easing
 * vocabulary stays consistent and every animation is guarded by the same
 * reduced-motion check. GSAP 3.13+ ships SplitText / DrawSVG / MorphSVG / Flip
 * for free, so there is no premium plugin dependency.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";

let registered = false;

/** Registers plugins exactly once, on the client only. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);
  registered = true;
}

registerGsap();

/** House easing vocabulary — slow, settled, never springy. */
export const EASE = {
  out: "power3.out",
  strong: "power4.out",
  inOut: "power2.inOut",
} as const;

export const DUR = {
  quick: 0.45,
  base: 0.9,
  slow: 1.2,
} as const;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * `useGSAP` without the extra dependency: runs the callback inside a
 * gsap.context scoped to `scope`, and reverts everything on cleanup — which
 * is what makes it safe under React 19 StrictMode double-invocation.
 */
export function useGsap(
  callback: (ctx: gsap.Context) => void | (() => void),
  scope?: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useLayoutEffect(() => {
    registerGsap();
    const ctx = gsap.context((self) => callback(self), scope?.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ------------------------------------------------------------------ */
/* Reveal primitives                                                   */
/* ------------------------------------------------------------------ */

/**
 * Masked line reveal for a headline. Lines rise out of their own clipping
 * box, which reads far more considered than a plain fade.
 */
export function revealLines(
  target: Element | null,
  options: { delay?: number; stagger?: number; start?: string } = {}
) {
  if (!target) return;
  const { delay = 0, stagger = 0.09, start = "top 82%" } = options;

  if (prefersReducedMotion()) {
    gsap.set(target, { autoAlpha: 1 });
    return;
  }

  // Fonts must be settled or the split measures the fallback face.
  const run = () => {
    const split = SplitText.create(target, { type: "lines", mask: "lines" });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 1.1,
      ease: EASE.strong,
      stagger,
      delay,
      scrollTrigger: { trigger: target as Element, start, once: true },
    });
  };

  if (typeof document !== "undefined" && document.fonts?.status !== "loaded") {
    document.fonts.ready.then(run);
  } else {
    run();
  }
}

/** Fade-and-rise for a single element or an array of them. */
export function revealUp(
  targets: gsap.TweenTarget,
  options: { y?: number; delay?: number; stagger?: number; start?: string; trigger?: Element | null } = {}
) {
  const { y = 34, delay = 0, stagger = 0, start = "top 85%", trigger } = options;

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    targets,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration: DUR.base,
      ease: EASE.out,
      delay,
      stagger,
      scrollTrigger: trigger ? { trigger, start, once: true } : undefined,
    }
  );
}

/**
 * Batched entrance for grids — cards animate in groups as they cross the
 * viewport edge rather than each firing its own ScrollTrigger.
 */
export function revealBatch(
  selector: string | Element[],
  options: { y?: number; stagger?: number; start?: string } = {}
) {
  const { y = 40, stagger = 0.1, start = "top 86%" } = options;

  if (prefersReducedMotion()) {
    gsap.set(selector, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(selector, { autoAlpha: 0, y });
  ScrollTrigger.batch(selector, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: DUR.base,
        ease: EASE.out,
        stagger,
        overwrite: true,
      }),
  });
}

/**
 * Counts a number up when it scrolls into view. Keeps prefix/suffix intact
 * and holds decimals so "6.5m" doesn't flicker to "7m".
 */
export function countUp(
  el: HTMLElement | null,
  value: number,
  options: {
    prefix?: string;
    suffix?: string;
    precision?: number;
    duration?: number;
    trigger?: Element | null;
    immediate?: boolean;
  } = {}
) {
  if (!el) return;
  const {
    prefix = "",
    suffix = "",
    precision = 0,
    duration = 1.6,
    trigger,
    immediate = false,
  } = options;

  const format = (n: number) =>
    prefix +
    n.toLocaleString("en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }) +
    suffix;

  if (prefersReducedMotion()) {
    el.textContent = format(value);
    return;
  }

  const proxy = { v: 0 };
  const tween = {
    v: value,
    duration,
    ease: EASE.out,
    onUpdate: () => {
      el.textContent = format(proxy.v);
    },
  } satisfies gsap.TweenVars;

  if (immediate) {
    gsap.to(proxy, tween);
    return;
  }

  gsap.to(proxy, {
    ...tween,
    scrollTrigger: { trigger: trigger ?? el, start: "top 88%", once: true },
  });
}

/**
 * Draws an SVG plan on, segment by segment: shell first, then partitions,
 * then fixtures — so it reads as "structure, then rooms".
 */
export function drawPlan(paths: SVGPathElement[], options: { stagger?: number; delay?: number } = {}) {
  const { stagger = 0.12, delay = 0 } = options;
  if (!paths.length) return;

  if (prefersReducedMotion()) {
    gsap.set(paths, { drawSVG: "100%", autoAlpha: 1 });
    return;
  }

  gsap.fromTo(
    paths,
    { drawSVG: "0%", autoAlpha: 1 },
    { drawSVG: "100%", duration: 1.3, ease: EASE.inOut, stagger, delay, overwrite: true }
  );
}

/**
 * Magnetic hover — the element leans toward the cursor within its own
 * bounds. Uses quickTo so there is no React state in the pointer path.
 */
export function magnetic(el: HTMLElement | null, strength = 0.32) {
  if (!el || prefersReducedMotion()) return () => {};
  if (window.matchMedia("(hover: none)").matches) return () => {};

  const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: EASE.out });
  const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: EASE.out });

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    xTo(0);
    yTo(0);
  };
}

/**
 * Crossfades panel content on tab/suite/material switches. Uses the View
 * Transition API where available and falls back to a GSAP tween elsewhere.
 */
export function transitionPanel(el: HTMLElement | null, apply: () => void) {
  if (prefersReducedMotion() || !el) {
    apply();
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };

  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(apply);
    return;
  }

  apply();
  gsap.fromTo(
    el.querySelectorAll("[data-panel-item]"),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: DUR.quick, ease: EASE.out, stagger: 0.05, overwrite: true }
  );
}

export { gsap, ScrollTrigger, SplitText, Flip };

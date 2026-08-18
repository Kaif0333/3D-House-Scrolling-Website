"use client";

import React, { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";

const INTERACTIVE = "a, button, [data-cursor-hover], input, select, textarea, label";

/**
 * Champagne dot with a trailing ring.
 *
 * Everything runs through gsap.quickTo inside a single mount-only effect, so
 * the pointer path never touches React state and the ring's easing is the lag
 * (rather than the lag being an accident of a restarting rAF loop). The native
 * cursor is hidden via a class on <html>, and only on devices that have a fine
 * pointer to begin with.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || prefersReducedMotion()) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    // The ring's slower duration *is* the trail.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: EASE.out });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: EASE.out });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const setHover = (on: boolean) => {
      gsap.to(ring, {
        scale: on ? 1.75 : 1,
        borderColor: on ? "rgba(198,168,124,0.9)" : "rgba(237,231,219,0.28)",
        backgroundColor: on ? "rgba(198,168,124,0.09)" : "rgba(198,168,124,0)",
        duration: 0.35,
        ease: EASE.out,
        overwrite: "auto",
      });
      gsap.to(dot, { scale: on ? 0.4 : 1, duration: 0.35, ease: EASE.out, overwrite: "auto" });
    };

    const onOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.(INTERACTIVE)) setHover(true);
    };
    const onOut = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.(INTERACTIVE)) setHover(false);
    };

    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 });
    const onEnter = () => gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.2, overwrite: "auto" });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, overwrite: "auto" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border opacity-0"
        style={{ borderColor: "rgba(237,231,219,0.28)" }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-champagne opacity-0"
      />
    </div>
  );
}

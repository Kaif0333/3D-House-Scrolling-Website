"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

interface SmoothScrollApi {
  /** Scrolls to an element, selector or absolute offset through Lenis. */
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
  getLenis: () => Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  // Falls back to native scrolling if the provider is missing, so consumers
  // never need a null check.
  return (
    ctx ?? {
      scrollTo: (target) => {
        if (typeof window === "undefined") return;
        if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
        else {
          const el = typeof target === "string" ? document.querySelector(target) : target;
          el?.scrollIntoView({ behavior: "smooth" });
        }
      },
      getLenis: () => null,
    }
  );
}

/**
 * Owns the single Lenis instance for the page.
 *
 * Lenis is driven by GSAP's ticker so smooth scrolling and every ScrollTrigger
 * stay in lockstep on one rAF loop. The instance lives in a ref (never state),
 * which keeps the provider from re-rendering the tree on mount.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();

    // Motion-sensitive visitors get native scrolling; the pin still works.
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    // Fonts and the first frames change layout after hydration; re-measure so
    // the pin's start/end (which the room rail derives its targets from) are right.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("load", onLoad);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<SmoothScrollApi["scrollTo"]>((target, options = {}) => {
    const { offset = 0, duration = 1.5 } = options;
    const lenis = lenisRef.current;

    if (!lenis) {
      if (typeof window === "undefined") return;
      if (typeof target === "number") {
        window.scrollTo({ top: target + offset, behavior: "smooth" });
        return;
      }
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    lenis.scrollTo(target as never, {
      offset,
      duration,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  }, []);

  /**
   * Route in-page anchors through Lenis. Without this, native jumps bypass
   * smooth scrolling and can land the viewer mid-pin on a dark canvas.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const el = document.querySelector(href);
      if (!el) return;

      event.preventDefault();
      scrollTo(el as HTMLElement, { duration: 1.6 });
      // Keep the URL shareable without triggering the native jump.
      window.history.pushState(null, "", href);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const api = useMemo<SmoothScrollApi>(
    () => ({ scrollTo, getLenis: () => lenisRef.current }),
    [scrollTo]
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

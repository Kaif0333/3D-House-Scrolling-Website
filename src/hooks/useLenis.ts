"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface UseLenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  touchMultiplier?: number;
  infinite?: boolean;
}

/**
 * Custom React hook that initializes Lenis smooth scrolling,
 * synchronizes it with GSAP ScrollTrigger ticker,
 * and ensures proper cleanup to avoid memory leaks.
 */
export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Ensure GSAP ScrollTrigger plugin is registered
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with cinematic defaults
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing:
        options.easing ?? ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smoothWheel: options.smoothWheel ?? true,
      touchMultiplier: options.touchMultiplier ?? 2,
      infinite: options.infinite ?? false,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll events with GSAP ScrollTrigger
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    // Drive Lenis RAF loop via GSAP's global ticker for 60fps lockstep sync
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Cleanup function to prevent memory leaks on unmount
    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [options.duration, options.easing, options.smoothWheel, options.touchMultiplier, options.infinite]);

  return lenisRef;
}

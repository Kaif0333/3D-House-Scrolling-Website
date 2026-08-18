"use client";

import { useEffect, useState } from "react";
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
 * exposes the Lenis instance for programmatically scrolling,
 * and ensures proper cleanup to avoid memory leaks.
 */
export function useLenis(options: UseLenisOptions = {}): Lenis | null {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with cinematic options
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing:
        options.easing ?? ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smoothWheel: options.smoothWheel ?? true,
      touchMultiplier: options.touchMultiplier ?? 2,
      infinite: options.infinite ?? false,
    });

    setLenisInstance(lenis);

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

    // Cleanup function on unmount to prevent memory leaks
    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [options.duration, options.easing, options.smoothWheel, options.touchMultiplier, options.infinite]);

  return lenisInstance;
}

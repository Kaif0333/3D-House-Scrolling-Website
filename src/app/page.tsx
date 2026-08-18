"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasSequence } from "@/components/CanvasSequence";
import { useLenis } from "@/hooks/useLenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const TOTAL_FRAMES = 500;
  const INITIAL_PRELOAD = 150;

  // 1. Initialize Lenis smooth scrolling via custom hook
  useLenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
  });

  useEffect(() => {
    // 2. Setup pinned ScrollTrigger section with direct scroll scrubbing
    // progress = ScrollTrigger.progress (0 to 1)
    // currentFrame = Math.floor(progress * (totalFrames - 1))
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=500%", // 500vh scroll height for precise frame control
      pin: true,
      scrub: true, // Synchronized direct scroll scrubbing
      onUpdate: (self) => {
        const progress = self.progress;
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );
        setCurrentFrame(frameIndex);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <main className="bg-slate-950 text-white min-h-screen font-sans selection:bg-amber-500 selection:text-black">
      {/* Pinned ScrollTrigger Canvas Section */}
      <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
        <CanvasSequence
          totalFrames={TOTAL_FRAMES}
          initialPreloadCount={INITIAL_PRELOAD}
          currentFrameIndex={currentFrame}
        />

        {/* Overlay Content / HUD */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12">
          {/* Header Bar */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400">
                Apple-Style Scroll Scrubbing
              </span>
              <h1 className="text-xl font-light tracking-wide text-slate-200">
                Villa Horizon 3D Experience
              </h1>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 text-xs font-mono text-slate-300">
              FRAME {String(currentFrame + 1).padStart(4, "0")} / {TOTAL_FRAMES}
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-md space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-amber-400/80">
                Lenis Smooth Scroll + GSAP Sync
              </span>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Scroll down to scrub forward through frames. Stop scrolling to freeze the exact frame. Scroll back up to reverse the sequence frame-by-frame.
              </p>
            </div>

            {/* Scroll Prompt */}
            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-800 text-xs text-slate-400">
              <span className="animate-bounce text-amber-400">↓</span>
              <span className="uppercase tracking-widest font-mono text-[11px]">
                Scroll To Scrub Sequence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continuation Content Below Pinned Canvas */}
      <section className="py-32 px-8 max-w-5xl mx-auto space-y-12">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-light tracking-wide text-amber-400 mb-6">
            Cinematic Scroll Synchronization
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Lenis smooth scrolling handles wheel physics and momentum, while GSAP ScrollTrigger updates frame targets in lockstep on every animation frame.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasSequence } from "@/components/CanvasSequence";
import { HeroHeader } from "@/components/HeroHeader";
import { TimelineOverlays } from "@/components/TimelineOverlays";
import { useLenis } from "@/hooks/useLenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const TOTAL_FRAMES = 500;
  const INITIAL_PRELOAD = 150;

  // Initialize Lenis smooth scroll
  useLenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
  });

  useEffect(() => {
    // Setup pinned ScrollTrigger canvas section mapped strictly to scroll progress
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=500%", // 500vh scroll height for precise frame control
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 to 1.0
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
    <main className="bg-slate-950 text-white min-h-screen font-sans selection:bg-amber-500 selection:text-black relative">
      {/* Top Left Logo & Top Right Navigation */}
      <HeroHeader />

      {/* Pinned ScrollTrigger Canvas Section */}
      <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
        {/* Canvas Render Engine */}
        <CanvasSequence
          totalFrames={TOTAL_FRAMES}
          initialPreloadCount={INITIAL_PRELOAD}
          currentFrameIndex={currentFrame}
        />

        {/* Interior Timeline Overlays (Entrance, Living Room, Kitchen, Bedroom, Bathroom, Garden) */}
        <TimelineOverlays currentFrame={currentFrame} />

        {/* Minimal Unobtrusive HUD Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12">
          {/* Frame Counter in Top Right (under nav) */}
          <div className="absolute top-24 right-10 z-20 bg-slate-950/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80 text-[11px] font-mono text-slate-300 shadow-xl">
            FRAME {String(currentFrame + 1).padStart(4, "0")} / {TOTAL_FRAMES}
          </div>
        </div>

        {/* Minimal Animated Scroll Indicator at Bottom Center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-slate-400/90 font-light">
            SCROLL TO SCRUB SEQUENCE
          </span>
          <div className="w-4 h-8 rounded-full border border-slate-700/80 flex justify-center p-1 backdrop-blur-sm bg-slate-950/40 shadow-lg">
            <div className="w-1 h-1.5 rounded-full bg-amber-400 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Continuation Content Below Pinned Canvas */}
      <section id="concept" className="py-32 px-8 max-w-5xl mx-auto space-y-12">
        <div className="border-t border-slate-800/80 pt-16">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono">
            ARCHITECTURAL PHILOSOPHY
          </span>
          <h2 className="text-3xl font-light tracking-wide text-slate-100 mt-2 mb-6">
            Pure Spatial Harmony
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl font-light">
            Villa Horizon seamlessly combines modern structural minimalism with surrounding organic landscapes. Scroll through the 3D sequence to experience light, scale, and volume as they transform dynamically.
          </p>
        </div>
      </section>
    </main>
  );
}

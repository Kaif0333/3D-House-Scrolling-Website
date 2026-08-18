"use client";

import React, { useEffect, useState } from "react";

export interface SpaceZone {
  id: string;
  tag: string;
  title: string;
  description: string;
  specs: string[];
  startFrame: number;
  peakStartFrame: number;
  peakEndFrame: number;
  endFrame: number;
  align: "left" | "right";
}

const ZONES: SpaceZone[] = [
  {
    id: "entrance",
    tag: "01 / ARCHITECTURAL ENTRY",
    title: "Grand Entrance",
    description: "Double-height entryway crafted with brushed bronze, architectural concrete, and natural basalt stone.",
    specs: ["Ceiling Height: 6.5m", "Material: Basalt & Bronze"],
    startFrame: 15,
    peakStartFrame: 30,
    peakEndFrame: 65,
    endFrame: 80,
    align: "left",
  },
  {
    id: "living",
    tag: "02 / LIVING & LOUNGE",
    title: "Light & Panoramic Lounge",
    description: "Floor-to-ceiling glass curtain walls offering panoramic valley views and seamless indoor-outdoor flow.",
    specs: ["Exposure: South-West", "Glass: Triple-Glazed Low-E"],
    startFrame: 95,
    peakStartFrame: 110,
    peakEndFrame: 150,
    endFrame: 165,
    align: "right",
  },
  {
    id: "kitchen",
    tag: "03 / CULINARY ATELIER",
    title: "Gourmet Kitchen",
    description: "Handcrafted smoked oak cabinetry with monolithic Calacatta marble island and concealed chef pantry.",
    specs: ["Island: Calacatta Viola", "Appliances: Gaggenau Vario"],
    startFrame: 180,
    peakStartFrame: 195,
    peakEndFrame: 235,
    endFrame: 250,
    align: "left",
  },
  {
    id: "bedroom",
    tag: "04 / PRIVATE SANCTUARY",
    title: "Master Suite",
    description: "A tranquil sanctuary with integrated acoustic wood paneling, custom lighting, and private sunset terrace.",
    specs: ["Flooring: Smoked Oak", "Terrace: 32 m² Private"],
    startFrame: 265,
    peakStartFrame: 280,
    peakEndFrame: 320,
    endFrame: 335,
    align: "right",
  },
  {
    id: "bathroom",
    tag: "05 / WELLNESS SPA",
    title: "Spa Bath Suite",
    description: "Freestanding stone soak tub, rain shower enclosure, and radiant heated Travertine stone floors.",
    specs: ["Tub: Monolithic Limestone", "Heating: Radiant Floor"],
    startFrame: 350,
    peakStartFrame: 365,
    peakEndFrame: 405,
    endFrame: 420,
    align: "left",
  },
  {
    id: "garden",
    tag: "06 / BOTANICAL COURTYARD",
    title: "Zen Garden & Pool",
    description: "Secluded interior courtyard featuring endemic Japanese maples, reflecting pool, and outdoor fireplace.",
    specs: ["Flora: Endemic Maples", "Pool: Heated Infinity Edge"],
    startFrame: 435,
    peakStartFrame: 450,
    peakEndFrame: 485,
    endFrame: 498,
    align: "right",
  },
];

interface TimelineOverlaysProps {
  currentFrame: number;
}

export const TimelineOverlays: React.FC<TimelineOverlaysProps> = ({ currentFrame }) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Mouse Parallax Effect for Glass Cards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMouseOffset({ x: normX * 12, y: normY * 12 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {ZONES.map((zone) => {
        let opacity = 0;
        let translateY = 24;

        if (currentFrame >= zone.startFrame && currentFrame <= zone.endFrame) {
          if (currentFrame < zone.peakStartFrame) {
            const progress = (currentFrame - zone.startFrame) / (zone.peakStartFrame - zone.startFrame);
            opacity = Math.max(0, Math.min(1, progress));
            translateY = 24 * (1 - opacity);
          } else if (currentFrame <= zone.peakEndFrame) {
            opacity = 1;
            translateY = 0;
          } else {
            const progress = (currentFrame - zone.peakEndFrame) / (zone.endFrame - zone.peakEndFrame);
            opacity = Math.max(0, Math.min(1, 1 - progress));
            translateY = -16 * (1 - opacity);
          }
        }

        if (opacity <= 0.01) return null;

        const isLeft = zone.align === "left";

        return (
          <div
            key={zone.id}
            style={{
              opacity,
              transform: `translate3d(${mouseOffset.x}px, ${translateY + mouseOffset.y}px, 0)`,
              transition: "opacity 120ms ease-out, transform 120ms ease-out",
            }}
            className={`absolute bottom-20 md:bottom-24 max-w-sm w-[calc(100%-4rem)] pointer-events-auto ${
              isLeft ? "left-8 md:left-16" : "right-8 md:right-16"
            }`}
            data-cursor-hover
          >
            {/* Glassmorphism Card Container */}
            <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800/70 p-6 md:p-7 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-amber-400/50 transition-colors duration-300">
              {/* Subtle top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/80 via-amber-300 to-transparent" />

              {/* Space Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-400 font-semibold">
                  {zone.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-light tracking-wide text-slate-100 mb-2 font-sans">
                {zone.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-300/90 font-light leading-relaxed mb-4">
                {zone.description}
              </p>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/60">
                {zone.specs.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800/80"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

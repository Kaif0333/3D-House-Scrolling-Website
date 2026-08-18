"use client";

import React from "react";
import Lenis from "lenis";

export interface RoomNavItem {
  id: string;
  name: string;
  shortName: string;
  startFrame: number;
  endFrame: number;
  targetProgress: number; // 0.0 to 1.0
}

export const ROOMS: RoomNavItem[] = [
  {
    id: "entrance",
    name: "Grand Entrance",
    shortName: "Entrance",
    startFrame: 15,
    endFrame: 80,
    targetProgress: 0.08,
  },
  {
    id: "living",
    name: "Living Space",
    shortName: "Living",
    startFrame: 95,
    endFrame: 165,
    targetProgress: 0.25,
  },
  {
    id: "kitchen",
    name: "Culinary Atelier",
    shortName: "Kitchen",
    startFrame: 180,
    endFrame: 250,
    targetProgress: 0.42,
  },
  {
    id: "bedroom",
    name: "Master Suite",
    shortName: "Bedroom",
    startFrame: 265,
    endFrame: 335,
    targetProgress: 0.59,
  },
  {
    id: "bathroom",
    name: "Wellness Spa",
    shortName: "Bathroom",
    startFrame: 350,
    endFrame: 420,
    targetProgress: 0.77,
  },
  {
    id: "garden",
    name: "Zen Garden",
    shortName: "Garden",
    startFrame: 435,
    endFrame: 498,
    targetProgress: 0.92,
  },
];

interface RoomProgressNavProps {
  currentFrame: number;
  lenisInstance: Lenis | null;
  scrollSectionRef: React.RefObject<HTMLDivElement | null>;
}

export const RoomProgressNav: React.FC<RoomProgressNavProps> = ({
  currentFrame,
  lenisInstance,
  scrollSectionRef,
}) => {
  // Determine currently active room based on frame range
  const activeRoomId = ROOMS.find(
    (r) => currentFrame >= r.startFrame && currentFrame <= r.endFrame
  )?.id;

  const handleRoomClick = (targetProgress: number) => {
    if (!lenisInstance || !scrollSectionRef.current) return;

    // Calculate absolute scroll position based on total scrollable distance
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = totalHeight * targetProgress;

    lenisInstance.scrollTo(targetScroll, {
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-5 pointer-events-auto">
      {ROOMS.map((room, index) => {
        const isActive = activeRoomId === room.id;

        return (
          <button
            key={room.id}
            onClick={() => handleRoomClick(room.targetProgress)}
            className="group flex items-center gap-3 cursor-pointer focus:outline-none"
            data-cursor-hover
            aria-label={`Scroll to ${room.name}`}
          >
            {/* Tooltip Label */}
            <span
              className={`text-[10px] uppercase font-mono tracking-[0.2em] transition-all duration-300 ${
                isActive
                  ? "opacity-100 text-amber-400 font-semibold translate-x-0"
                  : "opacity-0 group-hover:opacity-100 text-slate-400 translate-x-2"
              }`}
            >
              {String(index + 1).padStart(2, "0")}. {room.shortName}
            </span>

            {/* Indicator Dot */}
            <div className="relative flex items-center justify-center w-5 h-5">
              {/* Outer pulsing ring for active state */}
              {isActive && (
                <span className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping" />
              )}
              {/* Inner Dot */}
              <span
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-3 h-3 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-110"
                    : "w-1.5 h-1.5 bg-slate-700 group-hover:bg-slate-400 group-hover:scale-125"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

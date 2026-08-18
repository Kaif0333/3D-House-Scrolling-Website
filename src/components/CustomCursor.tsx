"use client";

import React, { useEffect, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide cursor on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      setPos({ x: e.clientX, y: e.clientY });

      // Check if target or parent has interactive cursor attributes
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("[data-cursor-hover]"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Smooth trailing ring follow loop
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    let currentX = -100;
    let currentY = -100;

    const loop = () => {
      currentX = lerp(currentX, pos.x, 0.15);
      currentY = lerp(currentY, pos.y, 0.15);
      setTrailingPos({ x: currentX, y: currentY });
      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameId);
    };
  }, [pos.x, pos.y]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Center Micro Dot */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        }}
        className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-transform duration-75"
      />

      {/* Trailing Luxury Ring */}
      <div
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) translate(-50%, -50%) scale(${
            isHovered ? 1.6 : 1
          })`,
        }}
        className={`absolute w-8 h-8 rounded-full border transition-all duration-300 ease-out ${
          isHovered
            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            : "border-slate-400/30"
        }`}
      />
    </div>
  );
};

"use client";

import React, { useRef } from "react";
import { ROOMS, SEQUENCE } from "@/data/villa";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { gsap, ScrollTrigger, useGsap, prefersReducedMotion } from "@/lib/motion";

const LAST_FRAME = SEQUENCE.totalFrames - 1;

interface RoomProgressNavProps {
  activeRoom: string | null;
}

/**
 * The right-hand room rail.
 *
 * Jump targets are derived from the pinned ScrollTrigger's own span, so the
 * frame ranges in the data file are the single source of truth. (Deriving them
 * from document height instead is what made every dot land in the wrong room.)
 */
export function RoomProgressNav({ activeRoom }: RoomProgressNavProps) {
  const railRef = useRef<HTMLElement | null>(null);
  const { scrollTo } = useSmoothScroll();

  // The rail belongs to the hero — retire it once the pin lets go, so it never
  // floats over the form and footer pointing at rooms that are off screen.
  useGsap(() => {
    const rail = railRef.current;
    if (!rail || prefersReducedMotion()) return;

    const st = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: SEQUENCE.scrollLength,
      onToggle: (self) =>
        gsap.to(rail, {
          autoAlpha: self.isActive ? 1 : 0,
          duration: 0.4,
          overwrite: true,
        }),
    });

    return () => st.kill();
  }, undefined, []);

  const goToRoom = (startFrame: number, endFrame: number) => {
    const pin = ScrollTrigger.getById(SEQUENCE.triggerId);
    const midFrame = (startFrame + endFrame) / 2;

    if (!pin) {
      // No pin (reduced motion): the hero is a still, so just go to it.
      scrollTo("#hero", { duration: 1.2 });
      return;
    }

    const target = pin.start + (midFrame / LAST_FRAME) * (pin.end - pin.start);
    scrollTo(target, { duration: 1.5 });
  };

  return (
    <nav
      ref={railRef}
      aria-label="Rooms in the walkthrough"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-1 sm:flex md:right-6"
    >
      {ROOMS.map((room) => {
        const isActive = activeRoom === room.id;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => goToRoom(room.startFrame, room.endFrame)}
            aria-current={isActive ? "true" : undefined}
            data-cursor-hover
            className="group flex min-h-11 items-center gap-3 px-2 py-2"
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ${
                isActive
                  ? "translate-x-0 text-champagne opacity-100"
                  : "translate-x-1 text-stone opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              }`}
            >
              {room.index} {room.shortName}
            </span>

            {/* Measure line — length encodes state, so it is not colour-only */}
            <span
              className={`block h-px transition-all duration-500 ${
                isActive
                  ? "w-7 bg-champagne"
                  : "w-3 bg-stone-dim group-hover:w-5 group-hover:bg-stone"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}

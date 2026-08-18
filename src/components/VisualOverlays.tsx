"use client";

import React from "react";

export const VisualOverlays: React.FC = () => {
  return (
    <>
      {/* Soft Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,6,23,0.75)_100%)]" />

      {/* Subtle Film Grain Noise SVG Overlay */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </>
  );
};

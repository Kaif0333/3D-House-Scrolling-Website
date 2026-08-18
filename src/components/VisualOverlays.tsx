import React from "react";

/**
 * Film grain, site-wide.
 *
 * The vignette that used to live here has moved into the hero itself — as a
 * fixed layer it dimmed every section below the fold. The grain tile is larger
 * than the viewport and drifts in steps, which reads as emulsion rather than a
 * frozen pattern, and costs nothing but a compositor transform.
 */
export function VisualOverlays() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <svg
        className="absolute -inset-[60px] h-[calc(100%+120px)] w-[calc(100%+120px)] opacity-[0.045] mix-blend-overlay motion-safe:animate-[horizon-grain_1s_steps(4)_infinite]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="villa-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#villa-grain)" />
      </svg>
    </div>
  );
}

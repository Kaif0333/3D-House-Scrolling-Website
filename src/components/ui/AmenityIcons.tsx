import type { ReactElement } from "react";
import type { AmenityIcon as AmenityIconName } from "@/data/villa";

/**
 * Five bespoke marks for the amenities grid.
 *
 * They are drawn by one hand on one 24x24 grid: a 1.25 stroke in currentColor,
 * round caps and joins, nothing filled, and a shared ground line at y=19.6 so
 * the set sits on a common datum. Each glyph is architectural rather than
 * illustrative — an elevation or a plan, never a pictogram of an object.
 * This replaces the emoji the section used to carry.
 */
const GLYPHS: Record<AmenityIconName, ReactElement> = {
  /* Infinity-pool edge: distant horizon, the water plane spilling over the
     lip, and two still ripples nested beneath it. */
  water: (
    <>
      <path d="M3 6.6H21" />
      <path d="M3 11.2H16.2C18.4 11.2 19.4 12.3 19.8 14.1" />
      <path d="M6.8 16.2q2.6-0.9 5.2 0t5.2 0" />
      <path d="M8.7 19.5q1.65-0.65 3.3 0t3.3 0" />
    </>
  ),

  /* Cellar: a single bottle in elevation — neck, shoulder, body — standing on
     the shelf rule that carries the whole set's ground line. */
  cellar: (
    <>
      <path d="M8.9 19.6V12.05C8.9 10.15 10.7 9.75 10.7 8.05V3.6H13.3V8.05C13.3 9.75 15.1 10.15 15.1 12.05V19.6" />
      <path d="M10.7 5.9H13.3" />
      <path d="M3 19.6H21" />
    </>
  ),

  /* Thermal: three sauna stones stacked on the ground line, with two heat
     curves rising off them at unequal heights. */
  thermal: (
    <>
      <rect x="4.6" y="15.5" width="6.1" height="4.1" rx="2.05" />
      <rect x="13.3" y="15.5" width="6.1" height="4.1" rx="2.05" />
      <rect x="8.95" y="10.9" width="6.1" height="4.1" rx="2.05" />
      <path d="M9.9 9.1c-1.4-1.55 1.4-2.7 0-4.25c-0.55-0.6-0.6-1.05-0.3-1.55" />
      <path d="M14.1 9.4c1.35-1.5-1.35-2.6 0-4.05" />
    </>
  ),

  /* Screening: a section through the cinema — the screen hung above, the
     floor rule below, and a small aperture on it throwing a wide cone. */
  screening: (
    <>
      <rect x="3.2" y="3.4" width="17.6" height="8.6" rx="0.6" />
      <circle cx="12" cy="18.55" r="1.05" />
      <path d="M11.14 17.95L6 14.4" />
      <path d="M12.86 17.95L18 14.4" />
      <path d="M3 19.6H21" />
    </>
  ),

  /* Arrival: the helipad seen in plan — circle and H — held above the same
     ground rule the cellar shelf sits on. */
  arrival: (
    <>
      <circle cx="12" cy="11.3" r="6.5" />
      <path d="M9.4 8.1V14.5" />
      <path d="M14.6 8.1V14.5" />
      <path d="M9.4 11.3H14.6" />
      <path d="M3 19.6H21" />
    </>
  ),
};

/**
 * Renders one mark from the set. Purely decorative — the card's heading
 * already names the amenity — so it is hidden from assistive technology.
 */
export function AmenityIcon({
  name,
  className = "h-7 w-7",
}: {
  name: AmenityIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  );
}

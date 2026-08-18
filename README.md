# Villa Horizon

A cinematic one-page site for a fictional contemporary residence above Lake Como. The hero is a
500-frame architectural walkthrough scrubbed by scroll; everything below it is an editorial
property presentation built on the same motion vocabulary.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## How the hero works

The source footage was rendered as a video, split into 500 stills, and is replayed on a `<canvas>`
driven by a pinned GSAP `ScrollTrigger`.

The scrub pipeline is deliberately **imperative** — a scrubbed timeline tweens a plain proxy object
and calls `canvas.draw(frame)` synchronously inside GSAP's ticker. No frame value passes through
React state, so scrolling never re-renders the tree. The only React state in the hero is the active
room id, which changes six times across the whole sequence.

One timeline owns everything: the playhead, the six room cards, the title exit and the scroll cue.
Because the cards are positioned on that same timeline at frame fractions, they can never drift out
of sync with the film.

| Concern | Approach |
| --- | --- |
| Payload | WebP at two tiers — 1600px desktop (~18 MB / 500 frames), 960px mobile (~5 MB / 250 frames) |
| Variant choice | Viewport width plus `navigator.connection.saveData` / `effectiveType` |
| Decode | `img.decode()` off the main thread; the browser keeps decoded bitmaps purgeable |
| Streaming | Loads radiate outward from the playhead, six requests in flight, so fast scrolls never strand on a distant frame |
| Opening gate | 32 frames, then the curtain lifts and the rest stream in |
| Portrait phones | The frame is letterboxed rather than cropped to a 26% centre strip |
| Caching | `/seq/*` and `/stills/*` served `immutable` for a year |

## Assets

`assets/frames/` holds the original 1920×1080 JPG export. It sits outside `public/` deliberately: it is
the **source** for the pipeline and is never served — the site loads `public/seq/` instead.

```bash
node scripts/build-assets.mjs
```

Regenerates from `assets/frames/`:

- `public/seq/d/` — 500 desktop frames (1600px WebP)
- `public/seq/m/` — 250 mobile frames (960px WebP, every 2nd frame)
- `public/stills/` — 14 curated stills used by the sections and the gallery
- `src/app/opengraph-image.jpg` — the social card

## Structure

```
src/
  app/            layout (metadata, fonts, JSON-LD), page (Server Component), globals.css
  components/     hero cluster, sections, ui/
  data/villa.ts   single source of truth — rooms, suites, amenities, materials, contact
  lib/motion.ts   GSAP registration, useGsap, reveal/count-up/draw/magnetic helpers
scripts/          asset pipeline
```

`src/data/villa.ts` is the only place room frame-ranges are defined. The hero overlays, the progress
rail and the gallery all read from it, so the timings cannot drift apart. The room rail derives its
jump targets from the pinned ScrollTrigger's own span rather than document height.

## Design system

"Warm Monolith" — a deliberately single dark world, defined as Tailwind v4 `@theme` tokens in
`globals.css`. Warm near-black ground (`ink #0e0d0b`), bone type, champagne accent; no Tailwind
default palette utilities anywhere. Fraunces carries display type, Geist the body, Geist Mono only
eyebrows and data.

## Motion and accessibility

Every animation goes through `src/lib/motion.ts`, which guards on `prefers-reduced-motion`. Under
reduced motion the hero drops the pin entirely and shows a still. The walkthrough narrative is always
in the DOM for assistive tech and crawlers, the canvas is labelled, there is a skip link and a
"skip the tour" control, and focus outlines are restyled rather than removed.

## Notes

The enquiry form has no backend and does not transmit. It validates, then hands the visitor a
prefilled `mailto:` and the direct contact channels, and says so plainly.

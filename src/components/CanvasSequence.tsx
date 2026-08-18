"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { SEQUENCE } from "@/data/villa";

export interface CanvasSequenceHandle {
  /** Draw a frame immediately. Called from ScrollTrigger's onUpdate — no React state involved. */
  draw: (frame: number) => void;
}

interface CanvasSequenceProps {
  onReady?: () => void;
  className?: string;
}

interface Variant {
  dir: string;
  stride: number;
  /** Number of files that actually exist in this variant's directory. */
  count: number;
}

const MAX_INFLIGHT = 6;

function pickVariant(): Variant {
  const desktop: Variant = {
    dir: SEQUENCE.desktop.dir,
    stride: 1,
    count: SEQUENCE.totalFrames,
  };
  if (typeof window === "undefined") return desktop;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const conn = nav.connection;
  const frugal =
    conn?.saveData === true ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "3g";

  const narrow = window.matchMedia("(max-width: 900px)").matches;

  if (narrow || frugal) {
    return {
      dir: SEQUENCE.mobile.dir,
      stride: SEQUENCE.mobile.stride,
      count: Math.ceil(SEQUENCE.totalFrames / SEQUENCE.mobile.stride),
    };
  }
  return desktop;
}

/**
 * Renders the walkthrough as a canvas image sequence.
 *
 * Frames are plain <img> elements decoded off the main thread via `decode()`,
 * which keeps first-draw latency low while letting the browser purge decoded
 * bitmaps under memory pressure (an explicit ImageBitmap cache would pin them).
 * Loading radiates outward from the playhead, so a fast scroll never strands
 * the viewer on a frame from a different room.
 */
export const CanvasSequence = forwardRef<CanvasSequenceHandle, CanvasSequenceProps>(
  function CanvasSequence({ onReady, className = "" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const framesRef = useRef<(HTMLImageElement | null)[]>([]);
    const variantRef = useRef<Variant>({
      dir: SEQUENCE.desktop.dir,
      stride: 1,
      count: SEQUENCE.totalFrames,
    });
    const playheadRef = useRef(0);
    const lastDrawnRef = useRef(-1);
    const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
    const pumpRef = useRef<(() => void) | null>(null);

    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const [curtainGone, setCurtainGone] = useState(false);
    const [failed, setFailed] = useState(false);

    /** Maps a 0..totalFrames-1 timeline frame onto this variant's file slot. */
    const toSlot = useCallback((frame: number) => {
      const v = variantRef.current;
      return Math.max(0, Math.min(v.count - 1, Math.round(frame / v.stride)));
    }, []);

    const paint = useCallback((slot: number, force = false) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;
      if (!force && lastDrawnRef.current === slot) return;

      let img = framesRef.current[slot];

      // Fall back to the closest loaded neighbour rather than showing nothing.
      if (!img?.complete || !img.naturalWidth) {
        let found: HTMLImageElement | null = null;
        for (let offset = 1; offset <= 60 && !found; offset++) {
          const back = framesRef.current[slot - offset];
          if (back?.complete && back.naturalWidth) found = back;
          const fwd = framesRef.current[slot + offset];
          if (!found && fwd?.complete && fwd.naturalWidth) found = fwd;
        }
        img = found;
      }
      if (!img?.complete || !img.naturalWidth) return;

      const { w, h, dpr } = sizeRef.current;
      if (!w || !h) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0e0d0b";
      ctx.fillRect(0, 0, w, h);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = w / h;

      let dw: number;
      let dh: number;
      let dx: number;
      let dy: number;

      if (boxAspect < 0.95) {
        // Portrait viewport: letterbox the cinematic frame rather than cropping
        // away three-quarters of it. The band sits just below the title block
        // and just above the room card — see the hero's portrait layout.
        dw = w;
        dh = w / imgAspect;
        dx = 0;
        dy = h * 0.47 - dh / 2;
      } else if (boxAspect > imgAspect) {
        dw = w;
        dh = w / imgAspect;
        dx = 0;
        dy = (h - dh) / 2;
      } else {
        dh = h;
        dw = h * imgAspect;
        dy = 0;
        dx = (w - dw) / 2;
      }

      ctx.drawImage(img, dx, dy, dw, dh);
      lastDrawnRef.current = slot;
    }, []);

    const draw = useCallback(
      (frame: number) => {
        playheadRef.current = frame;
        paint(toSlot(frame));
        pumpRef.current?.();
      },
      [paint, toSlot]
    );

    useImperativeHandle(ref, () => ({ draw }), [draw]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let mounted = true;
      const variant = pickVariant();
      variantRef.current = variant;
      framesRef.current = new Array(variant.count).fill(null);
      ctxRef.current = canvas.getContext("2d", { alpha: false });

      const frameUrl = (slot: number) =>
        `${variant.dir}/f_${String(slot + 1).padStart(4, "0")}.webp`;

      // Cache geometry instead of reading layout on every draw.
      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        sizeRef.current = { w: rect.width, h: rect.height, dpr };
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        paint(toSlot(playheadRef.current), true);
      };
      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(canvas);

      /* ---------------- streaming loader ---------------- */

      const requested = new Set<number>();
      let inflight = 0;

      const nextSlot = (): number | null => {
        const centre = toSlot(playheadRef.current);
        for (let radius = 0; radius < variant.count; radius++) {
          const ahead = centre + radius;
          if (ahead < variant.count && !requested.has(ahead)) return ahead;
          const behind = centre - radius;
          if (behind >= 0 && !requested.has(behind)) return behind;
        }
        return null;
      };

      const loadSlot = (slot: number) => {
        requested.add(slot);
        inflight++;

        const img = new Image();
        img.decoding = "async";
        // The opening frames matter for time-to-first-paint; the rest can wait.
        img.fetchPriority = slot < 8 ? "high" : "low";
        img.src = frameUrl(slot);

        const commit = () => {
          if (!mounted) return;
          framesRef.current[slot] = img;
          if (toSlot(playheadRef.current) === slot || lastDrawnRef.current === -1) {
            paint(slot, true);
          }
        };

        const settle = () => {
          inflight--;
          if (mounted) pump();
        };

        img
          .decode()
          .then(() => {
            commit();
            settle();
          })
          .catch(() => {
            // decode() can reject for already-cached images on some engines.
            if (img.complete && img.naturalWidth) commit();
            settle();
          });
      };

      /** Keeps MAX_INFLIGHT requests in the air, always nearest the playhead. */
      const pump = () => {
        if (!mounted) return;
        while (inflight < MAX_INFLIGHT) {
          const slot = nextSlot();
          if (slot === null) break;
          loadSlot(slot);
        }
      };
      pumpRef.current = pump;

      /* ---------------- opening gate ---------------- */

      const gate = Math.min(SEQUENCE.preloadCount, variant.count);
      let settled = 0;
      let opened = false;

      const openCurtain = () => {
        if (opened || !mounted) return;
        opened = true;
        setReady(true);
        onReady?.();
        window.setTimeout(() => mounted && setCurtainGone(true), 700);
      };

      pump();

      // Track the opening batch so the progress readout is honest.
      const gateTimer = window.setInterval(() => {
        if (!mounted) return;
        let have = 0;
        for (let i = 0; i < gate; i++) {
          const f = framesRef.current[i];
          if (f?.complete && f.naturalWidth) have++;
        }
        if (have > settled) {
          settled = have;
          setProgress(Math.round((settled / gate) * 100));
        }
        if (settled >= gate) {
          window.clearInterval(gateTimer);
          openCurtain();
        }
      }, 90);

      // Safety valve: never trap the viewer behind a stalled asset.
      const failsafe = window.setTimeout(() => {
        if (!mounted || opened) return;
        if (settled === 0) setFailed(true);
        openCurtain();
      }, 12000);

      return () => {
        mounted = false;
        pumpRef.current = null;
        ro.disconnect();
        window.clearInterval(gateTimer);
        window.clearTimeout(failsafe);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className={`relative h-full w-full overflow-hidden bg-ink ${className}`}>
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label="Cinematic walkthrough of Villa Horizon, from the arrival court through the living spaces to the garden courtyard at dusk."
        />

        {!curtainGone && (
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-700 ease-out ${
              ready ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex w-[min(78vw,22rem)] flex-col items-center gap-7 text-center">
              <div className="space-y-3">
                <p className="eyebrow">Atelier Vermeer</p>
                <h2 className="font-display text-4xl font-light text-bone md:text-5xl">
                  Villa Horizon
                </h2>
              </div>

              <div className="h-px w-full bg-hairline">
                <div
                  className="h-px bg-champagne transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="font-mono text-[11px] tracking-[0.24em] text-stone tabular">
                {failed
                  ? "SEQUENCE UNAVAILABLE — CONTINUE BELOW"
                  : `PREPARING THE WALKTHROUGH · ${String(progress).padStart(3, "0")}%`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

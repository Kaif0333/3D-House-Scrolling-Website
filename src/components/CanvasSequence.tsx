"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface CanvasSequenceProps {
  totalFrames?: number;
  initialPreloadCount?: number;
  currentFrameIndex?: number; // Controlled purely by GSAP ScrollTrigger progress
  className?: string;
  onInitialLoadComplete?: () => void;
}

export const CanvasSequence: React.FC<CanvasSequenceProps> = ({
  totalFrames = 500,
  initialPreloadCount = 150,
  currentFrameIndex = 0,
  className = "",
  onInitialLoadComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnIndexRef = useRef<number | null>(null);
  
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);
  const [preloaderHidden, setPreloaderHidden] = useState<boolean>(false);

  // Helper to format frame filename: /frames/frame_0001.jpg
  const getFrameUrl = (index: number) => {
    const frameNum = String(index + 1).padStart(4, "0");
    return `/frames/frame_${frameNum}.jpg`;
  };

  // Draw specific frame to canvas with responsive 'cover' scaling
  const renderFrame = useCallback((frameIndex: number, forceRedraw = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip redraw if this frame was already rendered and no force redraw (e.g. resize) was requested
    if (!forceRedraw && lastDrawnIndexRef.current === frameIndex) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fallback to nearest loaded frame if target frame is still downloading
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < totalFrames; offset++) {
        const prevImg = imagesRef.current[frameIndex - offset];
        if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) {
          img = prevImg;
          break;
        }
        const nextImg = imagesRef.current[frameIndex + offset];
        if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
          img = nextImg;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Handle high DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate aspect ratio 'cover' scaling
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      renderHeight = rect.width / imgAspect;
      offsetY = (rect.height - renderHeight) / 2;
    } else {
      renderWidth = rect.height * imgAspect;
      offsetX = (rect.width - renderWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    lastDrawnIndexRef.current = frameIndex;
  }, [totalFrames]);

  // Preload initial frames (1 to 150)
  useEffect(() => {
    imagesRef.current = new Array(totalFrames).fill(null);

    let mounted = true;
    let count = 0;
    const initialTarget = Math.min(initialPreloadCount, totalFrames);

    const loadInitialFrames = async () => {
      const promises: Promise<void>[] = [];

      for (let i = 0; i < initialTarget; i++) {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.src = getFrameUrl(i);
          img.onload = () => {
            if (mounted) {
              imagesRef.current[i] = img;
              count++;
              setLoadedCount(count);
              // Render frame 0 as soon as it arrives
              if (i === 0) {
                renderFrame(0, true);
              }
            }
            resolve();
          };
          img.onerror = () => {
            if (mounted) {
              count++;
              setLoadedCount(count);
            }
            resolve();
          };
        });
        promises.push(promise);
      }

      await Promise.all(promises);

      if (mounted) {
        setIsInitialLoaded(true);
        if (onInitialLoadComplete) onInitialLoadComplete();

        // Hide preloader overlay cleanly
        setTimeout(() => {
          if (mounted) setPreloaderHidden(true);
        }, 400);

        // Begin non-blocking background fetch for remaining frames (151 to 500)
        loadBackgroundFrames(initialTarget);
      }
    };

    const loadBackgroundFrames = (startIndex: number) => {
      if (startIndex >= totalFrames) return;

      const batchSize = 10;
      let currentIndex = startIndex;

      const loadNextBatch = () => {
        if (!mounted || currentIndex >= totalFrames) return;

        const endBatch = Math.min(currentIndex + batchSize, totalFrames);
        const batchPromises: Promise<void>[] = [];

        for (let i = currentIndex; i < endBatch; i++) {
          const promise = new Promise<void>((resolve) => {
            const img = new Image();
            img.src = getFrameUrl(i);
            img.onload = () => {
              if (mounted) {
                imagesRef.current[i] = img;
              }
              resolve();
            };
            img.onerror = () => {
              resolve();
            };
          });
          batchPromises.push(promise);
        }

        Promise.all(batchPromises).then(() => {
          currentIndex = endBatch;
          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            window.requestIdleCallback(() => loadNextBatch(), { timeout: 200 });
          } else {
            setTimeout(loadNextBatch, 50);
          }
        });
      };

      loadNextBatch();
    };

    loadInitialFrames();

    return () => {
      mounted = false;
    };
  }, [totalFrames, initialPreloadCount, renderFrame, onInitialLoadComplete]);

  // Redraw ONLY when currentFrameIndex changes
  useEffect(() => {
    let animFrameId: number;
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.floor(currentFrameIndex)));

    // Schedule frame render on requestAnimationFrame after scroll update
    animFrameId = requestAnimationFrame(() => {
      renderFrame(clampedIndex);
    });

    return () => cancelAnimationFrame(animFrameId);
  }, [currentFrameIndex, renderFrame, totalFrames]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.floor(currentFrameIndex)));
      renderFrame(clampedIndex, true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentFrameIndex, renderFrame, totalFrames]);

  const loadingPercentage = Math.min(
    100,
    Math.round((loadedCount / Math.min(initialPreloadCount, totalFrames)) * 100)
  );

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover"
      />

      {/* Preloader Overlay */}
      {!preloaderHidden && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-700 ease-in-out ${
            isInitialLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-md">
            <div className="space-y-1">
              <h2 className="text-xs uppercase tracking-[0.3em] font-medium text-amber-400/90">
                Architectural Showcase
              </h2>
              <h1 className="text-2xl font-light tracking-wider text-slate-100">
                Loading 3D Villa Experience
              </h1>
            </div>

            <div className="flex items-baseline gap-1 my-2">
              <span className="text-6xl font-extralight tracking-tighter text-amber-400 font-mono">
                {loadingPercentage}
              </span>
              <span className="text-xl font-light text-amber-400/70">%</span>
            </div>

            <div className="w-64 h-[3px] bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 transition-all duration-200 ease-out rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${loadingPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

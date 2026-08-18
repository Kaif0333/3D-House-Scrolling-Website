"use client";

import React from "react";
import Lenis from "lenis";

interface LuxuryFooterProps {
  lenisInstance: Lenis | null;
}

export const LuxuryFooter: React.FC<LuxuryFooterProps> = ({ lenisInstance }) => {
  const scrollToTop = () => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-24 pb-12 px-6 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 justify-between">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-amber-400/40 bg-slate-900/60 flex items-center justify-center text-amber-400 font-serif text-sm">
                H
              </div>
              <span className="text-sm font-light tracking-[0.3em] text-slate-100 uppercase font-sans">
                HORIZON VILLA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light max-w-sm leading-relaxed">
              A masterwork of contemporary architectural engineering and spatial serenity. Designed for those who appreciate pure aesthetic perfection.
            </p>
          </div>

          {/* Locations Col */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              GLOBAL REPRESENTATION
            </span>
            <ul className="text-xs text-slate-300 font-mono space-y-2">
              <li>Zurich • Bahnhofstrasse 42</li>
              <li>Lake Como • Via Bellagio 12</li>
              <li>Aspen • E Cooper Ave 204</li>
              <li>Tokyo • Ginza 6-Chome</li>
            </ul>
          </div>

          {/* Quick Links Col */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold block">
              QUICK NAVIGATION
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <a href="#concept" className="hover:text-amber-400 transition-colors">
                • Concept
              </a>
              <a href="#residences" className="hover:text-amber-400 transition-colors">
                • Residences
              </a>
              <a href="#gallery" className="hover:text-amber-400 transition-colors">
                • Amenities
              </a>
              <a href="#inquire" className="hover:text-amber-400 transition-colors">
                • Inquire
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Back to Top */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} HORIZON VILLA RESIDENCE. ALL RIGHTS RESERVED.
          </div>

          <button
            onClick={scrollToTop}
            data-cursor-hover
            className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer uppercase tracking-widest"
          >
            <span>BACK TO TOP</span>
            <span className="text-amber-400 text-sm">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

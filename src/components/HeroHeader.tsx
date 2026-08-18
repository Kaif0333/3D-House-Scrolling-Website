"use client";

import React from "react";

export const HeroHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-6 md:p-10 flex items-center justify-between bg-transparent">
      {/* Top Left: Liquid Glass Logo */}
      <div
        className="pointer-events-auto flex items-center gap-3 group cursor-pointer"
        data-cursor-hover
      >
        <div className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center text-amber-400 font-serif font-light text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.3)] group-hover:border-amber-400/60 transition-colors duration-500">
          H
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-light tracking-[0.3em] text-slate-100 uppercase font-sans">
            HORIZON
          </span>
          <span className="text-[9px] tracking-[0.3em] text-amber-400/80 uppercase font-mono">
            VILLA RESIDENCE
          </span>
        </div>
      </div>

      {/* Top Right: Liquid Glass Navigation Bar */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-8 bg-white/[0.03] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-7 py-2.5 rounded-full text-xs font-light text-slate-200">
        <a
          href="#concept"
          data-cursor-hover
          className="hover:text-amber-400 transition-colors duration-300 uppercase tracking-widest text-[11px]"
        >
          Concept
        </a>
        <a
          href="#residences"
          data-cursor-hover
          className="hover:text-amber-400 transition-colors duration-300 uppercase tracking-widest text-[11px]"
        >
          Residences
        </a>
        <a
          href="#gallery"
          data-cursor-hover
          className="hover:text-amber-400 transition-colors duration-300 uppercase tracking-widest text-[11px]"
        >
          Gallery
        </a>
        
        {/* Transparent Liquid Glass CTA Button */}
        <a
          href="#inquire"
          data-cursor-hover
          className="bg-white/[0.05] hover:bg-amber-400/20 text-slate-100 hover:text-amber-300 border border-white/20 hover:border-amber-400/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-500 px-5 py-1.5 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase font-medium"
        >
          Inquire
        </a>
      </nav>
    </header>
  );
};

"use client";

import React, { useEffect, useState } from "react";

export const HeroHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 p-6 md:p-10 flex items-center justify-between transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-slate-950/40 backdrop-blur-xl border-b border-slate-800/40 py-4"
          : "bg-transparent py-6"
      }`}
    >
      {/* Top Left: Elegant Logo */}
      <div
        className="flex items-center gap-3 group cursor-pointer"
        data-cursor-hover
      >
        <div className="w-9 h-9 rounded-full border border-amber-400/40 bg-slate-950/60 backdrop-blur-md flex items-center justify-center text-amber-400 font-serif font-light text-sm shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:border-amber-400 transition-colors duration-300">
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

      {/* Top Right: Minimal Navigation Bar */}
      <nav className="hidden md:flex items-center gap-8 bg-slate-950/50 backdrop-blur-md border border-slate-800/80 px-6 py-2.5 rounded-full text-xs font-light text-slate-300 shadow-xl">
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
        <a
          href="#inquire"
          data-cursor-hover
          className="bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 border border-amber-400/30 px-4 py-1.5 rounded-full transition-all duration-300 text-[10px] font-mono tracking-widest uppercase font-semibold"
        >
          Inquire
        </a>
      </nav>
    </header>
  );
};

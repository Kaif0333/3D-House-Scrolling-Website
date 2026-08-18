"use client";

import React, { useState } from "react";

interface ResidenceSuite {
  id: string;
  name: string;
  level: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  status: string;
  highlights: string[];
  svgDiagram: string;
}

const SUITES: ResidenceSuite[] = [
  {
    id: "penthouse",
    name: "The Horizon Penthouse",
    level: "Upper Level • Tier 01",
    area: "650 m² / 7,000 sq ft",
    bedrooms: 4,
    bathrooms: 5,
    price: "$18,500,000",
    status: "Available",
    highlights: [
      "360° Infinity rooftop pool & terrace",
      "Private glass elevator access",
      "Double-sided marble fireplace lounge",
      "Subterranean 4-car climate garage",
    ],
    svgDiagram: "M 20 20 H 280 V 180 H 20 Z M 100 20 V 180 M 20 90 H 280 M 180 90 V 180",
  },
  {
    id: "garden",
    name: "The Garden Pavilion",
    level: "Ground Level • Tier 02",
    area: "520 m² / 5,600 sq ft",
    bedrooms: 3,
    bathrooms: 4,
    price: "$14,200,000",
    status: "Available",
    highlights: [
      "Direct private courtyard & lotus pool access",
      "Integrated indoor-outdoor dining pavilion",
      "Subterranean wellness spa & sauna",
      "Custom Italian walnut walk-in suites",
    ],
    svgDiagram: "M 20 20 H 280 V 180 H 20 Z M 150 20 V 180 M 20 110 H 150 M 150 90 H 280",
  },
  {
    id: "vista",
    name: "The Vista Suite",
    level: "West Wing • Tier 03",
    area: "380 m² / 4,100 sq ft",
    bedrooms: 2,
    bathrooms: 3,
    price: "$9,800,000",
    status: "Reserved",
    highlights: [
      "Sunset orientation with glass terrace",
      "Custom Gaggenau chef kitchen",
      "Acoustic media lounge & wine vault",
      "Smart home automated climate dome",
    ],
    svgDiagram: "M 20 20 H 280 V 180 H 20 Z M 80 20 V 180 M 180 20 V 180 M 80 100 H 280",
  },
];

export const ResidencesExplorer: React.FC = () => {
  const [activeSuiteId, setActiveSuiteId] = useState<string>("penthouse");
  const activeSuite = SUITES.find((s) => s.id === activeSuiteId) || SUITES[0];

  return (
    <section id="residences" className="py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
      {/* Section Header */}
      <div className="space-y-3 max-w-2xl mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
          02 / RESIDENCES & FLOOR PLANS
        </span>
        <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-100 font-sans">
          Bespoke Living Spaces
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
          Three masterfully crafted architectural tiers designed to maximize privacy, natural light, and structural elegance.
        </p>
      </div>

      {/* Suite Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {SUITES.map((suite) => {
          const isActive = suite.id === activeSuiteId;
          return (
            <button
              key={suite.id}
              onClick={() => setActiveSuiteId(suite.id)}
              data-cursor-hover
              className={`p-6 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                isActive
                  ? "bg-slate-900/90 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
                  : "bg-slate-950/40 border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
                  {suite.level}
                </span>
                <span
                  className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                    suite.status === "Available"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {suite.status}
                </span>
              </div>
              <h3 className="text-lg font-light text-slate-100 mb-1">{suite.name}</h3>
              <p className="text-xs font-mono text-slate-400">{suite.area}</p>
            </button>
          );
        })}
      </div>

      {/* Active Suite Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Left Column: Floor Plan Schematic SVG */}
        <div className="lg:col-span-6 bg-slate-900/80 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative min-h-[320px]">
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase mb-4">
            ARCHITECTURAL SCHEMATIC • {activeSuite.name}
          </span>
          <svg
            viewBox="0 0 300 200"
            className="w-full max-w-sm h-auto text-amber-400/80 stroke-current fill-none stroke-[1.5]"
          >
            <path d={activeSuite.svgDiagram} />
            {/* Grid lines */}
            <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />
            <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />
          </svg>
          <div className="mt-6 flex gap-6 text-[11px] font-mono text-slate-400">
            <span>BEDROOMS: {activeSuite.bedrooms}</span>
            <span>BATHROOMS: {activeSuite.bathrooms}</span>
          </div>
        </div>

        {/* Right Column: Suite Specifications & Pricing */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-amber-400">
              SPECIFICATION OVERVIEW
            </span>
            <h3 className="text-2xl md:text-3xl font-light text-slate-100 mt-1 font-sans">
              {activeSuite.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-3 pb-4 border-b border-slate-800/80">
            <span className="text-3xl md:text-4xl font-light font-mono text-amber-400">
              {activeSuite.price}
            </span>
            <span className="text-xs text-slate-400 font-mono">ESTIMATED VALUATION</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300">
              SUITE HIGHLIGHTS
            </h4>
            <ul className="space-y-2.5">
              {activeSuite.highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#inquire"
            data-cursor-hover
            className="inline-block bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 border border-amber-400/40 px-6 py-3 rounded-full text-xs font-mono tracking-[0.2em] uppercase font-semibold transition-all duration-300"
          >
            Inquire For Private Presentation →
          </a>
        </div>
      </div>
    </section>
  );
};

"use client";

import React, { useState } from "react";

interface ConceptFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  statNumber: string;
  statLabel: string;
}

const CONCEPT_FEATURES: ConceptFeature[] = [
  {
    id: "synergy",
    title: "Structural Synergy",
    subtitle: "Harmonizing Nature & Steel",
    description:
      "Every beam and cantilevered deck is engineered to float weightlessly above the terrain, creating an uninterrupted dialogue between indoor sanctuaries and nature.",
    bullets: [
      "Zero-threshold triple glazed glass walls",
      "Custom patinated steel cantilevers",
      "Self-stabilizing foundation matrix",
    ],
    statNumber: "1,450 m²",
    statLabel: "Total Living Surface",
  },
  {
    id: "biophilic",
    title: "Biophilic Integration",
    subtitle: "Living Architecture",
    description:
      "Natural stone, endemic flora, and flowing water channels wind through the core of the villa, filtering air and infusing organic calming energy.",
    bullets: [
      "Subterranean rainwater recycling",
      "Integrated micro-climate gardens",
      "Acoustic stone waterfall buffers",
    ],
    statNumber: "360°",
    statLabel: "Panoramic Sightlines",
  },
  {
    id: "passive",
    title: "Passive Solar Engineering",
    subtitle: "Sustainable Precision",
    description:
      "Oriented along the sun's trajectory, overhangs optimize natural heating in winter while keeping interior spaces naturally cool during summer peaks.",
    bullets: [
      "Photovoltaic solar glass shingles",
      "Thermal mass basalt flooring",
      "AI-driven automated louvers",
    ],
    statNumber: "100%",
    statLabel: "Energy Neutrality",
  },
];

export const ArchitecturalConcept: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("synergy");
  const activeFeature = CONCEPT_FEATURES.find((f) => f.id === activeTab) || CONCEPT_FEATURES[0];

  return (
    <section id="concept" className="py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
            01 / PHILOSOPHY & VISION
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-100 font-sans">
            Sculpted for Generations
          </h2>
          <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
            Villa Horizon represents the pinnacle of modern architectural expression—where precision engineering meets uncompromised natural elegance.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/40 backdrop-blur-xl border border-slate-800/60 p-4 rounded-2xl">
          <div className="p-3">
            <div className="text-2xl md:text-3xl font-light font-mono text-amber-400">6.5m</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mt-1">
              Ceiling Clearance
            </div>
          </div>
          <div className="p-3 border-l border-slate-800/60">
            <div className="text-2xl md:text-3xl font-light font-mono text-amber-400">0.0</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mt-1">
              Carbon Footprint
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800/80 mb-12 overflow-x-auto no-scrollbar">
        {CONCEPT_FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveTab(feature.id)}
            data-cursor-hover
            className={`py-4 px-6 md:px-8 text-xs font-mono tracking-[0.2em] uppercase transition-all duration-300 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === feature.id
                ? "border-amber-400 text-amber-400 font-semibold bg-amber-400/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {feature.title}
          </button>
        ))}
      </div>

      {/* Feature Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/50 backdrop-blur-xl border border-slate-800/70 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] font-mono text-amber-400/90">
            {activeFeature.subtitle}
          </span>
          <h3 className="text-2xl md:text-4xl font-light text-slate-100 tracking-wide font-sans">
            {activeFeature.title}
          </h3>
          <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">
            {activeFeature.description}
          </p>

          <ul className="space-y-3 pt-2">
            {activeFeature.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column Stat Box */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-center space-y-3 shadow-inner">
          <span className="text-xs uppercase tracking-[0.3em] font-mono text-slate-400">
            Key Metric
          </span>
          <div className="text-4xl md:text-6xl font-light font-mono text-amber-400 tracking-tight">
            {activeFeature.statNumber}
          </div>
          <div className="text-xs font-mono tracking-widest text-slate-300 uppercase">
            {activeFeature.statLabel}
          </div>
        </div>
      </div>
    </section>
  );
};

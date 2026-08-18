"use client";

import React, { useState } from "react";

interface MaterialItem {
  id: string;
  name: string;
  origin: string;
  application: string;
  colorGradient: string;
  description: string;
}

const MATERIALS: MaterialItem[] = [
  {
    id: "marble",
    name: "Calacatta Viola Marble",
    origin: "Carrara, Italy",
    application: "Kitchen Island & Bath Suites",
    colorGradient: "from-slate-200 via-amber-100/40 to-slate-400",
    description: "Deep burgundy veining intertwined with creamy white quartz, bookmatched across all wet surfaces.",
  },
  {
    id: "oak",
    name: "Smoked Austrian Oak",
    origin: "Salzburg, Austria",
    application: "Acoustic Walls & Cabinetry",
    colorGradient: "from-amber-950 via-amber-900 to-amber-800",
    description: "Fumed for 72 hours to achieve rich dark chocolate tones and dense grain durability.",
  },
  {
    id: "bronze",
    name: "Patinated Bronze",
    origin: "Kyoto, Japan",
    application: "Entry Portals & Metal Trim",
    colorGradient: "from-amber-700 via-amber-800 to-slate-900",
    description: "Hand-rubbed patination providing subtle warm metallic reflections under ambient lighting.",
  },
  {
    id: "basalt",
    name: "Swiss Basalt Stone",
    origin: "Glarus, Switzerland",
    application: "Heated Flooring & Paving",
    colorGradient: "from-slate-800 via-slate-900 to-slate-950",
    description: "High thermal density volcanic stone engineered for radiant underfloor heating efficiency.",
  },
];

export const MaterialityShowcase: React.FC = () => {
  const [activeMaterial, setActiveMaterial] = useState<string>("marble");

  return (
    <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
      {/* Section Header */}
      <div className="space-y-3 max-w-2xl mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
          04 / ARCHITECTURAL MATERIALITY
        </span>
        <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-100 font-sans">
          Tactile Perfection
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
          Every raw material is ethically sourced from legendary quarries and artisan workshops around the world.
        </p>
      </div>

      {/* Material Swatch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MATERIALS.map((mat) => {
          const isActive = mat.id === activeMaterial;
          return (
            <button
              key={mat.id}
              onClick={() => setActiveMaterial(mat.id)}
              data-cursor-hover
              className={`p-6 rounded-3xl text-left transition-all duration-300 border cursor-pointer flex flex-col justify-between h-72 relative overflow-hidden group ${
                isActive
                  ? "bg-slate-900/90 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                  : "bg-slate-950/40 border-slate-800/70 hover:border-slate-700"
              }`}
            >
              {/* Material Texture Gradient Preview */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mat.colorGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
              />

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                  {mat.origin}
                </span>
                <h3 className="text-lg font-light text-slate-100 font-sans">{mat.name}</h3>
              </div>

              <div className="relative z-10 space-y-2 pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">
                  {mat.application}
                </span>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {mat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

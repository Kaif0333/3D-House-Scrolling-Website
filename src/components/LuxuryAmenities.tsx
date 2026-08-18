"use client";

import React from "react";

interface AmenityItem {
  id: string;
  category: string;
  title: string;
  description: string;
  span: string; // Tailwind grid span
  icon: string;
}

const AMENITIES: AmenityItem[] = [
  {
    id: "pool",
    category: "AQUATICS",
    title: "Cantilevered Infinity Pool",
    description: "Saltwater infinity pool extending 12 meters over the cliff edge with heated hydro-jets and underwater glass viewing portal.",
    span: "lg:col-span-8",
    icon: "🏊",
  },
  {
    id: "wine",
    category: "SOMMELIER",
    title: "Climate Wine Vault",
    description: "1,200 bottle climate-controlled sommelier vault crafted with dark oak and custom UV-filtered glass.",
    span: "lg:col-span-4",
    icon: "🍷",
  },
  {
    id: "spa",
    category: "WELLNESS",
    title: "Thermal Spa & Sauna",
    description: "Finnish cedar sauna, marble cold plunge, and radiant heated stone massage lounges for total rejuvenation.",
    span: "lg:col-span-4",
    icon: "🧘",
  },
  {
    id: "cinema",
    category: "ENTERTAINMENT",
    title: "Dolby Atmos Cinema",
    description: "16-seat private cinema engineered with acoustic fabric walls, 4K laser projection, and motorized leather recliners.",
    span: "lg:col-span-4",
    icon: "🎬",
  },
  {
    id: "helipad",
    category: "ACCESS",
    title: "Private Helipad & Garage",
    description: "Automated subterranean 6-car climate garage with fast EV charging and direct access to private rooftop helipad.",
    span: "lg:col-span-4",
    icon: "🚁",
  },
];

export const LuxuryAmenities: React.FC = () => {
  return (
    <section id="gallery" className="py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
      {/* Section Header */}
      <div className="space-y-3 max-w-2xl mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
          03 / UNRIVALED AMENITIES
        </span>
        <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-100 font-sans">
          Curated Private Lifestyle
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
          Every amenity is thoughtfully integrated to deliver an extraordinary standard of comfort, wellness, and entertainment.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {AMENITIES.map((amenity) => (
          <div
            key={amenity.id}
            data-cursor-hover
            className={`${amenity.span} bg-slate-950/50 backdrop-blur-xl border border-slate-800/70 p-8 md:p-10 rounded-3xl relative overflow-hidden group hover:border-amber-400/50 transition-all duration-500 shadow-xl flex flex-col justify-between`}
          >
            {/* Top Bar Icon & Category */}
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase">
                {amenity.category}
              </span>
              <span className="text-2xl bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 shadow-inner">
                {amenity.icon}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-light text-slate-100 group-hover:text-amber-300 transition-colors duration-300 font-sans">
                {amenity.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-300/80 font-light leading-relaxed">
                {amenity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

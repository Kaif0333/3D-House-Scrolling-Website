"use client";

import React, { useState } from "react";

export const InquirySection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Horizon Penthouse",
    tourDate: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <section id="inquire" className="py-32 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-semibold">
            05 / PRIVATE CONSULTATION
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-wide text-slate-100 font-sans">
            Schedule Your Private Presentation
          </h2>
          <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">
            Private viewing appointments for Villa Horizon are offered exclusively to verified buyers and representative advisors.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>DIRECT ADVISOR: +41 (0) 44 210 9800</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>DESK: CONCIERGE@HORIZONVILLA.COM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>OFFICES: ZURICH • LAKE COMO • ASPEN</span>
            </div>
          </div>
        </div>

        {/* Right Column Liquid Glass Form */}
        <div className="lg:col-span-7 bg-white/[0.04] backdrop-blur-2xl border border-white/15 p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h3 className="text-2xl font-light text-slate-100">Inquiry Received</h3>
              <p className="text-sm text-slate-300 font-light max-w-md mx-auto">
                Thank you, <span className="text-amber-400 font-medium">{formData.name}</span>. Our senior architectural concierge will reach out to you within 2 hours to confirm your private tour.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs font-mono text-amber-400 uppercase tracking-widest underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Lord / Lady / Dr. Name"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+41 79 000 0000"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                    SUITE INTEREST
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400/80 transition-colors"
                  >
                    <option value="Horizon Penthouse">The Horizon Penthouse ($18.5M)</option>
                    <option value="Garden Pavilion">The Garden Pavilion ($14.2M)</option>
                    <option value="Vista Suite">The Vista Suite ($9.8M)</option>
                    <option value="Entire Estate">Full Estate Purchase</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                  SPECIAL REQUESTS / MESSAGES
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Include any specific tour dates or representative preferences..."
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                data-cursor-hover
                className="w-full bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 border border-amber-400/40 py-4 rounded-xl text-xs font-mono tracking-[0.25em] uppercase font-semibold transition-all duration-500 shadow-lg cursor-pointer"
              >
                Request Private Presentation
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

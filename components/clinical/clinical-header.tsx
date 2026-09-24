"use client";

import React from "react";
import Image from "next/image";
import { Printer, ShieldCheck, Activity, LineChart, Columns, Sparkles } from "lucide-react";
import { cn } from "./ui-primitives";

interface ClinicalHeaderProps {
  activeTab: "nutrition" | "growth" | "split";
  onTabChange: (tab: "nutrition" | "growth" | "split") => void;
  onOpenFeedSheet: () => void;
}

export function ClinicalHeader({
  activeTab,
  onTabChange,
  onOpenFeedSheet,
}: ClinicalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-clinical-navy-950 text-white border-b border-clinical-navy-800 shadow-md">
      {/* Top Clinical & Regulatory Status Bar */}
      <div className="bg-clinical-navy-900/90 px-4 py-1 border-b border-clinical-navy-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side Engine (HIPAA / GDPR / GCC MOHAP Compliant)
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400 font-mono">
            Zero External Logging • Ephemeral Clinical Session
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded border border-blue-700/50 font-medium">
            ESPGHAN 2022 Validated
          </span>
          <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50 font-medium">
            Fenton 2013 / WHO 2006
          </span>
        </div>
      </div>

      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-4">
            <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
              <div className="relative w-28 sm:w-32 h-9">
                <Image
                  src="/logos/liptis-nutrition.png"
                  alt="Liptis Nutrition Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="hidden sm:block h-9 w-[1px] bg-clinical-navy-700" />

            <div className="bg-white/95 px-2 py-1 rounded-lg border border-white/20 flex items-center shrink-0">
              <div className="relative w-24 sm:w-28 h-8">
                <Image
                  src="/logos/pediamil-lbw.png"
                  alt="Pediamil LBW"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Liptis Nutrition NeoPed™
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-clinical-gold text-slate-950 uppercase tracking-wide">
                  LBW Clinical Suite
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Enteral Macronutrient Calculator & Age-Corrected Growth Trajectory
                Engine
              </p>
            </div>
          </div>

          {/* Clinical Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              id="generate-feed-sheet-btn"
              type="button"
              onClick={onOpenFeedSheet}
              aria-haspopup="dialog"
              aria-label="Generate Clinical Feed Sheet printable hospital document"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 border border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Generate Clinical Feed Sheet</span>
            </button>
          </div>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <div
          role="note"
          aria-label="Clinical regulatory notice"
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11.5px] text-slate-300 flex items-center justify-between gap-2"
        >
          <p className="leading-snug">
            <strong className="text-amber-300 font-semibold uppercase tracking-wide mr-1.5">
              Notice:
            </strong>
            For HCP reference only. Supported by Liptis Nutrition. Formulated
            against ESPGHAN 2022 guidelines and Fenton/WHO growth standards.
          </p>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="mt-3 flex items-center justify-between border-t border-clinical-navy-800 pt-2.5">
          <div
            role="tablist"
            aria-label="Clinical Calculation Modules"
            className="flex items-center gap-2"
            onKeyDown={(e) => {
              const tabs: ("nutrition" | "growth" | "split")[] = ["nutrition", "growth", "split"];
              const currentIndex = tabs.indexOf(activeTab);
              if (e.key === "ArrowRight") {
                const nextIndex = (currentIndex + 1) % tabs.length;
                onTabChange(tabs[nextIndex]);
              } else if (e.key === "ArrowLeft") {
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                onTabChange(tabs[prevIndex]);
              }
            }}
          >
            <button
              id="tab-nutrition"
              role="tab"
              type="button"
              aria-selected={activeTab === "nutrition"}
              aria-controls="panel-nutrition"
              tabIndex={activeTab === "nutrition" ? 0 : -1}
              onClick={() => onTabChange("nutrition")}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "nutrition"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <Activity className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Nutritional Feeds & Macro Engine</span>
            </button>

            <button
              id="tab-growth"
              role="tab"
              type="button"
              aria-selected={activeTab === "growth"}
              aria-controls="panel-growth"
              tabIndex={activeTab === "growth" ? 0 : -1}
              onClick={() => onTabChange("growth")}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "growth"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <LineChart className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Fenton / WHO Growth Plotter</span>
            </button>

            <button
              id="tab-split"
              role="tab"
              type="button"
              aria-selected={activeTab === "split"}
              aria-controls="panel-split"
              tabIndex={activeTab === "split" ? 0 : -1}
              onClick={() => onTabChange("split")}
              className={cn(
                "hidden lg:flex px-3.5 py-2 rounded-lg text-xs font-semibold transition-all items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "split"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <Columns className="w-4 h-4 text-purple-500" aria-hidden="true" />
              <span>Dual Split Screen</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-clinical-gold" aria-hidden="true" />
            <span>Pediamil® LBW Matrix: 80 kcal/100 mL • 2.2 g Prot/100 mL</span>
          </div>
        </div>
      </div>
    </header>
  );
}

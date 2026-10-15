"use client";

import React from "react";
import Image from "next/image";
import { Printer, ShieldCheck, Activity, LineChart, Columns, Sparkles } from "lucide-react";
import { cn } from "./ui-primitives";
import { APP_VERSION, APP_VERSION_LABEL, CLINICAL_GOVERNANCE } from "@/lib/version";

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
      <div className="bg-clinical-navy-900/90 px-3 sm:px-4 py-1 border-b border-clinical-navy-800 text-[10.5px] sm:text-[11px] text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Client-side calculation • Institutional review required</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400 font-mono">
            No Network Transmission • {APP_VERSION_LABEL}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs shrink-0 font-medium">
          <span className="bg-blue-900/60 text-blue-200 px-1.5 sm:px-2 py-0.5 rounded border border-blue-700/50">
            ESPGHAN 2022
          </span>
          <span className="bg-emerald-900/60 text-emerald-200 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-700/50">
            Fenton / WHO
          </span>
        </div>
      </div>

      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="bg-white px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <div className="relative w-24 sm:w-32 h-7 sm:h-9">
                  <Image
                    src="/logos/liptis-nutrition.png"
                    alt="Liptis Nutrition Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-clinical-navy-700" />

              <div className="bg-white/95 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/20 flex items-center shrink-0">
                <div className="relative w-20 sm:w-28 h-6 sm:h-8">
                  <Image
                    src="/logos/pediamil-lbw.png"
                    alt="Pediamil LBW"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="text-right sm:text-left">
              <div className="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight">
                  NeoPed™
                </h1>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-clinical-gold text-slate-950 uppercase tracking-wide shrink-0">
                  LBW Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden md:block">
                Enteral Macronutrient Calculator & Age-Corrected Growth Trajectory Engine
              </p>
            </div>
          </div>

          {/* Clinical Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              id="generate-feed-sheet-btn"
              type="button"
              onClick={onOpenFeedSheet}
              aria-haspopup="dialog"
              aria-label="Generate Clinical Feed Sheet printable hospital document"
              className="w-full md:w-auto px-3.5 py-2.5 sm:py-2 min-h-[44px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 border border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Generate Clinical Feed Sheet</span>
            </button>
          </div>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <div
          role="note"
          aria-label="Clinical regulatory notice"
          className="mt-2 sm:mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10.5px] sm:text-[11px] text-slate-300"
        >
          <p className="leading-snug">
            <strong className="text-amber-300 font-semibold uppercase tracking-wide mr-1.5">
              Notice:
            </strong>
            For licensed healthcare professionals. Reference calculation only. Not a prescription, medical order, diagnosis, or substitute for local NICU/pediatric protocol. Clinical judgment, fluid balance, illness severity, laboratory monitoring, parenteral nutrition, and total nutrient intake supersede calculated values.
          </p>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="mt-2.5 sm:mt-3 flex items-center justify-between border-t border-clinical-navy-800 pt-2 sm:pt-2.5">
          <div
            role="tablist"
            aria-label="Clinical Calculation Modules"
            className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-clinical-navy-900/90 sm:bg-transparent p-1 sm:p-0 rounded-xl sm:rounded-none border border-clinical-navy-800 sm:border-0"
            onKeyDown={(e) => {
              const tabs: ("growth" | "nutrition" | "split")[] = ["growth", "nutrition", "split"];
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
              id="tab-growth"
              role="tab"
              type="button"
              aria-selected={activeTab === "growth"}
              aria-controls="panel-growth"
              tabIndex={activeTab === "growth" ? 0 : -1}
              onClick={() => onTabChange("growth")}
              className={cn(
                "min-h-[44px] px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "growth"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <LineChart className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Growth Plotter</span>
              <span className="hidden sm:inline">Fenton / WHO Growth Plotter</span>
            </button>

            <button
              id="tab-nutrition"
              role="tab"
              type="button"
              aria-selected={activeTab === "nutrition"}
              aria-controls="panel-nutrition"
              tabIndex={activeTab === "nutrition" ? 0 : -1}
              onClick={() => onTabChange("nutrition")}
              className={cn(
                "min-h-[44px] px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "nutrition"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Macro Engine</span>
              <span className="hidden sm:inline">Nutritional Feeds & Macro Engine</span>
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
                "hidden lg:flex min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-all items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                activeTab === "split"
                  ? "bg-white text-clinical-navy-950 shadow"
                  : "text-slate-300 hover:text-white hover:bg-clinical-navy-800/80"
              )}
            >
              <Columns className="w-4 h-4 text-purple-500 shrink-0" aria-hidden="true" />
              <span>Dual Split Screen</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-clinical-gold shrink-0" aria-hidden="true" />
            <span>Pediamil® LBW Matrix: 79.7 kcal/100 mL • 2.42 g Prot/100 mL</span>
          </div>
        </div>
      </div>
    </header>
  );
}

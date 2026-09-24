"use client";

import React from "react";
import {
  calculateLbwNutrition,
  NutritionCalculationResult,
  STANDARD_LBW_MATRIX,
} from "@/lib/lbw-nutrition";
import { ClinicalCard, RangeGauge, StatusBadge } from "./ui-primitives";
import {
  Scale,
  Droplets,
  Flame,
  Dna,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

interface NutritionEngineProps {
  weightGrams: number;
  onWeightChange: (val: number) => void;
  fluidAllowance: number;
  onFluidChange: (val: number) => void;
  calculationResult: NutritionCalculationResult;
}

export function NutritionEngine({
  weightGrams,
  onWeightChange,
  fluidAllowance,
  onFluidChange,
  calculationResult: result,
}: NutritionEngineProps) {
  const quickWeightPresets = [
    { label: "850g (ELBW)", value: 850 },
    { label: "1,350g (VLBW)", value: 1350 },
    { label: "1,750g (VLBW)", value: 1750 },
    { label: "2,200g (LBW)", value: 2200 },
    { label: "3,100g (Step-Down)", value: 3100 },
    { label: "3,800g (Graduation)", value: 3800 },
    { label: "7,800g (Graduation)", value: 7800 },
  ];

  const quickFluidPresets = [135, 150, 160, 180];

  return (
    <div className="space-y-6">
      {/* Top Protocol Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-clinical-navy-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
            <Sparkles className="w-5 h-5 text-clinical-gold" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              ESPGHAN 2022 Enteral Nutrition Standard
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                Active Protocol
              </span>
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Target Matrix: {result.formulaProfile.brand} (Energy: {result.formulaProfile.energyKcalPer100Ml} kcal/100 mL • Protein: {result.formulaProfile.proteinGramsPer100Ml} g/100 mL)
            </p>
          </div>
        </div>
        <div className="text-xs text-right hidden sm:block">
          <span className="text-slate-300">Weight Category:</span>{" "}
          <strong className="text-white font-semibold">
            {result.isGraduated ? (
              <span className="text-blue-300">Graduation (&gt;3,500g • Preterm Targets N/A)</span>
            ) : (
              <span>
                {result.proteinBracket.classification} (
                {result.proteinBracket.targetMinGramsPerKg}–
                {result.proteinBracket.targetMaxGramsPerKg} g/kg/d protein)
              </span>
            )}
          </strong>
        </div>
      </div>

      {/* Screen Reader Live Announcement for Clinical Updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {result.clinicalSummary}
      </div>

      {/* Grid: Inputs & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clinical Parameters Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <ClinicalCard
            title="Patient Anthropometrics & Fluid Target"
            subtitle="Deterministic feed inputs for LBW enteral calculation"
            icon={<Scale className="w-4 h-4 text-clinical-navy-800" aria-hidden="true" />}
          >
            <div className="space-y-5">
              {/* Weight Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="weight-input"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    Current Weight (grams)
                    <span className="text-rose-500" aria-hidden="true">*</span>
                  </label>
                  <span id="weight-kg-display" className="text-xs font-mono font-medium text-slate-500">
                    {(weightGrams / 1000).toFixed(3)} kg
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="weight-input"
                    type="number"
                    min={400}
                    max={10000}
                    step={10}
                    value={weightGrams}
                    onChange={(e) => onWeightChange(Number(e.target.value))}
                    aria-describedby="weight-kg-display weight-presets-group"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent transition-all focus-visible:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400" aria-hidden="true">
                    grams (g)
                  </div>
                </div>

                {/* Validation Indicator & Presets */}
                <div id="weight-presets-group" role="group" aria-label="Quick Weight Presets" className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {quickWeightPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      aria-pressed={weightGrams === preset.value}
                      aria-label={`Set weight to ${preset.label}`}
                      onClick={() => onWeightChange(preset.value)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-navy-800 ${
                        weightGrams === preset.value
                          ? "bg-clinical-navy-900 text-white border-clinical-navy-900 font-semibold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fluid Allowance Slider & Number Input */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="fluid-slider"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <Droplets className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    Target Fluid Allowance
                  </label>
                  <span className="text-sm font-bold font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {fluidAllowance} mL/kg/day
                  </span>
                </div>

                {/* Slider */}
                <input
                  id="fluid-slider"
                  type="range"
                  min={120}
                  max={200}
                  step={5}
                  value={fluidAllowance}
                  onChange={(e) => onFluidChange(Number(e.target.value))}
                  aria-label="Target Fluid Allowance in milliliters per kilogram per day"
                  aria-valuemin={120}
                  aria-valuemax={200}
                  aria-valuenow={fluidAllowance}
                  aria-valuetext={`${fluidAllowance} milliliters per kilogram per day`}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-clinical-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-400" aria-hidden="true">
                  <span>120 mL/kg/d (Min)</span>
                  <span className="text-slate-600 font-semibold">150 mL/kg/d (Standard)</span>
                  <span>200 mL/kg/d (Max)</span>
                </div>

                {/* Fluid presets */}
                <div role="group" aria-label="Target Fluid Allowance presets" className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Tuning:</span>
                  {quickFluidPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={fluidAllowance === val}
                      aria-label={`Set fluid allowance to ${val} milliliters per kilogram per day`}
                      onClick={() => onFluidChange(val)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        fluidAllowance === val
                          ? "bg-blue-900 text-white border-blue-900 font-semibold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      {val} mL/kg/d
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Weight Classification Callout */}
              {result.isGraduated ? (
                <div className="p-3.5 rounded-lg bg-blue-50/90 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" aria-hidden="true" />
                      ESPGHAN Status:
                    </span>
                    <span className="font-bold text-blue-900 px-2 py-0.5 rounded bg-white border border-blue-300 shadow-2xs">
                      Graduation / Term Weight
                    </span>
                  </div>
                  <div className="text-[11.5px] text-blue-800 leading-relaxed">
                    Infant weight of {weightGrams}g exceeds the 3,500g clinical ceiling. ESPGHAN preterm catch-up targets no longer apply.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      ESPGHAN Category:
                    </span>
                    <span className="font-bold text-clinical-navy-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                      {result.proteinBracket.classification}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-500">
                    Infant weight of {weightGrams}g classifies as{" "}
                    <strong>{result.proteinBracket.description}</strong>. ESPGHAN
                    2022 recommends an enteral protein intake of{" "}
                    <strong>
                      {result.proteinBracket.targetMinGramsPerKg} to{" "}
                      {result.proteinBracket.targetMaxGramsPerKg} g/kg/day
                    </strong>
                    .
                  </div>
                </div>
              )}
            </div>
          </ClinicalCard>

          {/* Practical Feeding Schedule Card */}
          <ClinicalCard
            title="NICU Enteral Feeding Schedule"
            subtitle="Hourly infusion rates and bolus feed breakdowns"
            icon={<Clock className="w-4 h-4 text-clinical-navy-800" />}
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* q2h */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  q2h (12 Feeds)
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {result.feedingSchedule.q2hVolumePerFeedMl}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">
                    mL
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">every 2 hours</div>
              </div>

              {/* q3h */}
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                  q3h (8 Feeds)
                </div>
                <div className="text-base font-bold text-blue-950 mt-1">
                  {result.feedingSchedule.q3hVolumePerFeedMl}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">
                    mL
                  </span>
                </div>
                <div className="text-[10px] text-blue-600/80 mt-0.5">
                  every 3 hours
                </div>
              </div>

              {/* continuous */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Continuous
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {result.feedingSchedule.continuousInfusionMlPerHour}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">
                    mL/hr
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">infusion pump</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-100/70 px-3 py-2 rounded-md">
              <span>Total 24h Enteral Volume:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {result.totalDailyVolumeMl} mL/day
              </span>
            </div>
          </ClinicalCard>
        </div>

        {/* Right Column: Calculations, Gauges & Clinical Interpretation (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result.isGraduated ? (
            /* Large Blue Clinical Alert Card for Graduation (>3500g) with Product Tin Visual */
            <div
              role="alert"
              aria-live="polite"
              className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-400 shadow-sm space-y-5 text-blue-950"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Product Tin Visual (max-h-200px) */}
                <div className="shrink-0 flex items-center justify-center p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                  <img
                    src={result.imageSrc}
                    alt="Pediamil 1 Standard Infant Formula Tin"
                    className="max-h-[190px] sm:max-h-[200px] w-auto object-contain drop-shadow-sm"
                  />
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-200 text-blue-900 border border-blue-300">
                      Term-Equivalent Transition
                    </span>
                    <span className="text-xs font-mono text-blue-700 font-semibold">
                      Current Weight: {result.currentWeightGrams}g (&gt; 3,500g)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-blue-950">
                    Mature Infant Transition (Weight &gt; 3,500g)
                  </h3>
                  <div className="text-sm font-semibold text-blue-950 leading-relaxed bg-white/95 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                    {result.recommendationText}
                  </div>

                  {/* Standard Nutrition Recommendation Box */}
                  <div className="bg-white/95 p-3.5 rounded-xl border border-blue-200 space-y-2 shadow-2xs text-left">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      <span>Standard Term-Infant Nutrition Targets</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80">
                        <span className="text-slate-500 text-[10.5px] uppercase font-bold block">
                          Standard Energy Target
                        </span>
                        <strong className="text-blue-950 font-mono text-sm">~100 kcal/kg/day</strong>
                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                          Normal physiological growth goal
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80">
                        <span className="text-slate-500 text-[10.5px] uppercase font-bold block">
                          Standard Protein Target
                        </span>
                        <strong className="text-blue-950 font-mono text-sm">1.8 to 2.0 g/100 kcal</strong>
                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                          Standard Stage 1 formulation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Clinical Guidance for HCP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                <div className="bg-white/95 p-3.5 rounded-xl border border-blue-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Info className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span>Clinical Rationale & Solute Load</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11.5px]">
                    Preterm catch-up macronutrient densities (such as high protein fortifiers and high-energy preterm formulas) are specifically indicated for infants under 3,500g. Continuing preterm targets past term weight carries risks of high renal solute load (RSL) and abnormal fat mass accrual.
                  </p>
                </div>

                <div className="bg-white/95 p-3.5 rounded-xl border border-blue-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Recommended Clinical Next Steps</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11.5px]">
                    Transition patient to a standard infant formulation (Pediamil® 1) or exclusive maternal breastfeeding on demand. Monitor somatic growth against standard WHO 2006 weight-for-age percentiles.
                  </p>
                </div>
              </div>

              <div className="bg-blue-100/70 p-3 rounded-lg border border-blue-200 flex items-center justify-between text-xs text-blue-950 font-mono">
                <span>Prescribed Fluid Allowance: <strong>{result.targetFluidMlPerKgPerDay} mL/kg/day</strong></span>
                <span>Total 24h Volume: <strong className="text-sm font-bold text-blue-900">{result.totalDailyVolumeMl} mL/day</strong></span>
              </div>
            </div>
          ) : (
            /* Real-Time ESPGHAN Target Gauges */
            <ClinicalCard
              title="Delivered Macronutrient Densities vs. ESPGHAN 2022"
              subtitle="Deterministic real-time evaluation with target brackets"
              icon={<Flame className="w-4 h-4 text-orange-500" />}
            >
              <div className="space-y-6">
                {/* Energy Gauge */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <RangeGauge
                    currentValue={result.deliveredEnergyKcalPerKgPerDay}
                    minTarget={110}
                    maxTarget={135}
                    minScale={90}
                    maxScale={160}
                    unit="kcal/kg/day"
                    metricName="Delivered Energy (ESPGHAN: 110–135 kcal/kg/day)"
                    status={result.energyCompliance.status}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/80 pt-2 font-mono">
                    <span>
                      Total Daily Energy:{" "}
                      <strong>{result.deliveredEnergyKcalPerDay} kcal/day</strong>
                    </span>
                    <span>
                      Status:{" "}
                      <strong className="text-slate-900">
                        {result.energyCompliance.badgeLabel}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Protein Gauge */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <RangeGauge
                    currentValue={result.deliveredProteinGramsPerKgPerDay}
                    minTarget={result.proteinBracket.targetMinGramsPerKg}
                    maxTarget={result.proteinBracket.targetMaxGramsPerKg}
                    minScale={2.0}
                    maxScale={5.0}
                    unit="g/kg/day"
                    metricName={`Delivered Protein (Target for ${result.proteinBracket.classification}: ${result.proteinBracket.targetMinGramsPerKg}–${result.proteinBracket.targetMaxGramsPerKg} g/kg/day)`}
                    status={result.proteinCompliance.status}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/80 pt-2 font-mono">
                    <span>
                      Total Daily Protein:{" "}
                      <strong>{result.deliveredProteinGramsPerDay} g/day</strong>
                    </span>
                    <span>
                      Status:{" "}
                      <strong className="text-slate-900">
                        {result.proteinCompliance.badgeLabel}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Protein-to-Energy Ratio & Macro Breakdown Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-purple-700" />
                        Protein-to-Energy Ratio
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-950">
                        P:E
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-950 mt-1 font-mono">
                      {result.proteinToEnergyRatioGramsPer100Kcal}{" "}
                      <span className="text-xs font-normal text-purple-700">
                        g / 100 kcal
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 mt-1 leading-tight">
                      ESPGHAN target range: 2.5 to 3.6 g/100 kcal for low birth weight infants.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Clinical Concordance
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950">
                        ESPGHAN 2022
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-950 mt-1">
                      {result.energyCompliance.status === "on_target" &&
                      result.proteinCompliance.status === "on_target"
                        ? "Fully Compliant Protocol"
                        : "Adjustment Required"}
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1 leading-tight">
                      Energy and protein intake audited deterministically against
                      gestational and weight class goals.
                    </p>
                  </div>
                </div>
              </div>
            </ClinicalCard>
          )}

          {/* Clinical Interpretation & Product Matrix Recommendation Card */}
          <ClinicalCard
            title="Clinical Recommendation & Formulation Matrix"
            subtitle="Deterministic product pack alignment & physician interpretation"
            icon={<Info className="w-4 h-4 text-clinical-navy-800" />}
          >
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              {/* Product Pack Visual & Recommendation Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="shrink-0 flex items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={result.imageSrc}
                    alt={`${result.formulaProfile.brand} Product Pack`}
                    className="max-h-[175px] sm:max-h-[190px] w-auto object-contain"
                  />
                </div>
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Recommended Matrix: {result.formulaProfile.brand}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {result.isGraduated ? "Term Infant" : `${result.proteinBracket.classification} Bracket`} ({result.currentWeightGrams}g)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    {result.recommendationText}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-left">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 uppercase text-[10px] block font-sans">Formula Energy</span>
                      <strong className="text-slate-900">{result.formulaProfile.energyKcalPer100Ml} kcal / 100 mL</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 uppercase text-[10px] block font-sans">Formula Protein</span>
                      <strong className="text-slate-900">{result.formulaProfile.proteinGramsPer100Ml} g / 100 mL</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy interpretation note */}
              <div className="p-3 rounded-lg border flex items-start gap-2.5 bg-slate-50 border-slate-200">
                {result.energyCompliance.status === "on_target" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-900 font-semibold">
                    Caloric Provision:{" "}
                  </strong>
                  {result.energyCompliance.interpretation}
                </div>
              </div>

              {/* Protein interpretation note */}
              <div className="p-3 rounded-lg border flex items-start gap-2.5 bg-slate-50 border-slate-200">
                {result.proteinCompliance.status === "on_target" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-slate-900 font-semibold">
                    Protein Supply:{" "}
                  </strong>
                  {result.proteinCompliance.interpretation}
                </div>
              </div>

              {/* Comprehensive Summary Statement */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 font-mono text-[11.5px] leading-normal">
                {result.clinicalSummary}
              </div>
            </div>
          </ClinicalCard>
        </div>
      </div>
    </div>
  );
}

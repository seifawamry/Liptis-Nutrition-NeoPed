"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  NutritionCalculationResult,
  ESPGHAN_ENERGY_FRAMEWORK,
  ESPGHAN_PE_RATIO_FRAMEWORK,
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
  Sparkles,
  GraduationCap,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  BookOpen,
} from "lucide-react";

interface NutritionEngineProps {
  weightGrams: number;
  onWeightChange: (val: number) => void;
  fluidAllowance: number;
  onFluidChange: (val: number) => void;
  calculationResult: NutritionCalculationResult;
  onResetPatient?: () => void;
}

export function NutritionEngine({
  weightGrams,
  onWeightChange,
  fluidAllowance,
  onFluidChange,
  calculationResult: result,
  onResetPatient,
}: NutritionEngineProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  const handleCopySummary = async () => {
    if (!result.clinicalSummary) return;
    try {
      await navigator.clipboard.writeText(
        `[Liptis NeoPed Clinical Summary - ${result.auditMetadata.calculatedAtUtc}]\n` +
        `Patient Weight: ${weightGrams}g | Fluid Allowance: ${fluidAllowance} mL/kg/d\n` +
        `${result.clinicalSummary}\n` +
        `Audit: ${result.auditMetadata.engineVersion} | ${result.auditMetadata.nonDeviceDisclaimer}`
      );
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-clinical-navy-900 to-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
            <Sparkles className="w-5 h-5 text-clinical-gold" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                ESPGHAN 2022 Enteral Nutrition Standard
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                Audited Protocol
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-0.5">
              Energy: 115–140 kcal/kg/d (Typical) • Protein: 3.5–4.0 g/kg/d (Conditional to 4.5) • P:E: 2.8–3.6 g/100 kcal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onResetPatient && (
            <button
              type="button"
              onClick={onResetPatient}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Reset patient parameters to clinical baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Patient</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopySummary}
            disabled={result.isBlocked}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              copyFeedback
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            }`}
            aria-label="Copy clinical calculation summary to clipboard"
          >
            {copyFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {result.isBlocked
          ? `Calculation blocked: ${result.validation.errors[0]?.message}`
          : result.clinicalSummary}
      </div>

      {/* BLOCKING VALIDATION BANNER IF INVALID INPUTS */}
      {result.isBlocked && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-3 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-900 tracking-tight">
                Safety Stop: Nutritional Calculation Blocked by Input Validation
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                Calculations are strictly halted to prevent dispensing inaccurate enteral feeding orders. The entered parameters violate physiological safety boundaries:
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-rose-200">
            {result.validation.errors.map((err, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-rose-950">
                  <span>Parameter: {err.fieldLabel} ({String(err.value)})</span>
                  <span className="text-[11px] font-mono text-slate-500">Accepted: {err.acceptedRange}</span>
                </div>
                <p className="text-rose-800 leading-relaxed font-sans">{err.message}</p>
                <div className="text-[11.5px] text-slate-700 bg-rose-50/60 p-2 rounded border border-rose-100 font-medium">
                  <strong>Clinical Remediation:</strong> {err.remediation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Inputs & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clinical Parameters Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <ClinicalCard
            title="Patient Anthropometrics & Fluid Target"
            subtitle="Deterministic feed inputs with strict boundary verification"
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
                    {isNaN(weightGrams) ? "—" : (weightGrams / 1000).toFixed(3)} kg
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
                    aria-invalid={result.isBlocked}
                    aria-describedby="weight-kg-display weight-presets-group weight-bounds-note"
                    className={`w-full px-3.5 py-2.5 rounded-lg text-base font-semibold transition-all focus-visible:outline-none ${
                      result.isBlocked
                        ? "bg-rose-50 border-2 border-rose-400 text-rose-950 focus:ring-2 focus:ring-rose-500"
                        : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400" aria-hidden="true">
                    grams (g)
                  </div>
                </div>

                <div id="weight-bounds-note" className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Supported neonatal range: 400g to 10,000g</span>
                  {weightGrams < 400 && (
                    <span className="text-rose-600 font-semibold">Micro-preemie ICU protocol</span>
                  )}
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

              {/* Fluid Allowance Slider & Tuning */}
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

                <input
                  id="fluid-slider"
                  type="range"
                  min={80}
                  max={240}
                  step={5}
                  value={fluidAllowance}
                  onChange={(e) => onFluidChange(Number(e.target.value))}
                  aria-label="Target Fluid Allowance in milliliters per kilogram per day"
                  aria-valuemin={80}
                  aria-valuemax={240}
                  aria-valuenow={fluidAllowance}
                  aria-valuetext={`${fluidAllowance} milliliters per kilogram per day`}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-clinical-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-400" aria-hidden="true">
                  <span>80 mL/kg/d (Min)</span>
                  <span className="text-slate-600 font-semibold">150–180 (ESPGHAN Typical)</span>
                  <span>240 mL/kg/d (Max)</span>
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

                {/* Fluid Warnings */}
                {result.validation.warnings.map((warn, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{warn.message}</span>
                  </div>
                ))}
              </div>

              {/* Active Weight Classification Callout */}
              {!result.isBlocked && result.isGraduated && (
                <div className="p-3.5 rounded-lg bg-blue-50/90 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" aria-hidden="true" />
                      ESPGHAN Status:
                    </span>
                    <span className="font-bold text-blue-900 px-2 py-0.5 rounded bg-white border border-blue-300 shadow-2xs">
                      Graduation (&gt;3,500g)
                    </span>
                  </div>
                  <div className="text-[11.5px] text-blue-800 leading-relaxed">
                    Infant weight of {result.currentWeightGrams}g exceeds 3,500g. Preterm catch-up targets discontinued; standard term targets applied.
                  </div>
                </div>
              )}

              {!result.isBlocked && !result.isGraduated && result.proteinBracket && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      ESPGHAN Category:
                    </span>
                    <span className="font-bold text-clinical-navy-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                      {result.proteinBracket.classification}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-600">
                    Infant weight of {result.currentWeightGrams}g classifies as{" "}
                    <strong>{result.proteinBracket.description}</strong>. Recommended enteral protein:{" "}
                    <strong>
                      {result.proteinBracket.targetMinGramsPerKg} to {result.proteinBracket.targetMaxGramsPerKg} g/kg/day
                    </strong>
                    .
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-200/70 pt-1 font-mono">
                    Citation: {result.proteinBracket.citationSource}
                  </div>
                </div>
              )}
            </div>
          </ClinicalCard>

          {/* Practical Feeding Schedule Card */}
          {!result.isBlocked && result.feedingSchedule && (
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
                    <span className="text-xs font-normal text-slate-500 ml-0.5">mL</span>
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
                    <span className="text-xs font-normal text-slate-500 ml-0.5">mL</span>
                  </div>
                  <div className="text-[10px] text-blue-600/80 mt-0.5">every 3 hours</div>
                </div>

                {/* continuous */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Continuous
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {result.feedingSchedule.continuousInfusionMlPerHour}
                    <span className="text-xs font-normal text-slate-500 ml-0.5">mL/hr</span>
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

              <p className="text-[10.5px] text-slate-400 mt-2 italic leading-tight">
                {result.feedingSchedule.roundingDisclosure}
              </p>
            </ClinicalCard>
          )}
        </div>

        {/* Right Column: Calculations, Gauges & Clinical Interpretation (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {result.isBlocked ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Scale className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
              <div className="text-sm font-semibold text-slate-600">
                Awaiting Valid Patient Parameters
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Enter an authorized weight (400g to 10,000g) and physiological fluid allowance to activate ESPGHAN calculations.
              </p>
            </div>
          ) : result.isGraduated ? (
            /* Large Blue Clinical Alert Card for Graduation (>3500g) with Product Tin Visual */
            <div
              role="alert"
              aria-live="polite"
              className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-400 shadow-sm space-y-5 text-blue-950"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Product Tin Visual (max-h-200px) */}
                <div className="shrink-0 flex items-center justify-center p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                  <Image
                    src={result.imageSrc || "/pediamil-1.png"}
                    alt="Pediamil 1 Standard Infant Formula Tin"
                    width={180}
                    height={200}
                    className="max-h-[190px] sm:max-h-[200px] w-auto object-contain drop-shadow-sm"
                    unoptimized
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
              subtitle="Deterministic 4-tier energy evaluation and protein accretion analysis"
              icon={<Flame className="w-4 h-4 text-orange-500" />}
            >
              <div className="space-y-6">
                {/* Energy Gauge with ESPGHAN 2022 115-140 typical and 140-160 conditional */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <RangeGauge
                    currentValue={result.deliveredEnergyKcalPerKgPerDay || 0}
                    minTarget={ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN}
                    maxTarget={ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX}
                    conditionalMaxTarget={ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX}
                    minScale={90}
                    maxScale={180}
                    unit="kcal/kg/day"
                    metricName="Delivered Energy (ESPGHAN 2022: 115–140 kcal/kg/d, Cond: 140–160)"
                    status={result.energyCompliance?.status || "on_target"}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/80 pt-2 font-mono">
                    <span>
                      Total Daily Energy:{" "}
                      <strong>{result.deliveredEnergyKcalPerDay} kcal/day</strong>
                    </span>
                    <span>
                      Status:{" "}
                      <strong className="text-slate-900">
                        {result.energyCompliance?.badgeLabel}
                      </strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {result.energyCompliance?.interpretation}
                  </p>
                </div>

                {/* Protein Gauge */}
                {result.proteinBracket && (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <RangeGauge
                      currentValue={result.deliveredProteinGramsPerKgPerDay || 0}
                      minTarget={result.proteinBracket.targetMinGramsPerKg}
                      maxTarget={result.proteinBracket.targetMaxGramsPerKg}
                      minScale={2.0}
                      maxScale={5.0}
                      unit="g/kg/day"
                      metricName={`Delivered Protein (${result.proteinBracket.classification}: ${result.proteinBracket.targetMinGramsPerKg}–${result.proteinBracket.targetMaxGramsPerKg} g/kg/d)`}
                      status={result.proteinCompliance?.status || "on_target"}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/80 pt-2 font-mono">
                      <span>
                        Total Daily Protein:{" "}
                        <strong>{result.deliveredProteinGramsPerDay} g/day</strong>
                      </span>
                      <span>
                        Status:{" "}
                        <strong className="text-slate-900">
                          {result.proteinCompliance?.badgeLabel}
                        </strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {result.proteinCompliance?.interpretation}
                    </p>
                  </div>
                )}

                {/* Protein-to-Energy Ratio & Macro Breakdown Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-purple-700" />
                        Protein-to-Energy Ratio
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-950 font-mono">
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
                      ESPGHAN 2022 target: {ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL} to {ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL} g/100 kcal.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Clinical Reference Status
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950">
                        ESPGHAN 2022
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-950 mt-1">
                      {result.energyCompliance?.status === "on_target" &&
                      result.proteinCompliance?.status === "on_target"
                        ? "Within Reference Target"
                        : "Requires Clinician Review"}
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1 leading-tight">
                      Audited against gestational accretion and weight category targets.
                    </p>
                  </div>
                </div>
              </div>
            </ClinicalCard>
          )}

          {/* Clinical Formulation Matrix & Recommendation Card */}
          {!result.isBlocked && result.formulaProfile && (
            <ClinicalCard
              title="Clinical Formulation Matrix & Guidance"
              subtitle="Auditable product pack alignment & physician interpretation"
              icon={<Info className="w-4 h-4 text-clinical-navy-800" />}
            >
              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="shrink-0 flex items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <Image
                      src={result.imageSrc || "/pediamil-lbw.png"}
                      alt={`${result.formulaProfile.brand} Product Pack`}
                      width={160}
                      height={190}
                      className="max-h-[175px] sm:max-h-[190px] w-auto object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Nutritional Matrix: {result.formulaProfile.brand}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {result.isGraduated ? "Term Infant" : `${result.proteinBracket?.classification} Bracket`} ({result.currentWeightGrams}g)
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

                {/* Comprehensive Summary Statement */}
                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 font-mono text-[11.5px] leading-normal">
                  {result.clinicalSummary}
                </div>

                <div className="text-[10.5px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Engine: {result.auditMetadata.engineVersion}</span>
                  <span>Non-cleared clinical decision support utility</span>
                </div>
              </div>
            </ClinicalCard>
          )}
        </div>
      </div>
    </div>
  );
}

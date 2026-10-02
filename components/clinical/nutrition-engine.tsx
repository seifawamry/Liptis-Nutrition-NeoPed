"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  NutritionCalculationResult,
  ESPGHAN_DIRECT_GUIDELINES,
} from "@/lib/lbw-nutrition";
import { AgeCalculations } from "@/lib/growth-engine";
import { PatientNutrientPayload } from "./patient-nutrient-payload";
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
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

interface NutritionEngineProps {
  weightGrams: number;
  onWeightChange: (val: number) => void;
  fluidAllowance: number;
  onFluidChange: (val: number) => void;
  calculationResult: NutritionCalculationResult;
  onResetPatient?: () => void;
  ages?: AgeCalculations;
}

export function NutritionEngine({
  weightGrams,
  onWeightChange,
  fluidAllowance,
  onFluidChange,
  calculationResult: result,
  onResetPatient,
  ages,
}: NutritionEngineProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(false);

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
        `Status: ${result.overallStatus}\n` +
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
      {/* Prominent Clinical Decision Support & Supervised Reference Banner */}
      <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900 block uppercase tracking-wide">
              Clinical Decision Support Utility • For Licensed Healthcare Professionals
            </span>
            <p className="text-[11.5px] text-amber-800 leading-tight">
              Reference calculation only. Not a prescription, medical order, or substitute for local NICU protocol. Clinical judgment supersedes calculated values.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSourcePanel(!showSourcePanel)}
          className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-semibold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showSourcePanel ? "Hide Source Panel" : "View Clinical Sources"}</span>
          {showSourcePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Visible Source Panel Explaining Provenance (Section 3) */}
      {showSourcePanel && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-bold text-clinical-navy-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-clinical-navy-800" />
              <span>Authoritative Clinical Sources & Provenance Mapping</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">v2.1.0 Institutional</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block uppercase tracking-wider text-[11px]">
                1. Direct ESPGHAN 2022 Guidelines
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>Energy: 115–140 kcal/kg/d (typical), 140–160 (conditional catch-up)</li>
                <li>Protein: 3.5–4.0 g/kg/d, conditionally up to 4.5 g/kg/d for slow growth</li>
                <li>Protein-to-Energy ratio: 2.8–3.6 g / 100 kcal</li>
                <li>Fluid volume: 150–180 mL/kg/d typical for stable growing preterms</li>
              </ul>
              <p className="text-[10.5px] text-slate-400 italic mt-1">Source: J Pediatr Gastroenterol Nutr. 2022;76(2):248-268.</p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block uppercase tracking-wider text-[11px]">
                2. Official Manufacturer Product Specifications
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>Pediamil® LBW: 79.7 kcal/100 mL, 2.42g protein/100 mL (15.0g powder/100 mL)</li>
                <li>Pediamil® 1: 68.5 kcal/100 mL, 1.49g protein/100 mL (13.7g powder/100 mL)</li>
                <li>Standard dilution: 3 level scoops in 90 mL water = 100 mL prepared feed</li>
              </ul>
              <p className="text-[10.5px] text-blue-700 font-semibold mt-1">
                Verified against Liptis Nutrition Spec Sheet 2026-v1.0 (verified 2026-10-02).
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-purple-900 block uppercase tracking-wider text-[11px]">
                3. Institutional Operational Protocols
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>ELBW bracket (&lt;1000g): 3.5–4.5 g/kg/d protein target</li>
                <li>VLBW bracket (1000–1800g): 3.2–4.1 g/kg/d protein target</li>
                <li>LBW step-down (1801–3500g): 2.8–3.6 g/kg/d protein target</li>
                <li>Graduation ceiling: 3,500g (term-equivalent transition)</li>
              </ul>
              <p className="text-[10.5px] text-purple-800 italic mt-1">
                Local protocol / institutional operational range—requires local clinical approval.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
                4. Developer Alert Thresholds
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>Fluid restriction warning: &lt;135 mL/kg/day</li>
                <li>High fluid risk warning: &gt;200 mL/kg/day</li>
                <li>Safety stop (blocked input): Weight &lt;400g or &gt;10,000g</li>
                <li>Date block: Date of measurement preceding Date of birth or future date</li>
              </ul>
              <p className="text-[10.5px] text-slate-400 italic mt-1">System safety guards to prevent calculation errors.</p>
            </div>
          </div>

          <div className="p-2.5 bg-slate-100 rounded text-[11px] text-slate-600 border border-slate-200">
            <strong>Product Data Disclaimer:</strong> {result.productDisclaimer}
          </div>
        </div>
      )}

      {/* Top Protocol Status Header */}
      <div className="bg-gradient-to-r from-blue-950 via-clinical-navy-900 to-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
            <Sparkles className="w-5 h-5 text-clinical-gold" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                Enteral Nutrition Engine
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                ESPGHAN 2022 Reference Model
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
              {/* Patient Gestational Age & PMA Stratification Banner */}
              {ages && !ages.isBlocked && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/90 text-xs flex items-center justify-between text-blue-950 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />
                    <span className="font-bold text-blue-950">Patient Gestation:</span>
                    <span className="font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                      PMA {ages.pmaFormatted}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700">
                    Day of Life: <strong className="text-blue-950 font-mono">{ages.dayOfLife}</strong>
                  </span>
                </div>
              )}

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

              {/* Fluid Allowance Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="fluid-allowance-input"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    Target Fluid Allowance (mL/kg/day)
                    <span className="text-rose-500" aria-hidden="true">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Typical: 150–180 mL/kg/d
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="fluid-allowance-input"
                    type="number"
                    min={80}
                    max={240}
                    step={5}
                    value={fluidAllowance}
                    onChange={(e) => onFluidChange(Number(e.target.value))}
                    aria-describedby="fluid-warnings fluid-presets-group"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent transition-all focus-visible:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400" aria-hidden="true">
                    mL/kg/day
                  </div>
                </div>

                {/* Fluid Presets */}
                <div id="fluid-presets-group" role="group" aria-label="Quick Fluid Target Presets" className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {quickFluidPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={fluidAllowance === val}
                      aria-label={`Set fluid allowance to ${val} mL per kg per day`}
                      onClick={() => onFluidChange(val)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-navy-800 ${
                        fluidAllowance === val
                          ? "bg-clinical-navy-900 text-white border-clinical-navy-900 font-semibold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      {val} mL
                    </button>
                  ))}
                </div>

                {/* Fluid Warnings */}
                <div id="fluid-warnings">
                  {result.validation.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      role="status"
                      className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <span className="font-semibold block">{w.message}</span>
                        <span className="text-amber-800">{w.remediation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ClinicalCard>

          {/* Feeding Schedules Card */}
          {!result.isBlocked && result.feedingSchedule && (
            <ClinicalCard
              title="Enteral Feeding Schedule"
              subtitle="Reconciled intervals with explicit rounding disclosure"
              icon={<Clock className="w-4 h-4 text-clinical-navy-800" aria-hidden="true" />}
            >
              <div className="grid grid-cols-3 gap-2.5 text-center">
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

              <p className="text-[10.5px] text-slate-500 mt-2 italic leading-tight">
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
                Enter an authorized weight (400g to 10,000g) and physiological fluid allowance to activate nutritional calculations.
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
                {/* Product Tin Visual (max-h-200px) with Quick Powder Niche */}
                <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-blue-200 shadow-sm gap-2 w-full sm:w-auto">
                  <Image
                    src={result.imageSrc || "/pediamil-1.png"}
                    alt="Pediamil 1 Standard Infant Formula Tin"
                    width={180}
                    height={200}
                    className="max-h-[190px] sm:max-h-[200px] w-auto object-contain drop-shadow-sm"
                    unoptimized
                  />
                  {result.deliveredNutrientPayload && (
                    <div className="w-full p-2 bg-blue-50/90 rounded-lg border border-blue-200 text-center text-[10.5px] space-y-0.5 shadow-2xs">
                      <span className="font-bold text-blue-950 uppercase tracking-wider block text-[9.5px]">
                        Patient Daily Powder Need
                      </span>
                      <div className="font-mono font-bold text-blue-900 text-sm">
                        {result.deliveredNutrientPayload.dailyPowderGrams}g{" "}
                        <span className="text-[10px] font-normal text-blue-700">powder/day</span>
                      </div>
                      <div className="text-blue-800 text-[10px]">
                        ≈ <strong>{result.deliveredNutrientPayload.dailyScoops}</strong> scoops/day
                      </div>
                    </div>
                  )}
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
                    <ul className="text-xs text-slate-700 space-y-1.5 pl-1">
                      <li>• <strong>Energy:</strong> {result.standardTermTargets?.energyTarget}</li>
                      <li>• <strong>Protein:</strong> {result.standardTermTargets?.proteinTarget}</li>
                      <li>• <strong>Recommended Formulation:</strong> {result.standardTermTargets?.formulationBrand} ({result.standardTermTargets?.formulationStage})</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comprehensive Delivered Patient Nutrient Breakdown Niche */}
              {result.deliveredNutrientPayload && (
                <PatientNutrientPayload
                  payload={result.deliveredNutrientPayload}
                  isGraduated={true}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white/95 p-3.5 rounded-xl border border-blue-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <ShieldAlert className="w-4 h-4 text-blue-600" aria-hidden="true" />
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
                    minTarget={ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}
                    maxTarget={ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX}
                    conditionalMaxTarget={ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX}
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

                {/* Consistent Protein-to-Energy Ratio & Overall Status (Section 2 & 13) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* P:E Ratio Card with Consistent Status Messages */}
                  <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-purple-700" />
                        Protein-to-Energy Ratio
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          result.peRatioCompliance?.status === "on_target"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {result.peRatioCompliance?.status === "on_target" ? "Target 2.8–3.6" : "Non-Target"}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-950 font-mono">
                      {result.proteinToEnergyRatioGramsPer100Kcal}{" "}
                      <span className="text-xs font-normal text-purple-700">
                        g / 100 kcal
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-900 leading-snug font-medium">
                      {result.peRatioCompliance?.interpretation}
                    </p>
                  </div>

                  {/* Overall Compliance Status: Never calls 'Within Reference Target' if ANY metric is abnormal */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                        Overall Clinical Compliance
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          result.overallStatus === "Within reference range"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {result.overallStatus === "Within reference range" ? "Reference Met" : "Review Flag"}
                      </span>
                    </div>
                    <div className={`text-sm font-bold ${
                      result.overallStatus === "Within reference range" ? "text-emerald-900" : "text-amber-900"
                    }`}>
                      {result.overallStatus}
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      {result.overallStatus === "Within reference range"
                        ? "Energy, protein, and P:E ratio all satisfy recommended reference boundaries."
                        : "One or more nutritional parameters fall outside standard targets. Review clinical plan."}
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
                  <div className="shrink-0 flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs gap-2 w-full sm:w-auto">
                    <Image
                      src={result.imageSrc || "/pediamil-lbw.png"}
                      alt={`${result.formulaProfile.brand} Product Pack`}
                      width={160}
                      height={190}
                      className="max-h-[175px] sm:max-h-[190px] w-auto object-contain"
                      unoptimized
                    />
                    {result.deliveredNutrientPayload && (
                      <div className="w-full p-2 bg-emerald-50/90 rounded-lg border border-emerald-200 text-center text-[10.5px] space-y-0.5 shadow-2xs">
                        <span className="font-bold text-emerald-950 uppercase tracking-wider block text-[9.5px]">
                          Patient Daily Powder Need
                        </span>
                        <div className="font-mono font-bold text-emerald-900 text-sm">
                          {result.deliveredNutrientPayload.dailyPowderGrams}g{" "}
                          <span className="text-[10px] font-normal text-emerald-700">powder/day</span>
                        </div>
                        <div className="text-emerald-800 text-[10px]">
                          ≈ <strong>{result.deliveredNutrientPayload.dailyScoops}</strong> scoops/day
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Matrix: {result.formulaProfile.brand}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {result.isGraduated ? "Term Infant" : `${result.proteinBracket?.classification} Bracket`} ({result.currentWeightGrams}g)
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      {result.recommendationText}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Energy Density</span>
                        <strong>{result.formulaProfile.energyKcalPer100Ml} kcal/100mL</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Protein Content</span>
                        <strong>{result.formulaProfile.proteinGramsPer100Ml} g/100mL</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Carbohydrates</span>
                        <strong>{result.formulaProfile.carbsGramsPer100Ml ?? "—"} g/100mL</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Lipids</span>
                        <strong>{result.formulaProfile.fatGramsPer100Ml ?? "—"} g/100mL</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preparation & Reconstitution Note */}
                {result.formulaProfile.productProfile && (
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-[11px] text-blue-950 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-blue-900">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Standard Reconstitution Instructions ({result.formulaProfile.productProfile.reconstitution.standardDilutionPercent}% w/v)</span>
                    </div>
                    <p className="text-blue-900/90 leading-relaxed">
                      {result.formulaProfile.productProfile.reconstitution.scoopsPerStandardVolume}.{" "}
                      Powder mass: {result.formulaProfile.productProfile.reconstitution.powderMassGramsPer100Ml} g per 100 mL prepared feed.
                    </p>
                  </div>
                )}

                {/* Patient Delivered Daily Nutritional Payload Niche */}
                {result.deliveredNutrientPayload && (
                  <PatientNutrientPayload
                    payload={result.deliveredNutrientPayload}
                    isGraduated={false}
                  />
                )}

                <div className="p-2.5 bg-slate-100 rounded text-[10.5px] text-slate-500 italic">
                  {result.productDisclaimer}
                </div>
              </div>
            </ClinicalCard>
          )}
        </div>
      </div>
    </div>
  );
}

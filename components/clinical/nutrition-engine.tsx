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
  FileCode,
  Download,
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
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  const quickWeightPresets = [
    { label: "850g (ELBW)", value: 850 },
    { label: "1,350g (VLBW)", value: 1350 },
    { label: "1,750g (VLBW)", value: 1750 },
    { label: "2,200g (LBW)", value: 2200 },
    { label: "3,100g (Step-Down)", value: 3100 },
    { label: "3,800g (Graduation)", value: 3800 },
    { label: "7,800g (Graduation)", value: 7800 },
  ];

  const quickFluidPresets = [135, 150, 160, 180, 200];

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

  const handleDownloadAuditJson = () => {
    if (!result) return;
    const auditData = {
      calculationSession: {
        timestampUtc: result.auditMetadata.calculatedAtUtc,
        engineVersion: result.auditMetadata.engineVersion,
        runtimeEnvironment: "Client-side isolated execution (zero cloud telemetry)",
        inputs: {
          patientWeightGrams: weightGrams,
          patientWeightKg: result.currentWeightKg,
          fluidAllowanceMlPerKgPerDay: fluidAllowance,
        },
        outputs: {
          totalDailyVolumeMl: result.totalDailyVolumeMl,
          deliveredEnergyKcalPerKgPerDay: result.deliveredEnergyKcalPerKgPerDay,
          deliveredProteinGramsPerKgPerDay: result.deliveredProteinGramsPerKgPerDay,
          proteinToEnergyRatioGramsPer100Kcal: result.proteinToEnergyRatioGramsPer100Kcal,
          overallStatus: result.overallStatus,
          feedingSchedule: result.feedingSchedule,
          deliveredNutrientPayload: result.deliveredNutrientPayload,
        },
        clinicalReferences: result.auditMetadata.guidelinesUsed,
        nonDeviceDisclaimer: result.auditMetadata.nonDeviceDisclaimer,
        productDisclaimer: result.productDisclaimer,
      },
    };
    const auditBlob = new Blob([JSON.stringify(auditData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(auditBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liptis-audit-${weightGrams}g-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                    Range: 135–200 mL/kg/d (Typical: 150–180)
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="fluid-allowance-input"
                    type="number"
                    min={135}
                    max={200}
                    step={5}
                    value={fluidAllowance}
                    onChange={(e) => onFluidChange(Number(e.target.value))}
                    aria-describedby="fluid-warnings fluid-presets-group fluid-bounds-note"
                    className={`w-full px-3.5 py-2.5 rounded-lg text-base font-semibold transition-all focus-visible:outline-none ${
                      result.isBlocked && result.validation.errors.some((e) => e.field === "fluidAllowance")
                        ? "bg-rose-50 border-2 border-rose-400 text-rose-950 focus:ring-2 focus:ring-rose-500"
                        : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400" aria-hidden="true">
                    mL/kg/day
                  </div>
                </div>

                <div id="fluid-bounds-note" className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Supported enteral range: 135 to 200 mL/kg/day</span>
                  {fluidAllowance < 135 && (
                    <span className="text-rose-600 font-semibold">Below enteral minimum (135 mL)</span>
                  )}
                  {fluidAllowance > 200 && (
                    <span className="text-rose-600 font-semibold">Exceeds enteral ceiling (200 mL)</span>
                  )}
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
          ) : (
            <div className="space-y-6">
              {/* Graduation Alert Callout for Infants >3500g */}
              {result.isGraduated && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-400 shadow-sm space-y-5 text-blue-950"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Product Tin Visual with Crisp Outlined Powder Box */}
                    <div className="shrink-0 flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border-2 border-slate-300 shadow-sm gap-2.5 w-full sm:w-auto">
                      <Image
                        src={result.imageSrc || "/pediamil-1.png"}
                        alt="Pediamil 1 Standard Infant Formula Tin"
                        width={180}
                        height={200}
                        className="max-h-[190px] sm:max-h-[200px] w-auto object-contain drop-shadow-md"
                        unoptimized
                      />
                      {result.deliveredNutrientPayload && (
                        <div className="w-full p-2.5 bg-blue-50 rounded-xl border-2 border-blue-400 text-center text-xs space-y-0.5 shadow-xs">
                          <span className="font-black text-blue-950 uppercase tracking-wider block text-[10px]">
                            Patient Daily Powder Need
                          </span>
                          <div className="font-mono font-black text-blue-950 text-base">
                            {result.deliveredNutrientPayload.dailyPowderGrams}g{" "}
                            <span className="text-xs font-semibold text-blue-800">powder/day</span>
                          </div>
                          <div className="text-blue-900 text-xs font-bold font-mono">
                            ≈ {result.deliveredNutrientPayload.dailyScoops} scoops/day
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
              )}

              {/* Real-Time Macronutrient Densities vs. ESPGHAN 2022 / Term Guidelines */}
              <ClinicalCard
                title={
                  result.isGraduated
                    ? "Delivered Macronutrient Densities vs. Term Infant Guidelines"
                    : "Delivered Macronutrient Densities vs. ESPGHAN 2022"
                }
                subtitle={
                  result.isGraduated
                    ? "Standard infant energy, protein, carbohydrate & lipid accretion with Pediamil® 1"
                    : "Deterministic 4-tier energy, protein, carbohydrate & lipid accretion evaluation"
                }
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              >
                <div className="space-y-6">
                  {/* Protocol Context Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10.5px]">
                        Active Reference:
                      </span>
                      <span className="font-semibold text-clinical-navy-950">
                        {result.isGraduated
                          ? "Term Infant Nutrition Standards (Pediamil® 1 Matrix)"
                          : "ESPGHAN 2022 Preterm Enteral Recommendations (Pediamil® LBW Matrix)"}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-300">
                      Fluid: {result.targetFluidMlPerKgPerDay} mL/kg/d • 24h Feed Vol: {result.totalDailyVolumeMl} mL/d
                    </span>
                  </div>

                  {/* 1. Delivered Energy Gauge */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <RangeGauge
                      currentValue={result.deliveredEnergyKcalPerKgPerDay || 0}
                      minTarget={result.isGraduated ? 90 : ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}
                      maxTarget={result.isGraduated ? 120 : ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX}
                      conditionalMaxTarget={result.isGraduated ? undefined : ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX}
                      minScale={result.isGraduated ? 70 : 90}
                      maxScale={result.isGraduated ? 150 : 180}
                      unit="kcal/kg/day"
                      metricName={
                        result.isGraduated
                          ? "Delivered Energy (Standard Term Infant: 90–120 kcal/kg/d)"
                          : "Delivered Energy (ESPGHAN 2022: 115–140 kcal/kg/d, Cond: 140–160)"
                      }
                      status={result.energyCompliance?.status || "on_target"}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200/80 pt-2 font-mono">
                      <div>
                        Total Daily Energy:{" "}
                        <strong className="text-slate-950 font-bold">{result.deliveredEnergyKcalPerDay} kcal/day</strong>
                      </div>
                      <div>
                        Formula Caloric Density:{" "}
                        <strong className="text-slate-950 font-bold">
                          {result.formulaProfile?.energyKcalPer100Ml} kcal/100 mL
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Evaluation:</span>
                        <strong className="text-slate-900 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300">
                          {result.energyCompliance?.badgeLabel}
                        </strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {result.energyCompliance?.interpretation}
                    </p>
                  </div>

                  {/* 2. Delivered Protein Gauge */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <RangeGauge
                      currentValue={result.deliveredProteinGramsPerKgPerDay || 0}
                      minTarget={result.isGraduated ? 1.8 : (result.proteinBracket?.targetMinGramsPerKg || 3.0)}
                      maxTarget={result.isGraduated ? 2.5 : (result.proteinBracket?.targetMaxGramsPerKg || 3.6)}
                      minScale={result.isGraduated ? 1.0 : 2.0}
                      maxScale={result.isGraduated ? 3.5 : 5.0}
                      unit="g/kg/day"
                      metricName={
                        result.isGraduated
                          ? "Delivered Protein (Term Infant Target: 1.8–2.5 g/kg/d, protects renal solute load)"
                          : `Delivered Protein (${result.proteinBracket?.classification}: ${result.proteinBracket?.targetMinGramsPerKg}–${result.proteinBracket?.targetMaxGramsPerKg} g/kg/d)`
                      }
                      status={result.proteinCompliance?.status || "on_target"}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200/80 pt-2 font-mono">
                      <div>
                        Total Daily Protein:{" "}
                        <strong className="text-slate-950 font-bold">{result.deliveredProteinGramsPerDay} g/day</strong>
                      </div>
                      <div>
                        Whey:Casein Ratio:{" "}
                        <strong className="text-purple-900 font-bold">
                          60:40 ({result.deliveredNutrientPayload?.wheyGramsPerDay ?? (Math.round((result.deliveredProteinGramsPerDay || 0) * 0.6 * 100) / 100)}g Whey, {result.deliveredNutrientPayload?.caseinGramsPerDay ?? (Math.round((result.deliveredProteinGramsPerDay || 0) * 0.4 * 100) / 100)}g Casein)
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Evaluation:</span>
                        <strong className="text-slate-900 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300">
                          {result.proteinCompliance?.badgeLabel}
                        </strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {result.proteinCompliance?.interpretation}{" "}
                      {result.isGraduated
                        ? "Whey enriched with 1.9 g/100g Alpha-Lactalbumin; delivers balanced amino acids without metabolic stress."
                        : "Whey containing Alpha-Lactalbumin promotes high bioavailable tryptophan, supporting neurogenesis and positive nitrogen accretion."}
                    </p>
                  </div>

                  {/* 3. Delivered Carbohydrates Gauge */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <RangeGauge
                      currentValue={result.deliveredCarbsGramsPerKgPerDay || result.deliveredNutrientPayload?.carbsGramsPerKgPerDay || 0}
                      minTarget={result.isGraduated ? 9.0 : ESPGHAN_DIRECT_GUIDELINES.CARBOHYDRATES.TYPICAL_MIN}
                      maxTarget={result.isGraduated ? 13.0 : ESPGHAN_DIRECT_GUIDELINES.CARBOHYDRATES.TYPICAL_MAX}
                      minScale={result.isGraduated ? 6.0 : 7.0}
                      maxScale={result.isGraduated ? 16.0 : 18.0}
                      unit="g/kg/day"
                      metricName={
                        result.isGraduated
                          ? "Delivered Carbohydrates (Term Infant Target: 9.0–13.0 g/kg/d | 100% Lactose Matrix)"
                          : "Delivered Carbohydrates (ESPGHAN 2022: 11.0–15.0 g/kg/d | 8.0–13.0 g/100 kcal)"
                      }
                      status={result.carbsCompliance?.status || "on_target"}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200/80 pt-2 font-mono">
                      <div>
                        Total Daily Carbs:{" "}
                        <strong className="text-slate-950 font-bold">
                          {result.deliveredCarbsGramsPerDay ?? result.deliveredNutrientPayload?.carbsGramsPerDay} g/day
                        </strong>
                      </div>
                      <div>
                        Carbohydrate Density:{" "}
                        <strong className="text-amber-950 font-bold">
                          {result.isGraduated ? "7.18 g/100 mL (10.5 g/100 kcal)" : "6.37 g/100 mL (8.0 g/100 kcal)"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Evaluation:</span>
                        <strong className="text-slate-900 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300">
                          {result.carbsCompliance?.badgeLabel || "Evaluated"}
                        </strong>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                        <span>Carbohydrate Composition & Gut Physiology:</span>
                      </div>
                      <p className="text-amber-950/90 leading-tight">
                        {result.isGraduated
                          ? "100% Lactose Digestible Carbohydrates (7.18 g/100 mL) + GOS Prebiotics (0.55 g/100 mL). Zero maltodextrin. Supports lactase maturation, stool softening, and physiological calcium absorption."
                          : "100% Lactose Digestible Carbohydrate (6.32 g/100 mL, 99.2% of carbohydrates) + 2'-FL HMO (0.14 g/100 mL = 0.95 g/100g powder) + GOS Prebiotics (0.30 g/100 mL = 2.0 g/100g powder) + Dietary Fibers (0.44 g/100 mL). Promotes intestinal lactobacilli colonization and calcium/magnesium uptake."}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {result.carbsCompliance?.interpretation}
                    </p>
                  </div>

                  {/* 4. Delivered Total Lipids Gauge */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                    <RangeGauge
                      currentValue={result.deliveredFatGramsPerKgPerDay || result.deliveredNutrientPayload?.fatGramsPerKgPerDay || 0}
                      minTarget={result.isGraduated ? 4.0 : ESPGHAN_DIRECT_GUIDELINES.TOTAL_FAT.TYPICAL_MIN}
                      maxTarget={result.isGraduated ? 6.0 : ESPGHAN_DIRECT_GUIDELINES.TOTAL_FAT.TYPICAL_MAX}
                      minScale={result.isGraduated ? 2.5 : 3.0}
                      maxScale={result.isGraduated ? 8.0 : 10.0}
                      unit="g/kg/day"
                      metricName={
                        result.isGraduated
                          ? "Delivered Total Lipids (Term Target: 4.0–6.0 g/kg/d | >60% Milk Fat Matrix)"
                          : "Delivered Total Lipids (ESPGHAN 2022: 4.8–8.1 g/kg/d | 4.8–6.6 g/100 kcal)"
                      }
                      status={result.fatCompliance?.status || "on_target"}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200/80 pt-2 font-mono">
                      <div>
                        Total Daily Lipids:{" "}
                        <strong className="text-slate-950 font-bold">
                          {result.deliveredFatGramsPerDay ?? result.deliveredNutrientPayload?.fatGramsPerDay} g/day
                        </strong>
                      </div>
                      <div>
                        Lipid Density:{" "}
                        <strong className="text-emerald-950 font-bold">
                          {result.isGraduated ? "3.65 g/100 mL (>60% Milk Fat)" : "4.88 g/100 mL (6.12 g/100 kcal, ~55% Energy)"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Evaluation:</span>
                        <strong className="text-slate-900 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300">
                          {result.fatCompliance?.badgeLabel || "Evaluated"}
                        </strong>
                      </div>
                    </div>

                    {/* Essential Fatty Acids Matrix (LA, ALA, DHA, ARA) */}
                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1.5">
                      <div className="font-semibold text-emerald-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          <span>Essential Fatty Acids & LC-PUFA Delivery:</span>
                        </span>
                        <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900">
                          {result.isGraduated ? "LA:ALA 8.3:1" : "LA:ALA 8.2:1 • ARA:DHA 1:1"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-0.5">
                        <div className="bg-white/80 p-2 rounded border border-emerald-200">
                          <span className="text-slate-500 text-[10px] block font-sans">Linoleic Acid (LA)</span>
                          <strong className="text-emerald-950">
                            {result.isGraduated ? "0.675 g/100 mL" : "0.465 g/100 mL"}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            ≈ {(((result.totalDailyVolumeMl || 0) * (result.isGraduated ? 0.675 : 0.465) / 100 * 1000) / (result.currentWeightKg || 1)).toFixed(0)} mg/kg/d
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-emerald-200">
                          <span className="text-slate-500 text-[10px] block font-sans">Alpha-Linolenic (ALA)</span>
                          <strong className="text-emerald-950">
                            {result.isGraduated ? "0.081 g/100 mL" : "0.057 g/100 mL"}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            ≈ {(((result.totalDailyVolumeMl || 0) * (result.isGraduated ? 0.081 : 0.057) / 100 * 1000) / (result.currentWeightKg || 1)).toFixed(1)} mg/kg/d
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-emerald-200">
                          <span className="text-slate-500 text-[10px] block font-sans">Double-Encaps. DHA</span>
                          <strong className="text-emerald-950">
                            {result.isGraduated ? "8.1 mg/100 mL" : "13.5 mg/100 mL"}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            ≈ {(((result.totalDailyVolumeMl || 0) * (result.isGraduated ? 8.1 : 13.5) / 100) / (result.currentWeightKg || 1)).toFixed(1)} mg/kg/d
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-emerald-200">
                          <span className="text-slate-500 text-[10px] block font-sans">Arachidonic Acid (ARA)</span>
                          <strong className="text-emerald-950">
                            {result.isGraduated ? "8.1 mg/100 mL" : "13.5 mg/100 mL"}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            ≈ {(((result.totalDailyVolumeMl || 0) * (result.isGraduated ? 8.1 : 13.5) / 100) / (result.currentWeightKg || 1)).toFixed(1)} mg/kg/d
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {result.fatCompliance?.interpretation}
                    </p>
                  </div>

                  {/* Summary Row: P:E Ratio & Overall Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                          {result.isGraduated ? "Term Target 1.8–2.5" : (result.peRatioCompliance?.status === "on_target" ? "Target 2.8–3.6" : "Non-Target")}
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
                          ? "Energy, protein, carbohydrates, lipids, and P:E ratio all satisfy recommended reference boundaries."
                          : "One or more nutritional parameters fall outside standard targets. Review clinical plan."}
                      </p>
                    </div>
                  </div>
                </div>
              </ClinicalCard>
            </div>
          )}

          {/* Clinical Formulation Matrix & Recommendation Card */}
          {!result.isBlocked && result.formulaProfile && (
            <ClinicalCard
              title="Clinical Formulation Matrix & Guidance"
              subtitle="Auditable product pack alignment & physician interpretation"
              icon={<Info className="w-4 h-4 text-clinical-navy-800" />}
            >
              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-300">
                  <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-sm gap-2.5 w-full sm:w-auto">
                    <Image
                      src={result.imageSrc || "/pediamil-lbw.png"}
                      alt={`${result.formulaProfile.brand} Product Pack`}
                      width={170}
                      height={200}
                      className="max-h-[185px] sm:max-h-[200px] w-auto object-contain drop-shadow-md"
                      unoptimized
                    />
                    {result.deliveredNutrientPayload && (
                      <div className="w-full p-2.5 bg-emerald-50 rounded-xl border-2 border-emerald-400 text-center text-xs space-y-1 shadow-xs">
                        <span className="font-black text-emerald-950 uppercase tracking-wider block text-[10px]">
                          Patient Daily Powder Need
                        </span>
                        <div className="font-mono font-black text-emerald-950 text-base">
                          {result.deliveredNutrientPayload.dailyPowderGrams}g{" "}
                          <span className="text-xs font-semibold text-emerald-800">powder/day</span>
                        </div>
                        <div className="text-emerald-900 text-xs font-bold font-mono">
                          ≈ {result.deliveredNutrientPayload.dailyScoops} scoops/day
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border-2 border-emerald-400">
                        Matrix: {result.formulaProfile.brand}
                      </span>
                      <span className="text-slate-800 font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                        {result.isGraduated ? "Term Infant" : `${result.proteinBracket?.classification} Bracket`} ({result.currentWeightGrams}g)
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-2xs">
                      {result.recommendationText}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm">
                      <div className="p-3 bg-amber-50/70 border-2 border-amber-200 rounded-xl flex flex-col justify-between">
                        <span className="text-amber-950 block text-[11px] font-black uppercase tracking-wider">
                          Energy Density
                        </span>
                        <div className="mt-1.5">
                          <strong className="text-slate-950 font-mono text-base font-black block">
                            {result.formulaProfile.energyKcalPer100Ml}
                          </strong>
                          <span className="text-[11px] font-bold text-slate-700 font-sans">
                            kcal / 100mL
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/70 border-2 border-blue-200 rounded-xl flex flex-col justify-between">
                        <span className="text-blue-950 block text-[11px] font-black uppercase tracking-wider">
                          Protein Content
                        </span>
                        <div className="mt-1.5">
                          <strong className="text-slate-950 font-mono text-base font-black block">
                            {result.formulaProfile.proteinGramsPer100Ml}
                          </strong>
                          <span className="text-[11px] font-bold text-slate-700 font-sans">
                            g / 100mL (60:40)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50/70 border-2 border-purple-200 rounded-xl flex flex-col justify-between">
                        <span className="text-purple-950 block text-[11px] font-black uppercase tracking-wider">
                          Carbohydrates
                        </span>
                        <div className="mt-1.5">
                          <strong className="text-slate-950 font-mono text-base font-black block">
                            {result.formulaProfile.carbsGramsPer100Ml ?? "—"}
                          </strong>
                          <span className="text-[11px] font-bold text-slate-700 font-sans">
                            g / 100mL ({result.isGraduated ? "100% Lactose" : "Lactose • 2'-FL • GOS"})
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border-2 border-emerald-200 rounded-xl flex flex-col justify-between">
                        <span className="text-emerald-950 block text-[11px] font-black uppercase tracking-wider">
                          Total Lipids
                        </span>
                        <div className="mt-1.5">
                          <strong className="text-slate-950 font-mono text-base font-black block">
                            {result.formulaProfile.fatGramsPer100Ml ?? "—"}
                          </strong>
                          <span className="text-[11px] font-bold text-slate-700 font-sans">
                            g / 100mL ({result.isGraduated ? ">60% Milk Fat" : "Milk Fat • DHA/ARA"})
                          </span>
                        </div>
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

                <div className="p-2.5 bg-slate-100 rounded text-[10.5px] text-slate-500 italic">
                  {result.productDisclaimer}
                </div>
              </div>
            </ClinicalCard>
          )}
        </div>
      </div>

      {/* Patient Delivered Daily Nutritional Payload Section (Full Width for Maximum Legibility & Doctor Workflow) */}
      {!result.isBlocked && result.deliveredNutrientPayload && (
        <PatientNutrientPayload
          payload={result.deliveredNutrientPayload}
          isGraduated={result.isGraduated}
        />
      )}

      {/* Section 9: Developer / Clinician Calculation Audit Panel & JSON Export */}
      <div className="rounded-xl border border-slate-300 bg-slate-900 text-slate-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCode className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Developer & Clinician Calculation Audit Panel
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {result.auditMetadata.engineVersion}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Auditable deterministic trace, atomic conversions, and clinical reference alignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadAuditJson}
              disabled={result.isBlocked}
              aria-label="Download calculation audit session as JSON"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download Audit JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAuditPanel(!showAuditPanel)}
              aria-expanded={showAuditPanel}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <span>{showAuditPanel ? "Hide Details" : "View Audit Trace"}</span>
              {showAuditPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showAuditPanel && (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-3 text-slate-300 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">Calculation Timestamp (UTC):</span>
                <span className="text-slate-200">{result.auditMetadata.calculatedAtUtc}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">Execution Environment:</span>
                <span className="text-slate-200">Client-side runtime (zero server transit)</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">Overall Clinical Status:</span>
                <span className="text-emerald-400 font-bold">{result.overallStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800 pb-3 font-sans">
              <div className="space-y-1 text-[11px]">
                <strong className="text-slate-200 font-mono text-xs block">Mathematical Inputs & Formula Derivatives:</strong>
                <p className="text-slate-400">
                  • Weight (kg) = {weightGrams}g ÷ 1000 = <span className="text-slate-200 font-mono">{result.currentWeightKg?.toFixed(3)} kg</span>
                </p>
                <p className="text-slate-400">
                  • Total Volume = {result.currentWeightKg?.toFixed(3)} kg × {fluidAllowance} mL/kg/d = <span className="text-slate-200 font-mono">{result.totalDailyVolumeMl} mL/day</span>
                </p>
                <p className="text-slate-400">
                  • Delivered Energy = ({result.totalDailyVolumeMl} mL × {result.formulaProfile?.energyKcalPer100Ml} kcal/100mL) ÷ {result.currentWeightKg?.toFixed(3)} kg = <span className="text-slate-200 font-mono">{result.deliveredEnergyKcalPerKgPerDay} kcal/kg/d</span>
                </p>
                <p className="text-slate-400">
                  • Delivered Protein = ({result.totalDailyVolumeMl} mL × {result.formulaProfile?.proteinGramsPer100Ml}g/100mL) ÷ {result.currentWeightKg?.toFixed(3)} kg = <span className="text-slate-200 font-mono">{result.deliveredProteinGramsPerKgPerDay} g/kg/d</span>
                </p>
                <p className="text-slate-400">
                  • P:E Ratio = ({result.deliveredProteinGramsPerKgPerDay}g ÷ {result.deliveredEnergyKcalPerKgPerDay} kcal) × 100 = <span className="text-slate-200 font-mono">{result.proteinToEnergyRatioGramsPer100Kcal} g/100 kcal</span>
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <strong className="text-slate-200 font-mono text-xs block">Atomic Molecular Weight Conversions:</strong>
                <p className="text-slate-400">• Sodium: Na = 22.99 g/mol (1 mmol = 22.99 mg)</p>
                <p className="text-slate-400">• Potassium: K = 39.10 g/mol (1 mmol = 39.10 mg)</p>
                <p className="text-slate-400">• Chloride: Cl = 35.45 g/mol (1 mmol = 35.45 mg)</p>
                <p className="text-slate-400">• Calcium: Ca = 40.08 g/mol (1 mmol = 40.08 mg)</p>
                <p className="text-slate-400">• Phosphorus: P = 30.97 g/mol (1 mmol = 30.97 mg)</p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-sans">
              <strong className="text-slate-200 font-mono text-xs block">Active Clinical Reference Documents:</strong>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                {(result.auditMetadata.guidelinesUsed || []).map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 text-[10.5px] text-slate-500 border-t border-slate-800/80 font-sans italic">
              {result.auditMetadata.nonDeviceDisclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

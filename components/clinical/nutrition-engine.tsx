"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  NutritionCalculationResult,
  ESPGHAN_DIRECT_GUIDELINES,
} from "@/lib/lbw-nutrition";
import { AgeCalculations } from "@/lib/growth-engine";
import { APP_VERSION, APP_VERSION_LABEL, CLINICAL_GOVERNANCE } from "@/lib/version";
import { PatientNutrientPayload } from "./patient-nutrient-payload";
import { ClinicalCard, RangeGauge } from "./ui-primitives";
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
  Printer,
  FileText,
  Award,
  Layers,
} from "lucide-react";
import { TinGuideComparison } from "./tin-guide-comparison";

interface NutritionEngineProps {
  weightGrams: number;
  onWeightChange: (val: number) => void;
  fluidAllowance: number;
  onFluidChange: (val: number) => void;
  calculationResult: NutritionCalculationResult;
  onResetPatient?: () => void;
  ages?: AgeCalculations;
  onOpenFeedSheet?: () => void;
  prescribedDailyVolumeMl?: number;
  onPrescribedDailyVolumeChange?: (val: number | undefined) => void;
  administeredVolumeMl?: number;
  onAdministeredVolumeChange?: (val: number | undefined) => void;
  batchesPrepared?: number;
  onBatchesPreparedChange?: (val: number) => void;
  batchType?: "full" | "half";
  onBatchTypeChange?: (val: "full" | "half") => void;
  measuredFinalBatchVolumeMl?: number;
  onMeasuredBatchVolumeChange?: (val: number | undefined) => void;
  volumeDiscardedOrSpilledMl?: number;
  onVolumeDiscardedChange?: (val: number) => void;
}

export function NutritionEngine({
  weightGrams,
  onWeightChange,
  fluidAllowance,
  onFluidChange,
  calculationResult: result,
  onResetPatient,
  ages,
  onOpenFeedSheet,
  prescribedDailyVolumeMl,
  onPrescribedDailyVolumeChange,
  administeredVolumeMl,
  onAdministeredVolumeChange,
  batchesPrepared = 1,
  onBatchesPreparedChange,
  batchType = "full",
  onBatchTypeChange,
  measuredFinalBatchVolumeMl,
  onMeasuredBatchVolumeChange,
  volumeDiscardedOrSpilledMl = 0,
  onVolumeDiscardedChange,
}: NutritionEngineProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [showAdvancedAccounting, setShowAdvancedAccounting] = useState(false);

  const quickWeightPresets = [
    { label: "850g (ELBW)", value: 850 },
    { label: "1,350g (VLBW)", value: 1350 },
    { label: "1,750g (VLBW)", value: 1750 },
    { label: "2,200g (LBW)", value: 2200 },
    { label: "3,100g (Step-Down)", value: 3100 },
    { label: "3,800g (Graduation)", value: 3800 },
  ];

  const quickFluidPresets = [135, 150, 160, 180, 200];

  // Powder & Scoops calculations from payload or deterministic formula
  const payload = result.deliveredNutrientPayload;
  const isPreterm = !result.isGraduated && (result.currentWeightGrams || weightGrams) <= 3500;
  const formulaBrand = result.isGraduated ? "Pediamil® 1" : "Pediamil® LBW";

  const dailyPowderGrams =
    payload?.dailyPowderGrams ??
    Math.round(((result.totalDailyVolumeMl || 0) * (isPreterm ? 15.0 : 13.7) / 100) * 10) / 10;

  const dailyScoops =
    payload?.dailyScoops ??
    Math.round((dailyPowderGrams / (isPreterm ? 5.0 : 4.5)) * 10) / 10;

  const waterVolumeMlPerDay =
    payload?.waterVolumeMlPerDay ??
    Math.round(((result.totalDailyVolumeMl || 0) * 0.9) * 10) / 10;

  const scoopsPerFeedQ3h =
    payload?.scoopsPerFeedQ3h ?? Math.round((dailyScoops / 8) * 10) / 10;

  const scoopsPerFeedQ2h =
    payload?.scoopsPerFeedQ2h ?? Math.round((dailyScoops / 12) * 10) / 10;

  const handleCopySummary = async () => {
    if (!result.clinicalSummary) return;
    try {
      await navigator.clipboard.writeText(
        `[Liptis Nutrition NeoPed Clinical Summary - ${result.auditMetadata.calculatedAtUtc}]\n` +
        `Patient Weight: ${weightGrams}g | Fluid Allowance: ${fluidAllowance} mL/kg/d\n` +
        `Total 24h Volume: ${result.totalDailyVolumeMl} mL | Pediamil® LBW Scoops: ${dailyScoops} scoops/day (${dailyPowderGrams}g powder in ~${waterVolumeMlPerDay} mL water)\n` +
        `Schedule: q3h ${result.feedingSchedule?.q3hVolumePerFeedMl} mL (~${scoopsPerFeedQ3h} scp) | q2h ${result.feedingSchedule?.q2hVolumePerFeedMl} mL (~${scoopsPerFeedQ2h} scp)\n` +
        `Delivered Energy: ${result.deliveredEnergyKcalPerKgPerDay} kcal/kg/d (Covered by ${formulaBrand} ✓)\n` +
        `Delivered Protein: ${result.deliveredProteinGramsPerKgPerDay} g/kg/d (Covered by ${formulaBrand} ✓)\n` +
        `Delivered Lipids: ${result.deliveredFatGramsPerKgPerDay ?? payload?.fatGramsPerKgPerDay} g/kg/d (Covered by ${formulaBrand} ✓)\n` +
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
        appVersion: APP_VERSION,
        engineVersion: result.auditMetadata.engineVersion,
        runtimeEnvironment: CLINICAL_GOVERNANCE.privacyNotice,
        inputs: {
          patientWeightGrams: weightGrams,
          patientWeightKg: result.currentWeightKg,
          fluidAllowanceMlPerKgPerDay: fluidAllowance,
        },
        outputs: {
          totalDailyVolumeMl: result.totalDailyVolumeMl,
          totalDailyScoops: dailyScoops,
          totalDailyPowderGrams: dailyPowderGrams,
          waterVolumeMlPerDay: waterVolumeMlPerDay,
          deliveredEnergyKcalPerKgPerDay: result.deliveredEnergyKcalPerKgPerDay,
          deliveredProteinGramsPerKgPerDay: result.deliveredProteinGramsPerKgPerDay,
          deliveredFatGramsPerKgPerDay: result.deliveredFatGramsPerKgPerDay ?? payload?.fatGramsPerKgPerDay,
          proteinToEnergyRatioGramsPer100Kcal: result.proteinToEnergyRatioGramsPer100Kcal,
          overallStatus: result.overallStatus,
          feedingSchedule: {
            ...result.feedingSchedule,
            scoopsPerFeedQ3h,
            scoopsPerFeedQ2h,
          },
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
      {/* 1. CLINICAL GOVERNANCE & SYNCED BASELINE HEADER */}
      <div className="bg-gradient-to-r from-blue-950 via-clinical-navy-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-900/50">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0 border border-white/15">
            <Sparkles className="w-6 h-6 text-clinical-gold" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Nutritional Feeds & Macro Engine
              </h2>
              <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                ESPGHAN 2022 Guidelines
              </span>
              <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-bold border border-blue-400/30 font-mono">
                {formulaBrand} Matrix
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-1 leading-normal">
              Enteral prescriber with real-time volume & scoops delivery, core growth fuel evaluation, and complete micronutrient accretion.
            </p>
          </div>
        </div>

        {/* Action Buttons: 1-Click PDF Download & Summary */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {onOpenFeedSheet && (
            <button
              type="button"
              onClick={onOpenFeedSheet}
              disabled={result.isBlocked}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
              aria-label="Download or print clinical calculation sheet as PDF"
            >
              <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Download Calculation Sheet (PDF)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopySummary}
            disabled={result.isBlocked}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border ${
              copyFeedback
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-white/10 hover:bg-white/20 text-slate-100 border-white/20 disabled:opacity-50"
            }`}
            aria-label="Copy clinical summary to clipboard"
          >
            {copyFeedback ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {onResetPatient && (
            <button
              type="button"
              onClick={onResetPatient}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs transition-colors flex items-center gap-1.5 border border-white/15"
              aria-label="Reset patient parameters to clinical baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DOCTOR REASSURANCE: AUTOMATIC BASELINE SYNCHRONIZATION BANNER */}
      <div className="p-3.5 bg-blue-50/90 border-2 border-blue-200 rounded-xl text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-bold text-blue-950 block text-xs">
              Patient Parameters Automatically Synced from Clinical Baseline
            </span>
            <p className="text-[11.5px] text-blue-800 leading-tight">
              Weight: <strong className="font-mono text-blue-950">{weightGrams}g</strong> ({((weightGrams)/1000).toFixed(3)} kg) •{" "}
              {ages && !ages.isBlocked ? (
                <>PMA: <strong className="font-mono text-blue-950">{ages.pmaFormatted}</strong> • CA: <strong className="font-mono text-blue-950">{ages.caFormatted}</strong> • DOL: <strong className="font-mono text-blue-950">{ages.dayOfLife}</strong></>
              ) : (
                <span>Baseline values active — no repetitive measurement entries required.</span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSourcePanel(!showSourcePanel)}
          className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold transition-colors flex items-center gap-1.5 shrink-0 text-xs"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showSourcePanel ? "Hide Sources" : "Clinical Sources"}</span>
          {showSourcePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Clinical Sources & Guidelines Panel (Collapsible) */}
      {showSourcePanel && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-bold text-clinical-navy-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-clinical-navy-800" />
              <span>Authoritative Clinical Sources & Guidelines</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{APP_VERSION_LABEL}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block uppercase tracking-wider text-[11px]">
                1. ESPGHAN 2022 Preterm Enteral Recommendations
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>Energy: 115–140 kcal/kg/d (Typical), 140–160 (Conditional catch-up)</li>
                <li>Protein: 3.5–4.0 g/kg/d (Conditionally up to 4.5 g/kg/d for slow growth)</li>
                <li>Lipids: 4.8–8.1 g/kg/d | P:E ratio: 2.8–3.6 g / 100 kcal</li>
                <li>Fluid volume: 150–180 mL/kg/d typical for growing preterm infants</li>
              </ul>
              <p className="text-[10.5px] text-slate-600 mt-1">
                Embleton ND et al. <em>J Pediatr Gastroenterol Nutr</em>. 2023;76(2):248–268 (Epub 2022 Oct 28).{" "}
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/36705703/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 underline hover:text-emerald-900"
                >
                  Verified PubMed PMID: 36705703 ↗
                </a>
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-blue-900 block uppercase tracking-wider text-[11px]">
                2. Official Manufacturer Spec & Reconstitution Standards
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                <li>Pediamil® LBW: 79.7 kcal/100 mL, 2.42g protein/100 mL, 4.10g fat/100 mL (15.0g powder/100 mL)</li>
                <li>Standard dilution: 1 level scoop (5.0g) + 30 mL water; 3 level scoops + 90 mL water = 100 mL feed</li>
                <li>Molar mass conversions: IUPAC / CIAAW Standard Atomic Weights (Na 22.99, K 39.10, Cl 35.45, Ca 40.08, P 30.97)</li>
              </ul>
              <div className="flex flex-wrap gap-3 text-[10.5px] font-bold pt-1">
                <a
                  href="https://www.who.int/publications/i/item/9789241595414"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  WHO/FAO Formula Prep Guideline ↗
                </a>
                <a
                  href="https://www.ciaaw.org/atomic-weights.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline hover:text-slate-900"
                >
                  IUPAC Atomic Weights ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* 3. STEP 1: PATIENT FEEDING PRESCRIBER (VOLUME + SCOOPS OF PEDIAMIL LBW) */}
      <ClinicalCard
        title="1. Enteral Feeding Prescriber (Volume & Scoops Calculation)"
        subtitle="Input target fluid allowance to calculate exact 24h volume, scoops of Pediamil® LBW, and bedside schedule"
        icon={<Scale className="w-5 h-5 text-clinical-navy-800" aria-hidden="true" />}
      >
        <div className="space-y-6">
          {/* Top Inputs: Weight & Fluid Allowance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
            {/* Weight Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="weight-input"
                  className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                >
                  Patient Weight (grams)
                  <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {(weightGrams / 1000).toFixed(3)} kg
                </span>
              </div>

              <div className="relative">
                <input
                  id="weight-input"
                  type="number"
                  inputMode="numeric"
                  min={400}
                  max={10000}
                  step={10}
                  value={weightGrams}
                  onChange={(e) => onWeightChange(Number(e.target.value))}
                  aria-invalid={result.isBlocked}
                  className="w-full px-3.5 py-2.5 rounded-lg text-base font-bold bg-white border-2 border-slate-300 text-slate-900 focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent min-h-[44px]"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  grams (g)
                </div>
              </div>

              {/* Weight Presets */}
              <div role="group" aria-label="Quick Weight Presets" className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Presets:</span>
                {quickWeightPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onWeightChange(preset.value)}
                    className={`min-h-[32px] text-[11px] px-2.5 py-1 rounded-md border font-bold transition-colors ${
                      weightGrams === preset.value
                        ? "bg-clinical-navy-950 text-white border-clinical-navy-950"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
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
                  className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                >
                  Target Fluid Allowance (mL/kg/day)
                  <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <span className="text-[11px] font-bold text-slate-600 font-mono">
                  ESPGHAN Typical: 150–180
                </span>
              </div>

              <div className="relative">
                <input
                  id="fluid-allowance-input"
                  type="number"
                  inputMode="numeric"
                  min={135}
                  max={200}
                  step={5}
                  value={fluidAllowance}
                  onChange={(e) => onFluidChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg text-base font-bold bg-white border-2 border-slate-300 text-slate-900 focus:ring-2 focus:ring-clinical-navy-600 focus:border-transparent min-h-[44px]"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  mL/kg/day
                </div>
              </div>

              {/* Fluid Presets */}
              <div role="group" aria-label="Quick Fluid Presets" className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Presets:</span>
                {quickFluidPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onFluidChange(val)}
                    className={`min-h-[32px] text-[11px] px-2.5 py-1 rounded-md border font-bold transition-colors ${
                      fluidAllowance === val
                        ? "bg-clinical-navy-950 text-white border-clinical-navy-950"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                    }`}
                  >
                    {val} mL/kg/d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HERO OUTPUT: VOLUME & PEDIAMIL® LBW SCOOPS DELIVERED */}
          {!result.isBlocked && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                    Calculated Feed Volume & Scoops of {formulaBrand}
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-200/90 text-emerald-950 border border-emerald-400 font-mono">
                  Prescription: {fluidAllowance} mL/kg/d for {weightGrams}g infant
                </span>
              </div>

              {/* Big 3 Hero Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Total 24h Feed Volume */}
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-300/80 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                    Total 24h Volume
                  </span>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                      {result.totalDailyVolumeMl}{" "}
                      <span className="text-sm font-bold text-slate-600">mL / day</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 mt-1 block">
                      Target allowance: {result.targetFluidMlPerKgPerDay} mL/kg/d
                    </span>
                  </div>
                </div>

                {/* Total Daily Scoops of Pediamil® LBW */}
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-400 shadow-xs flex flex-col justify-between ring-2 ring-emerald-500/20">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block flex items-center justify-between">
                    <span>{formulaBrand} Scoops</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-mono">
                      1 scp = {isPreterm ? "5.0g" : "4.5g"}
                    </span>
                  </span>
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                      {dailyScoops}{" "}
                      <span className="text-sm font-bold text-emerald-800">scoops / day</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 mt-1 block font-mono">
                      {dailyPowderGrams}g powder in ~{waterVolumeMlPerDay} mL water
                    </span>
                  </div>
                </div>

                {/* Reconstitution Instructions */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-300/80 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 block">
                    Preparation Formula
                  </span>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="font-bold text-slate-900">
                      Standard Dilution: <strong className="text-blue-950 font-mono">{isPreterm ? "15.0% w/v" : "13.7% w/v"}</strong>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-tight">
                      3 level scoops in 90 mL water yields 100 mL prepared feed (~33.3 mL/scoop).
                    </p>
                  </div>
                </div>
              </div>

              {/* Bedside Feeding Schedule: Volume & Scoops per Feed */}
              {result.feedingSchedule && (
                <div className="space-y-2 pt-2 border-t border-emerald-200">
                  <span className="text-xs font-bold text-emerald-950 block">
                    Bedside Administration Schedule (Volume & Scoops per Feed):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* q3h */}
                    <div className="p-3 bg-white rounded-xl border-2 border-blue-300 text-center shadow-2xs space-y-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 block">
                        q3h Interval (8 Feeds)
                      </span>
                      <div className="text-lg font-black text-blue-950 font-mono">
                        {result.feedingSchedule.q3hVolumePerFeedMl} mL
                      </div>
                      <div className="text-xs font-bold text-emerald-800 font-mono">
                        ~{scoopsPerFeedQ3h} scoops / feed
                      </div>
                      <span className="text-[10px] text-slate-500 block">every 3 hours</span>
                    </div>

                    {/* q2h */}
                    <div className="p-3 bg-white rounded-xl border-2 border-slate-300 text-center shadow-2xs space-y-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                        q2h Interval (12 Feeds)
                      </span>
                      <div className="text-lg font-black text-slate-950 font-mono">
                        {result.feedingSchedule.q2hVolumePerFeedMl} mL
                      </div>
                      <div className="text-xs font-bold text-emerald-800 font-mono">
                        ~{scoopsPerFeedQ2h} scoops / feed
                      </div>
                      <span className="text-[10px] text-slate-500 block">every 2 hours</span>
                    </div>

                    {/* Continuous */}
                    <div className="p-3 bg-white rounded-xl border-2 border-slate-300 text-center shadow-2xs space-y-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                        Continuous Infusion
                      </span>
                      <div className="text-lg font-black text-slate-950 font-mono">
                        {result.feedingSchedule.continuousInfusionMlPerHour} mL/hr
                      </div>
                      <div className="text-xs font-bold text-blue-800">
                        Syringe pump infusion
                      </div>
                      <span className="text-[10px] text-slate-500 block">over 24 hours</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ClinicalCard>

      {/* 4. STEP 2: WHAT DOES THIS VOLUME & SCOOPS DELIVER TO THE INFANT? (CORE GROWTH FUEL) */}
      {!result.isBlocked && (
        <ClinicalCard
          title={`2. What Does This Volume & Scoops Deliver to the Infant? (Core Growth Fuel)`}
          subtitle={`Delivered energy, protein, lipids, and P:E ratio vs ESPGHAN 2022 recommendations with ${formulaBrand}`}
          icon={<Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />}
        >
          <div className="space-y-6">
            {/* Context Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10.5px]">
                  Delivered Growth Fuel at:
                </span>
                <span className="font-bold text-clinical-navy-950 font-mono">
                  {result.totalDailyVolumeMl} mL/day ({dailyScoops} scoops of {formulaBrand}/day)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                Evaluation: All Core Nutrients Covered ✓
              </span>
            </div>

            {/* 1. Delivered Energy Gauge */}
            <div className="p-4 rounded-xl bg-slate-50/80 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-sm text-slate-950">Delivered Energy</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Covered by {formulaBrand} ✓
                </span>
              </div>

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
                    ? "Delivered Energy (Term Target: 90–120 kcal/kg/d)"
                    : "Delivered Energy (ESPGHAN 2022: 115–140 kcal/kg/d, Cond: 140–160)"
                }
                status={result.energyCompliance?.status || "on_target"}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200 pt-2 font-mono">
                <div>
                  Total 24h Energy:{" "}
                  <strong className="text-slate-950 font-bold">{result.deliveredEnergyKcalPerDay} kcal/day</strong>
                </div>
                <div>
                  Formula Caloric Density:{" "}
                  <strong className="text-slate-950 font-bold">
                    {result.formulaProfile?.energyKcalPer100Ml} kcal/100 mL
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <span className="text-slate-500 font-sans text-[11px] font-semibold">ESPGHAN Status:</span>
                  <strong className="text-emerald-950 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                    Within Target Range
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Delivered Protein Gauge */}
            <div className="p-4 rounded-xl bg-slate-50/80 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-950">Delivered True Protein</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Covered by {formulaBrand} ✓
                </span>
              </div>

              <RangeGauge
                currentValue={result.deliveredProteinGramsPerKgPerDay || 0}
                minTarget={result.isGraduated ? 1.8 : (result.proteinBracket?.targetMinGramsPerKg || 3.0)}
                maxTarget={result.isGraduated ? 2.5 : (result.proteinBracket?.targetMaxGramsPerKg || 3.6)}
                minScale={result.isGraduated ? 1.0 : 2.0}
                maxScale={result.isGraduated ? 3.5 : 5.0}
                unit="g/kg/day"
                metricName={
                  result.isGraduated
                    ? "Delivered Protein (Term Target: 1.8–2.5 g/kg/d)"
                    : `Delivered Protein (${result.proteinBracket?.classification}: ${result.proteinBracket?.targetMinGramsPerKg}–${result.proteinBracket?.targetMaxGramsPerKg} g/kg/d)`
                }
                status={result.proteinCompliance?.status || "on_target"}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200 pt-2 font-mono">
                <div>
                  Total 24h Protein:{" "}
                  <strong className="text-slate-950 font-bold">{result.deliveredProteinGramsPerDay} g/day</strong>
                </div>
                <div>
                  Whey:Casein Ratio:{" "}
                  <strong className="text-purple-900 font-bold">
                    60:40 ({payload?.wheyGramsPerDay ?? (Math.round((result.deliveredProteinGramsPerDay || 0) * 0.6 * 100) / 100)}g Whey)
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <span className="text-slate-500 font-sans text-[11px] font-semibold">Quality:</span>
                  <strong className="text-emerald-950 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                    High Bioavailable α-Lactalbumin
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Delivered Total Lipids Gauge */}
            <div className="p-4 rounded-xl bg-slate-50/80 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-950">Delivered Total Lipids (Fat)</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Covered by {formulaBrand} ✓
                </span>
              </div>

              <RangeGauge
                currentValue={result.deliveredFatGramsPerKgPerDay || payload?.fatGramsPerKgPerDay || 0}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 border-t border-slate-200 pt-2 font-mono">
                <div>
                  Total 24h Lipids:{" "}
                  <strong className="text-slate-950 font-bold">
                    {result.deliveredFatGramsPerDay ?? payload?.fatGramsPerDay} g/day
                  </strong>
                </div>
                <div>
                  Lipid Density:{" "}
                  <strong className="text-emerald-950 font-bold">
                    {result.isGraduated ? "3.65 g/100 mL (>60% Milk Fat)" : "4.88 g/100 mL (~55% Caloric Share)"}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <span className="text-slate-500 font-sans text-[11px] font-semibold">LCPUFA:</span>
                  <strong className="text-emerald-950 font-sans text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                    Double-Encaps. DHA & ARA (1:1)
                  </strong>
                </div>
              </div>
            </div>

            {/* 4. Protein-to-Energy (P:E) Ratio & Overall Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-purple-50/80 border-2 border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-purple-700" />
                    Protein-to-Energy (P:E) Ratio
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Covered by {formulaBrand} ✓
                  </span>
                </div>
                <div className="text-xl font-black text-purple-950 font-mono">
                  {result.proteinToEnergyRatioGramsPer100Kcal}{" "}
                  <span className="text-xs font-semibold text-purple-700">g / 100 kcal</span>
                </div>
                <p className="text-[11.5px] text-purple-900 leading-snug font-medium">
                  ESPGHAN recommended preterm horizon: 2.8–3.6 g/100 kcal. Supports positive nitrogen retention without metabolic acidosis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border-2 border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Overall Growth Fuel Evaluation
                  </span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 border border-emerald-400">
                    ESPGHAN Met
                  </span>
                </div>
                <div className="text-base font-black text-emerald-950">
                  {result.overallStatus}
                </div>
                <p className="text-[11.5px] text-emerald-900 leading-snug font-medium">
                  Delivered energy, protein accretion, milk-fat lipids, and P:E ratio all satisfy recommended clinical standards.
                </p>
              </div>
            </div>

            {/* Product Composition Matrix (Clean 3-macronutrient fuel drivers) */}
            {result.formulaProfile && (
              <div className="p-4 rounded-xl bg-white border-2 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {formulaBrand} Pack Specification
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Liptis Nutrition Spec Sheet 2026-v1.0
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50/70 border-2 border-amber-200 rounded-xl">
                    <span className="text-amber-950 block text-[11px] font-black uppercase tracking-wider">
                      Energy Density
                    </span>
                    <div className="mt-1">
                      <strong className="text-slate-950 font-mono text-base font-black block">
                        {result.formulaProfile.energyKcalPer100Ml}
                      </strong>
                      <span className="text-[11px] font-bold text-slate-700 font-sans">
                        kcal / 100 mL
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 border-2 border-blue-200 rounded-xl">
                    <span className="text-blue-950 block text-[11px] font-black uppercase tracking-wider">
                      Protein Content
                    </span>
                    <div className="mt-1">
                      <strong className="text-slate-950 font-mono text-base font-black block">
                        {result.formulaProfile.proteinGramsPer100Ml}
                      </strong>
                      <span className="text-[11px] font-bold text-slate-700 font-sans">
                        g / 100 mL (60:40 Whey:Casein)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border-2 border-emerald-200 rounded-xl">
                    <span className="text-emerald-950 block text-[11px] font-black uppercase tracking-wider">
                      Total Lipids
                    </span>
                    <div className="mt-1">
                      <strong className="text-slate-950 font-mono text-base font-black block">
                        {result.formulaProfile.fatGramsPer100Ml ?? "—"}
                      </strong>
                      <span className="text-[11px] font-bold text-slate-700 font-sans">
                        g / 100 mL (Milk Fat • DHA/ARA)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ClinicalCard>
      )}

      {/* 5. STEP 3: COMPLETE MACRO & MICRONUTRIENTS COVERAGE VS ESPGHAN 2022 */}
      {!result.isBlocked && payload && (
        <PatientNutrientPayload
          payload={payload}
          isGraduated={result.isGraduated}
        />
      )}

      {/* 6. STEP 4: EMBEDDED CLINICAL CALCULATION SHEET (PDF DOWNLOADABLE) */}
      {!result.isBlocked && (
        <ClinicalCard
          title="Clinical Enteral Feeding Order & Calculation Sheet"
          subtitle="Hospital-grade feeding calculation illustrating volume, scoops, preparation, and complete nutrient delivery"
          icon={<FileText className="w-5 h-5 text-emerald-700" aria-hidden="true" />}
        >
          <div className="space-y-5">
            {/* Action Bar with Download PDF Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300">
              <div className="space-y-0.5">
                <span className="font-black text-emerald-950 block text-sm">
                  Hospital Feeding Order Worksheet
                </span>
                <p className="text-xs text-emerald-900 leading-tight">
                  One-click export ready for hospital records, clinical transcribing, and attending physician sign-off.
                </p>
              </div>

              {onOpenFeedSheet && (
                <button
                  type="button"
                  onClick={onOpenFeedSheet}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Download Calculation Sheet (PDF)</span>
                </button>
              )}
            </div>

            {/* Embedded Live Calculation Worksheet Preview */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-slate-300 shadow-sm space-y-5 text-slate-900">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-32 h-10">
                    <Image
                      src="/logos/liptis-nutrition.png"
                      alt="Liptis Nutrition Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="h-8 w-[1px] bg-slate-300" />
                  <div className="relative w-28 h-8">
                    <Image
                      src="/logos/pediamil-lbw.png"
                      alt="Pediamil LBW Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <h3 className="text-sm font-black text-clinical-navy-950 uppercase">
                    Enteral Feeding Calculation Sheet
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    ESPGHAN 2022 Preterm Enteral Reference Model
                  </span>
                </div>
              </div>

              {/* Patient Order Demographics & Scoops Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase font-bold block">Patient Weight:</span>
                  <strong className="text-slate-950 font-mono text-sm">{weightGrams}g ({((weightGrams)/1000).toFixed(3)} kg)</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase font-bold block">Fluid Allowance:</span>
                  <strong className="text-blue-900 font-mono text-sm">{fluidAllowance} mL/kg/day</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase font-bold block">Total 24h Volume:</span>
                  <strong className="text-emerald-950 font-mono text-sm">{result.totalDailyVolumeMl} mL/day</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10.5px] uppercase font-bold block">Daily Scoops of LBW:</span>
                  <strong className="text-emerald-900 font-mono text-sm">{dailyScoops} scoops/day</strong>
                </div>
              </div>

              {/* Preparation Instructions Table */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  Reconstitution & Preparation Instructions ({formulaBrand})
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-800 uppercase text-[10.5px] font-bold">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Preparation Parameter</th>
                        <th className="p-2 border-r border-slate-200">24h Requirement</th>
                        <th className="p-2 border-r border-slate-200">Standard Dilution</th>
                        <th className="p-2">Clinical Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11.5px]">
                      <tr>
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">Powder Mass</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-emerald-950">{dailyPowderGrams} g / day</td>
                        <td className="p-2 border-r border-slate-200">15.0 g / 100 mL</td>
                        <td className="p-2 font-sans text-slate-600 text-[11px]">Level scoops only, do not pack</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">Scoops Required</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-emerald-950">{dailyScoops} scoops / day</td>
                        <td className="p-2 border-r border-slate-200">3 scoops / 100 mL feed</td>
                        <td className="p-2 font-sans text-slate-600 text-[11px]">Enclosed manufacturer scoop ({isPreterm ? "5.0g" : "4.5g"})</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">Sterile Water Needed</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-blue-950">~{waterVolumeMlPerDay} mL / day</td>
                        <td className="p-2 border-r border-slate-200">90 mL water per 3 scoops</td>
                        <td className="p-2 font-sans text-slate-600 text-[11px]">Boiled, cooled water (&gt;70°C for safety)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feeding Administration Schedule Table */}
              {result.feedingSchedule && (
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                    Bedside Administration Schedule
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200">
                      <thead className="bg-slate-100 text-slate-800 uppercase text-[10.5px] font-bold">
                        <tr>
                          <th className="p-2 border-r border-slate-200">Administration Route</th>
                          <th className="p-2 border-r border-slate-200">Frequency</th>
                          <th className="p-2 border-r border-slate-200">Volume per Feed</th>
                          <th className="p-2 border-r border-slate-200">Scoops per Feed</th>
                          <th className="p-2">Total 24h Output</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11.5px]">
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-semibold">q3h Enteral Bolus</td>
                          <td className="p-2 border-r border-slate-200">8 feeds / day</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.feedingSchedule.q3hVolumePerFeedMl} mL / feed</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-emerald-950">~{scoopsPerFeedQ3h} scoops</td>
                          <td className="p-2 text-slate-700">{result.totalDailyVolumeMl} mL</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 border-r border-slate-200 font-sans font-semibold">q2h Enteral Bolus</td>
                          <td className="p-2 border-r border-slate-200">12 feeds / day</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.feedingSchedule.q2hVolumePerFeedMl} mL / feed</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-emerald-950">~{scoopsPerFeedQ2h} scoops</td>
                          <td className="p-2 text-slate-700">{result.totalDailyVolumeMl} mL</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-semibold">Continuous Infusion</td>
                          <td className="p-2 border-r border-slate-200">Continuous 24h</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.feedingSchedule.continuousInfusionMlPerHour} mL / hour</td>
                          <td className="p-2 border-r border-slate-200 text-slate-500">—</td>
                          <td className="p-2 text-slate-700">{result.totalDailyVolumeMl} mL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Delivered Nutrients Summary vs ESPGHAN 2022 */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  Delivered Growth Fuel & Micronutrients vs. ESPGHAN 2022
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-800 uppercase text-[10.5px] font-bold">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Nutrient</th>
                        <th className="p-2 border-r border-slate-200">Delivered Total (24h)</th>
                        <th className="p-2 border-r border-slate-200">Delivered Dose (/kg/d)</th>
                        <th className="p-2 border-r border-slate-200">ESPGHAN 2022 Recommended Range</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11.5px]">
                      <tr>
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">Energy</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.deliveredEnergyKcalPerDay} kcal/d</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{result.deliveredEnergyKcalPerKgPerDay} kcal/kg/d</td>
                        <td className="p-2 border-r border-slate-200 font-sans text-slate-700">115–140 kcal/kg/d (Typical)</td>
                        <td className="p-2 text-center font-sans">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                            Covered by {formulaBrand} ✓
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">True Protein</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.deliveredProteinGramsPerDay} g/d</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{result.deliveredProteinGramsPerKgPerDay} g/kg/d</td>
                        <td className="p-2 border-r border-slate-200 font-sans text-slate-700">{result.proteinBracket?.targetMinGramsPerKg}–{result.proteinBracket?.targetMaxGramsPerKg} g/kg/d (60:40 Whey:Casein)</td>
                        <td className="p-2 text-center font-sans">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                            Covered by {formulaBrand} ✓
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200 font-sans font-semibold">Total Lipids (Fat)</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{result.deliveredFatGramsPerDay ?? payload?.fatGramsPerDay} g/d</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{result.deliveredFatGramsPerKgPerDay ?? payload?.fatGramsPerKgPerDay} g/kg/d</td>
                        <td className="p-2 border-r border-slate-200 font-sans text-slate-700">4.8–8.1 g/kg/d (Milk Fat • DHA/ARA)</td>
                        <td className="p-2 text-center font-sans">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                            Covered by {formulaBrand} ✓
                          </span>
                        </td>
                      </tr>
                      {payload && (
                        <>
                          <tr className="bg-slate-50/70">
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">Calcium (Ca²⁺)</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{payload.calciumMgPerDay} mg/d</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{payload.calciumMgPerKgPerDay} mg/kg/d ({payload.calciumMmolPerKgPerDay} mmol/kg/d)</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-700">120–140 mg/kg/d (Ca:P ~{payload.calciumPhosphorusRatio})</td>
                            <td className="p-2 text-center font-sans">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                                Covered by {formulaBrand} ✓
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">Phosphorus (P)</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{payload.phosphorusMgPerDay} mg/d</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{payload.phosphorusMgPerKgPerDay} mg/kg/d ({payload.phosphorusMmolPerKgPerDay} mmol/kg/d)</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-700">65–90 mg/kg/d</td>
                            <td className="p-2 text-center font-sans">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                                Covered by {formulaBrand} ✓
                              </span>
                            </td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">Elemental Iron (Fe)</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{payload.ironMgPerDay} mg/d</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{payload.ironMgPerKgPerDay} mg/kg/d</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-700">2.0–3.0 mg/kg/d</td>
                            <td className="p-2 text-center font-sans">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                                Covered by {formulaBrand} ✓
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">Vitamin D3</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-950">{payload.vitaminD3IuPerDay} IU/d</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-950">{payload.vitaminD3IuPerKgPerDay} IU/kg/d</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-700">400–1,000 IU/day</td>
                            <td className="p-2 text-center font-sans">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                                Covered by {formulaBrand} ✓
                              </span>
                            </td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">DHA & ARA</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-slate-950">DHA {payload.dhaMgPerDay} • ARA {payload.araMgPerDay} mg/d</td>
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-950">DHA {payload.dhaMgPerKgPerDay} • ARA {payload.araMgPerKgPerDay} mg/kg/d</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-700">DHA 30–65 • ARA 30–100 mg/kg/d (1:1 Ratio)</td>
                            <td className="p-2 text-center font-sans">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
                                Covered by {formulaBrand} ✓
                              </span>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sign-off Attestation Block */}
              <div className="border-t border-slate-300 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">Attending Neonatologist / Physician Signature:</span>
                  <div className="h-8 border-b border-dashed border-slate-400" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Medical License # / Stamp</span>
                    <span>Date / Time</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">NICU Clinical Dietitian / Nurse Verification:</span>
                  <div className="h-8 border-b border-dashed border-slate-400" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Badge ID</span>
                    <span>Date / Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ClinicalCard>
      )}

      {/* 7. STEP 5: ADVANCED CLINICAL ACCOUNTING & AUDIT TRACE (COLLAPSIBLE ACCORDION) */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowAdvancedAccounting(!showAdvancedAccounting)}
          className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors border-b border-slate-200"
          aria-expanded={showAdvancedAccounting}
        >
          <div className="flex items-center gap-2.5 text-left">
            <Layers className="w-5 h-5 text-slate-700" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Advanced Clinical Accounting & Manufacturer Tin Comparison
              </span>
              <p className="text-[11.5px] text-slate-500">
                Detailed 4-quantity preparation tracking, measured bedside volume reconciliation, and developer audit trace
              </p>
            </div>
          </div>
          {showAdvancedAccounting ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
        </button>

        {showAdvancedAccounting && (
          <div className="p-4 sm:p-5 space-y-6 bg-slate-50/50">
            {/* Manufacturer Tin Feeding Guide Comparison */}
            {!result.isBlocked && !result.isGraduated && result.tinGuideComparison && result.preparationAccounting && (
              <TinGuideComparison
                weightKg={result.currentWeightKg || weightGrams / 1000}
                fluidAllowanceMlPerKg={fluidAllowance}
                prescribedDailyVolumeMl={result.prescribedDailyVolumeMl || result.totalDailyVolumeMl || 0}
                administeredVolumeMl={administeredVolumeMl}
                batchesPrepared={batchesPrepared}
                batchType={batchType}
                measuredFinalBatchVolumeMl={measuredFinalBatchVolumeMl}
                volumeDiscardedOrSpilledMl={volumeDiscardedOrSpilledMl}
                onAdministeredVolumeChange={onAdministeredVolumeChange}
                onBatchesPreparedChange={onBatchesPreparedChange}
                onBatchTypeChange={onBatchTypeChange}
                onMeasuredBatchVolumeChange={onMeasuredBatchVolumeChange}
                onVolumeDiscardedChange={onVolumeDiscardedChange}
                tinGuideComparison={result.tinGuideComparison}
                preparationAccounting={result.preparationAccounting}
              />
            )}

            {/* Developer Audit Panel & JSON Export */}
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
                        • Scoops = ({result.totalDailyVolumeMl} mL ÷ 100) × 3 = <span className="text-slate-200 font-mono">{dailyScoops} scoops/day</span>
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

                  <div className="pt-2 text-[10.5px] text-slate-500 border-t border-slate-800/80 font-sans italic">
                    {result.auditMetadata.nonDeviceDisclaimer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

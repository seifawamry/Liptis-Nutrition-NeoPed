"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Printer, ShieldAlert, FileText, GraduationCap, AlertTriangle } from "lucide-react";
import {
  NutritionCalculationResult,
  ESPGHAN_DIRECT_GUIDELINES,
} from "@/lib/lbw-nutrition";
import { AgeCalculations, BiologicalSex, PercentileEvaluation } from "@/lib/growth-engine";

interface FeedSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationResult: NutritionCalculationResult;
  biologicalSex: BiologicalSex | null;
  gaWeeks: number;
  gaDays: number;
  dob: string;
  dom: string;
  ages: AgeCalculations;
  lengthCm: number;
  headCircumferenceCm: number;
  weightPercentile: PercentileEvaluation | null;
  lengthPercentile: PercentileEvaluation | null;
  hcPercentile: PercentileEvaluation | null;
}

export function FeedSheetModal({
  isOpen,
  onClose,
  calculationResult: nut,
  biologicalSex,
  gaWeeks,
  gaDays,
  dob,
  dom,
  ages,
  lengthCm,
  headCircumferenceCm,
  weightPercentile,
  lengthPercentile,
  hcPercentile,
}: FeedSheetModalProps) {
  const [nicuBed, setNicuBed] = useState("NICU Incubator #04 (Level III)");
  const [patientId, setPatientId] = useState("NEO-" + Math.floor(100000 + Math.random() * 900000));
  const [clinicianName, setClinicianName] = useState("Attending Neonatologist, MD / Clinical Dietitian");
  const [allowNutritionOnly, setAllowNutritionOnly] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const printBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    printBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.getElementById("generate-feed-sheet-btn")?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isGrowthBlocked = ages.isBlocked;
  const isPrintingBlocked = nut.isBlocked || (isGrowthBlocked && !allowNutritionOnly);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feed-sheet-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden when printed) */}
        <div className="no-print bg-clinical-navy-950 text-white px-6 py-3.5 flex items-center justify-between border-b border-clinical-navy-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-clinical-gold" aria-hidden="true" />
            <div>
              <h2 id="feed-sheet-title" className="text-sm font-bold text-white tracking-tight">
                Clinical Calculation Worksheet Preview
              </h2>
              <p className="text-[11px] text-amber-300 font-medium">
                Clinical calculation worksheet — requires independent clinician verification before use
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={printBtnRef}
              type="button"
              onClick={handlePrint}
              disabled={isPrintingBlocked}
              aria-label="Print Hospital Feed Sheet or Save as PDF"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 transition-all border border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Print Worksheet / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close feed sheet modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Printable Feed Sheet Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-5 print:space-y-4 text-slate-900 bg-white">
          {/* CRITICAL STOP: Nutrition Validation Blocked */}
          {nut.isBlocked ? (
            <div className="p-8 bg-rose-50 border-2 border-rose-400 rounded-xl text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="text-base font-bold text-rose-900">
                Worksheet Generation Blocked: Invalid Nutritional Inputs
              </h3>
              <p className="text-xs text-rose-800 max-w-md mx-auto">
                Patient weight or fluid allowance violates clinical safety boundaries. Correct invalid entries (e.g. weight &lt; 400g) in the primary module before printing enteral worksheets.
              </p>
            </div>
          ) : isGrowthBlocked && !allowNutritionOnly ? (
            /* PREFERRED BEHAVIOR: Block if Demographic/Growth Data is Invalid */
            <div className="p-8 bg-amber-50 border-2 border-amber-400 rounded-xl text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-950">
                  Worksheet generation is unavailable until the growth-demographic validation errors are corrected.
                </h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  The clinical sheet cannot be generated with invalid or malformed dates (e.g. measurement date preceding birth date, invalid calendar day, or future assessment date).
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-amber-200 text-left max-w-lg mx-auto text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Identified Validation Errors:</span>
                <ul className="list-disc list-inside text-amber-950 space-y-0.5">
                  {ages.validation.errors.map((err, i) => (
                    <li key={i}>{err.message}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  Return and Correct Demographics
                </button>
                <button
                  type="button"
                  onClick={() => setAllowNutritionOnly(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Generate Nutrition-Only Sheet (Growth Omitted)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Institutional Header with Logos */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-36 h-12">
                    <Image
                      src="/logos/liptis-nutrition.png"
                      alt="Liptis Nutrition Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="h-10 w-[1px] bg-slate-300" />
                  <div className="relative w-32 h-10">
                    <Image
                      src="/logos/pediamil-lbw.png"
                      alt="Pediamil LBW Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="text-right max-w-md">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-clinical-navy-950 uppercase leading-snug">
                    Clinical Calculation Worksheet
                  </h1>
                  <p className="text-[11px] font-bold text-rose-700 tracking-tight">
                    Requires independent clinician verification before use
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    ESPGHAN 2022 Enteral Reference Model
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Printed: {currentDateStr} • Ephemeral ID: {patientId}
                  </p>
                </div>
              </div>

              {/* Hospital & Patient Bed Metadata */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <label htmlFor="patient-id-input" className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Patient Identifier:
                  </label>
                  <input
                    id="patient-id-input"
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="font-mono font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label htmlFor="nicu-bed-input" className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Ward / Bed Station:
                  </label>
                  <input
                    id="nicu-bed-input"
                    type="text"
                    value={nicuBed}
                    onChange={(e) => setNicuBed(e.target.value)}
                    className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label htmlFor="clinician-name-input" className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Attending Clinician:
                  </label>
                  <input
                    id="clinician-name-input"
                    type="text"
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                    className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Section 1: Demographics & Age Assessment (Omitted or Clean in Nutrition-Only Mode) */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span>1. Gestational Milestones & Demographics</span>
                </h3>

                {allowNutritionOnly ? (
                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs">
                    <strong>Nutrition-Only Notice:</strong> Growth assessment was not performed due to demographic validation errors. Malformed dates or calculated ages have been completely omitted from this record.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Biological Sex:</span>
                      <strong className="text-slate-900 capitalize">
                        {biologicalSex ? (biologicalSex === "male" ? "Male (♂)" : "Female (♀)") : "Unspecified"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">GA at Birth:</span>
                      <strong className="text-slate-900 font-mono">
                        {gaWeeks}w + {gaDays}d
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Chronological Age:</span>
                      <strong className="text-slate-900 font-mono">
                        {ages.caFormatted}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Post-Menstrual Age:</span>
                      <strong className="text-blue-900 font-mono font-bold">
                        {ages.pmaFormatted}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Enteral Feed Prescription & Schedule */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
                <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span>2. Enteral Nutrition Prescription & Schedule</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  <div className="shrink-0 w-14 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1 shadow-2xs">
                    <Image
                      src={nut.imageSrc || "/pediamil-lbw.png"}
                      alt={`${nut.formulaProfile?.brand} Product Pack`}
                      width={56}
                      height={64}
                      className="max-h-full max-w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Weight:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {nut.currentWeightGrams} g ({nut.currentWeightKg?.toFixed(3)} kg)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Fluid Allowance:</span>
                      <strong className="text-blue-900 font-mono text-sm">
                        {nut.targetFluidMlPerKgPerDay} mL/kg/day
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Formulation Matrix:</span>
                      <strong className="text-slate-900 block font-mono">
                        {nut.formulaProfile?.brand}
                      </strong>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {nut.formulaProfile?.energyKcalPer100Ml} kcal / {nut.formulaProfile?.proteinGramsPer100Ml}g Prot / 100mL
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Total Daily Volume:</span>
                      <strong className="text-emerald-700 font-mono text-sm">
                        {nut.totalDailyVolumeMl} mL/day
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Feeding interval table */}
                {nut.feedingSchedule && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2 border-r border-slate-200">Administration Modality</th>
                          <th className="p-2 border-r border-slate-200">Frequency / Day</th>
                          <th className="p-2 border-r border-slate-200">Dose per Feed</th>
                          <th className="p-2">24-Hour Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium">
                            Bolus Enteral (q2h Interval)
                          </td>
                          <td className="p-2 border-r border-slate-200">12 feeds / 24h</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.feedingSchedule.q2hVolumePerFeedMl} mL / feed
                          </td>
                          <td className="p-2 text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 border-r border-slate-200 font-sans font-medium">
                            Bolus Enteral (q3h Interval)
                          </td>
                          <td className="p-2 border-r border-slate-200">8 feeds / 24h</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.feedingSchedule.q3hVolumePerFeedMl} mL / feed
                          </td>
                          <td className="p-2 text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium">
                            Continuous Enteral Infusion
                          </td>
                          <td className="p-2 border-r border-slate-200">Continuous infusion pump</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.feedingSchedule.continuousInfusionMlPerHour} mL / hour
                          </td>
                          <td className="p-2 text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-[10px] text-slate-400 mt-1 italic font-mono">
                      {nut.feedingSchedule.roundingDisclosure}
                    </p>
                  </div>
                )}

                {/* Preparation & Reconstitution Instructions */}
                {nut.formulaProfile?.productProfile && (
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
                    <span className="font-bold text-slate-900 block">Preparation & Reconstitution Protocol:</span>
                    <p className="text-slate-700">
                      {nut.formulaProfile.productProfile.reconstitution.preparationInstructions}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Standard Dilution: {nut.formulaProfile.productProfile.reconstitution.standardDilutionPercent}% w/v ({nut.formulaProfile.productProfile.reconstitution.powderMassGramsPer100Ml}g powder per 100 mL feed).
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: ESPGHAN 2022 Macronutrient Compliance Audit */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span>3. Delivered Macronutrients vs. ESPGHAN 2022 Guidelines</span>
                </h3>

                {nut.isGraduated ? (
                  <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300 text-blue-950 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-900">
                      <GraduationCap className="w-4 h-4 text-blue-600" aria-hidden="true" />
                      <span>Patient Achieved Term-Equivalent Weight (&gt; 3,500g)</span>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed bg-white/90 p-2.5 rounded border border-blue-200">
                      {nut.recommendationText}
                    </p>
                    {nut.standardTermTargets && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded border border-blue-200">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Standard Energy Target:</span>
                          <strong className="text-blue-950 font-mono">{nut.standardTermTargets.energyTarget}</strong>
                        </div>
                        <div className="p-2 bg-white rounded border border-blue-200">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Standard Protein Target:</span>
                          <strong className="text-blue-950 font-mono">{nut.standardTermTargets.proteinTarget}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Energy */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <span className="text-slate-500 text-[10.5px] uppercase font-semibold">
                        Delivered Energy
                      </span>
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {nut.deliveredEnergyKcalPerKgPerDay} kcal/kg/day
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        ESPGHAN: {ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}–{ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX} kcal/kg/d
                      </div>
                      <div className="pt-1 flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nut.energyCompliance?.badgeClass}`}>
                          {nut.energyCompliance?.badgeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Protein */}
                    {nut.proteinBracket && (
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <span className="text-slate-500 text-[10.5px] uppercase font-semibold">
                          Delivered Protein ({nut.proteinBracket.classification})
                        </span>
                        <div className="text-sm font-bold font-mono text-slate-900">
                          {nut.deliveredProteinGramsPerKgPerDay} g/kg/day
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          Target: {nut.proteinBracket.targetMinGramsPerKg}–{nut.proteinBracket.targetMaxGramsPerKg} g/kg/d
                        </div>
                        <div className="pt-1 flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nut.proteinCompliance?.badgeClass}`}>
                            {nut.proteinCompliance?.badgeLabel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* P:E Ratio */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <span className="text-slate-500 text-[10.5px] uppercase font-semibold">
                        Protein-to-Energy Ratio
                      </span>
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {nut.proteinToEnergyRatioGramsPer100Kcal} g/100 kcal
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        ESPGHAN: {ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MIN_G_PER_100_KCAL}–{ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MAX_G_PER_100_KCAL} g/100 kcal
                      </div>
                      <div className="pt-1 flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nut.peRatioCompliance?.badgeClass}`}>
                          {nut.peRatioCompliance?.badgeLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Delivered Micronutrient, Electrolyte & Fatty Acid Accretion */}
              {nut.deliveredNutrientPayload && (
                <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
                  <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span>4. Delivered Micronutrient, Electrolyte & Fatty Acid Accretion (24h Payload)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Daily Powder: {nut.deliveredNutrientPayload.dailyPowderGrams}g (~{nut.deliveredNutrientPayload.dailyScoops} scp in {nut.deliveredNutrientPayload.waterVolumeMlPerDay} mL water)
                    </span>
                  </h3>

                  {/* Comprehensive Nutritional Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2 border-r border-slate-200">Nutrient</th>
                          <th className="p-2 border-r border-slate-200">Delivered (24h Total)</th>
                          <th className="p-2 border-r border-slate-200">Normalized (/kg/day)</th>
                          <th className="p-2 border-r border-slate-200">Molar Units (Atomic Weight)</th>
                          <th className="p-2">ESPGHAN 2022 Reference Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Sodium (Na⁺)
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.deliveredNutrientPayload.sodiumMgPerDay} mg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {nut.deliveredNutrientPayload.sodiumMgPerKgPerDay} mg/kg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-blue-900 font-bold">
                            {nut.deliveredNutrientPayload.sodiumMmolPerDay} mmol/d ({nut.deliveredNutrientPayload.sodiumMmolPerKgPerDay} mmol/kg/d)
                            <span className="text-[9.5px] text-slate-400 block font-normal font-sans">Na = 22.99 g/mol</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            3.0–5.0 mmol/kg/day (69–115 mg/kg/d)
                          </td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Potassium (K⁺)
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.deliveredNutrientPayload.potassiumMgPerDay} mg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {nut.deliveredNutrientPayload.potassiumMgPerKgPerDay} mg/kg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-blue-900 font-bold">
                            {nut.deliveredNutrientPayload.potassiumMmolPerDay} mmol/d ({nut.deliveredNutrientPayload.potassiumMmolPerKgPerDay} mmol/kg/d)
                            <span className="text-[9.5px] text-slate-400 block font-normal font-sans">K = 39.10 g/mol</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            2.0–3.0 mmol/kg/day (78–117 mg/kg/d)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Chloride (Cl⁻)
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.deliveredNutrientPayload.chlorideMgPerDay} mg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {nut.deliveredNutrientPayload.chlorideMgPerKgPerDay} mg/kg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-blue-900 font-bold">
                            {nut.deliveredNutrientPayload.chlorideMmolPerDay} mmol/d ({nut.deliveredNutrientPayload.chlorideMmolPerKgPerDay} mmol/kg/d)
                            <span className="text-[9.5px] text-slate-400 block font-normal font-sans">Cl = 35.45 g/mol</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            2.0–3.0 mmol/kg/day (71–106 mg/kg/d)
                          </td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Calcium (Ca²⁺)
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.deliveredNutrientPayload.calciumMgPerDay} mg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {nut.deliveredNutrientPayload.calciumMgPerKgPerDay} mg/kg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-blue-900 font-bold">
                            {nut.deliveredNutrientPayload.calciumMmolPerDay} mmol/d ({nut.deliveredNutrientPayload.calciumMmolPerKgPerDay} mmol/kg/d)
                            <span className="text-[9.5px] text-slate-400 block font-normal font-sans">Ca = 40.08 g/mol</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            120–140 mg/kg/day (3.0–3.5 mmol/kg/d)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Phosphorus (P)
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {nut.deliveredNutrientPayload.phosphorusMgPerDay} mg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {nut.deliveredNutrientPayload.phosphorusMgPerKgPerDay} mg/kg/day
                          </td>
                          <td className="p-2 border-r border-slate-200 text-blue-900 font-bold">
                            {nut.deliveredNutrientPayload.phosphorusMmolPerDay} mmol/d ({nut.deliveredNutrientPayload.phosphorusMmolPerKgPerDay} mmol/kg/d)
                            <span className="text-[9.5px] text-slate-400 block font-normal font-sans">P = 30.97 g/mol • Ca:P ~{nut.deliveredNutrientPayload.calciumPhosphorusRatio} (wt)</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            65–90 mg/kg/day (2.1–2.9 mmol/kg/d)
                          </td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            DHA & ARA
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            DHA {nut.deliveredNutrientPayload.dhaMgPerDay} mg/d • ARA {nut.deliveredNutrientPayload.araMgPerDay} mg/d
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            DHA {nut.deliveredNutrientPayload.dhaMgPerKgPerDay} • ARA {nut.deliveredNutrientPayload.araMgPerKgPerDay} mg/kg/d
                          </td>
                          <td className="p-2 border-r border-slate-200 text-purple-900 font-bold">
                            ARA:DHA Ratio: {nut.deliveredNutrientPayload.araDhaRatioFormatted}
                            <span className="text-[9.5px] text-slate-500 block font-normal font-sans">Balanced structural LCPUFA</span>
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            DHA 30–65 mg/kg/d • ARA 30–100 mg/kg/d (ARA:DHA 0.5–2:1)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                            Vitamin D3 & Iron
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            Vit D {nut.deliveredNutrientPayload.vitaminD3IuPerDay} IU/d • Fe {nut.deliveredNutrientPayload.ironMgPerDay} mg/d
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            Vit D {nut.deliveredNutrientPayload.vitaminD3IuPerKgPerDay} IU/kg/d • Fe {nut.deliveredNutrientPayload.ironMgPerKgPerDay} mg/kg/d
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-700">
                            Bioactive Whey / HMO: {nut.deliveredNutrientPayload.twoFlHmoGramsPerDay ? `${nut.deliveredNutrientPayload.twoFlHmoGramsPerDay}g HMO/d` : "Formula Matrix"}
                          </td>
                          <td className="p-2 font-sans text-slate-600">
                            Vit D 400–1000 IU/d • Fe 2–3 mg/kg/d
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Section 5: Anthropometric Growth Interpretation */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <span>5. Anthropometric Growth Trajectory Assessment</span>
                </h3>
                {allowNutritionOnly ? (
                  <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs">
                    <strong>Growth Assessment Omitted:</strong> Growth trajectory was not evaluated due to incomplete or uncorrected demographics. This document is a nutrition calculation worksheet only.
                  </div>
                ) : weightPercentile ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Weight for Age:</span>
                        <div className="font-bold text-slate-900 font-mono">
                          {weightPercentile.percentileFormatted} ({weightPercentile.zScoreFormatted})
                        </div>
                        <p className="text-[10.5px] text-slate-600 leading-tight">{weightPercentile.clinicalNote}</p>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Length for Age:</span>
                        <div className="font-bold text-slate-900 font-mono">
                          {lengthPercentile ? `${lengthPercentile.percentileFormatted} (${lengthPercentile.zScoreFormatted})` : "Not recorded"}
                        </div>
                        <p className="text-[10.5px] text-slate-600 leading-tight">
                          {lengthPercentile ? lengthPercentile.clinicalNote : "Optional measurement not entered."}
                        </p>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Head Circumference:</span>
                        <div className="font-bold text-slate-900 font-mono">
                          {hcPercentile ? `${hcPercentile.percentileFormatted} (${hcPercentile.zScoreFormatted})` : "Not recorded"}
                        </div>
                        <p className="text-[10.5px] text-slate-600 leading-tight">
                          {hcPercentile ? hcPercentile.clinicalNote : "Optional measurement not entered."}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Methodology: Linear interpolation between tabulated LMS parameters. Screening assessment only; not an automatic treatment recommendation.
                    </p>
                  </>
                ) : (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-xs">
                    Growth parameters were not recorded for this calculation session.
                  </div>
                )}
              </div>

              {/* Institutional Sign-Off Block */}
              <div className="border-t-2 border-slate-900 pt-4 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-4">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                    Attending Neonatologist / Pediatrician Verification & Order Transcribing:
                  </span>
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>Signature & Medical License Stamp</span>
                    <span>Date / Time</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                    NICU Nurse / Clinical Dietitian Verification:
                  </span>
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>Staff Signature & Hospital Badge ID</span>
                    <span>Date / Time</span>
                  </div>
                </div>
              </div>

              {/* Regulatory & Institutional Audit Footnote */}
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 space-y-1 font-mono">
                <p>
                  <strong>Clinical Notice:</strong> {nut.auditMetadata.nonDeviceDisclaimer}
                </p>
                <p>
                  <strong>Product Notice:</strong> {nut.productDisclaimer}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

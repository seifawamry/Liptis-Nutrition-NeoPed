"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Printer, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Sparkles, GraduationCap } from "lucide-react";
import { NutritionCalculationResult } from "@/lib/lbw-nutrition";
import { AgeCalculations, BiologicalSex, GrowthMetric, PercentileEvaluation } from "@/lib/growth-engine";

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
                Institutional Clinical Feed Sheet Preview
              </h2>
              <p className="text-[11px] text-slate-300">
                Print-ready hospital document formatted for medical records & bedside administration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={printBtnRef}
              type="button"
              onClick={handlePrint}
              aria-label="Print Hospital Feed Sheet or Save as PDF"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 transition-all border border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Print Hospital Sheet / Save PDF</span>
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

            <div className="text-right">
              <h1 className="text-base font-extrabold tracking-tight text-clinical-navy-950 uppercase">
                Neonatal Enteral Feed Sheet
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                ESPGHAN 2022 Preterm Nutrition Protocol
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Printed: {currentDateStr} • Ephemeral ID: {patientId}
              </p>
            </div>
          </div>

          {/* Hospital & Patient Bed Metadata (Editable for simulation) */}
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
                className="font-mono font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full focus-visible:ring-1 focus-visible:ring-clinical-navy-800"
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
                className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full focus-visible:ring-1 focus-visible:ring-clinical-navy-800"
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
                className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-full focus-visible:ring-1 focus-visible:ring-clinical-navy-800"
              />
            </div>
          </div>

          {/* Section 1: Demographics & Age Assessment */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>1. Gestational Milestones & Age Correction</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Sex:</span>
                <strong className="text-slate-900 capitalize">
                  {biologicalSex ? (biologicalSex === "male" ? "Male (♂)" : "Female (♀)") : "Unspecified"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">GA at Birth:</span>
                <strong className="text-slate-900">
                  {gaWeeks} weeks + {gaDays} days
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Chronological Age (CA):</span>
                <strong className="text-slate-900 font-mono">
                  {ages.caFormatted}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Post-Menstrual Age (PMA):</span>
                <strong className="text-blue-900 font-mono font-bold">
                  {ages.pmaFormatted}
                </strong>
              </div>
            </div>
            <div className="text-[11.5px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>
                <strong>Corrected Chronological Age (CCA):</strong> {ages.ccaFormatted}
              </span>
              <span className="font-mono text-slate-500">
                DOB: {dob} | Measurement: {dom}
              </span>
            </div>
          </div>

          {/* Section 2: Enteral Feed Prescription & Feeding Schedule */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
            <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>2. Enteral Nutrition Prescription & Schedule</span>
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="shrink-0 w-14 h-16 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1 shadow-2xs">
                <img
                  src={nut.imageSrc}
                  alt={`${nut.formulaProfile.brand} Product Pack`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
                <div>
                  <span className="text-slate-500 text-[11px] block">Weight:</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {nut.currentWeightGrams} g ({nut.currentWeightKg.toFixed(3)} kg)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Fluid Allowance:</span>
                  <strong className="text-blue-900 font-mono text-sm">
                    {nut.targetFluidMlPerKgPerDay} mL/kg/day
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Prescribed Matrix:</span>
                  <strong className="text-slate-900 block">
                    {nut.formulaProfile.brand}
                  </strong>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {nut.formulaProfile.energyKcalPer100Ml} kcal / {nut.formulaProfile.proteinGramsPer100Ml}g Prot / 100mL
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
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-medium">
                      Bolus Enteral (q2h Interval)
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">12 feeds / 24h</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {nut.feedingSchedule.q2hVolumePerFeedMl} mL / feed
                    </td>
                    <td className="p-2 font-mono text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="p-2 border-r border-slate-200 font-medium">
                      Bolus Enteral (q3h Interval)
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">8 feeds / 24h</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {nut.feedingSchedule.q3hVolumePerFeedMl} mL / feed
                    </td>
                    <td className="p-2 font-mono text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 font-medium">
                      Continuous Enteral Infusion
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">Continuous syringe pump</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {nut.feedingSchedule.continuousInfusionMlPerHour} mL / hour
                    </td>
                    <td className="p-2 font-mono text-slate-700">{nut.totalDailyVolumeMl} mL</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                    ESPGHAN Target: 110–135 kcal/kg/d
                  </div>
                  <div className="pt-1 flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nut.energyCompliance.badgeClass}`}
                    >
                      {nut.energyCompliance.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* Protein */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10.5px] uppercase font-semibold">
                    Delivered Protein ({nut.proteinBracket.classification})
                  </span>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {nut.deliveredProteinGramsPerKgPerDay} g/kg/day
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Bracket Target: {nut.proteinBracket.targetMinGramsPerKg}–{nut.proteinBracket.targetMaxGramsPerKg} g/kg/d
                  </div>
                  <div className="pt-1 flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${nut.proteinCompliance.badgeClass}`}
                    >
                      {nut.proteinCompliance.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* P:E Ratio */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10.5px] uppercase font-semibold">
                    Protein-to-Energy Ratio
                  </span>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {nut.proteinToEnergyRatioGramsPer100Kcal} g / 100 kcal
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Target: 2.5–3.6 g / 100 kcal
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-purple-100 text-purple-900 border-purple-300">
                      Balanced Quality
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-600 italic bg-blue-50/60 p-2 rounded border border-blue-100 font-mono">
              Clinical Statement: {nut.clinicalSummary}
            </p>
          </div>

          {/* Section 4: Somatic Growth & Anthropometric Percentile Assessment */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-clinical-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span>4. Somatic Growth Trajectory (Fenton 2013 / WHO 2006 Standards)</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-slate-500 text-[11px] block">Current Weight:</span>
                <strong className="text-slate-900 font-mono">{nut.currentWeightGrams} g</strong>
                <div className="text-[11px] text-slate-600 mt-1">
                  Percentile:{" "}
                  <span className="font-bold text-slate-900">
                    {weightPercentile?.shortBadge || "Evaluated"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-slate-500 text-[11px] block">Crown-Heel Length:</span>
                <strong className="text-slate-900 font-mono">{lengthCm} cm</strong>
                <div className="text-[11px] text-slate-600 mt-1">
                  Percentile:{" "}
                  <span className="font-bold text-slate-900">
                    {lengthPercentile?.shortBadge || "Evaluated"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-slate-500 text-[11px] block">Head Circumference (OFC):</span>
                <strong className="text-slate-900 font-mono">{headCircumferenceCm} cm</strong>
                <div className="text-[11px] text-slate-600 mt-1">
                  Percentile:{" "}
                  <span className="font-bold text-slate-900">
                    {hcPercentile?.shortBadge || "Evaluated"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Clinician Signature Block & Clinical Disclaimers */}
          <div className="pt-2 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-xs text-slate-600">
            <div className="space-y-1 text-[11px] text-slate-500 max-w-md">
              <p>
                <strong>Mandatory Regulatory Notice:</strong> This clinical feed
                sheet is generated for hospital staff reference. Supported by Liptis
                Nutrition. Formulated against ESPGHAN 2022 guidelines and Fenton/WHO
                standards. Verify patient tolerance, electrolyte balance, and
                clinical indications prior to feed administration.
              </p>
            </div>

            <div className="space-y-4 text-right w-full sm:w-auto">
              <div className="h-10 border-b border-slate-400 w-56 ml-auto" />
              <div className="text-[11px]">
                <strong className="text-slate-900 block">Attending Neonatologist / Dietitian Signature</strong>
                <span className="text-slate-400">Date & Stamp: ______________________</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

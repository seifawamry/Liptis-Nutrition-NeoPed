"use client";

import React, { useState } from "react";
import {
  TinGuideComparisonResult,
  PreparationAdministrationRecord,
  PEDIAMIL_LBW_TIN_GUIDE_ROWS,
  TIN_GUIDE_METADATA,
  PREPARATION_SPEC,
} from "@/lib/tin-guide";
import {
  ShieldAlert,
  Info,
  Scale,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList,
  FlaskConical,
  HelpCircle,
} from "lucide-react";

interface TinGuideComparisonProps {
  weightKg: number;
  prescribedDailyVolumeMl: number;
  fluidAllowanceMlPerKg: number;
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
  tinGuideComparison: TinGuideComparisonResult;
  preparationAccounting: PreparationAdministrationRecord;
}

export function TinGuideComparison({
  weightKg,
  prescribedDailyVolumeMl,
  fluidAllowanceMlPerKg,
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
  tinGuideComparison: comp,
  preparationAccounting: prep,
}: TinGuideComparisonProps) {
  const [showFullTinTable, setShowFullTinTable] = useState(false);
  const [showPrepTracking, setShowPrepTracking] = useState(true);

  const selectedSpec = batchType === "full" ? PREPARATION_SPEC.fullBatch : PREPARATION_SPEC.halfBatch;

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Clinical Governance Notice */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300 rounded-2xl shadow-sm text-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-sky-950 uppercase tracking-wide">
                Clinician Prescription Supremacy & Manufacturer Reference Principle
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-200 text-sky-900 border border-sky-300">
                Prescription Active: {prescribedDailyVolumeMl} mL/day
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {TIN_GUIDE_METADATA.mandatoryClinicalDisclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Separation of the 4 Distinct Quantities */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Separation of Clinical & Manufacturer Quantities
            </h3>
            <p className="text-xs text-slate-500">
              Zero ambiguity: Prescribed, tin reference, prepared batch, and administered volumes are tracked independently.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            Patient Weight: {weightKg.toFixed(3)} kg ({Math.round(weightKg * 1000)}g)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Quantity 1: Clinician Prescribed Daily Volume */}
          <div className="p-3.5 bg-blue-50/70 border-2 border-blue-300 rounded-xl relative flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                1. Clinician Prescribed
              </span>
              <div className="text-2xl font-black text-blue-950">
                {prescribedDailyVolumeMl}{" "}
                <span className="text-sm font-semibold text-blue-700">mL/day</span>
              </div>
              <div className="text-[11px] text-blue-800 font-medium">
                {fluidAllowanceMlPerKg} mL/kg/day target
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200/80 text-[10px] text-blue-900 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
              Authoritative Medical Order
            </div>
          </div>

          {/* Quantity 2: Manufacturer Tin-Guide Daily Reference */}
          <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-xl relative flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                2. Tin-Guide Reference
              </span>
              <div className="text-2xl font-black text-amber-950">
                {comp.applicableRow ? comp.applicableRow.dailyVolumeLabel : "N/A"}
              </div>
              <div className="text-[11px] text-amber-800 font-medium">
                {comp.applicableRow ? `Weight band: ${comp.applicableRow.weightBandLabel}` : "Out of 1.0–4.0 kg scope"}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/80 text-[10px] text-amber-900 font-semibold flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-600 shrink-0" />
              Reference Comparison Only
            </div>
          </div>

          {/* Quantity 3: Prepared Batch Volume */}
          <div className="p-3.5 bg-purple-50/70 border-2 border-purple-300 rounded-xl relative flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                3. Prepared Batch Volume
              </span>
              <div className="text-2xl font-black text-purple-950">
                {prep.totalPreparedVolumeAvailableMl}{" "}
                <span className="text-sm font-semibold text-purple-700">mL feed</span>
              </div>
              <div className="text-[11px] text-purple-800 font-medium">
                {prep.batchesPrepared} batch{prep.batchesPrepared > 1 ? "es" : ""} ({selectedSpec.name})
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-purple-200/80 text-[10px] text-purple-900 font-semibold flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-purple-600 shrink-0" />
              {prep.hasMeasuredBatchVolume ? "Measured batch volume" : `Approx. ${selectedSpec.finalFeedVolumeMl} mL/batch`}
            </div>
          </div>

          {/* Quantity 4: Actually Administered Volume */}
          <div className={`p-3.5 border-2 rounded-xl relative flex flex-col justify-between ${
            prep.isVolumeAdministeredDocumented
              ? "bg-emerald-50/70 border-emerald-400"
              : "bg-slate-50 border-slate-300"
          }`}>
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                prep.isVolumeAdministeredDocumented ? "text-emerald-800" : "text-slate-600"
              }`}>
                4. Actually Administered
              </span>
              <div className={`text-2xl font-black ${
                prep.isVolumeAdministeredDocumented ? "text-emerald-950" : "text-slate-700"
              }`}>
                {prep.isVolumeAdministeredDocumented ? administeredVolumeMl : "Not entered"}
                {prep.isVolumeAdministeredDocumented && (
                  <span className="text-sm font-semibold text-emerald-700"> mL/day</span>
                )}
              </div>
              <div className={`text-[11px] font-medium ${
                prep.isVolumeAdministeredDocumented ? "text-emerald-800" : "text-slate-500"
              }`}>
                {prep.isVolumeAdministeredDocumented
                  ? `Delivered basis: ${administeredVolumeMl} mL`
                  : `Defaulting to prescribed ${prescribedDailyVolumeMl} mL`}
              </div>
            </div>
            <div className={`mt-2 pt-2 border-t text-[10px] font-semibold flex items-center gap-1 ${
              prep.isVolumeAdministeredDocumented
                ? "border-emerald-200 text-emerald-900"
                : "border-slate-200 text-slate-600"
            }`}>
              <ClipboardList className={`w-3 h-3 shrink-0 ${
                prep.isVolumeAdministeredDocumented ? "text-emerald-600" : "text-slate-500"
              }`} />
              {prep.isVolumeAdministeredDocumented ? "Measured bedside record" : "Expected theoretical"}
            </div>
          </div>
        </div>

        {/* 3. Tin Guide Comparison Status Banner */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          comp.comparisonStatus === "within_reference_range"
            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
            : comp.comparisonStatus === "individualized_medical_instruction"
            ? "bg-sky-50 border-sky-300 text-sky-950"
            : comp.comparisonStatus === "tin_range_unavailable"
            ? "bg-slate-50 border-slate-300 text-slate-800"
            : "bg-amber-50 border-amber-300 text-amber-950"
        }`}>
          <div className="flex items-start gap-2.5">
            {comp.comparisonStatus === "within_reference_range" || comp.comparisonStatus === "individualized_medical_instruction" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Comparison Status: {comp.statusLabel}</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {comp.reviewMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFullTinTable(!showFullTinTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm shrink-0"
          >
            <span>{showFullTinTable ? "Hide Tin Table" : "View Tin Reference Table"}</span>
            {showFullTinTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. Interactive Tin Guide Reference Table (Collapsible) */}
      {showFullTinTable && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Pediamil® LBW Manufacturer Tin Feeding Guide (Reference Table)
              </h3>
              <p className="text-xs text-slate-500">
                Transcribed from manufacturer packaging photograph. Provided for clinical reference only.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Provisional Verification Status
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Infant Weight</th>
                  <th className="py-2.5 px-3">Manufacturer Total Amount/Day</th>
                  <th className="py-2.5 px-3">Water Examples</th>
                  <th className="py-2.5 px-3">Scoops</th>
                  <th className="py-2.5 px-3">Feeds / Day</th>
                  <th className="py-2.5 px-3">Calculated Quantity</th>
                  <th className="py-2.5 px-3">Transcription Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PEDIAMIL_LBW_TIN_GUIDE_ROWS.map((row, idx) => {
                  const isCurrentRow =
                    weightKg >= row.minWeightKg &&
                    (row.maxWeightKg === 4.0 ? weightKg <= 4.0 : weightKg < row.maxWeightKg);
                  return (
                    <tr
                      key={idx}
                      className={
                        isCurrentRow
                          ? "bg-blue-50/80 font-semibold text-blue-950 border-l-4 border-l-blue-600"
                          : "hover:bg-slate-50/80 text-slate-700"
                      }
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {isCurrentRow && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" aria-label="Current patient bracket" />
                          )}
                          <span>{row.weightBandLabel}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{row.dailyVolumeLabel}</td>
                      <td className="py-2.5 px-3">{row.waterExamples}</td>
                      <td className="py-2.5 px-3 font-mono">{row.scoops !== null ? `${row.scoops} scoops` : "—"}</td>
                      <td className="py-2.5 px-3 font-mono">{row.feedsPerDay !== null ? `${row.feedsPerDay} feeds` : "—"}</td>
                      <td className="py-2.5 px-3 font-mono">{row.calculatedQuantityLabel}</td>
                      <td className="py-2.5 px-3">
                        {row.verificationStatus === "provisional_requires_confirmation" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            Provisional
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Transcribed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800">Source Metadata & Clinical Caveats:</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Source:</strong> {TIN_GUIDE_METADATA.source}</li>
              <li><strong>Product:</strong> {TIN_GUIDE_METADATA.product}</li>
              <li><strong>Verification Status:</strong> {TIN_GUIDE_METADATA.transcriptionStatus}</li>
              <li><strong>Row 4 (3.0–3.5 kg):</strong> Transcription requires confirmation from the original tin or manufacturer document.</li>
              <li>{TIN_GUIDE_METADATA.legalNotice}</li>
            </ul>
          </div>
        </div>
      )}

      {/* 5. Actual Preparation and Administered-Volume Tracking Module */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Preparation and Administered-Volume Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Track batches prepared, measured volumes, and actual bedside administration for exact nutrient accountability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              prep.isVolumeAdministeredDocumented
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}>
              {prep.isVolumeAdministeredDocumented ? "Active: Administered Volume Used" : "Active: Prescribed Volume Used"}
            </span>
          </div>
        </div>

        {/* Batch Reconstitution Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Batch Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Manufacturer Batch Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onBatchTypeChange?.("full")}
                className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                  batchType === "full"
                    ? "bg-purple-600 text-white border-purple-700 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                <div>Full Batch</div>
                <div className="text-[10px] font-normal opacity-90">6 scoops / ~198 mL</div>
              </button>
              <button
                type="button"
                onClick={() => onBatchTypeChange?.("half")}
                className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                  batchType === "half"
                    ? "bg-purple-600 text-white border-purple-700 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                <div>Half Batch</div>
                <div className="text-[10px] font-normal opacity-90">3 scoops / ~99 mL</div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {batchType === "full"
                ? "6 scoops (~30g) + 180 mL water yields ~198 mL prepared feed."
                : "3 scoops (~15g) + 90 mL water yields ~99 mL prepared feed (not exactly 100 mL)."}
            </p>
          </div>

          {/* Batches Prepared */}
          <div className="space-y-1.5">
            <label htmlFor="input-batches-prepared" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Batches Prepared (24h)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-batches-prepared"
                type="number"
                min={1}
                max={10}
                step={1}
                value={batchesPrepared}
                onChange={(e) => onBatchesPreparedChange?.(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-600"
              />
              <span className="text-xs text-slate-500 font-semibold shrink-0">
                = {prep.totalPreparedVolumeAvailableMl} mL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Total prepared feed available for this 24-hour cycle.
            </p>
          </div>

          {/* Measured Batch Volume (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="input-measured-batch-vol" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Measured Batch Volume (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-measured-batch-vol"
                type="number"
                min={50}
                max={500}
                step={1}
                placeholder={`~${selectedSpec.finalFeedVolumeMl} mL`}
                value={measuredFinalBatchVolumeMl ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                  onMeasuredBatchVolumeChange?.(val);
                }}
                className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-600"
              />
              <span className="text-xs text-slate-500 font-semibold shrink-0">mL / batch</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Enter if graduated cylinder measurement differs from standard.
            </p>
          </div>
        </div>

        {/* Warning if measured volume materially deviates */}
        {prep.measuredVolumeWarning && (
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Reconstitution Volume Warning: </span>
              {prep.measuredVolumeWarning}
            </div>
          </div>
        )}

        {/* Administration & Waste Tracking */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Administered Volume Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-administered-volume" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Actually Administered Volume (24h)
              </label>
              {administeredVolumeMl !== undefined && (
                <button
                  type="button"
                  onClick={() => onAdministeredVolumeChange?.(undefined)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Reset to Prescribed ({prescribedDailyVolumeMl} mL)
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="input-administered-volume"
                type="number"
                min={0}
                max={1000}
                step={0.5}
                placeholder={`${prescribedDailyVolumeMl} mL (Prescribed)`}
                value={administeredVolumeMl ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                  onAdministeredVolumeChange?.(val);
                }}
                className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className="text-xs text-slate-500 font-semibold shrink-0">mL / 24h</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              If entered, delivered nutrient payload is recalculated directly from this volume.
            </p>
          </div>

          {/* Volume Discarded or Spilled */}
          <div className="space-y-1.5">
            <label htmlFor="input-discarded-volume" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Volume Discarded or Spilled (mL)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-discarded-volume"
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={volumeDiscardedOrSpilledMl}
                onChange={(e) => onVolumeDiscardedChange?.(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500"
              />
              <span className="text-xs text-slate-500 font-semibold shrink-0">
                Remaining: {prep.remainingOrDiscardedVolumeMl} mL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Prepared volume ({prep.totalPreparedVolumeAvailableMl} mL) - Administered - Discarded = {prep.remainingOrDiscardedVolumeMl} mL.
            </p>
          </div>
        </div>

        {/* Clinical Safety Reminders on Powder Density & Official Label */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Volumetric Density Review: </span>
              {TIN_GUIDE_METADATA.powderDensityNotice}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Hospital Preparation Policy: </span>
              {TIN_GUIDE_METADATA.preparationStandardNotice}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

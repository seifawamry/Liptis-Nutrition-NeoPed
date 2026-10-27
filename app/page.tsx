"use client";

import React, { useState, useMemo, useCallback } from "react";
import { HcpGateModal } from "@/components/clinical/hcp-gate-modal";
import { ClinicalHeader } from "@/components/clinical/clinical-header";
import { NutritionEngine } from "@/components/clinical/nutrition-engine";
import { GrowthPlotter } from "@/components/clinical/growth-plotter";
import { FeedSheetModal } from "@/components/clinical/feed-sheet-modal";
import { ExecutiveOverviewModal } from "@/components/clinical/executive-overview-modal";
import { calculateLbwNutrition } from "@/lib/lbw-nutrition";
import {
  BiologicalSex,
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
} from "@/lib/growth-engine";
import {
  ShieldCheck,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Award,
} from "lucide-react";
import { APP_VERSION, APP_VERSION_LABEL, CLINICAL_GOVERNANCE } from "@/lib/version";

export default function Home() {
  // HCP Gate state
  const [isHcpVerified, setIsHcpVerified] = useState(false);

  // Tab navigation: "growth" | "nutrition" | "split"
  const [activeTab, setActiveTab] = useState<"growth" | "nutrition" | "split">("growth");
  const [isFeedSheetOpen, setIsFeedSheetOpen] = useState(false);
  const [isExecutiveOverviewOpen, setIsExecutiveOverviewOpen] = useState(false);
  const [isExecutiveBannerExpanded, setIsExecutiveBannerExpanded] = useState(false);
  const [feedSheetValidationErrors, setFeedSheetValidationErrors] = useState<string[]>([]);

  // Default dates: DOB 14 days ago, DOM today
  const defaultDates = useMemo(() => {
    const today = new Date();
    const dobDate = new Date(today);
    dobDate.setDate(dobDate.getDate() - 14);

    const formatYmd = (d: Date) => d.toISOString().split("T")[0];
    return {
      dob: formatYmd(dobDate),
      dom: formatYmd(today),
    };
  }, []);

  // Clinical Case Baseline Defaults: Male infant born at 28w + 2d GA, current weight 1,350g, fluid 150 mL/kg/day
  const [weightGrams, setWeightGrams] = useState<number>(1350);
  const [fluidAllowance, setFluidAllowance] = useState<number>(150);
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | null>("male");
  const [gaWeeks, setGaWeeks] = useState<number>(28);
  const [gaDays, setGaDays] = useState<number>(2);
  const [dob, setDob] = useState<string>(defaultDates.dob);
  const [dom, setDom] = useState<string>(defaultDates.dom);
  const [lengthCm, setLengthCm] = useState<number>(39.5);
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<number>(27.2);

  // 4-Quantity Tracking & Preparation Parameters
  const [prescribedDailyVolumeMl, setPrescribedDailyVolumeMl] = useState<number | undefined>(undefined);
  const [administeredVolumeMl, setAdministeredVolumeMl] = useState<number | undefined>(undefined);
  const [batchesPrepared, setBatchesPrepared] = useState<number>(1);
  const [batchType, setBatchType] = useState<"full" | "half">("full");
  const [measuredFinalBatchVolumeMl, setMeasuredFinalBatchVolumeMl] = useState<number | undefined>(undefined);
  const [volumeDiscardedOrSpilledMl, setVolumeDiscardedOrSpilledMl] = useState<number>(0);

  // Patient reset callback
  const handleResetPatient = useCallback(() => {
    setWeightGrams(1350);
    setFluidAllowance(150);
    setBiologicalSex("male");
    setGaWeeks(28);
    setGaDays(2);
    setDob(defaultDates.dob);
    setDom(defaultDates.dom);
    setLengthCm(39.5);
    setHeadCircumferenceCm(27.2);
    setPrescribedDailyVolumeMl(undefined);
    setAdministeredVolumeMl(undefined);
    setBatchesPrepared(1);
    setBatchType("full");
    setMeasuredFinalBatchVolumeMl(undefined);
    setVolumeDiscardedOrSpilledMl(0);
  }, [defaultDates]);

  // Derived ages with strict validation
  const ages = useMemo(() => {
    return calculateAges(gaWeeks, gaDays, dob, dom);
  }, [gaWeeks, gaDays, dob, dom]);

  // Deterministic nutrition calculation with strict validation & age-specific targets
  const calculationResult = useMemo(() => {
    const pmaWeeks = ages && !ages.isBlocked ? ages.pmaWeeksDecimal : undefined;
    return calculateLbwNutrition(weightGrams, fluidAllowance, undefined, pmaWeeks, {
      prescribedDailyVolumeMl,
      administeredVolumeMl,
      batchesPrepared,
      batchType,
      measuredFinalBatchVolumeMl,
      volumeDiscardedOrSpilledMl,
    });
  }, [
    weightGrams,
    fluidAllowance,
    ages,
    prescribedDailyVolumeMl,
    administeredVolumeMl,
    batchesPrepared,
    batchType,
    measuredFinalBatchVolumeMl,
    volumeDiscardedOrSpilledMl,
  ]);

  // Derived dataset & percentiles
  const growthDataset = useMemo(() => {
    if (!biologicalSex) return null;
    return getGrowthDataset(biologicalSex, ages);
  }, [biologicalSex, ages]);

  const weightPercentile = useMemo(() => {
    if (!growthDataset) return null;
    return evaluatePercentile(weightGrams, "weight", growthDataset);
  }, [weightGrams, growthDataset]);

  const lengthPercentile = useMemo(() => {
    if (!growthDataset) return null;
    return evaluatePercentile(lengthCm, "length", growthDataset);
  }, [lengthCm, growthDataset]);

  const hcPercentile = useMemo(() => {
    if (!growthDataset) return null;
    return evaluatePercentile(headCircumferenceCm, "headCircumference", growthDataset);
  }, [headCircumferenceCm, growthDataset]);

  // Handle feed sheet opening with strict validation
  const handleOpenFeedSheet = useCallback(() => {
    const errors: string[] = [];
    if (calculationResult.isBlocked) {
      if (calculationResult.validation?.errors?.length) {
        errors.push(...calculationResult.validation.errors.map((e) => e.message));
      } else {
        errors.push("Nutrition calculations are blocked due to invalid patient weight or fluid parameters.");
      }
    }
    if (ages.isBlocked) {
      if (ages.validation?.errors?.length) {
        errors.push(...ages.validation.errors.map((e) => e.message));
      } else {
        errors.push("Growth age assessment is blocked due to invalid date or gestational age inputs.");
      }
    }

    if (errors.length > 0) {
      setFeedSheetValidationErrors(errors);
      setIsFeedSheetOpen(false);
      setTimeout(() => {
        document.getElementById("feed-sheet-validation-error-summary")?.focus();
      }, 50);
      return;
    }

    setFeedSheetValidationErrors([]);
    setIsFeedSheetOpen(true);
  }, [calculationResult, ages]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Skip to Main Clinical Content Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-link">
        Skip to clinical calculation content
      </a>

      {/* HCP Gate Modal */}
      {!isHcpVerified && (
        <HcpGateModal onVerified={() => setIsHcpVerified(true)} />
      )}

      {/* Persistent Institutional Header */}
      <ClinicalHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFeedSheet={handleOpenFeedSheet}
        onOpenExecutiveOverview={() => setIsExecutiveOverviewOpen(true)}
      />

      {/* Feed Sheet Accessible Error Summary Banner */}
      {feedSheetValidationErrors.length > 0 && (
        <div
          id="feed-sheet-validation-error-summary"
          role="alert"
          tabIndex={-1}
          aria-live="assertive"
          className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 focus:outline-none"
        >
          <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl shadow-md text-rose-950 flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                <span>Cannot Generate Clinical Feed Sheet — Validation Errors Identified</span>
              </div>
              <p className="text-xs text-rose-800">
                Please correct the following clinical parameters before generating the hospital feed sheet:
              </p>
              <ul className="list-disc list-inside text-xs font-semibold space-y-1 text-rose-900">
                {feedSheetValidationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setFeedSheetValidationErrors([])}
              className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-100 rounded-lg text-xs"
              aria-label="Dismiss error summary"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main Suite Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 space-y-3.5 sm:space-y-6 focus:outline-none">
        {/* Executive Description & Management Review Banner */}
        <section
          aria-label="Executive Briefing & Data Evidence Overview"
          className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-3.5 sm:p-5 shadow-md border border-blue-800/40 space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Sparkles className="w-5 h-5 text-clinical-gold" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    Executive Description & System Verification
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                    Zero Clinical Error
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Liptis Nutrition NeoPed™ LBW Clinical Platform
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsExecutiveOverviewOpen(true)}
                className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 border border-blue-400/30"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Evidence Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExecutiveBannerExpanded(!isExecutiveBannerExpanded)}
                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all border border-white/10 flex items-center gap-1 shrink-0"
                aria-expanded={isExecutiveBannerExpanded}
              >
                <span>{isExecutiveBannerExpanded ? "Less" : "Summary"}</span>
                {isExecutiveBannerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>NeoPed™</strong> is Liptis Nutrition’s dedicated clinical decision support platform for Low Birth Weight (LBW) and Very Low Birth Weight (VLBW) infants in neonatal intensive care. Engineered to eliminate prescribing errors and ensure mathematical precision, it unifies international enteral feeding standards, manufacturer tin guides, and longitudinal growth tracking with 100% client-side data privacy.
          </p>

          {isExecutiveBannerExpanded && (
            <div className="pt-3 border-t border-blue-900/60 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-blue-200 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>4-Quantity Separation</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Strictly segregates Doctor’s Prescribed Volume, Manufacturer Tin Guide Reference, Prepared Batch Volume, and Actually Administered Bedside Volume.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-blue-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Reconstitution Precision</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Calibrated preparation: 6 scoops + 180 mL water yields ~198 mL full batch (3 scoops / 90 mL yields ~99 mL half batch). Tracks powder usage and discarded waste.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-blue-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Client-Side Privacy</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    100% deterministic pure mathematical computation. Zero network transmission of Protected Health Information (PHI) — HIPAA / GDPR compliant by design.
                  </p>
                </div>
              </div>

              {/* Direct Clickable Evidence Links */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Links to Authoritative Data & Guidelines:
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/36511826/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 transition-colors"
                  >
                    <span>ESPGHAN 2022 Guidelines (PubMed: 36511826)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://bmcpediatr.biomedcentral.com/articles/10.1186/1471-2431-13-59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-colors"
                  >
                    <span>Fenton 2013 Preterm Growth Curves (BMC Pediatrics)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.who.int/tools/child-growth-standards/standards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-700/60 transition-colors"
                  >
                    <span>WHO 2006 Child Growth Standards (WHO.int)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://peditools.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 transition-colors"
                  >
                    <span>PediTools Clinical Calculator References</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://ciaaw.org/atomic-weights.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <span>IUPAC Atomic Weights (Ca: 40.078, P: 30.973762)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* View Routing with Tabpanel Semantics */}
        {activeTab === "growth" && (
          <section
            role="tabpanel"
            id="panel-growth"
            aria-labelledby="tab-growth"
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            <GrowthPlotter
              biologicalSex={biologicalSex}
              onSexChange={setBiologicalSex}
              gaWeeks={gaWeeks}
              onGaWeeksChange={setGaWeeks}
              gaDays={gaDays}
              onGaDaysChange={setGaDays}
              dob={dob}
              onDobChange={setDob}
              dom={dom}
              onDomChange={setDom}
              weightGrams={weightGrams}
              onWeightChange={setWeightGrams}
              lengthCm={lengthCm}
              onLengthChange={setLengthCm}
              headCircumferenceCm={headCircumferenceCm}
              onHcChange={setHeadCircumferenceCm}
              calculationResult={calculationResult}
              fluidAllowance={fluidAllowance}
            />
          </section>
        )}

        {activeTab === "nutrition" && (
          <section
            role="tabpanel"
            id="panel-nutrition"
            aria-labelledby="tab-nutrition"
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            <NutritionEngine
              weightGrams={weightGrams}
              onWeightChange={setWeightGrams}
              fluidAllowance={fluidAllowance}
              onFluidChange={setFluidAllowance}
              calculationResult={calculationResult}
              onResetPatient={handleResetPatient}
              ages={ages}
              prescribedDailyVolumeMl={prescribedDailyVolumeMl}
              onPrescribedDailyVolumeChange={setPrescribedDailyVolumeMl}
              administeredVolumeMl={administeredVolumeMl}
              onAdministeredVolumeChange={setAdministeredVolumeMl}
              batchesPrepared={batchesPrepared}
              onBatchesPreparedChange={setBatchesPrepared}
              batchType={batchType}
              onBatchTypeChange={setBatchType}
              measuredFinalBatchVolumeMl={measuredFinalBatchVolumeMl}
              onMeasuredBatchVolumeChange={setMeasuredFinalBatchVolumeMl}
              volumeDiscardedOrSpilledMl={volumeDiscardedOrSpilledMl}
              onVolumeDiscardedChange={setVolumeDiscardedOrSpilledMl}
            />
          </section>
        )}

        {activeTab === "split" && (
          <section
            role="tabpanel"
            id="panel-split"
            aria-labelledby="tab-split"
            tabIndex={0}
            className="grid grid-cols-1 xl:grid-cols-2 gap-8 focus-visible:outline-none"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Module 1: Fenton / WHO Growth Trajectory Plotter
                </h2>
              </div>
              <GrowthPlotter
                biologicalSex={biologicalSex}
                onSexChange={setBiologicalSex}
                gaWeeks={gaWeeks}
                onGaWeeksChange={setGaWeeks}
                gaDays={gaDays}
                onGaDaysChange={setGaDays}
                dob={dob}
                onDobChange={setDob}
                dom={dom}
                onDomChange={setDom}
                weightGrams={weightGrams}
                onWeightChange={setWeightGrams}
                lengthCm={lengthCm}
                onLengthChange={setLengthCm}
                headCircumferenceCm={headCircumferenceCm}
                onHcChange={setHeadCircumferenceCm}
                calculationResult={calculationResult}
                fluidAllowance={fluidAllowance}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Module 2: Enteral Nutrition & Macro Engine
                </h2>
              </div>
              <NutritionEngine
                weightGrams={weightGrams}
                onWeightChange={setWeightGrams}
                fluidAllowance={fluidAllowance}
                onFluidChange={setFluidAllowance}
                calculationResult={calculationResult}
                onResetPatient={handleResetPatient}
                ages={ages}
                prescribedDailyVolumeMl={prescribedDailyVolumeMl}
                onPrescribedDailyVolumeChange={setPrescribedDailyVolumeMl}
                administeredVolumeMl={administeredVolumeMl}
                onAdministeredVolumeChange={setAdministeredVolumeMl}
                batchesPrepared={batchesPrepared}
                onBatchesPreparedChange={setBatchesPrepared}
                batchType={batchType}
                onBatchTypeChange={setBatchType}
                measuredFinalBatchVolumeMl={measuredFinalBatchVolumeMl}
                onMeasuredBatchVolumeChange={setMeasuredFinalBatchVolumeMl}
                volumeDiscardedOrSpilledMl={volumeDiscardedOrSpilledMl}
                onVolumeDiscardedChange={setVolumeDiscardedOrSpilledMl}
              />
            </div>
          </section>
        )}
      </main>

      {/* Executive Overview & Clinical Governance Modal */}
      <ExecutiveOverviewModal
        isOpen={isExecutiveOverviewOpen}
        onClose={() => setIsExecutiveOverviewOpen(false)}
      />

      {/* Institutional Printable Feed Sheet Modal */}
      <FeedSheetModal
        isOpen={isFeedSheetOpen}
        onClose={() => setIsFeedSheetOpen(false)}
        calculationResult={calculationResult}
        biologicalSex={biologicalSex}
        gaWeeks={gaWeeks}
        gaDays={gaDays}
        dob={dob}
        dom={dom}
        ages={ages}
        lengthCm={lengthCm}
        headCircumferenceCm={headCircumferenceCm}
        weightPercentile={weightPercentile}
        lengthPercentile={lengthPercentile}
        hcPercentile={hcPercentile}
      />

      {/* Persistent Institutional Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Liptis Nutrition NeoPed™ LBW Clinical Suite</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  {APP_VERSION_LABEL}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Uses selected ESPGHAN 2022 reference recommendations; local clinical validation required.
                Fenton 2013 and WHO 2006 linear interpolation between tabulated LMS parameters.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {CLINICAL_GOVERNANCE.privacyNotice}
              </span>
              <span>•</span>
              <span className="font-mono">100% Client-Side Pure Math</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[10.5px] text-slate-400 leading-relaxed">
            <p>
              <strong>Clinical Decision Support Notice:</strong> This software is a deterministic mathematical reference
              tool intended exclusively for licensed healthcare professionals. It does not constitute a medical order,
              prescription, or automated diagnosis. Clinical judgment, fluid balance, diuresis, and metabolic monitoring
              supersede all calculated values.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

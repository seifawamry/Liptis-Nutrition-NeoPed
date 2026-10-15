"use client";

import React, { useState, useMemo, useCallback } from "react";
import { HcpGateModal } from "@/components/clinical/hcp-gate-modal";
import { ClinicalHeader } from "@/components/clinical/clinical-header";
import { NutritionEngine } from "@/components/clinical/nutrition-engine";
import { GrowthPlotter } from "@/components/clinical/growth-plotter";
import { FeedSheetModal } from "@/components/clinical/feed-sheet-modal";
import { calculateLbwNutrition } from "@/lib/lbw-nutrition";
import {
  BiologicalSex,
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
} from "@/lib/growth-engine";
import { ShieldCheck, Sparkles, BookOpen, AlertTriangle, ShieldAlert, X } from "lucide-react";
import { APP_VERSION, APP_VERSION_LABEL, CLINICAL_GOVERNANCE } from "@/lib/version";

export default function Home() {
  // HCP Gate state
  const [isHcpVerified, setIsHcpVerified] = useState(false);

  // Tab navigation: "growth" | "nutrition" | "split"
  const [activeTab, setActiveTab] = useState<"growth" | "nutrition" | "split">("growth");
  const [isFeedSheetOpen, setIsFeedSheetOpen] = useState(false);
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
  }, [defaultDates]);

  // Derived ages with strict validation
  const ages = useMemo(() => {
    return calculateAges(gaWeeks, gaDays, dob, dom);
  }, [gaWeeks, gaDays, dob, dom]);

  // Deterministic nutrition calculation with strict validation & age-specific targets
  const calculationResult = useMemo(() => {
    const pmaWeeks = ages && !ages.isBlocked ? ages.pmaWeeksDecimal : undefined;
    return calculateLbwNutrition(weightGrams, fluidAllowance, undefined, pmaWeeks);
  }, [weightGrams, fluidAllowance, ages]);

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
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 focus:outline-none">
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
              />
            </div>
          </section>
        )}
      </main>

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

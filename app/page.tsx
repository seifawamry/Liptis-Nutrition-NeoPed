"use client";

import React, { useState, useMemo } from "react";
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
import { ShieldCheck, Info, Sparkles, BookOpen } from "lucide-react";

export default function Home() {
  // HCP Gate state
  const [isHcpVerified, setIsHcpVerified] = useState(false);

  // Tab navigation: "nutrition" | "growth" | "split"
  const [activeTab, setActiveTab] = useState<"nutrition" | "growth" | "split">("nutrition");
  const [isFeedSheetOpen, setIsFeedSheetOpen] = useState(false);

  // Clinical Case Defaults: Male infant born at 28w + 2d GA, current weight 1,350g, fluid 150 mL/kg/day
  const [weightGrams, setWeightGrams] = useState<number>(1350);
  const [fluidAllowance, setFluidAllowance] = useState<number>(150);

  // Growth & Age Parameters
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | null>("male");
  const [gaWeeks, setGaWeeks] = useState<number>(28);
  const [gaDays, setGaDays] = useState<number>(2);

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

  const [dob, setDob] = useState<string>(defaultDates.dob);
  const [dom, setDom] = useState<string>(defaultDates.dom);

  // Additional anthropometrics for growth plotting
  const [lengthCm, setLengthCm] = useState<number>(39.5);
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<number>(27.2);

  // Deterministic nutrition calculation
  const calculationResult = useMemo(() => {
    return calculateLbwNutrition(weightGrams, fluidAllowance);
  }, [weightGrams, fluidAllowance]);

  // Derived ages
  const ages = useMemo(() => {
    return calculateAges(gaWeeks, gaDays, dob, dom);
  }, [gaWeeks, gaDays, dob, dom]);

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
        onOpenFeedSheet={() => setIsFeedSheetOpen(true)}
      />

      {/* Main Suite Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 focus:outline-none">
        {/* View Routing with Tabpanel Semantics */}
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
            />
          </section>
        )}

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
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Module 1: Enteral Nutrition & Macro Engine
                </h2>
              </div>
              <NutritionEngine
                weightGrams={weightGrams}
                onWeightChange={setWeightGrams}
                fluidAllowance={fluidAllowance}
                onFluidChange={setFluidAllowance}
                calculationResult={calculationResult}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Module 2: Fenton / WHO Growth Trajectory Plotter
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
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  v1.0.0 Institutional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Formulated against ESPGHAN 2022 Preterm Enteral Recommendations and
                Fenton 2013 / WHO 2006 Growth Standards.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                GDPR / HIPAA / GCC MOHAP Compliant
              </span>
              <span>•</span>
              <span className="font-mono">100% Client-Side Computation</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[10.5px] text-slate-400 leading-relaxed">
            <p>
              <strong>Clinical Disclaimer:</strong> This application is a decision
              support calculation matrix provided for licensed healthcare
              professionals. Calculations are deterministic and executed strictly
              within the local browser context. No patient information or clinical
              metrics are logged, cached externally, or transmitted across any
              network. Clinical judgement and individualized physiological monitoring
              supersede standardized mathematical recommendations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

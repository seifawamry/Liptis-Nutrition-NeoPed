"use client";

import React, { useState, useMemo } from "react";
import {
  BiologicalSex,
  GrowthMetric,
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
  evaluateLongitudinalRecords,
  LongitudinalRecord,
  AgeCalculations,
  TECHNICAL_METHODOLOGY,
  CLINICAL_INTERPRETATION_FACTORS,
} from "@/lib/growth-engine";
import { ClinicalCard } from "./ui-primitives";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceDot,
  CartesianGrid,
} from "recharts";
import {
  Baby,
  Calendar,
  Ruler,
  TrendingUp,
  Lock,
  Sparkles,
  ShieldAlert,
  Plus,
  Trash2,
  Activity,
  History,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NutritionCalculationResult } from "@/lib/lbw-nutrition";

interface GrowthPlotterProps {
  biologicalSex: BiologicalSex | null;
  onSexChange: (sex: BiologicalSex) => void;
  gaWeeks: number;
  onGaWeeksChange: (weeks: number) => void;
  gaDays: number;
  onGaDaysChange: (days: number) => void;
  dob: string;
  onDobChange: (dob: string) => void;
  dom: string;
  onDomChange: (dom: string) => void;
  weightGrams: number;
  onWeightChange: (val: number) => void;
  lengthCm: number;
  onLengthChange: (val: number) => void;
  headCircumferenceCm: number;
  onHcChange: (val: number) => void;
  calculationResult?: NutritionCalculationResult | null;
  fluidAllowance?: number;
}

export function GrowthPlotter({
  biologicalSex,
  onSexChange,
  gaWeeks,
  onGaWeeksChange,
  gaDays,
  onGaDaysChange,
  dob,
  onDobChange,
  dom,
  onDomChange,
  weightGrams,
  onWeightChange,
  lengthCm,
  onLengthChange,
  headCircumferenceCm,
  onHcChange,
  calculationResult,
  fluidAllowance,
}: GrowthPlotterProps) {
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>("weight");
  const [showDataTable, setShowDataTable] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<"chart" | "longitudinal">("chart");

  // Serial longitudinal measurements state (pre-seeded with 3 clinical visits)
  const [serialRecords, setSerialRecords] = useState<
    Array<{ date: string; weightGrams: number; lengthCm?: number; headCircumferenceCm?: number }>
  >(() => {
    const d1 = new Date(dob);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 7);
    const d3 = new Date(dom);

    const fmt = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return [
      { date: fmt(d1), weightGrams: 1180, lengthCm: 38.0, headCircumferenceCm: 26.5 },
      { date: fmt(d2), weightGrams: 1250, lengthCm: 38.8, headCircumferenceCm: 26.8 },
      { date: fmt(d3), weightGrams: 1350, lengthCm: 39.5, headCircumferenceCm: 27.2 },
    ];
  });

  const [newEntryDate, setNewEntryDate] = useState("");
  const [newEntryWeight, setNewEntryWeight] = useState("");
  const [newEntryLength, setNewEntryLength] = useState("");
  const [newEntryHc, setNewEntryHc] = useState("");
  const [serialError, setSerialError] = useState<string | null>(null);

  // Calculate ages with strict calendar validation
  const ages: AgeCalculations = useMemo(() => {
    return calculateAges(gaWeeks, gaDays, dob, dom);
  }, [gaWeeks, gaDays, dob, dom]);

  // Active dataset based on sex and routing rule (PMA <= 50 -> Fenton; PMA > 50 -> WHO)
  const dataset = useMemo(() => {
    if (!biologicalSex) return null;
    return getGrowthDataset(biologicalSex, ages);
  }, [biologicalSex, ages]);

  // Active measurement value
  const currentMetricValue =
    activeMetric === "weight"
      ? weightGrams
      : activeMetric === "length"
      ? lengthCm
      : headCircumferenceCm;

  // Evaluate percentile and exact continuous Z-score
  const percentileEval = useMemo(() => {
    if (!dataset || ages.isBlocked) return null;
    return evaluatePercentile(currentMetricValue, activeMetric, dataset);
  }, [dataset, currentMetricValue, activeMetric, ages.isBlocked]);

  // Longitudinal records evaluation
  const evaluatedSerialRecords = useMemo(() => {
    if (!biologicalSex || ages.isBlocked) return [];
    return evaluateLongitudinalRecords(serialRecords, gaWeeks, gaDays, dob, biologicalSex);
  }, [serialRecords, gaWeeks, gaDays, dob, biologicalSex, ages.isBlocked]);

  const handleAddSerialRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setSerialError(null);

    if (!newEntryDate || !newEntryWeight) {
      setSerialError("Date and weight are required.");
      return;
    }
    const wt = Number(newEntryWeight);
    if (isNaN(wt) || wt < 400 || wt > 10000) {
      setSerialError("Weight must be between 400g and 10,000g.");
      return;
    }

    setSerialRecords((prev) => [
      ...prev,
      {
        date: newEntryDate,
        weightGrams: wt,
        lengthCm: newEntryLength ? Number(newEntryLength) : undefined,
        headCircumferenceCm: newEntryHc ? Number(newEntryHc) : undefined,
      },
    ]);

    setNewEntryDate("");
    setNewEntryWeight("");
    setNewEntryLength("");
    setNewEntryHc("");
  };

  const handleRemoveSerialRecord = (index: number) => {
    setSerialRecords((prev) => prev.filter((_, i) => i !== index));
  };

  // Metric configurations
  const metricConfig = useMemo(() => {
    switch (activeMetric) {
      case "weight":
        return {
          label: "Weight",
          unit: "g",
          yMin: dataset?.chartType === "who" ? 1500 : 300,
          yMax: dataset?.chartType === "who" ? 16000 : 5500,
          step: 500,
        };
      case "length":
        return {
          label: "Crown-Heel Length",
          unit: "cm",
          yMin: dataset?.chartType === "who" ? 40 : 20,
          yMax: dataset?.chartType === "who" ? 95 : 60,
          step: 5,
        };
      case "headCircumference":
        return {
          label: "Head Circumference",
          unit: "cm",
          yMin: dataset?.chartType === "who" ? 30 : 15,
          yMax: dataset?.chartType === "who" ? 52 : 42,
          step: 5,
        };
    }
  }, [activeMetric, dataset?.chartType]);

  // Chart data points - with unit scaling (WHO weight stored in kg scaled to g for visual alignment with patient dot)
  const chartData = useMemo(() => {
    if (!dataset || ages.isBlocked) return [];
    const scaleFactor = activeMetric === "weight" && dataset.weightUnit === "kg" ? 1000 : 1;
    return dataset.data.map((pt) => {
      const metricLms = pt[activeMetric];
      return {
        age: pt.age,
        p3: Math.round(metricLms.p3 * scaleFactor * 10) / 10,
        p10: Math.round(metricLms.p10 * scaleFactor * 10) / 10,
        p50: Math.round(metricLms.p50 * scaleFactor * 10) / 10,
        p90: Math.round(metricLms.p90 * scaleFactor * 10) / 10,
        p97: Math.round(metricLms.p97 * scaleFactor * 10) / 10,
      };
    });
  }, [dataset, activeMetric, ages.isBlocked]);

  // Dynamic Y domain to auto-fit curves and patient dot
  const yDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return [metricConfig.yMin, metricConfig.yMax];
    const vals: number[] = [];
    chartData.forEach((d) => {
      vals.push(d.p3, d.p97);
    });
    if (typeof currentMetricValue === "number" && !isNaN(currentMetricValue) && currentMetricValue > 0) {
      vals.push(currentMetricValue);
    }
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    if (activeMetric === "weight") {
      const min = Math.max(0, Math.floor((minVal * 0.95) / 200) * 200);
      const max = Math.ceil((maxVal * 1.05) / 500) * 500;
      return [min, max];
    } else {
      const min = Math.max(0, Math.floor((minVal * 0.95) / 2) * 2);
      const max = Math.ceil((maxVal * 1.05) / 2) * 2;
      return [min, max];
    }
  }, [chartData, currentMetricValue, activeMetric, metricConfig]);

  return (
    <div className="space-y-6">
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {percentileEval
          ? `${metricConfig.label} is ${currentMetricValue} ${metricConfig.unit}. Evaluated at ${ages.pmaFormatted}: ${percentileEval.percentileFormatted} (${percentileEval.zScoreFormatted}).`
          : "Growth data updated."}
      </div>

      {/* Sex Selection Gate Notice if not yet selected */}
      {!biologicalSex && (
        <div
          role="alert"
          className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-5 text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-amber-950">
            Biological Sex Selection Mandatory
          </h3>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">
            Fenton 2013 and WHO 2006 growth standards exhibit sexual dimorphism.
            Select biological sex below to activate linear LMS age correction and percentile curves.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onSexChange("male")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Baby className="w-4 h-4" aria-hidden="true" />
              Male Infant (Boys Reference)
            </button>
            <button
              type="button"
              onClick={() => onSexChange("female")}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Baby className="w-4 h-4" aria-hidden="true" />
              Female Infant (Girls Reference)
            </button>
          </div>
        </div>
      )}

      {/* VALIDATION BLOCK ALERT */}
      {ages.isBlocked && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5 font-bold text-rose-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Growth Age & Trajectory Calculation Blocked</span>
          </div>
          <p className="text-xs text-rose-800">
            Anthropometric percentiles and curves cannot be computed because of invalid date or demographic parameters:
          </p>
          <ul className="text-xs space-y-1 list-disc list-inside text-rose-900 font-medium">
            {ages.validation.errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* OUT OF RANGE CHART ALERT */}
      {dataset?.isAgeOutOfRange && !ages.isBlocked && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Age Boundary Notice: </strong>
            <span>{dataset.ageOutOfRangeWarning}</span>
          </div>
        </div>
      )}

      {/* Patient Delivered Macronutrient Growth Fuel Snapshot */}
      {calculationResult && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-300 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Patient Delivered Macronutrient Growth Fuel ({calculationResult.formulaProfile?.brand ?? "Pediamil® LBW"})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 font-mono">
                24h Volume: <strong className="text-slate-950 font-black">{calculationResult.deliveredNutrientPayload?.totalDailyVolumeMl ?? Math.round((weightGrams / 1000) * (fluidAllowance ?? 150))} mL/d</strong> ({fluidAllowance ?? 150} mL/kg/d)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Energy */}
            <div className="p-3.5 bg-amber-50/80 border-2 border-amber-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-amber-950 block text-[11px] font-black uppercase tracking-wider">
                  Total Energy
                </span>
                <div className="mt-1">
                  <strong className="text-slate-950 font-mono text-base sm:text-lg font-black block">
                    {calculationResult.deliveredEnergyKcalPerKgPerDay}
                  </strong>
                  <span className="text-xs font-bold text-slate-700 font-sans">
                    kcal / kg / day
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-amber-200/90 text-xs font-bold text-amber-950">
                Goal: 110–135 kcal/kg/d
              </div>
            </div>

            {/* 2. Protein */}
            <div className="p-3.5 bg-blue-50/80 border-2 border-blue-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-blue-950 block text-[11px] font-black uppercase tracking-wider">
                  True Protein
                </span>
                <div className="mt-1">
                  <strong className="text-slate-950 font-mono text-base sm:text-lg font-black block">
                    {calculationResult.deliveredProteinGramsPerKgPerDay}
                  </strong>
                  <span className="text-xs font-bold text-slate-700 font-sans">
                    g / kg / day (60:40)
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-blue-200/90 text-xs font-bold text-blue-950">
                Target: {calculationResult.proteinBracket?.targetMinGramsPerKg ?? 3.5}–{calculationResult.proteinBracket?.targetMaxGramsPerKg ?? 4.0} g/kg/d
              </div>
            </div>

            {/* 3. Carbohydrates */}
            <div className="p-3.5 bg-purple-50/80 border-2 border-purple-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-purple-950 block text-[11px] font-black uppercase tracking-wider">
                  Carbohydrates
                </span>
                <div className="mt-1">
                  <strong className="text-slate-950 font-mono text-base sm:text-lg font-black block">
                    {calculationResult.deliveredNutrientPayload?.carbsGramsPerKgPerDay ?? "—"}
                  </strong>
                  <span className="text-xs font-bold text-slate-700 font-sans">
                    g / kg / day ({calculationResult.deliveredNutrientPayload?.carbsGramsPerDay ?? "—"} g/d)
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-purple-200/90 text-xs font-bold text-purple-950">
                ESPGHAN: 11.0–15.0 g/kg/d (100% Lactose)
              </div>
            </div>

            {/* 4. Total Lipids */}
            <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-emerald-950 block text-[11px] font-black uppercase tracking-wider">
                  Total Lipids
                </span>
                <div className="mt-1">
                  <strong className="text-slate-950 font-mono text-base sm:text-lg font-black block">
                    {calculationResult.deliveredNutrientPayload?.fatGramsPerKgPerDay ?? "—"}
                  </strong>
                  <span className="text-xs font-bold text-slate-700 font-sans">
                    g / kg / day ({calculationResult.deliveredNutrientPayload?.fatGramsPerDay ?? "—"} g/d)
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-emerald-200/90 text-xs font-bold text-emerald-950">
                ESPGHAN: 4.8–8.1 g/kg/d (MCT/DHA/ARA)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs (Left) and Growth Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Baseline Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Baseline Demographics Card */}
          <ClinicalCard
            title="Baseline Clinical Demographics"
            subtitle="Biological sex, gestational age, and measurement timeline"
            icon={<Baby className="w-4 h-4 text-clinical-navy-800" aria-hidden="true" />}
          >
            <div className="space-y-4">
              {/* Biological Sex Radiogroup */}
              <div>
                <label id="sex-label" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Biological Sex <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <div
                  role="radiogroup"
                  aria-labelledby="sex-label"
                  className="grid grid-cols-2 gap-2"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={biologicalSex === "male"}
                    onClick={() => onSexChange("male")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      biologicalSex === "male"
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span>♂ Male</span>
                    {biologicalSex === "male" && (
                      <span className="text-[10px] bg-white/20 px-1 rounded">Active</span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={biologicalSex === "female"}
                    onClick={() => onSexChange("female")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      biologicalSex === "female"
                        ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span>♀ Female</span>
                    {biologicalSex === "female" && (
                      <span className="text-[10px] bg-white/20 px-1 rounded">Active</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Gestational Age at Birth */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="ga-weeks-input"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    GA Weeks (22–36)
                  </label>
                  <input
                    id="ga-weeks-input"
                    type="number"
                    min={22}
                    max={36}
                    value={gaWeeks}
                    onChange={(e) => onGaWeeksChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ga-days-input"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    GA Days (0–6)
                  </label>
                  <input
                    id="ga-days-input"
                    type="number"
                    min={0}
                    max={6}
                    value={gaDays}
                    onChange={(e) => onGaDaysChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-clinical-navy-600"
                  />
                </div>
              </div>

              {/* Clinical Dates: DOB & DOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="dob-input"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    Date of Birth (DOB)
                  </label>
                  <input
                    id="dob-input"
                    type="date"
                    value={dob}
                    onChange={(e) => onDobChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dom-input"
                    className="text-xs font-semibold text-slate-700 block mb-1"
                  >
                    Date of Measurement
                  </label>
                  <input
                    id="dom-input"
                    type="date"
                    value={dom}
                    onChange={(e) => onDomChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Calculated Ages Output & Routing Details */}
              {!ages.isBlocked && (
                <div className="p-3 bg-slate-100/80 rounded-xl space-y-2 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Post-Menstrual Age:</span>
                    <strong className="text-clinical-navy-950 font-mono text-sm">{ages.pmaFormatted}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Chronological Age:</span>
                    <strong className="text-slate-900 font-mono">{ages.caFormatted}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Corrected Age:</span>
                    <strong className="text-blue-900 font-mono">{ages.ccaFormatted}</strong>
                  </div>

                  {dataset && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Selected Standard:</span>
                        <span className="text-blue-900">{dataset.standardName}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        {dataset.routingRationale}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ClinicalCard>

          {/* Current Measurements Entry Card */}
          <ClinicalCard
            title="Anthropometric Measurements"
            subtitle="Parameters plotted on active growth curve"
            icon={<Ruler className="w-4 h-4 text-clinical-navy-800" />}
          >
            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="metric-weight-input"
                  className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1"
                >
                  <span>Weight (grams)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {(weightGrams / 1000).toFixed(3)} kg
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="metric-weight-input"
                    type="number"
                    min={400}
                    max={10000}
                    step={10}
                    value={weightGrams}
                    onChange={(e) => onWeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                    g
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="metric-length-input"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Crown-Heel Length (cm)
                </label>
                <div className="relative">
                  <input
                    id="metric-length-input"
                    type="number"
                    min={20}
                    max={70}
                    step={0.5}
                    value={lengthCm}
                    onChange={(e) => onLengthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="metric-hc-input"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Head Circumference (OFC) (cm)
                </label>
                <div className="relative">
                  <input
                    id="metric-hc-input"
                    type="number"
                    min={15}
                    max={45}
                    step={0.5}
                    value={headCircumferenceCm}
                    onChange={(e) => onHcChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>
            </div>
          </ClinicalCard>
        </div>

        {/* Right Column: Visualization & Longitudinal Tracking (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <ClinicalCard
            title={
              dataset
                ? `${dataset.standardName} — ${dataset.sex === "male" ? "Boys" : "Girls"}`
                : "Growth Trajectory Visualization"
            }
            subtitle={
              dataset
                ? `Plotted at ${dataset.patientPlotAge} ${dataset.xAxisUnit} • Linear LMS math`
                : "Select biological sex to render growth curves"
            }
            icon={<TrendingUp className="w-4 h-4 text-clinical-navy-800" />}
            action={
              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Curve vs Longitudinal */}
                <div
                  role="tablist"
                  aria-label="View Mode Selector"
                  className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeViewMode === "chart"}
                    onClick={() => setActiveViewMode("chart")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      activeViewMode === "chart"
                        ? "bg-white text-clinical-navy-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Curve</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeViewMode === "longitudinal"}
                    onClick={() => setActiveViewMode("longitudinal")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      activeViewMode === "longitudinal"
                        ? "bg-white text-clinical-navy-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Longitudinal Tracking</span>
                  </button>
                </div>

                {activeViewMode === "chart" && (
                  <button
                    type="button"
                    onClick={() => setShowDataTable(!showDataTable)}
                    aria-expanded={showDataTable}
                    className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                  >
                    {showDataTable ? "Show Chart" : "Table"}
                  </button>
                )}

                {activeViewMode === "chart" && (
                  <div
                    role="tablist"
                    aria-label="Growth Metric Selector"
                    className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold"
                  >
                    {(["weight", "length", "headCircumference"] as GrowthMetric[]).map(
                      (metric) => (
                        <button
                          key={metric}
                          role="tab"
                          aria-selected={activeMetric === metric}
                          type="button"
                          onClick={() => setActiveMetric(metric)}
                          className={`px-2 py-1 rounded-md transition-all ${
                            activeMetric === metric
                              ? "bg-white text-clinical-navy-950 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {metric === "weight" ? "Weight" : metric === "length" ? "Length" : "HC"}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            }
          >
            {dataset && !ages.isBlocked ? (
              activeViewMode === "chart" ? (
                <div className="space-y-4">
                  {showDataTable ? (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-label="Percentile Data Table"
                      className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg text-xs"
                    >
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                          <tr>
                            <th scope="col" className="p-2 border-r">Age ({dataset.xAxisUnit})</th>
                            <th scope="col" className="p-2 border-r text-rose-700">3rd %ile</th>
                            <th scope="col" className="p-2 border-r text-amber-700">10th %ile</th>
                            <th scope="col" className="p-2 border-r font-bold text-slate-900">50th (Median)</th>
                            <th scope="col" className="p-2 border-r text-amber-700">90th %ile</th>
                            <th scope="col" className="p-2 text-rose-700">97th %ile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {chartData.map((row) => (
                            <tr key={row.age} className="hover:bg-slate-50">
                              <td className="p-2 border-r">{row.age}</td>
                              <td className="p-2 border-r text-rose-700">{row.p3}</td>
                              <td className="p-2 border-r text-amber-700">{row.p10}</td>
                              <td className="p-2 border-r text-slate-900 font-bold">{row.p50}</td>
                              <td className="p-2 border-r text-amber-700">{row.p90}</td>
                              <td className="p-2 text-rose-700">{row.p97}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Graphical Curve */
                    <div className="h-80 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          key={`chart-${dataset.datasetKey}-${activeMetric}-${dataset.patientPlotAge}`}
                          data={chartData}
                          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="age"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            stroke="#64748b"
                            tick={{ fontSize: 11 }}
                            label={{
                              value: dataset.xAxisLabel,
                              position: "insideBottom",
                              offset: -12,
                              fontSize: 11,
                              fill: "#475569",
                            }}
                          />
                          <YAxis
                            stroke="#64748b"
                            domain={yDomain}
                            tick={{ fontSize: 11 }}
                            label={{
                              value: `${metricConfig.label} (${metricConfig.unit})`,
                              angle: -90,
                              position: "insideLeft",
                              offset: 5,
                              fontSize: 11,
                              fill: "#475569",
                            }}
                          />
                          <Tooltip
                            formatter={(val: number, name: string) => [
                              `${val} ${metricConfig.unit}`,
                              name,
                            ]}
                            labelFormatter={(label) =>
                              `${dataset.xAxisLabel}: ${label} • Reference: ${dataset.sex === "male" ? "Boys Cohort" : "Girls Cohort"}`
                            }
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                          {/* Percentile Curves */}
                          <Line
                            type="monotone"
                            dataKey="p97"
                            name="97th %ile"
                            stroke="#dc2626"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="p90"
                            name="90th %ile"
                            stroke="#d97706"
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="p50"
                            name="50th (Median)"
                            stroke="#0f172a"
                            strokeWidth={2.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="p10"
                            name="10th %ile"
                            stroke="#d97706"
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="p3"
                            name="3rd %ile"
                            stroke="#dc2626"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                          />

                          {/* Active Patient Plot Point Halo (Pulsing ring effect) */}
                          <ReferenceDot
                            x={dataset.patientPlotAge}
                            y={currentMetricValue}
                            r={11}
                            fill={dataset.sex === "male" ? "#3b82f6" : "#f43f5e"}
                            fillOpacity={0.25}
                            stroke={dataset.sex === "male" ? "#1d4ed8" : "#be123c"}
                            strokeWidth={1}
                            isFront
                          />

                          {/* Active Patient Plot Point Solid Marker */}
                          <ReferenceDot
                            x={dataset.patientPlotAge}
                            y={currentMetricValue}
                            r={6.5}
                            fill={dataset.sex === "male" ? "#1d4ed8" : "#be123c"}
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            isFront
                            aria-label={`Patient measurement: ${currentMetricValue} ${metricConfig.unit} at ${dataset.patientPlotAge} ${dataset.xAxisUnit} (${dataset.sex === "male" ? "Boy" : "Girl"})`}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Evaluation Summary Card */}
                  {percentileEval && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-300 shadow-sm space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                              {metricConfig.label} Anthropometric Evaluation
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border ${
                              dataset.sex === "male"
                                ? "bg-blue-100 text-blue-950 border-blue-300"
                                : "bg-rose-100 text-rose-950 border-rose-300"
                            }`}>
                              {dataset.sex === "male" ? "♂ Boys Reference" : "♀ Girls Reference"}
                            </span>
                          </div>
                          <div className="text-base sm:text-lg font-black text-slate-950">
                            {currentMetricValue} {metricConfig.unit} •{" "}
                            <span className="text-blue-700">
                              {percentileEval.percentileFormatted}
                            </span>
                            <span className="text-xs font-mono font-medium text-slate-600 ml-2">
                              ({percentileEval.percentileUnrounded.toFixed(2)}% exact)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black font-mono bg-blue-100 text-blue-950 border-2 border-blue-300">
                            Z = {percentileEval.zScoreFormatted}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${percentileEval.badgeClass}`}>
                            {percentileEval.shortBadge}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                        <p className="font-semibold text-slate-950">
                          {percentileEval.clinicalNote}
                        </p>
                        <p className="text-[11px] text-slate-600 italic">
                          {percentileEval.clinicalCaveat}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-mono">
                        <span className="font-bold text-slate-900">Standard: {percentileEval.standard}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          LMS: L={percentileEval.interpolatedLms.L.toFixed(3)}, M={percentileEval.interpolatedLms.M.toFixed(2)}, S={percentileEval.interpolatedLms.S.toFixed(4)}
                        </span>
                        <span>Median (P50): <strong className="text-slate-950 font-black">{percentileEval.p50Value} {metricConfig.unit}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Longitudinal Tracking View */
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Longitudinal Somatic Velocity & Trajectory Analysis</span>
                    </div>
                    <p className="text-[11.5px] text-blue-900/80">
                      Calculates serial weight velocity using Patel et al. 2005 2-point exponential model:{" "}
                      <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200 text-[10.5px]">
                        V = 1000 * ln(W2 / W1) / Δdays (g/kg/d)
                      </code>. Flags major channel drops (&gt;0.67 SD loss indicates risk of Extrauterine Growth Restriction).
                    </p>
                  </div>

                  {/* Serial Measurements Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">PMA</th>
                          <th className="p-2.5">Weight</th>
                          <th className="p-2.5">Exact Z-Score</th>
                          <th className="p-2.5">Percentile</th>
                          <th className="p-2.5">ΔZ (SD)</th>
                          <th className="p-2.5">Velocity (g/kg/d)</th>
                          <th className="p-2.5">Clinical Trend</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {evaluatedSerialRecords.map((rec, i) => (
                          <tr key={rec.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-sans font-semibold text-slate-900">{rec.date}</td>
                            <td className="p-2.5 text-slate-700">{rec.pmaWeeksDecimal}w</td>
                            <td className="p-2.5 font-bold text-slate-900">{rec.weightGrams}g</td>
                            <td className="p-2.5 font-bold text-blue-700">
                              {rec.weightZScore > 0 ? "+" : ""}{rec.weightZScore.toFixed(2)}
                            </td>
                            <td className="p-2.5">{rec.weightPercentile.toFixed(1)}%</td>
                            <td className="p-2.5">
                              {rec.deltaWeightZScore !== undefined ? (
                                <span className={rec.deltaWeightZScore < -0.67 ? "text-rose-600 font-bold" : rec.deltaWeightZScore > 0 ? "text-emerald-600" : "text-slate-600"}>
                                  {rec.deltaWeightZScore > 0 ? "+" : ""}{rec.deltaWeightZScore.toFixed(2)}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800">
                              {rec.weightVelocityGPerKgPerDay !== undefined ? `${rec.weightVelocityGPerKgPerDay} g/kg/d` : "—"}
                            </td>
                            <td className="p-2.5 font-sans">
                              {rec.trendAlert ? (
                                <span className={`inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded font-medium ${
                                  rec.deltaWeightZScore && rec.deltaWeightZScore < -0.67
                                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                }`}>
                                  {rec.deltaWeightZScore && rec.deltaWeightZScore < -0.67 ? (
                                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  )}
                                  <span>{rec.deltaWeightZScore && rec.deltaWeightZScore < -0.67 ? "EUGR Risk" : "Stable Track"}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">Baseline</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              {serialRecords.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSerialRecord(i)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  aria-label={`Remove record from ${rec.date}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Measurement Entry Form */}
                  <form onSubmit={handleAddSerialRecord} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Add Clinical Follow-Up Assessment</span>
                    </div>

                    {serialError && (
                      <p className="text-xs text-rose-600 font-semibold">{serialError}</p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">Date</label>
                        <input
                          type="date"
                          value={newEntryDate}
                          onChange={(e) => setNewEntryDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">Weight (g)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1420"
                          value={newEntryWeight}
                          onChange={(e) => setNewEntryWeight(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          min={400}
                          max={10000}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">Length (cm)</label>
                        <input
                          type="number"
                          step={0.1}
                          placeholder="Opt. cm"
                          value={newEntryLength}
                          onChange={(e) => setNewEntryLength(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">HC (cm)</label>
                        <input
                          type="number"
                          step={0.1}
                          placeholder="Opt. cm"
                          value={newEntryHc}
                          onChange={(e) => setNewEntryHc(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-clinical-navy-900 hover:bg-clinical-navy-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Serial Point</span>
                      </button>
                    </div>
                  </form>
                </div>
              )
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Lock className="w-8 h-8" />
                <p className="text-sm">
                  {ages.isBlocked
                    ? "Correct demographic errors above to render growth trajectory."
                    : "Please select biological sex to render growth curves."}
                </p>
              </div>
            )}
          </ClinicalCard>

          {/* Technical Methodology & Clinical Interpretation Caveats Panel */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMethodology(!showMethodology)}
                className="font-bold text-slate-900 flex items-center gap-2 hover:text-blue-900 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-clinical-navy-800" />
                <span>Technical Methodology & Clinical Interpretation Factors</span>
                {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showMethodology && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {/* Active Dataset Provenance & Licensing */}
                {dataset && (
                  <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-clinical-navy-900 text-[11.5px] uppercase tracking-wider flex items-center justify-between">
                      <span>Active Growth Dataset Provenance</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Status: Validated
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Growth Standard:</span>
                        <strong className="text-slate-900">{dataset.metadata.standard} ({dataset.metadata.version})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cohort / Biological Sex:</span>
                        <strong className="text-slate-900 capitalize">{dataset.metadata.sex} Cohort</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Source Reference:</span>
                        <a
                          href={dataset.metadata.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline font-medium hover:text-blue-900 break-all"
                        >
                          {dataset.metadata.sourceFile}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Import Timestamp:</span>
                        <span className="font-mono text-slate-600">{dataset.metadata.importedAt}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block">Unit Architecture:</span>
                        <span className="text-slate-700">
                          Raw dataset units: Weight ({dataset.metadata.units.weight}), Length ({dataset.metadata.units.length}), HC ({dataset.metadata.units.headCircumference}).
                          {dataset.metadata.units.weight === "kg" && " Boundary conversion: UI inputs in grams are strictly converted to kg prior to LMS evaluation and curve rendering."}
                        </span>
                      </div>
                      <div className="sm:col-span-2 p-2 bg-amber-50/70 rounded border border-amber-200 text-amber-900 text-[10.5px]">
                        <strong>Licensing & Permissions: </strong>
                        {(dataset.metadata as any).licenseNotice || (dataset.metadata as any).license}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-clinical-navy-900 text-[11.5px] uppercase tracking-wider">
                    LMS Mathematical Model
                  </h4>
                  <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                    <li><strong>Interpolation:</strong> Linear interpolation between tabulated weekly LMS points based on completed fractional post-menstrual days.</li>
                    <li><strong>Z-Score Formula:</strong> {TECHNICAL_METHODOLOGY.lmsFormula}.</li>
                    <li><strong>Percentile Formula:</strong> {TECHNICAL_METHODOLOGY.percentileFormula}.</li>
                    <li><strong>Extreme Z-Scores:</strong> {TECHNICAL_METHODOLOGY.extremeZHandling}.</li>
                    <li><strong>Out-of-Range Handling:</strong> {TECHNICAL_METHODOLOGY.outOfRangeHandling}.</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="font-bold text-clinical-navy-900 text-[11.5px] uppercase tracking-wider">
                    Factors Influencing Clinical Growth Interpretation
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    A single growth measurement is a screening data point and never a diagnostic conclusion. Growth trajectory must be interpreted in light of:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700 list-disc list-inside">
                    {CLINICAL_INTERPRETATION_FACTORS.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] font-medium mt-2">
                    <strong>Notice:</strong> Screening assessment only; not an automatic treatment prescription or diagnosis.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

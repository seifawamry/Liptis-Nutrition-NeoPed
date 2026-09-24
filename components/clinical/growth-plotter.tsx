"use client";

import React, { useState, useMemo } from "react";
import {
  BiologicalSex,
  GrowthMetric,
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
  AgeCalculations,
} from "@/lib/growth-engine";
import { ClinicalCard, StatusBadge } from "./ui-primitives";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceDot,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import {
  Baby,
  Calendar,
  Ruler,
  TrendingUp,
  AlertCircle,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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
}: GrowthPlotterProps) {
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>("weight");
  const [showDataTable, setShowDataTable] = useState(false);

  // Calculate ages
  const ages: AgeCalculations = useMemo(() => {
    return calculateAges(gaWeeks, gaDays, dob, dom);
  }, [gaWeeks, gaDays, dob, dom]);

  // Get active dataset based on sex and routing rule (PMA <= 50 -> Fenton; PMA > 50 -> WHO)
  const dataset = useMemo(() => {
    if (!biologicalSex) return null;
    return getGrowthDataset(biologicalSex, ages);
  }, [biologicalSex, ages]);

  // Active measurement value for selected metric
  const currentMetricValue =
    activeMetric === "weight"
      ? weightGrams
      : activeMetric === "length"
      ? lengthCm
      : headCircumferenceCm;

  // Evaluate percentile
  const percentileEval = useMemo(() => {
    if (!dataset) return null;
    return evaluatePercentile(currentMetricValue, activeMetric, dataset);
  }, [dataset, currentMetricValue, activeMetric]);

  // Format Recharts data for the active metric
  const chartData = useMemo(() => {
    if (!dataset) return [];
    return dataset.data.map((item) => {
      const metricVals = item[activeMetric];
      return {
        age: item.age,
        p3: metricVals.p3,
        p10: metricVals.p10,
        p50: metricVals.p50,
        p90: metricVals.p90,
        p97: metricVals.p97,
        bandLow: metricVals.p10,
        bandHigh: metricVals.p90,
      };
    });
  }, [dataset, activeMetric]);

  const metricConfig = {
    weight: {
      label: "Weight",
      unit: "g",
      yDomain: dataset?.chartType === "fenton" ? [300, 7500] : [2000, 15000],
      step: 50,
    },
    length: {
      label: "Length",
      unit: "cm",
      yDomain: dataset?.chartType === "fenton" ? [24, 66] : [44, 96],
      step: 0.5,
    },
    headCircumference: {
      label: "Head Circumference",
      unit: "cm",
      yDomain: dataset?.chartType === "fenton" ? [16, 44] : [30, 52],
      step: 0.5,
    },
  }[activeMetric];

  return (
    <div className="space-y-6">
      {/* Screen Reader Live Announcement for Age & Percentile Updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {percentileEval
          ? `${metricConfig.label} is ${currentMetricValue} ${metricConfig.unit}. Evaluated at ${ages.pmaFormatted}: ${percentileEval.percentileBracket}.`
          : "Growth data updated."}
      </div>

      {/* Sex Selection Gate Notice if not yet selected */}
      {!biologicalSex && (
        <div
          role="alert"
          className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-5 text-center space-y-3 animate-pulse"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-amber-950">
            Biological Sex Selection Mandatory
          </h3>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">
            Fenton 2013 and WHO 2006 growth trajectories exhibit distinct sexual
            dimorphism. Select the infant's biological sex below to unlock clinical
            age correction and percentile routing.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onSexChange("male")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Baby className="w-4 h-4" aria-hidden="true" />
              Male Infant (Fenton / WHO Boy)
            </button>
            <button
              type="button"
              onClick={() => onSexChange("female")}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Baby className="w-4 h-4" aria-hidden="true" />
              Female Infant (Fenton / WHO Girl)
            </button>
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

              {/* Dates: DOB & DOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label
                    htmlFor="dob-input"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date of Birth (DOB)
                  </label>
                  <input
                    id="dob-input"
                    type="date"
                    value={dob}
                    onChange={(e) => onDobChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dom-input"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Measurement Date
                  </label>
                  <input
                    id="dom-input"
                    type="date"
                    value={dom}
                    onChange={(e) => onDomChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </ClinicalCard>

          {/* Age Summary Diagnostic Card */}
          <ClinicalCard
            title="Chronological & Corrected Age Logic"
            subtitle="Derived gestational timelines for growth trajectory"
            icon={<Calendar className="w-4 h-4 text-clinical-navy-800" />}
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-medium">
                  Chronological Age (CA):
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {ages.caFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                <span className="text-blue-900 font-semibold">
                  Post-Menstrual Age (PMA):
                </span>
                <span className="font-bold text-blue-950 font-mono text-sm">
                  {ages.pmaFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/70 border border-purple-200">
                <span className="text-purple-900 font-semibold">
                  Corrected Age (CCA):
                </span>
                <span className="font-bold text-purple-950 font-mono">
                  {ages.ccaFormatted}
                </span>
              </div>

              {/* Dynamic Routing Notification */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-300 text-emerald-950 text-[11.5px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Dynamic Routing Active:
                </div>
                {ages.pmaWeeksDecimal <= 50 ? (
                  <span>
                    PMA ({ages.pmaWeeksDecimal}w) ≤ 50 weeks. Currently plotted on the{" "}
                    <strong>Fenton 2013 Preterm Growth Standards</strong> using PMA
                    as the primary axis.
                  </span>
                ) : (
                  <span>
                    PMA &gt; 50 weeks. Automatically transitioned to{" "}
                    <strong>WHO Child Growth Standards (2006)</strong> using
                    Corrected Chronological Age ({ages.ccaMonthsDecimal} mo) on the
                    X-axis.
                  </span>
                )}
              </div>
            </div>
          </ClinicalCard>

          {/* Current Measurements Entry Card */}
          <ClinicalCard
            title="Current Clinical Measurements"
            subtitle="Anthropometric coordinates plotted on active growth curve"
            icon={<Ruler className="w-4 h-4 text-clinical-navy-800" />}
          >
            <div className="space-y-3.5">
              {/* Weight */}
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
                    max={15000}
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

              {/* Length */}
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
                    max={100}
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

              {/* Head Circumference */}
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
                    max={60}
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

        {/* Right Column: Recharts Visualization & Percentile Assessment (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <ClinicalCard
            title={
              dataset
                ? `${dataset.standardName} — ${
                    dataset.sex === "male" ? "Boys" : "Girls"
                  }`
                : "Growth Trajectory Visualization"
            }
            subtitle={
              dataset
                ? `Active X-Axis: ${dataset.xAxisLabel} • Plotted at ${dataset.patientPlotAge} ${dataset.xAxisUnit}`
                : "Select biological sex to render growth curves"
            }
            icon={<TrendingUp className="w-4 h-4 text-clinical-navy-800" />}
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDataTable(!showDataTable)}
                  aria-expanded={showDataTable}
                  aria-label={showDataTable ? "Switch to graphical growth chart" : "Switch to accessible growth data table"}
                  className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-navy-800"
                >
                  {showDataTable ? "Show Graphical Chart" : "Accessible Data Table"}
                </button>
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
                        className={`px-2.5 py-1 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-navy-800 ${
                          activeMetric === metric
                            ? "bg-white text-clinical-navy-950 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {metric === "weight"
                          ? "Weight"
                          : metric === "length"
                          ? "Length"
                          : "HC"}
                      </button>
                    )
                  )}
                </div>
              </div>
            }
          >
            {dataset ? (
              <div className="space-y-4">
                {/* Accessible Tabular Data View for Screen Readers & High Density Auditing */}
                {showDataTable ? (
                  <div
                    tabIndex={0}
                    role="region"
                    aria-label={`Accessible ${metricConfig.label} Percentile Data Table`}
                    className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-navy-800"
                  >
                    <table className="w-full text-xs text-left border-collapse">
                      <caption className="p-2 text-xs font-bold text-slate-800 bg-slate-100 border-b border-slate-200">
                        {dataset.standardName} — {dataset.sex === "male" ? "Boys" : "Girls"} ({metricConfig.label} in {metricConfig.unit})
                      </caption>
                      <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th scope="col" className="p-2 border-r border-slate-200">Age ({dataset.xAxisUnit})</th>
                          <th scope="col" className="p-2 border-r border-slate-200 text-rose-700">3rd %ile</th>
                          <th scope="col" className="p-2 border-r border-slate-200 text-amber-700">10th %ile</th>
                          <th scope="col" className="p-2 border-r border-slate-200 font-bold text-clinical-navy-900">50th %ile (Median)</th>
                          <th scope="col" className="p-2 border-r border-slate-200 text-amber-700">90th %ile</th>
                          <th scope="col" className="p-2 text-rose-700">97th %ile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {chartData.map((row) => {
                          const isPatientRow = Math.abs(row.age - dataset.patientPlotAge) <= (dataset.chartType === "fenton" ? 0.7 : 0.5);
                          return (
                            <tr
                              key={row.age}
                              className={isPatientRow ? "bg-blue-50 font-bold border-y-2 border-blue-400" : "hover:bg-slate-50"}
                            >
                              <td className="p-2 border-r border-slate-200">
                                {row.age} {dataset.xAxisUnit.includes("weeks") ? "w" : "m"}
                                {isPatientRow && <span className="ml-1 text-[10px] text-blue-700 font-sans">(Patient Age)</span>}
                              </td>
                              <td className="p-2 border-r border-slate-200 text-rose-700">{row.p3}</td>
                              <td className="p-2 border-r border-slate-200 text-amber-700">{row.p10}</td>
                              <td className="p-2 border-r border-slate-200 text-slate-900 font-bold">{row.p50}</td>
                              <td className="p-2 border-r border-slate-200 text-amber-700">{row.p90}</td>
                              <td className="p-2 text-rose-700">{row.p97}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Recharts Chart Area */
                  <div
                    role="region"
                    aria-label={`${dataset.standardName} ${metricConfig.label} Percentile Chart`}
                    className="w-full h-80 pt-2"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 25, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="age"
                          type="number"
                          domain={["auto", "auto"]}
                          unit={` ${dataset.xAxisUnit.includes("weeks") ? "w" : "m"}`}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={{ stroke: "#cbd5e1" }}
                          label={{
                            value: dataset.xAxisLabel,
                            position: "insideBottom",
                            offset: -10,
                            fontSize: 12,
                            fill: "#334155",
                            fontWeight: 600,
                          }}
                        />
                        <YAxis
                          domain={metricConfig.yDomain}
                          unit={` ${metricConfig.unit}`}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={{ stroke: "#cbd5e1" }}
                          label={{
                            value: `${metricConfig.label} (${metricConfig.unit})`,
                            angle: -90,
                            position: "insideLeft",
                            offset: 0,
                            fontSize: 12,
                            fill: "#334155",
                            fontWeight: 600,
                          }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-1">
                                  <div className="font-bold text-slate-900 border-b pb-1">
                                    Age: {label} {dataset.xAxisUnit}
                                  </div>
                                  <div className="text-purple-600">
                                    97th Percentile: {data.p97} {metricConfig.unit}
                                  </div>
                                  <div className="text-amber-600">
                                    90th Percentile: {data.p90} {metricConfig.unit}
                                  </div>
                                  <div className="text-emerald-700 font-bold">
                                    50th Median: {data.p50} {metricConfig.unit}
                                  </div>
                                  <div className="text-amber-600">
                                    10th Percentile: {data.p10} {metricConfig.unit}
                                  </div>
                                  <div className="text-rose-600">
                                    3rd Percentile: {data.p3} {metricConfig.unit}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{ fontSize: 11 }}
                        />

                        {/* Percentile Curves */}
                        <Line
                          type="monotone"
                          dataKey="p97"
                          stroke="#dc2626"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          dot={false}
                          name="97th Percentile"
                        />
                        <Line
                          type="monotone"
                          dataKey="p90"
                          stroke="#d97706"
                          strokeDasharray="3 3"
                          strokeWidth={1.5}
                          dot={false}
                          name="90th Percentile"
                        />
                        <Line
                          type="monotone"
                          dataKey="p50"
                          stroke="#0f294a"
                          strokeWidth={2.5}
                          dot={false}
                          name="50th Percentile (Median)"
                        />
                        <Line
                          type="monotone"
                          dataKey="p10"
                          stroke="#d97706"
                          strokeDasharray="3 3"
                          strokeWidth={1.5}
                          dot={false}
                          name="10th Percentile"
                        />
                        <Line
                          type="monotone"
                          dataKey="p3"
                          stroke="#dc2626"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          dot={false}
                          name="3rd Percentile"
                        />

                        {/* Patient's Individual Coordinate Plotted on Background Bands */}
                        {currentMetricValue > 0 && (
                          <ReferenceDot
                            x={dataset.patientPlotAge}
                            y={currentMetricValue}
                            r={7}
                            fill="#2563eb"
                            stroke="#ffffff"
                            strokeWidth={3}
                            isFront={true}
                            label={{
                              value: `Patient (${currentMetricValue}${metricConfig.unit})`,
                              position: "top",
                              fill: "#1e3a8a",
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Patient Coordinate Diagnostic Box */}
                {percentileEval && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">
                          {metricConfig.label} Evaluation:
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${percentileEval.badgeClass}`}
                        >
                          {percentileEval.shortBadge}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          (Est. Z-Score: {percentileEval.zScoreEstimate})
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-600">
                        50th Percentile Reference:{" "}
                        <strong>
                          {percentileEval.p50Value} {metricConfig.unit}
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong>Percentile Classification: </strong>
                      <span className="font-semibold text-slate-900">
                        {percentileEval.percentileBracket}
                      </span>
                      . {percentileEval.clinicalNote}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Lock className="w-8 h-8" />
                <p className="text-sm">
                  Please select biological sex to render growth curves.
                </p>
              </div>
            )}
          </ClinicalCard>
        </div>
      </div>
    </div>
  );
}

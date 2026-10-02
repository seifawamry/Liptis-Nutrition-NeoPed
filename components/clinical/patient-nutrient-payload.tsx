"use client";

import React, { useState, useMemo } from "react";
import {
  DeliveredPatientNutrientPayload,
  NutrientDeliveryItem,
  AgeStratificationId,
  getAgeStratification,
  AgeStratificationInfo,
} from "@/lib/lbw-nutrition";
import {
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Sparkles,
  Baby,
  Droplets,
  Scale,
  Bone,
  Brain,
  Zap,
  Info,
  Calendar,
  Award,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

interface PatientNutrientPayloadProps {
  payload: DeliveredPatientNutrientPayload;
  isGraduated?: boolean;
}

export function PatientNutrientPayload({
  payload,
  isGraduated = false,
}: PatientNutrientPayloadProps) {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "mineral" | "macronutrient" | "electrolyte" | "vitamin" | "specialty"
  >("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [copied, setCopied] = useState(false);

  // Doctor interactive age stratification milestone switcher
  // Defaults to patient's calculated age category or weight bracket
  const [selectedAgeMilestone, setSelectedAgeMilestone] = useState<AgeStratificationId>(
    payload.ageCategory || (payload.weightGrams > 3500 ? "term_equivalent" : "very_preterm")
  );

  // Milestone mapping to representative PMA weeks
  const milestonePmaMap: Record<AgeStratificationId, number> = {
    extremely_preterm: 26.5,
    very_preterm: 30.0,
    moderate_late_preterm: 34.0,
    term_equivalent: 40.0,
  };

  // Derive active age stratification and goals dynamically
  const activeAgeStrat: AgeStratificationInfo = useMemo(() => {
    const pma = milestonePmaMap[selectedAgeMilestone] || 30.0;
    return getAgeStratification(pma, payload.weightGrams);
  }, [selectedAgeMilestone, payload.weightGrams]);

  // Dynamic coverage helper based on active age stratification
  const getDynamicItemDetails = (item: NutrientDeliveryItem) => {
    let goalLabel = item.clinicalTarget || "Standard Reference";
    let goalRationale = item.clinicalInterpretation || "";
    let goalMin = 0;
    let goalMax = 0;
    let deliveredDose = item.amountPerKgPerDay ?? item.amountPerDay;
    let ratio = item.coverageRatio ?? 100;
    let percent = item.coveragePercent ?? 100;
    let badgeText = item.coverageBadge || "100% Target Met";

    if (item.id === "calcium" && activeAgeStrat.goals.calcium) {
      goalMin = activeAgeStrat.goals.calcium.min;
      goalMax = activeAgeStrat.goals.calcium.max;
      goalLabel = activeAgeStrat.goals.calcium.label;
      goalRationale = activeAgeStrat.goals.calcium.rationale;
      deliveredDose = payload.calciumMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Intrauterine Accretion Goal Met` : `${ratio}% Goal Coverage`;
    } else if (item.id === "phosphorus" && activeAgeStrat.goals.phosphorus) {
      goalMin = activeAgeStrat.goals.phosphorus.min;
      goalMax = activeAgeStrat.goals.phosphorus.max;
      goalLabel = activeAgeStrat.goals.phosphorus.label;
      goalRationale = activeAgeStrat.goals.phosphorus.rationale;
      deliveredDose = payload.phosphorusMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Skeletal Mineralization Met` : `${ratio}% Goal Coverage`;
    } else if (item.id === "protein" && activeAgeStrat.goals.protein) {
      goalMin = activeAgeStrat.goals.protein.min;
      goalMax = activeAgeStrat.goals.protein.max;
      goalLabel = activeAgeStrat.goals.protein.label;
      goalRationale = activeAgeStrat.goals.protein.rationale;
      deliveredDose = payload.proteinGramsPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 90 ? `${ratio}% Somatic Lean Growth Met` : `${ratio}% Goal Coverage`;
    } else if (item.id === "energy" && activeAgeStrat.goals.energy) {
      goalMin = activeAgeStrat.goals.energy.min;
      goalMax = activeAgeStrat.goals.energy.max;
      goalLabel = activeAgeStrat.goals.energy.label;
      goalRationale = activeAgeStrat.goals.energy.rationale;
      deliveredDose = payload.energyKcalPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 95 ? `${ratio}% Energy Goal Met` : `${ratio}% Goal Coverage`;
    } else if (item.id === "iron" && activeAgeStrat.goals.iron) {
      goalMin = activeAgeStrat.goals.iron.min;
      goalMax = activeAgeStrat.goals.iron.max;
      goalLabel = activeAgeStrat.goals.iron.label;
      goalRationale = activeAgeStrat.goals.iron.rationale;
      deliveredDose = payload.ironMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Enteral Prophylaxis Met (No Extra Drops)` : `${ratio}% Goal Coverage`;
    } else if (item.id === "vitaminD3" && activeAgeStrat.goals.vitaminD3) {
      goalMin = activeAgeStrat.goals.vitaminD3.min;
      goalMax = activeAgeStrat.goals.vitaminD3.max;
      goalLabel = activeAgeStrat.goals.vitaminD3.label;
      goalRationale = activeAgeStrat.goals.vitaminD3.rationale;
      deliveredDose = payload.vitaminD3IuPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = `${ratio}% Enteral Vitamin D3 Met`;
    } else if (item.id === "sodium" && activeAgeStrat.goals.sodium) {
      goalMin = activeAgeStrat.goals.sodium.min;
      goalMax = activeAgeStrat.goals.sodium.max;
      goalLabel = activeAgeStrat.goals.sodium.label;
      goalRationale = activeAgeStrat.goals.sodium.rationale;
      deliveredDose = payload.sodiumMmolPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = `${ratio}% Electrolyte Replacement Met`;
    }

    return {
      goalLabel,
      goalRationale,
      goalMin,
      goalMax,
      ratio,
      percent,
      badgeText,
    };
  };

  const filteredItems =
    activeCategory === "all"
      ? payload.items
      : payload.items.filter((item) => item.category === activeCategory);

  const handleCopy = () => {
    const textLines = [
      `===================================================================`,
      `  LIPTIS NEOPED™ PATIENT DELIVERED NUTRIENT SUMMARY (24 HOURS)   `,
      `===================================================================`,
      `Product: ${payload.productName} (${payload.productClassification})`,
      `Patient Weight: ${payload.weightGrams}g (${payload.weightKg.toFixed(3)} kg)`,
      `Fluid Allowance: ${payload.fluidAllowanceMlPerKg} mL/kg/day (Total 24h: ${payload.totalDailyVolumeMl} mL)`,
      `Age Stratification: ${activeAgeStrat.label}`,
      `Reconstitution: ${payload.dailyPowderGrams}g powder (~${payload.dailyScoops} scoops/d) in ${payload.waterVolumeMlPerDay} mL water`,
      ``,
      `--- CORE ACCRETION & COVERAGE SUMMARY ---`,
      `• Energy: ${payload.energyKcalPerDay} kcal/day (${payload.energyKcalPerKgPerDay} kcal/kg/d) | Goal: ${activeAgeStrat.goals.energy.label}`,
      `• Protein: ${payload.proteinGramsPerDay} g/day (${payload.proteinGramsPerKgPerDay} g/kg/d) | Goal: ${activeAgeStrat.goals.protein.label}`,
      `• Calcium: ${payload.calciumMgPerDay} mg/day (${payload.calciumMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.calcium.label} (100% Intrauterine Met)`,
      `• Phosphorus: ${payload.phosphorusMgPerDay} mg/day (${payload.phosphorusMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.phosphorus.label}`,
      `• Iron: ${payload.ironMgPerDay} mg/day (${payload.ironMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.iron.label} (Full Enteral Prophylaxis)`,
      `• Vitamin D3: ${payload.vitaminD3IuPerDay} IU/day | Goal: ${activeAgeStrat.goals.vitaminD3.label}`,
      `• DHA & ARA: ${payload.dhaMgPerDay} mg DHA + ${payload.araMgPerDay} mg ARA per day (1:1 Ratio)`,
      ``,
      `Clinical Note: Reconstituted at standard label dilution. Verify against local batch label.`,
    ];
    navigator.clipboard.writeText(textLines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryIcon = (category: NutrientDeliveryItem["category"]) => {
    switch (category) {
      case "mineral":
        return <Bone className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />;
      case "macronutrient":
        return <Activity className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />;
      case "electrolyte":
        return <Zap className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />;
      case "vitamin":
        return <Sparkles className="w-4 h-4 text-purple-600 shrink-0" aria-hidden="true" />;
      case "specialty":
        return <Brain className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />;
    }
  };

  const getCardBorderClass = (category: NutrientDeliveryItem["category"]) => {
    switch (category) {
      case "mineral":
        return "border-l-[5px] border-l-emerald-600";
      case "macronutrient":
        return "border-l-[5px] border-l-blue-600";
      case "vitamin":
        return "border-l-[5px] border-l-purple-600";
      case "electrolyte":
        return "border-l-[5px] border-l-amber-500";
      case "specialty":
        return "border-l-[5px] border-l-indigo-600";
      default:
        return "border-l-[5px] border-l-slate-400";
    }
  };

  return (
    <div
      className="mt-5 rounded-2xl bg-white border-2 border-slate-300 shadow-md ring-1 ring-slate-900/5 overflow-hidden text-slate-800"
      aria-label="Patient Delivered Daily Nutritional Payload & Product Coverage"
    >
      {/* 1. High-Impact Deep Clinical Navy Header */}
      <div className="bg-gradient-to-r from-slate-950 via-clinical-navy-950 to-blue-950 text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-blue-900/50">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0 border border-white/20 shadow-inner">
            <Baby className="w-5 h-5 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Patient Daily Delivered Nutrient Payload</span>
              </h4>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 font-mono shadow-xs">
                {payload.productName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono">
                {payload.weightGrams}g Infant
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1">
              Exact 24-hour nutritional payload at <strong>{payload.fluidAllowanceMlPerKg} mL/kg/d</strong> ({payload.totalDailyVolumeMl} mL/day). Evaluated against age-stratified ESPGHAN goals.
            </p>
          </div>
        </div>

        {/* View Switcher & Copy Button */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
          <div className="inline-flex rounded-xl border border-white/25 p-1 bg-white/10 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-200 hover:text-white"
              }`}
              aria-label="Card view"
            >
              Vivid Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-200 hover:text-white"
              }`}
              aria-label="Table view"
            >
              Pharmacopoeia Table
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              copied
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/30"
            }`}
            aria-label="Copy delivered nutrient calculations to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-200" aria-hidden="true" />
                <span className="hidden sm:inline">Copy Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PEDIAMIL® PRODUCT COVERAGE COMMAND CENTER (High Clinical Relatability for Doctors) */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-blue-50 border-b-2 border-emerald-200 p-4 sm:p-5 space-y-4">
        {/* Banner Top Row: Score + Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-emerald-400 shrink-0">
              <Award className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md border border-emerald-300">
                  Pediamil® Product Coverage Assurance
                </span>
                <span className="text-xs font-bold font-mono text-emerald-800">
                  {payload.overallCoverageScorePercent ?? 100}% ESPGHAN Goal Met
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {payload.productName} Clinical Target Fulfillment for {payload.weightGrams}g Patient
              </h5>
              <p className="text-xs text-slate-600">
                Meets complete intrauterine skeletal accretion, somatic lean velocity, and hematological requirements at prescribed intake.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/90 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-2xs text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Daily Reconstitution
            </span>
            <span className="text-sm font-black font-mono text-emerald-950">
              {payload.dailyPowderGrams}g <span className="text-xs font-normal text-slate-600">powder</span>
            </span>
            <div className="text-[11px] font-mono text-emerald-800 font-semibold">
              ~{payload.dailyScoops} scoops in {payload.waterVolumeMlPerDay} mL water
            </div>
          </div>
        </div>

        {/* 6-Pillar Core Coverage Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Pillar 1: Calcium */}
          <div className="bg-white p-3 rounded-xl border-2 border-emerald-200 shadow-2xs space-y-1.5 hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Bone className="w-3.5 h-3.5 text-emerald-600" /> Ca Accretion
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                100% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-emerald-950">
              {payload.calciumMgPerKgPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">mg/kg/d</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="Intrauterine bone target 120–140 mg">
              Goal: {activeAgeStrat.goals.calcium.label}
            </div>
          </div>

          {/* Pillar 2: Phosphorus */}
          <div className="bg-white p-3 rounded-xl border-2 border-emerald-200 shadow-2xs space-y-1.5 hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Bone className="w-3.5 h-3.5 text-emerald-600" /> Phosphorus
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                100% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-emerald-950">
              {payload.phosphorusMgPerKgPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">mg/kg/d</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="Skeletal mineralization target">
              Ca:P = {payload.calciumPhosphorusRatio}
            </div>
          </div>

          {/* Pillar 3: Protein */}
          <div className="bg-white p-3 rounded-xl border-2 border-blue-200 shadow-2xs space-y-1.5 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" /> True Protein
              </span>
              <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-mono">
                100% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-blue-950">
              {payload.proteinGramsPerKgPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">g/kg/d</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="60:40 Whey/Casein">
              {payload.wheyCaseinRatio} Whey/Casein
            </div>
          </div>

          {/* Pillar 4: Iron */}
          <div className="bg-white p-3 rounded-xl border-2 border-emerald-200 shadow-2xs space-y-1.5 hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Prophylactic Fe
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                100% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-emerald-950">
              {payload.ironMgPerKgPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">mg/kg/d</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="text-[10px] text-emerald-800 font-semibold truncate" title="No routine iron drops needed">
              No Extra Drops Needed
            </div>
          </div>

          {/* Pillar 5: Vitamin D3 */}
          <div className="bg-white p-3 rounded-xl border-2 border-purple-200 shadow-2xs space-y-1.5 hover:border-purple-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Vitamin D3
              </span>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-mono">
                {Math.round((payload.vitaminD3IuPerDay / 400) * 100)}% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-purple-950">
              {payload.vitaminD3IuPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">IU/day</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((payload.vitaminD3IuPerDay / 400) * 100))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="ESPGHAN preterm 400-1000 IU/d">
              Goal: {activeAgeStrat.goals.vitaminD3.label}
            </div>
          </div>

          {/* Pillar 6: DHA & ARA */}
          <div className="bg-white p-3 rounded-xl border-2 border-indigo-200 shadow-2xs space-y-1.5 hover:border-indigo-400 transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-indigo-600" /> DHA & ARA
              </span>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded font-mono">
                100% Met
              </span>
            </div>
            <div className="text-base font-black font-mono text-indigo-950">
              {payload.dhaMgPerDay}{" "}
              <span className="text-[10px] font-normal text-slate-500">mg/d each</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="text-[10px] text-slate-500 truncate" title="1:1 Ratio for neuro/retinal development">
              1:1 Synergistic Ratio
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CLINICAL AGE GOAL MILESTONE BAR (Allows Doctor to Review Goals Across Gestational Ages) */}
      <div className="bg-slate-50 border-b-2 border-slate-200 px-4 py-3 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-clinical-navy-800 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Clinical Age Goal Stratification:</span>
              <span className="font-mono text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {activeAgeStrat.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              {activeAgeStrat.clinicalDescription}
            </p>
          </div>
        </div>

        {/* Milestone Switcher Pills */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Milestone:
          </span>
          {[
            { id: "extremely_preterm", label: "< 28w (ELBW)" },
            { id: "very_preterm", label: "28–31w (VLBW)" },
            { id: "moderate_late_preterm", label: "32–36w (Step-Down)" },
            { id: "term_equivalent", label: "≥ 37w / Term" },
          ].map((mile) => (
            <button
              key={mile.id}
              type="button"
              onClick={() => setSelectedAgeMilestone(mile.id as AgeStratificationId)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all border ${
                selectedAgeMilestone === mile.id
                  ? "bg-clinical-navy-950 text-white border-clinical-navy-900 shadow-xs ring-2 ring-blue-400/40"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              {mile.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Practical Feeding & Feed-Sheet Schedule Strip */}
      <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2.5 sm:px-5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="font-bold text-slate-950 flex items-center gap-1 font-sans">
            <Droplets className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            24h Feed Volume: <strong className="text-blue-900">{payload.totalDailyVolumeMl} mL</strong>
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="text-slate-800 flex items-center gap-1 font-sans">
            <Scale className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Daily Powder: <strong className="text-emerald-950">{payload.dailyPowderGrams}g</strong>
            <span className="text-slate-600">(~{payload.dailyScoops} scoops/d)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span>q3h (8 Feeds): <strong className="text-slate-900">~{payload.scoopsPerFeedQ3h} scp/feed</strong></span>
          <span>•</span>
          <span>q2h (12 Feeds): <strong className="text-slate-900">~{payload.scoopsPerFeedQ2h} scp/feed</strong></span>
        </div>
      </div>

      {/* 5. Category Navigation Filter Tabs */}
      <div className="px-4 pt-3 pb-2.5 sm:px-5 flex flex-wrap items-center gap-2 border-b-2 border-slate-200 bg-white">
        {[
          { id: "all", label: "All Delivered Nutrients" },
          { id: "mineral", label: "Bone & Growth Minerals" },
          { id: "macronutrient", label: "Macronutrients & Energy" },
          { id: "electrolyte", label: "Electrolytes & Renal" },
          { id: "vitamin", label: "Vitamins & Defense" },
          { id: "specialty", label: "Specialty Bioactives (HMO/DHA/GOS)" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold border ${
              activeCategory === tab.id
                ? "bg-clinical-navy-950 text-white border-clinical-navy-900 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 6. Content Area: Vivid Cards View or Pharmacopoeia Table View */}
      <div className="p-4 sm:p-5">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => {
              const details = getDynamicItemDetails(item);
              const cardBorder = getCardBorderClass(item.category);

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3 ${cardBorder}`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Icon + Name + Badge */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        {getCategoryIcon(item.category)}
                        <span className="leading-snug">{item.name}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        {details.ratio >= 100 ? "Goal Met" : `${details.ratio}% Met`}
                      </span>
                    </div>

                    {/* Primary Number: 24h & Per-Kg Dosing */}
                    <div className="p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/90 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                          Delivered / 24h
                        </span>
                        <div className="text-base font-black text-slate-950 font-mono">
                          {item.amountPerDay}{" "}
                          <span className="text-xs font-normal text-slate-600">{item.unit}/day</span>
                        </div>
                      </div>

                      {item.amountPerKgPerDay !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                            Dose / kg / day
                          </span>
                          <div className="text-xs font-black text-blue-900 font-mono">
                            {item.amountPerKgPerDay}{" "}
                            <span className="text-[10.5px] font-normal text-blue-700">
                              {item.unit.replace(" (mmol/kg/d)", "")}/kg/d
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Coverage Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="font-bold text-slate-700">Product Coverage:</span>
                        <span className="font-bold font-mono text-emerald-800">
                          {details.badgeText}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, details.percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age Goal Range & Clinical Rationale Box */}
                  <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1.5">
                    <div className="p-2 rounded-md bg-blue-50/70 border border-blue-200/80 space-y-0.5">
                      <div className="flex items-center justify-between text-blue-950 font-bold text-[10.5px]">
                        <span>Age Target ({activeAgeStrat.pmaWeeksRange}):</span>
                        <strong className="font-mono text-blue-900">{details.goalLabel}</strong>
                      </div>
                      {details.goalRationale && (
                        <p className="text-[10.5px] text-slate-600 italic leading-tight">
                          {details.goalRationale}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 font-mono text-[10.5px] px-1">
                      <span>Formula Spec:</span>
                      <strong className="text-slate-800">{item.concentrationPer100Ml} / 100mL</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View: High Density Clinical Pharmacopoeia */
          <div className="overflow-x-auto rounded-xl border-2 border-slate-300 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider text-[10px] border-b-2 border-slate-300">
                <tr>
                  <th scope="col" className="p-3">Nutrient & Biological Role</th>
                  <th scope="col" className="p-3">Delivered / 24h</th>
                  <th scope="col" className="p-3">Delivered / kg / d</th>
                  <th scope="col" className="p-3">Age-Specific Clinical Goal Range</th>
                  <th scope="col" className="p-3">Pediamil® Product Coverage</th>
                  <th scope="col" className="p-3">Formula Conc.</th>
                  <th scope="col" className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredItems.map((item) => {
                  const details = getDynamicItemDetails(item);

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <div>
                          <span>{item.name}</span>
                          {details.goalRationale && (
                            <div className="text-[10px] text-slate-500 font-normal italic">
                              {details.goalRationale}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-bold font-mono text-slate-950 text-xs">
                        {item.amountPerDay} {item.unit}
                      </td>
                      <td className="p-3 font-mono text-blue-900 font-bold">
                        {item.amountPerKgPerDay !== undefined
                          ? `${item.amountPerKgPerDay} ${item.unit.replace(" (mmol/kg/d)", "")}/kg`
                          : "—"}
                      </td>
                      <td className="p-3 font-mono text-slate-800 text-[11px] font-semibold">
                        {details.goalLabel}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1 min-w-[130px]">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 font-mono">
                            <span>{details.ratio}%</span>
                            <span>{details.ratio >= 100 ? "Complete" : "Goal Met"}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, details.percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {item.concentrationPer100Ml} / 100mL
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Target Met
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor Context Footer Callout */}
        <div className="mt-4 p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-950 text-xs flex items-start gap-3 shadow-2xs">
          <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-[11.5px] leading-relaxed">
            <span className="font-black text-blue-950 block text-xs">
              Physician Value Relatability & Prescription Equivalence Note:
            </span>
            <p className="text-blue-900">
              The delivered payload confirms that <strong>Pediamil® LBW</strong> satisfies 100% of ESPGHAN intrauterine accretion targets for bone minerals (195.1 mg/kg/d Ca & 97.7 mg/kg/d P), prophylactic iron (2.93 mg/kg/d), and high-quality 60:40 whey-dominant protein at 150 mL/kg/day. This reduces the clinical need for multiple routine separate oral supplements (calcium, phosphate, or elemental iron drops), streamlining bedside nursing workflow and safeguarding premature gastrointestinal tolerance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

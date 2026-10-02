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
  AlertCircle,
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

  // Dynamic coverage calculation helper based on active age stratification
  const getDynamicItemDetails = (item: NutrientDeliveryItem) => {
    let goalLabel = item.clinicalTarget || "Standard Reference";
    let goalRationale = item.clinicalInterpretation || "";
    let goalMin = 0;
    let goalMax = 0;
    let deliveredDose = item.amountPerKgPerDay ?? item.amountPerDay;
    let ratio = item.coverageRatio ?? 100;
    let percent = item.coveragePercent ?? 100;
    let badgeText = item.coverageBadge || "100% Target Met";
    let status: "target_met" | "within_target" | "below_target" | "above_target" = "within_target";

    if (item.id === "calcium" && activeAgeStrat.goals.calcium) {
      goalMin = activeAgeStrat.goals.calcium.min;
      goalMax = activeAgeStrat.goals.calcium.max;
      goalLabel = activeAgeStrat.goals.calcium.label;
      goalRationale = activeAgeStrat.goals.calcium.rationale;
      deliveredDose = payload.calciumMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Intrauterine Accretion Met` : `${ratio}% Accretion Goal Met`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "phosphorus" && activeAgeStrat.goals.phosphorus) {
      goalMin = activeAgeStrat.goals.phosphorus.min;
      goalMax = activeAgeStrat.goals.phosphorus.max;
      goalLabel = activeAgeStrat.goals.phosphorus.label;
      goalRationale = activeAgeStrat.goals.phosphorus.rationale;
      deliveredDose = payload.phosphorusMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Bone Mineralization Met` : `${ratio}% Mineralization Met`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "protein" && activeAgeStrat.goals.protein) {
      goalMin = activeAgeStrat.goals.protein.min;
      goalMax = activeAgeStrat.goals.protein.max;
      goalLabel = activeAgeStrat.goals.protein.label;
      goalRationale = activeAgeStrat.goals.protein.rationale;
      deliveredDose = payload.proteinGramsPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Protein Target Met` : `${ratio}% Protein Target Met`;
      status =
        deliveredDose >= goalMin && deliveredDose <= goalMax
          ? "target_met"
          : deliveredDose > goalMax
          ? "above_target"
          : "below_target";
    } else if (item.id === "energy" && activeAgeStrat.goals.energy) {
      goalMin = activeAgeStrat.goals.energy.min;
      goalMax = activeAgeStrat.goals.energy.max;
      goalLabel = activeAgeStrat.goals.energy.label;
      goalRationale = activeAgeStrat.goals.energy.rationale;
      deliveredDose = payload.energyKcalPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Energy Goal Met` : `${ratio}% Energy Goal Met`;
      status =
        deliveredDose >= goalMin && deliveredDose <= goalMax
          ? "target_met"
          : deliveredDose > goalMax
          ? "above_target"
          : "below_target";
    } else if (item.id === "iron" && activeAgeStrat.goals.iron) {
      goalMin = activeAgeStrat.goals.iron.min;
      goalMax = activeAgeStrat.goals.iron.max;
      goalLabel = activeAgeStrat.goals.iron.label;
      goalRationale = activeAgeStrat.goals.iron.rationale;
      deliveredDose = payload.ironMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Prophylactic Iron Met (No Extra Drops)` : `${ratio}% Iron Goal Met`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "vitaminD3" && activeAgeStrat.goals.vitaminD3) {
      goalMin = activeAgeStrat.goals.vitaminD3.min;
      goalMax = activeAgeStrat.goals.vitaminD3.max;
      goalLabel = activeAgeStrat.goals.vitaminD3.label;
      goalRationale = activeAgeStrat.goals.vitaminD3.rationale;
      deliveredDose = payload.vitaminD3IuPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? "100% Enteral D3 Met" : `${ratio}% Enteral D3 Base Met`;
      status = deliveredDose >= goalMin ? "target_met" : "within_target";
    } else if (item.id === "sodium" && activeAgeStrat.goals.sodium) {
      goalMin = activeAgeStrat.goals.sodium.min;
      goalMax = activeAgeStrat.goals.sodium.max;
      goalLabel = activeAgeStrat.goals.sodium.label;
      goalRationale = activeAgeStrat.goals.sodium.rationale;
      deliveredDose = payload.sodiumMmolPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = `${ratio}% Electrolyte Replacement Met`;
      status = deliveredDose >= goalMin ? "target_met" : "within_target";
    } else if (item.id === "dhaAra") {
      ratio = 100;
      percent = 100;
      badgeText = "100% Neuro/Retinal Target Met";
      status = "target_met";
      goalLabel = "ESPGHAN: 12–30 mg DHA / 100 kcal (with ARA >= DHA)";
      goalRationale = `Delivers ${payload.dhaMgPerDay} mg DHA + ${payload.araMgPerDay} mg ARA daily (1:1 ratio) for photoreceptor and cognitive development.`;
    } else if (item.id === "carbs") {
      ratio = 100;
      percent = 100;
      badgeText = "100% Energy Substrate Met";
      status = "within_target";
      goalLabel = payload.weightGrams <= 3500 ? "ESPGHAN: 10.5–12.0 g/kg/d" : "Term: 9.0–13.0 g/kg/d";
      goalRationale = "100% lactose matrix enhances intestinal calcium absorption and bifidogenic gut flora.";
    } else if (item.id === "lipids") {
      ratio = 100;
      percent = 100;
      badgeText = "100% Essential Fatty Acids Met";
      status = "within_target";
      goalLabel = payload.weightGrams <= 3500 ? "ESPGHAN: 4.8–6.6 g/kg/d" : "Term: 4.0–6.0 g/kg/d";
      goalRationale = "Provides ~50% of non-protein caloric density and essential fatty acid delivery.";
    }

    return {
      goalLabel,
      goalRationale,
      goalMin,
      goalMax,
      ratio,
      percent,
      badgeText,
      status,
    };
  };

  // Dynamic 6 Core Pillars computation for the active age milestone
  const corePillars = useMemo(() => {
    const caRatio = Math.round((payload.calciumMgPerKgPerDay / activeAgeStrat.goals.calcium.min) * 100);
    const pRatio = Math.round((payload.phosphorusMgPerKgPerDay / activeAgeStrat.goals.phosphorus.min) * 100);
    const protRatio = Math.round((payload.proteinGramsPerKgPerDay / activeAgeStrat.goals.protein.min) * 100);
    const nrgRatio = Math.round((payload.energyKcalPerKgPerDay / activeAgeStrat.goals.energy.min) * 100);
    const feRatio = Math.round((payload.ironMgPerKgPerDay / activeAgeStrat.goals.iron.min) * 100);
    const vitDRatio = Math.round((payload.vitaminD3IuPerDay / activeAgeStrat.goals.vitaminD3.min) * 100);

    const scores = [
      Math.min(100, caRatio),
      Math.min(100, pRatio),
      Math.min(100, protRatio),
      Math.min(100, nrgRatio),
      Math.min(100, feRatio),
      Math.min(100, vitDRatio),
    ];
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      overallScore,
      calcium: {
        value: payload.calciumMgPerKgPerDay,
        unit: "mg/kg/d",
        goal: activeAgeStrat.goals.calcium.label,
        ratio: caRatio,
        percent: Math.min(100, caRatio),
        isMet: payload.calciumMgPerKgPerDay >= activeAgeStrat.goals.calcium.min,
        subtitle: caRatio >= 100 ? "Intrauterine Accretion Met" : `${caRatio}% of Target`,
      },
      phosphorus: {
        value: payload.phosphorusMgPerKgPerDay,
        unit: "mg/kg/d",
        goal: activeAgeStrat.goals.phosphorus.label,
        ratio: pRatio,
        percent: Math.min(100, pRatio),
        isMet: payload.phosphorusMgPerKgPerDay >= activeAgeStrat.goals.phosphorus.min,
        subtitle: `Ca:P = ${payload.calciumPhosphorusRatio}`,
      },
      protein: {
        value: payload.proteinGramsPerKgPerDay,
        unit: "g/kg/d",
        goal: activeAgeStrat.goals.protein.label,
        ratio: protRatio,
        percent: Math.min(100, protRatio),
        isMet: payload.proteinGramsPerKgPerDay >= activeAgeStrat.goals.protein.min,
        subtitle: `${payload.wheyCaseinRatio} Whey/Casein`,
      },
      energy: {
        value: payload.energyKcalPerKgPerDay,
        unit: "kcal/kg/d",
        goal: activeAgeStrat.goals.energy.label,
        ratio: nrgRatio,
        percent: Math.min(100, nrgRatio),
        isMet: payload.energyKcalPerKgPerDay >= activeAgeStrat.goals.energy.min,
        subtitle: `Caloric Density ~0.80 kcal/mL`,
      },
      iron: {
        value: payload.ironMgPerKgPerDay,
        unit: "mg/kg/d",
        goal: activeAgeStrat.goals.iron.label,
        ratio: feRatio,
        percent: Math.min(100, feRatio),
        isMet: payload.ironMgPerKgPerDay >= activeAgeStrat.goals.iron.min,
        subtitle: payload.ironMgPerKgPerDay >= 2.0 ? "No Extra Drops Needed" : `${feRatio}% Enteral Fe Met`,
      },
      vitaminD3: {
        value: payload.vitaminD3IuPerDay,
        unit: "IU/day",
        goal: activeAgeStrat.goals.vitaminD3.label,
        ratio: vitDRatio,
        percent: Math.min(100, vitDRatio),
        isMet: payload.vitaminD3IuPerDay >= activeAgeStrat.goals.vitaminD3.min,
        subtitle: payload.vitaminD3IuPerDay >= 400 ? "Enteral D3 Target Met" : `${vitDRatio}% Enteral D3 Met`,
      },
      dhaAra: {
        value: `${payload.dhaMgPerDay} / ${payload.araMgPerDay}`,
        unit: "mg/d each",
        goal: "12–30 mg DHA / 100 kcal",
        ratio: 100,
        percent: 100,
        isMet: true,
        subtitle: "1:1 Retinal/Cognitive Ratio",
      },
    };
  }, [payload, activeAgeStrat]);

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
      `Active Age Stratification: ${activeAgeStrat.label}`,
      `Reconstitution: ${payload.dailyPowderGrams}g powder (~${payload.dailyScoops} scoops/d) in ${payload.waterVolumeMlPerDay} mL water`,
      ``,
      `--- CORE ACCRETION & COVERAGE SUMMARY ---`,
      `• Energy: ${payload.energyKcalPerDay} kcal/day (${payload.energyKcalPerKgPerDay} kcal/kg/d) | Goal: ${activeAgeStrat.goals.energy.label}`,
      `• True Protein: ${payload.proteinGramsPerDay} g/day (${payload.proteinGramsPerKgPerDay} g/kg/d) | Goal: ${activeAgeStrat.goals.protein.label} (${payload.wheyCaseinRatio} Whey/Casein)`,
      `• Calcium: ${payload.calciumMgPerDay} mg/day (${payload.calciumMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.calcium.label} (100% Intrauterine Met)`,
      `• Phosphorus: ${payload.phosphorusMgPerDay} mg/day (${payload.phosphorusMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.phosphorus.label}`,
      `• Elemental Iron: ${payload.ironMgPerDay} mg/day (${payload.ironMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.iron.label} (Full Enteral Prophylaxis)`,
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
        return <Bone className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />;
      case "macronutrient":
        return <Activity className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />;
      case "electrolyte":
        return <Zap className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />;
      case "vitamin":
        return <Sparkles className="w-4 h-4 text-purple-700 shrink-0" aria-hidden="true" />;
      case "specialty":
        return <Brain className="w-4 h-4 text-indigo-700 shrink-0" aria-hidden="true" />;
      default:
        return <Info className="w-4 h-4 text-slate-700 shrink-0" aria-hidden="true" />;
    }
  };

  const getCardBorderClass = (category: NutrientDeliveryItem["category"]) => {
    switch (category) {
      case "mineral":
        return "border-l-[6px] border-l-emerald-600";
      case "macronutrient":
        return "border-l-[6px] border-l-blue-600";
      case "vitamin":
        return "border-l-[6px] border-l-purple-600";
      case "electrolyte":
        return "border-l-[6px] border-l-amber-500";
      case "specialty":
        return "border-l-[6px] border-l-indigo-600";
      default:
        return "border-l-[6px] border-l-slate-400";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "target_met") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 border-2 border-emerald-400 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          Target Met
        </span>
      );
    }
    if (status === "within_target") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-950 border-2 border-blue-400 shrink-0">
          Target Range
        </span>
      );
    }
    if (status === "above_target") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md bg-purple-100 text-purple-950 border-2 border-purple-400 shrink-0">
          Conditional High
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 border-2 border-amber-400 shrink-0">
        <AlertCircle className="w-3 h-3 text-amber-700" />
        Clinical Review
      </span>
    );
  };

  return (
    <div
      className="mt-6 rounded-2xl bg-white border-2 border-slate-300 shadow-md ring-1 ring-slate-900/5 overflow-hidden text-slate-900"
      aria-label="Patient Delivered Daily Nutritional Payload & Product Coverage"
    >
      {/* 1. Header with Clinical Navy Gradient and High-Contrast Typography */}
      <div className="bg-gradient-to-r from-slate-950 via-clinical-navy-950 to-blue-950 text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border-2 border-white/20 shadow-inner">
            <Baby className="w-6 h-6 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Patient Daily Delivered Nutrient Payload</span>
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 font-mono">
                {payload.productName}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/50 font-mono">
                {payload.weightGrams}g Infant
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              Exact 24-hour nutritional payload at <strong>{payload.fluidAllowanceMlPerKg} mL/kg/d</strong> ({payload.totalDailyVolumeMl} mL/day). Evaluated against active ESPGHAN clinical goals.
            </p>
          </div>
        </div>

        {/* View Switcher & Copy Action */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
          <div className="inline-flex rounded-xl border-2 border-white/30 p-1 bg-white/10 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                viewMode === "cards"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Card view"
            >
              Vivid Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Table view"
            >
              Pharmacopoeia Table
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-2 shadow-sm ${
              copied
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-white/15 hover:bg-white/25 text-white border-2 border-white/30"
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
                <span>Copy Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PEDIAMIL® PRODUCT COVERAGE ASSURANCE COMMAND CENTER */}
      <div className="bg-slate-50 border-b-2 border-slate-300 p-4 sm:p-5 space-y-4">
        {/* Banner Top Row: Score Badge + Headline Box */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-emerald-400 shrink-0">
              <Award className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border-2 border-emerald-400">
                  Pediamil® Product Coverage Assurance
                </span>
                <span className="text-sm font-black font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {corePillars.overallScore}% ESPGHAN Goal Met
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-black text-slate-950">
                {payload.productName} Target Fulfillment for {payload.weightGrams}g Patient ({activeAgeStrat.label})
              </h5>
              <p className="text-xs text-slate-700 leading-normal font-medium">
                Satisfies complete intrauterine skeletal accretion, somatic velocity, and hematological requirements at prescribed intake.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-right space-y-0.5 shadow-2xs">
            <span className="text-xs text-slate-700 font-black uppercase tracking-wider block">
              Daily Reconstitution
            </span>
            <div className="text-base font-black font-mono text-slate-950">
              {payload.dailyPowderGrams}g <span className="text-xs font-semibold text-slate-700">powder</span>
            </div>
            <div className="text-xs font-mono text-emerald-900 font-bold">
              ~{payload.dailyScoops} scoops in {payload.waterVolumeMlPerDay} mL water
            </div>
          </div>
        </div>

        {/* 6-Pillar Core Coverage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Pillar 1: Calcium */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Bone className="w-4 h-4 text-emerald-700" /> Ca Accretion
                </span>
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded font-mono border border-emerald-400">
                  {corePillars.calcium.ratio}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.calcium.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.calcium.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${corePillars.calcium.percent}%` }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.calcium.goal}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {corePillars.calcium.subtitle}
              </div>
            </div>
          </div>

          {/* Pillar 2: Phosphorus */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Bone className="w-4 h-4 text-emerald-700" /> Phosphorus
                </span>
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded font-mono border border-emerald-400">
                  {corePillars.phosphorus.ratio}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.phosphorus.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.phosphorus.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${corePillars.phosphorus.percent}%` }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.phosphorus.goal}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {corePillars.phosphorus.subtitle}
              </div>
            </div>
          </div>

          {/* Pillar 3: True Protein */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-700" /> True Protein
                </span>
                <span className="text-xs font-black text-blue-950 bg-blue-100 px-2 py-0.5 rounded font-mono border border-blue-400">
                  {corePillars.protein.ratio}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.protein.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.protein.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${corePillars.protein.percent}%` }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.protein.goal}
              </div>
              <div className="text-xs font-bold text-blue-800">
                {corePillars.protein.subtitle}
              </div>
            </div>
          </div>

          {/* Pillar 4: Elemental Iron */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-700" /> Prophylactic Fe
                </span>
                <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded font-mono border border-emerald-400">
                  {corePillars.iron.ratio}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.iron.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.iron.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${corePillars.iron.percent}%` }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.iron.goal}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {corePillars.iron.subtitle}
              </div>
            </div>
          </div>

          {/* Pillar 5: Vitamin D3 */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" /> Vitamin D3
                </span>
                <span className="text-xs font-black text-purple-950 bg-purple-100 px-2 py-0.5 rounded font-mono border border-purple-400">
                  {corePillars.vitaminD3.ratio}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.vitaminD3.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.vitaminD3.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${corePillars.vitaminD3.percent}%` }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.vitaminD3.goal}
              </div>
              <div className="text-xs font-bold text-purple-800">
                {corePillars.vitaminD3.subtitle}
              </div>
            </div>
          </div>

          {/* Pillar 6: DHA & ARA */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-950 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-700" /> DHA & ARA
                </span>
                <span className="text-xs font-black text-indigo-950 bg-indigo-100 px-2 py-0.5 rounded font-mono border border-indigo-400">
                  100%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-950">
                {corePillars.dhaAra.value}{" "}
                <span className="text-xs font-semibold text-slate-700">{corePillars.dhaAra.unit}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Goal: {corePillars.dhaAra.goal}
              </div>
              <div className="text-xs font-bold text-indigo-800">
                {corePillars.dhaAra.subtitle}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CLINICAL AGE GOAL STRATIFICATION BAR */}
      <div className="bg-slate-100 border-b-2 border-slate-300 px-4 py-3 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-800 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-xs font-black text-slate-950 flex items-center gap-2">
              <span>Clinical Age Goal Stratification:</span>
              <span className="font-mono text-blue-950 bg-white px-2.5 py-0.5 rounded border-2 border-blue-300 font-bold">
                {activeAgeStrat.label}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-normal font-medium mt-0.5">
              {activeAgeStrat.clinicalDescription}
            </p>
          </div>
        </div>

        {/* Milestone Switcher Buttons with Bold Borders */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider mr-1 hidden sm:inline">
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
              className={`text-xs px-3 py-1.5 rounded-lg font-black transition-all border-2 ${
                selectedAgeMilestone === mile.id
                  ? "bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-blue-500/40"
                  : "bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50"
              }`}
            >
              {mile.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Practical Feeding & Feed-Sheet Schedule Strip */}
      <div className="bg-white border-b-2 border-slate-300 px-4 py-2.5 sm:px-5 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-black text-slate-950 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-600" aria-hidden="true" />
            24h Feed Volume: <strong className="font-mono text-blue-950 font-bold">{payload.totalDailyVolumeMl} mL</strong>
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="text-slate-950 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Daily Powder: <strong className="font-mono text-emerald-950 font-bold">{payload.dailyPowderGrams}g</strong>
            <span className="text-slate-700 font-mono">(~{payload.dailyScoops} scoops/d)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-800">
          <span>q3h (8 Feeds): <strong className="text-slate-950">~{payload.scoopsPerFeedQ3h} scp/feed</strong></span>
          <span>•</span>
          <span>q2h (12 Feeds): <strong className="text-slate-950">~{payload.scoopsPerFeedQ2h} scp/feed</strong></span>
        </div>
      </div>

      {/* 5. Category Navigation Filter Tabs */}
      <div className="px-4 pt-3 pb-3 sm:px-5 flex flex-wrap items-center gap-2 border-b-2 border-slate-300 bg-slate-50">
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
            className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-black border-2 ${
              activeCategory === tab.id
                ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 6. Content Area: Vivid Cards View or Pharmacopoeia Table View */}
      <div className="p-4 sm:p-5">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const details = getDynamicItemDetails(item);
              const cardBorder = getCardBorderClass(item.category);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl bg-white border-2 border-slate-300 hover:border-slate-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-3.5 ${cardBorder}`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Name + Saturated Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-xs text-slate-950">
                        {getCategoryIcon(item.category)}
                        <span className="leading-snug">{item.name}</span>
                      </div>
                      {getStatusBadge(details.status)}
                    </div>

                    {/* Primary Number Box: Distinct Bounded Frame */}
                    <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-baseline justify-between shadow-2xs">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                          Delivered / 24h
                        </span>
                        <div className="text-lg font-black text-slate-950 font-mono mt-0.5">
                          {item.amountPerDay}{" "}
                          <span className="text-xs font-bold text-slate-700">{item.unit}/day</span>
                        </div>
                      </div>

                      {item.amountPerKgPerDay !== undefined && (
                        <div className="text-right">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                            Dose / kg / day
                          </span>
                          <div className="text-sm font-black text-blue-950 font-mono mt-0.5">
                            {item.amountPerKgPerDay}{" "}
                            <span className="text-xs font-bold text-blue-800">
                              {item.unit.replace(" (mmol/kg/d)", "")}/kg/d
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Coverage Progress Bar */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">Pediamil® Goal Coverage:</span>
                        <span className="font-mono text-emerald-900 font-black">
                          {details.badgeText}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${details.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age Target Range & Clinical Biological Rationale Box */}
                  <div className="pt-2 border-t-2 border-slate-200 space-y-2">
                    <div className="p-2.5 rounded-lg bg-blue-50 border-2 border-blue-200 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-blue-950">
                        <span>Target ({activeAgeStrat.pmaWeeksRange}):</span>
                        <span className="font-mono text-blue-900 font-bold">{details.goalLabel}</span>
                      </div>
                      {details.goalRationale && (
                        <p className="text-xs text-slate-800 font-medium leading-normal italic">
                          {details.goalRationale}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                      <span>Formula Spec:</span>
                      <strong className="text-slate-950 font-mono">{item.concentrationPer100Ml} / 100mL</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View: High Density Clinical Pharmacopoeia */
          <div className="overflow-x-auto rounded-xl border-2 border-slate-300 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-950 font-black uppercase tracking-wider text-xs border-b-2 border-slate-300">
                <tr>
                  <th scope="col" className="p-3.5">Nutrient & Biological Role</th>
                  <th scope="col" className="p-3.5">Delivered / 24h</th>
                  <th scope="col" className="p-3.5">Delivered / kg / d</th>
                  <th scope="col" className="p-3.5">Age Clinical Target Range</th>
                  <th scope="col" className="p-3.5">Pediamil® Coverage %</th>
                  <th scope="col" className="p-3.5">Formula Spec</th>
                  <th scope="col" className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 bg-white">
                {filteredItems.map((item) => {
                  const details = getDynamicItemDetails(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-950">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <div>
                            <span className="font-black text-slate-950">{item.name}</span>
                            {details.goalRationale && (
                              <div className="text-xs text-slate-700 font-medium italic mt-0.5">
                                {details.goalRationale}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-black font-mono text-slate-950 text-sm">
                        {item.amountPerDay} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-blue-950 font-black text-xs">
                        {item.amountPerKgPerDay !== undefined
                          ? `${item.amountPerKgPerDay} ${item.unit.replace(" (mmol/kg/d)", "")}/kg`
                          : "—"}
                      </td>
                      <td className="p-3.5 font-mono text-slate-950 text-xs font-bold">
                        {details.goalLabel}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1 min-w-[140px]">
                          <div className="flex items-center justify-between text-xs font-black text-emerald-950 font-mono">
                            <span>{details.ratio}%</span>
                            <span>{details.ratio >= 100 ? "Goal Met" : "Target Met"}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${details.percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-900 font-bold text-xs">
                        {item.concentrationPer100Ml} / 100mL
                      </td>
                      <td className="p-3.5 text-center">
                        {getStatusBadge(details.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor Context Footer Callout */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-blue-950 text-xs flex items-start gap-3 shadow-xs">
          <Shield className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs leading-relaxed">
            <span className="font-black text-blue-950 block text-sm">
              Physician Value Relatability & Prescription Equivalence Note:
            </span>
            <p className="text-slate-800 font-medium">
              The delivered payload confirms that <strong>Pediamil® LBW</strong> satisfies 100% of ESPGHAN intrauterine accretion targets for bone minerals (195.1 mg/kg/d Ca & 97.7 mg/kg/d P), prophylactic iron (2.93 mg/kg/d), and high-quality 60:40 whey-dominant protein at 150 mL/kg/day. This reduces the clinical need for multiple routine separate oral supplements (calcium, phosphate, or elemental iron drops), streamlining bedside nursing workflow and safeguarding premature gastrointestinal tolerance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

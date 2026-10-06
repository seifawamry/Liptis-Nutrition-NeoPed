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
  AlertCircle,
  Calculator,
  ArrowRight,
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
  const [showMathBridge, setShowMathBridge] = useState(true);

  // Doctor interactive age stratification milestone switcher
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

  // Factors that link doctor inputs to final calculations
  const dailyVolumeFactor = (payload.totalDailyVolumeMl / 100).toFixed(2);
  const normalizedFluidFactor = (payload.fluidAllowanceMlPerKg / 100).toFixed(2);

  // Dynamic coverage calculation helper based on active age stratification
  const getDynamicItemDetails = (item: NutrientDeliveryItem) => {
    let goalLabel = item.clinicalTarget || "Standard Reference";
    let goalRationale = item.clinicalInterpretation || "";
    let goalMin = 0;
    let goalMax = 0;
    let deliveredDose = item.amountPerKgPerDay ?? item.amountPerDay;
    let ratio = item.coverageRatio ?? 100;
    let percent = item.coveragePercent ?? 100;
    let badgeText = item.coverageBadge || "Target Met";
    let status: "target_met" | "within_target" | "below_target" | "above_target" = "within_target";

    if (item.id === "calcium" && activeAgeStrat.goals.calcium) {
      goalMin = activeAgeStrat.goals.calcium.min;
      goalMax = activeAgeStrat.goals.calcium.max;
      goalLabel = activeAgeStrat.goals.calcium.label;
      goalRationale = activeAgeStrat.goals.calcium.rationale;
      deliveredDose = payload.calciumMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Intrauterine Accretion` : `${ratio}% Accretion Target`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "phosphorus" && activeAgeStrat.goals.phosphorus) {
      goalMin = activeAgeStrat.goals.phosphorus.min;
      goalMax = activeAgeStrat.goals.phosphorus.max;
      goalLabel = activeAgeStrat.goals.phosphorus.label;
      goalRationale = activeAgeStrat.goals.phosphorus.rationale;
      deliveredDose = payload.phosphorusMgPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Bone Target Met` : `${ratio}% Target Met`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "protein" && activeAgeStrat.goals.protein) {
      goalMin = activeAgeStrat.goals.protein.min;
      goalMax = activeAgeStrat.goals.protein.max;
      goalLabel = activeAgeStrat.goals.protein.label;
      goalRationale = activeAgeStrat.goals.protein.rationale;
      deliveredDose = payload.proteinGramsPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? `${ratio}% Protein Target Met` : `${ratio}% Target Met`;
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
      badgeText = ratio >= 100 ? `${ratio}% Energy Goal Met` : `${ratio}% Goal Met`;
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
      badgeText = ratio >= 100 ? `${ratio}% Prophylactic Fe Met` : `${ratio}% Iron Goal Met`;
      status = deliveredDose >= goalMin ? "target_met" : "below_target";
    } else if (item.id === "vitaminD3" && activeAgeStrat.goals.vitaminD3) {
      goalMin = activeAgeStrat.goals.vitaminD3.min;
      goalMax = activeAgeStrat.goals.vitaminD3.max;
      goalLabel = activeAgeStrat.goals.vitaminD3.label;
      goalRationale = activeAgeStrat.goals.vitaminD3.rationale;
      deliveredDose = payload.vitaminD3IuPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = ratio >= 100 ? "100% Enteral D3 Met" : `${ratio}% Enteral D3 Met`;
      status = deliveredDose >= goalMin ? "target_met" : "within_target";
    } else if (item.id === "sodium" && activeAgeStrat.goals.sodium) {
      goalMin = activeAgeStrat.goals.sodium.min;
      goalMax = activeAgeStrat.goals.sodium.max;
      goalLabel = activeAgeStrat.goals.sodium.label;
      goalRationale = activeAgeStrat.goals.sodium.rationale;
      deliveredDose = payload.sodiumMmolPerKgPerDay;
      ratio = Math.round((deliveredDose / goalMin) * 100);
      percent = Math.min(100, ratio);
      badgeText = `${ratio}% Electrolyte Target`;
      status = deliveredDose >= goalMin ? "target_met" : "within_target";
    } else if (item.id === "dha") {
      const minDha = 30;
      const maxDha = 65;
      deliveredDose = payload.dhaMgPerKgPerDay;
      ratio = Math.round((deliveredDose / minDha) * 100);
      percent = Math.min(100, ratio);
      status = deliveredDose >= minDha && deliveredDose <= maxDha ? "within_target" : deliveredDose < minDha ? "below_target" : "above_target";
      badgeText = deliveredDose >= minDha && deliveredDose <= maxDha ? "Within Target Range" : deliveredDose < minDha ? "Below Target Range" : "Above Target Range";
      goalLabel = "ESPGHAN 2022: 30–65 mg/kg/d (or 12–30 mg/100 kcal)";
      goalRationale = `Delivers ${payload.dhaMgPerDay} mg/day (${payload.dhaMgPerKgPerDay} mg/kg/d). Structural LCPUFA for photoreceptor membrane differentiation and cognitive maturation.`;
    } else if (item.id === "ara") {
      const minAra = 30;
      const maxAra = 100;
      deliveredDose = payload.araMgPerKgPerDay;
      ratio = Math.round((deliveredDose / minAra) * 100);
      percent = Math.min(100, ratio);
      status = deliveredDose >= minAra && deliveredDose <= maxAra ? "within_target" : deliveredDose < minAra ? "below_target" : "above_target";
      badgeText = deliveredDose >= minAra && deliveredDose <= maxAra ? "Within Target Range" : deliveredDose < minAra ? "Below Target Range" : "Above Target Range";
      goalLabel = "ESPGHAN 2022: 30–100 mg/kg/d";
      goalRationale = `Delivers ${payload.araMgPerDay} mg/day (${payload.araMgPerKgPerDay} mg/kg/d). Critical omega-6 constituent for neurogenesis and vascular tone.`;
    } else if (item.id === "araDhaRatio") {
      ratio = 100;
      percent = 100;
      status = payload.araDhaRatio >= 0.5 && payload.araDhaRatio <= 2.0 ? "within_target" : "above_target";
      badgeText = payload.araDhaRatio >= 0.5 && payload.araDhaRatio <= 2.0 ? "Within Reference (0.5–2:1)" : "Outside Reference";
      goalLabel = "ESPGHAN 2022: 0.5:1 to 2.0:1";
      goalRationale = `Calculated formula ratio is ${payload.araDhaRatioFormatted}. Balanced physiological ratio prevents competitive displacement in neural tissue.`;
    } else if (item.id === "carbs") {
      const minCarbs = payload.weightGrams <= 3500 ? 11.0 : 9.0;
      const maxCarbs = payload.weightGrams <= 3500 ? 15.0 : 13.0;
      deliveredDose = payload.carbsGramsPerKgPerDay;
      ratio = Math.round((deliveredDose / minCarbs) * 100);
      percent = Math.min(100, ratio);
      status = deliveredDose >= minCarbs && deliveredDose <= maxCarbs ? "within_target" : deliveredDose < minCarbs ? "below_target" : "above_target";
      badgeText = deliveredDose >= minCarbs && deliveredDose <= maxCarbs ? "Within Target Range" : deliveredDose < minCarbs ? "Below Target Range" : "Above Target Range";
      goalLabel = payload.weightGrams <= 3500 ? "ESPGHAN 2022: 11.0–15.0 g/kg/d" : "Term: 9.0–13.0 g/kg/d";
      goalRationale = payload.weightGrams <= 3500
        ? "ESPGHAN 2022 preterm recommended range: 11–15 g/kg/day. 100% lactose matrix enhances intestinal calcium absorption and bifidogenic flora."
        : "Standard infant carbohydrate intake for mature digestion.";
    } else if (item.id === "lipids") {
      const minLipids = payload.weightGrams <= 3500 ? 4.8 : 4.0;
      const maxLipids = payload.weightGrams <= 3500 ? 8.1 : 6.0;
      deliveredDose = payload.fatGramsPerKgPerDay;
      ratio = Math.round((deliveredDose / minLipids) * 100);
      percent = Math.min(100, ratio);
      status = deliveredDose >= minLipids && deliveredDose <= maxLipids ? "within_target" : deliveredDose < minLipids ? "below_target" : "above_target";
      badgeText = deliveredDose >= minLipids && deliveredDose <= maxLipids ? "Within Target Range" : deliveredDose < minLipids ? "Below Target Range" : "Above Target Range";
      goalLabel = payload.weightGrams <= 3500 ? "ESPGHAN 2022: 4.8–8.1 g/kg/d" : "Term: 4.0–6.0 g/kg/d";
      goalRationale = payload.weightGrams <= 3500
        ? "ESPGHAN 2022 recommended range: 4.8–8.1 g/kg/day total fat providing ~50% non-protein calories and essential fatty acids."
        : "Standard term lipid intake supporting somatic growth and fat-soluble vitamin absorption.";
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
    const dhaRatio = Math.round((payload.dhaMgPerKgPerDay / 30) * 100);

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
        subtitle: caRatio >= 100 ? "Accretion Target Met" : `${caRatio}% of Target`,
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
        subtitle: `~0.80 kcal/mL`,
      },
      iron: {
        value: payload.ironMgPerKgPerDay,
        unit: "mg/kg/d",
        goal: activeAgeStrat.goals.iron.label,
        ratio: feRatio,
        percent: Math.min(100, feRatio),
        isMet: payload.ironMgPerKgPerDay >= activeAgeStrat.goals.iron.min,
        subtitle: payload.ironMgPerKgPerDay >= 2.0 ? "Enteral Prophylactic Dose" : `${feRatio}% Enteral Fe`,
      },
      vitaminD3: {
        value: payload.vitaminD3IuPerDay,
        unit: "IU/day",
        goal: activeAgeStrat.goals.vitaminD3.label,
        ratio: vitDRatio,
        percent: Math.min(100, vitDRatio),
        isMet: payload.vitaminD3IuPerDay >= activeAgeStrat.goals.vitaminD3.min,
        subtitle: payload.vitaminD3IuPerDay >= 400 ? "Enteral D3 Target Met" : `${vitDRatio}% Enteral D3`,
      },
      dhaAra: {
        value: `${payload.dhaMgPerKgPerDay} / ${payload.araMgPerKgPerDay}`,
        unit: "mg/kg/d",
        goal: "DHA: 30–65, ARA: 30–100 mg/kg/d",
        ratio: dhaRatio,
        percent: Math.min(100, dhaRatio),
        isMet: payload.dhaMgPerKgPerDay >= 30,
        subtitle: `ARA:DHA Ratio ${payload.araDhaRatioFormatted}`,
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
      `• Calcium: ${payload.calciumMgPerDay} mg/day (${payload.calciumMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.calcium.label}`,
      `• Phosphorus: ${payload.phosphorusMgPerDay} mg/day (${payload.phosphorusMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.phosphorus.label}`,
      `• Elemental Iron: ${payload.ironMgPerDay} mg/day (${payload.ironMgPerKgPerDay} mg/kg/d) | Goal: ${activeAgeStrat.goals.iron.label}`,
      `• Vitamin D3: ${payload.vitaminD3IuPerDay} IU/day | Goal: ${activeAgeStrat.goals.vitaminD3.label}`,
      `• DHA & ARA: ${payload.dhaMgPerDay} mg DHA + ${payload.araMgPerDay} mg ARA per day (${payload.araDhaRatioFormatted} Ratio)`,
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
        return "border-l-4 border-l-emerald-600";
      case "macronutrient":
        return "border-l-4 border-l-blue-600";
      case "vitamin":
        return "border-l-4 border-l-purple-600";
      case "electrolyte":
        return "border-l-4 border-l-amber-500";
      case "specialty":
        return "border-l-4 border-l-indigo-600";
      default:
        return "border-l-4 border-l-slate-400";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "target_met" || status === "within_target") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          Target Met
        </span>
      );
    }
    if (status === "above_target") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 border border-purple-400 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-purple-700 shrink-0" />
          Above Range
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400 shrink-0">
        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        Below Range
      </span>
    );
  };

  return (
    <div
      className="rounded-2xl bg-white border-2 border-slate-300 shadow-md ring-1 ring-slate-900/5 overflow-hidden text-slate-900"
      aria-label="Patient Delivered Daily Nutritional Payload & Product Coverage"
    >
      {/* 1. Header with Clinical Navy Gradient and High-Contrast Typography */}
      <div className="bg-gradient-to-r from-slate-950 via-clinical-navy-950 to-blue-950 text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20 shadow-inner">
            <Baby className="w-6 h-6 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Patient Daily Delivered Nutrient Payload</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 font-mono">
                {payload.productName}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/50 font-mono">
                {payload.weightGrams}g Infant
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-normal">
              Calculated 24-hour enteral accretion at <strong>{payload.fluidAllowanceMlPerKg} mL/kg/d</strong> ({payload.totalDailyVolumeMl} mL/day). Evaluated against authoritative ESPGHAN 2022 clinical goals.
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="inline-flex rounded-xl border border-white/30 p-1 bg-white/10 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
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
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
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
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm ${
              copied
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/30"
            }`}
            aria-label="Copy delivered nutrient calculations to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-200" aria-hidden="true" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. DOCTOR CALCULATION FORMULA & INPUT RESONATION BRIDGE */}
      <div className="bg-slate-50 border-b-2 border-slate-300 p-4 sm:p-5 space-y-4">
        {/* Input Bridge Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center border border-blue-300 shrink-0">
                <Calculator className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <span>Doctor Calculation Formula & Input Resonation Bridge</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                    Deterministic Math
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Every delivered nutrient is calculated directly from your entered patient parameters and the verified product specification.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMathBridge(!showMathBridge)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 self-start md:self-auto"
            >
              {showMathBridge ? "Hide Formula Derivatives" : "Show Formula Derivatives"}
            </button>
          </div>

          {showMathBridge && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Step 1: Volume Calculation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
                  1. Prescribed 24h Feed Volume
                </span>
                <div className="font-mono text-xs text-slate-900 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Patient Weight:</span>
                    <strong>{payload.weightGrams}g ({payload.weightKg.toFixed(3)} kg)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fluid Allowance:</span>
                    <strong>{payload.fluidAllowanceMlPerKg} mL/kg/day</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-blue-950 font-black">
                    <span>Total Daily Volume:</span>
                    <span className="text-sm">{payload.totalDailyVolumeMl} mL/day</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Product Multipliers */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
                  2. Exact Concentration Multipliers
                </span>
                <div className="font-mono text-xs text-slate-900 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>24h Absolute Multiplier:</span>
                    <strong className="text-emerald-800">{dailyVolumeFactor}× per 100 mL</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dose /kg/day Multiplier:</span>
                    <strong className="text-blue-800">{normalizedFluidFactor}× per 100 mL</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-slate-950 font-black">
                    <span>Powder Density (15%):</span>
                    <span className="text-sm">{payload.dailyPowderGrams}g (~{payload.dailyScoops} scp)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Clinician Verification Formula */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-900 block">
                  3. Verified Clinical Derivative
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                  • <strong>Delivered 24h:</strong> <span className="font-mono">({payload.totalDailyVolumeMl} ÷ 100) × Conc. /100mL</span>
                  <br />
                  • <strong>Delivered /kg/d:</strong> <span className="font-mono">({payload.fluidAllowanceMlPerKg} ÷ 100) × Conc. /100mL</span>
                </p>
                <div className="pt-1 border-t border-blue-200 flex items-center justify-between text-[11px] font-mono text-blue-950 font-bold">
                  <span>Pediamil® LBW Matrix:</span>
                  <span>79.7 kcal & 2.42g Prot / 100mL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6-Pillar Core Coverage Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" />
              6 Core Clinical Accretion Pillars ({activeAgeStrat.label})
            </span>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">
              {corePillars.overallScore}% Overall Alignment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Pillar 1: Calcium */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Bone className="w-3.5 h-3.5 text-emerald-700" /> Calcium
                  </span>
                  <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded font-mono border border-emerald-300">
                    {corePillars.calcium.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.calcium.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.calcium.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.calcium.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.calcium.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-center">
                  {corePillars.calcium.subtitle}
                </div>
              </div>
            </div>

            {/* Pillar 2: Phosphorus */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Bone className="w-3.5 h-3.5 text-emerald-700" /> Phosphorus
                  </span>
                  <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded font-mono border border-emerald-300">
                    {corePillars.phosphorus.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.phosphorus.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.phosphorus.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.phosphorus.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.phosphorus.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-center">
                  {corePillars.phosphorus.subtitle}
                </div>
              </div>
            </div>

            {/* Pillar 3: True Protein */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-700" /> Protein
                  </span>
                  <span className="text-xs font-black text-blue-950 bg-blue-100 px-1.5 py-0.5 rounded font-mono border border-blue-300">
                    {corePillars.protein.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.protein.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.protein.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.protein.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.protein.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-300 text-center">
                  {corePillars.protein.subtitle}
                </div>
              </div>
            </div>

            {/* Pillar 4: Energy */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-700" /> Energy
                  </span>
                  <span className="text-xs font-black text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded font-mono border border-amber-300">
                    {corePillars.energy.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.energy.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.energy.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.energy.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.energy.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-center">
                  {corePillars.energy.subtitle}
                </div>
              </div>
            </div>

            {/* Pillar 5: Elemental Iron */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" /> Iron (Fe)
                  </span>
                  <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded font-mono border border-emerald-300">
                    {corePillars.iron.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.iron.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.iron.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.iron.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.iron.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-center">
                  {corePillars.iron.subtitle}
                </div>
              </div>
            </div>

            {/* Pillar 6: Vitamin D3 */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-sm space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Vit D3
                  </span>
                  <span className="text-xs font-black text-purple-950 bg-purple-100 px-1.5 py-0.5 rounded font-mono border border-purple-300">
                    {corePillars.vitaminD3.ratio}%
                  </span>
                </div>
                <div className="text-base font-black font-mono text-slate-950">
                  {corePillars.vitaminD3.value}{" "}
                  <span className="text-xs font-medium text-slate-600">{corePillars.vitaminD3.unit}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${corePillars.vitaminD3.percent}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Target Range:</span>
                  <span className="font-mono text-slate-950 font-bold">{corePillars.vitaminD3.goal}</span>
                </div>
                <div className="text-[10px] font-bold text-purple-950 bg-purple-100 px-2 py-0.5 rounded border border-purple-300 text-center">
                  {corePillars.vitaminD3.subtitle}
                </div>
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
              <span className="font-mono text-blue-950 bg-white px-2.5 py-0.5 rounded border border-blue-300 font-bold">
                {activeAgeStrat.label}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-normal font-medium mt-0.5">
              {activeAgeStrat.clinicalDescription}
            </p>
          </div>
        </div>

        {/* Milestone Switcher Buttons */}
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
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${
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
          <span className="font-bold text-slate-950 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-600" aria-hidden="true" />
            24h Feed Volume: <strong className="font-mono text-blue-950">{payload.totalDailyVolumeMl} mL</strong>
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="text-slate-950 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Daily Powder: <strong className="font-mono text-emerald-950">{payload.dailyPowderGrams}g</strong>
            <span className="text-slate-600 font-mono">(~{payload.dailyScoops} scoops/d in {payload.waterVolumeMlPerDay} mL water)</span>
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
            className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold border ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const details = getDynamicItemDetails(item);
              const cardBorder = getCardBorderClass(item.category);

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${cardBorder}`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Category Bar & Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(details.status)}
                      </div>
                    </div>

                    {/* Nutrient Title & Concentration Spec (Full Width, Zero Collision) */}
                    <div>
                      <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug">
                        {item.name}
                      </h4>
                      <div className="text-xs font-mono text-slate-600 mt-1">
                        Product Concentration: <strong className="text-slate-950 font-bold">{item.concentrationPer100Ml} / 100mL</strong>
                      </div>
                    </div>

                    {/* Primary Number Box: Clean 2-column subgrid */}
                    <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-600 block">
                            24h Delivered Dose
                          </span>
                          <div className="text-base font-black text-slate-950 font-mono mt-0.5">
                            {item.amountPerDay}{" "}
                            <span className="text-xs font-bold text-slate-700">{item.unit}/day</span>
                          </div>
                        </div>

                        {item.amountPerKgPerDay !== undefined && (
                          <div className="text-right">
                            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-600 block">
                              Normalized Dose
                            </span>
                            <div className="text-base font-black text-blue-950 font-mono mt-0.5">
                              {item.amountPerKgPerDay}{" "}
                              <span className="text-xs font-bold text-blue-800">
                                {item.unit.replace(" (mmol/kg/d)", "")}/kg/d
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* For electrolytes & minerals with molar units */}
                      {(item.mmolPerDay !== undefined || item.mmolPerKgPerDay !== undefined) && (
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono text-purple-950 gap-1.5">
                          <span className="font-bold text-slate-700">Electrolyte Molar Rate:</span>
                          <strong className="bg-purple-100/80 px-2 py-0.5 rounded border border-purple-300 font-black">
                            {item.mmolPerDay} mmol/d ({item.mmolPerKgPerDay} mmol/kg/d)
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Product Coverage Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-1.5">
                        <span className="text-slate-800 text-xs font-bold">Coverage Evaluation:</span>
                        <span className="font-mono text-emerald-950 font-black text-xs bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          {details.badgeText}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${details.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinical Target Range Box (Isolated White Card inside Blue Enclosure, Zero Overlap) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/90 border-2 border-blue-300 space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-950">
                          Target Range ({activeAgeStrat.pmaWeeksRange})
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-300 font-mono">
                          ESPGHAN
                        </span>
                      </div>
                      <div className="font-mono font-black text-blue-950 text-xs bg-white p-2.5 rounded-lg border-2 border-blue-300 shadow-2xs leading-relaxed">
                        {details.goalLabel}
                      </div>
                    </div>
                    {details.goalRationale && (
                      <div className="pt-2 border-t border-blue-200 text-xs text-slate-900 leading-relaxed font-sans">
                        <strong className="text-slate-950 font-black block mb-0.5">Clinical Rationale:</strong>
                        <span className="font-medium text-slate-800">{details.goalRationale}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View: High Density Clinical Pharmacopoeia */
          <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-950 font-bold uppercase tracking-wider text-xs border-b border-slate-300">
                <tr>
                  <th scope="col" className="p-3.5">Nutrient & Biological Role</th>
                  <th scope="col" className="p-3.5">Formula Spec</th>
                  <th scope="col" className="p-3.5">Delivered / 24h</th>
                  <th scope="col" className="p-3.5">Delivered / kg / d</th>
                  <th scope="col" className="p-3.5">Molar Rate</th>
                  <th scope="col" className="p-3.5">ESPGHAN Target Range</th>
                  <th scope="col" className="p-3.5 text-center">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredItems.map((item) => {
                  const details = getDynamicItemDetails(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-950 max-w-xs">
                        <div className="flex items-start gap-2">
                          {getCategoryIcon(item.category)}
                          <div>
                            <span className="font-bold text-slate-950 block">{item.name}</span>
                            {details.goalRationale && (
                              <div className="text-[11px] text-slate-600 font-normal leading-tight mt-0.5">
                                {details.goalRationale}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 text-xs whitespace-nowrap">
                        {item.concentrationPer100Ml} / 100mL
                      </td>
                      <td className="p-3.5 font-bold font-mono text-slate-950 text-xs whitespace-nowrap">
                        {item.amountPerDay} {item.unit}/d
                      </td>
                      <td className="p-3.5 font-mono text-blue-950 font-bold text-xs whitespace-nowrap">
                        {item.amountPerKgPerDay !== undefined
                          ? `${item.amountPerKgPerDay} ${item.unit.replace(" (mmol/kg/d)", "")}/kg/d`
                          : "—"}
                      </td>
                      <td className="p-3.5 font-mono text-purple-950 text-xs whitespace-nowrap">
                        {item.mmolPerKgPerDay !== undefined
                          ? `${item.mmolPerKgPerDay} mmol/kg/d`
                          : "—"}
                      </td>
                      <td className="p-3.5 font-mono text-slate-900 text-xs max-w-xs">
                        {details.goalLabel}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
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
        <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 text-xs flex items-start gap-3 shadow-xs">
          <Shield className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs leading-relaxed">
            <span className="font-bold text-blue-950 block text-sm">
              Physician Clinical Decision Support & Reference Comparison Note:
            </span>
            <p className="text-slate-800 font-medium">
              The delivered payload demonstrates that <strong>Pediamil® LBW</strong> at the entered volume delivers bone minerals ({payload.calciumMgPerKgPerDay} mg/kg/d Ca & {payload.phosphorusMgPerKgPerDay} mg/kg/d P), enteral iron ({payload.ironMgPerKgPerDay} mg/kg/d), and 60:40 whey:casein protein within ESPGHAN 2022 preterm enteral recommendation horizons. Product nutrient values are manufacturer-specific and must be verified against current batch labeling. Total nutrient intake, individual clinical tolerance, and laboratory monitoring must guide bedside clinical care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

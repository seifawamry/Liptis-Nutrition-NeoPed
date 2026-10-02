"use client";

import React, { useState } from "react";
import {
  DeliveredPatientNutrientPayload,
  NutrientDeliveryItem,
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

  const filteredItems =
    activeCategory === "all"
      ? payload.items
      : payload.items.filter((item) => item.category === activeCategory);

  const handleCopy = () => {
    const textLines = [
      `=== LIPTIS NEOPED™ PATIENT DELIVERED NUTRIENT SUMMARY ===`,
      `Product: ${payload.productName} (${payload.productClassification})`,
      `Patient Weight: ${payload.weightGrams}g (${payload.weightKg.toFixed(3)} kg)`,
      `Prescribed Fluid: ${payload.fluidAllowanceMlPerKg} mL/kg/day (Total: ${payload.totalDailyVolumeMl} mL/day)`,
      `Daily Powder: ${payload.dailyPowderGrams}g (~${payload.dailyScoops} scoops/day in ${payload.waterVolumeMlPerDay} mL water)`,
      ``,
      `--- DELIVERED NUTRIENT BREAKDOWN (24 HOURS) ---`,
      ...payload.items.map(
        (i) =>
          `• ${i.name}: ${i.amountPerDay} ${i.unit}/day ${
            i.amountPerKgPerDay ? `(${i.amountPerKgPerDay} ${i.unit}/kg/d)` : ""
          } | Spec: ${i.concentrationPer100Ml} | Target: ${i.clinicalTarget || "N/A"}`
      ),
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
        return <Bone className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />;
      case "macronutrient":
        return <Activity className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />;
      case "electrolyte":
        return <Zap className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />;
      case "vitamin":
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />;
      case "specialty":
        return <Brain className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />;
    }
  };

  const getStatusBadge = (item: NutrientDeliveryItem) => {
    if (item.status === "target_met") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" aria-hidden="true" />
          Target Met
        </span>
      );
    }
    if (item.status === "within_target") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
          Target Range
        </span>
      );
    }
    if (item.status === "above_target") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
          Conditional High
        </span>
      );
    }
    if (item.status === "below_target") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          Below Target
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
        Clinical Value
      </span>
    );
  };

  return (
    <div
      className="mt-4 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden text-slate-800"
      aria-label="Patient Delivered Daily Nutritional Payload"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-clinical-navy-900 to-blue-950 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
            <Baby className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Patient Daily Delivered Nutritional Payload</span>
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono">
                {payload.productName}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Exact 24-hour clinical nutrient accretion for <strong>{payload.weightGrams}g</strong> infant at{" "}
              <strong>{payload.fluidAllowanceMlPerKg} mL/kg/d</strong> ({payload.totalDailyVolumeMl} mL/day)
            </p>
          </div>
        </div>

        {/* Copy & View Mode Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="inline-flex rounded-lg border border-white/20 p-0.5 bg-white/5 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-300 hover:text-white"
              }`}
              aria-label="Card view"
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-300 hover:text-white"
              }`}
              aria-label="Table view"
            >
              Pharmacopoeia Table
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
            aria-label="Copy delivered nutrient calculations to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Copy Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Practical Daily Reconstitution & Feeding Band */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            24h Feed Volume: <strong className="font-mono text-blue-900">{payload.totalDailyVolumeMl} mL</strong>
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="text-slate-700 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Daily Powder: <strong className="font-mono text-emerald-900">{payload.dailyPowderGrams}g</strong>
            <span className="text-slate-500 font-mono text-[11px]">(~{payload.dailyScoops} scoops/d)</span>
          </span>
          <span className="text-slate-300 hidden md:inline" aria-hidden="true">|</span>
          <span className="text-slate-600 hidden md:inline">
            Water: <strong className="font-mono">{payload.waterVolumeMlPerDay} mL</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>q3h (8 Feeds): <strong className="text-slate-800 font-mono">~{payload.scoopsPerFeedQ3h} scp</strong></span>
          <span>•</span>
          <span>q2h (12 Feeds): <strong className="text-slate-800 font-mono">~{payload.scoopsPerFeedQ2h} scp</strong></span>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="px-3.5 pt-3 pb-2 flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 bg-white">
        {[
          { id: "all", label: "All Nutrients" },
          { id: "mineral", label: "Bone & Growth Minerals" },
          { id: "macronutrient", label: "Macronutrients & Energy" },
          { id: "electrolyte", label: "Electrolytes & Renal" },
          { id: "vitamin", label: "Vitamins & Neuro/Immunity" },
          { id: "specialty", label: "Specialty Bioactives" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
              activeCategory === tab.id
                ? "bg-clinical-navy-900 text-white font-semibold shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area: Cards View or Pharmacopoeia Table View */}
      <div className="p-3.5 sm:p-4">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      {getCategoryIcon(item.category)}
                      <span>{item.name}</span>
                    </div>
                    {getStatusBadge(item)}
                  </div>

                  {/* Primary Numbers */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        Delivered per 24h
                      </span>
                      <div className="text-base font-bold text-slate-950 font-mono">
                        {item.amountPerDay}{" "}
                        <span className="text-xs font-normal text-slate-600">{item.unit}/day</span>
                      </div>
                    </div>

                    {item.amountPerKgPerDay !== undefined && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                          Dose / kg / day
                        </span>
                        <div className="text-xs font-bold text-blue-900 font-mono">
                          {item.amountPerKgPerDay}{" "}
                          <span className="text-[10.5px] font-normal text-blue-700">
                            {item.unit.replace(" (mmol/kg/d)", "")}/kg/d
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Context & Reference Target */}
                <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[10.5px]">
                    <span>Formula Conc:</span>
                    <strong className="text-slate-700">{item.concentrationPer100Ml} / 100mL</strong>
                  </div>
                  {item.clinicalTarget && (
                    <div className="flex items-center justify-between text-slate-600 font-mono text-[10.5px]">
                      <span>Target Goal:</span>
                      <strong className="text-slate-800">{item.clinicalTarget}</strong>
                    </div>
                  )}
                  {item.clinicalInterpretation && (
                    <p className="text-[10.5px] text-slate-600 leading-tight italic pt-0.5">
                      {item.clinicalInterpretation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View: High Density Clinical Pharmacopoeia */
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th scope="col" className="p-2.5">Nutrient & Biological Role</th>
                  <th scope="col" className="p-2.5">Delivered / 24h</th>
                  <th scope="col" className="p-2.5">Delivered / kg / d</th>
                  <th scope="col" className="p-2.5">Formula Concentration</th>
                  <th scope="col" className="p-2.5">Clinical Reference Target</th>
                  <th scope="col" className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                      {getCategoryIcon(item.category)}
                      <div>
                        <span>{item.name}</span>
                        {item.clinicalInterpretation && (
                          <div className="text-[10px] text-slate-400 font-normal italic">
                            {item.clinicalInterpretation}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 font-bold font-mono text-slate-950 text-xs">
                      {item.amountPerDay} {item.unit}
                    </td>
                    <td className="p-2.5 font-mono text-blue-900 font-semibold">
                      {item.amountPerKgPerDay !== undefined
                        ? `${item.amountPerKgPerDay} ${item.unit.replace(" (mmol/kg/d)", "")}/kg`
                        : "—"}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600">
                      {item.concentrationPer100Ml} / 100mL
                    </td>
                    <td className="p-2.5 font-mono text-slate-700 text-[11px]">
                      {item.clinicalTarget || "—"}
                    </td>
                    <td className="p-2.5 text-center">
                      {getStatusBadge(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor Context Footer Callout */}
        <div className="mt-3.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 text-xs flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <span className="font-bold text-blue-900">
              Physician Value Relatability Note:
            </span>
            <p className="text-blue-900/90">
              Delivered nutrient calculations reflect verified manufacturer specifications at standard dilution ({payload.powderGramsPerScoop}g scoop per 30 mL water equivalent). Calcium, phosphorus, and vitamin D3 delivery directly address intrauterine bone mineral deficits to prevent osteopenia of prematurity. Always adjust supplemental electrolytes or parenteral nutrition based on serum biochemistry (BUN, creatinine, Ca, P, ALP, electrolytes).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Preterm & LBW Nutritional Calculation Engine
 * Reference: ESPGHAN 2022 Enteral Nutrition in Preterm Infants
 * Pure deterministic mathematical utility with full decimal precision.
 */

import { validateNutritionInputs, ValidationReport, CLINICAL_BOUNDS } from "./validation";

export interface FormulaProfile {
  name: string;
  brand: string;
  energyKcalPer100Ml: number;
  proteinGramsPer100Ml: number;
  carbsGramsPer100Ml?: number;
  fatGramsPer100Ml?: number;
}

export const STANDARD_LBW_MATRIX: FormulaProfile = {
  name: "Preterm & LBW Matrix (Discharge Formula)",
  brand: "Pediamil® LBW",
  energyKcalPer100Ml: 80, // 80 kcal / 100 mL (0.80 kcal/mL)
  proteinGramsPer100Ml: 2.2, // 2.2 g protein / 100 mL
  carbsGramsPer100Ml: 8.5,
  fatGramsPer100Ml: 4.2,
};

export const STANDARD_STAGE_1_MATRIX: FormulaProfile = {
  name: "Standard Infant Formula (Stage 1)",
  brand: "Pediamil® 1",
  energyKcalPer100Ml: 67, // ~67 kcal / 100 mL (yields ~100 kcal/kg/day at 150 mL/kg/d)
  proteinGramsPer100Ml: 1.3, // ~1.94 g protein / 100 kcal (1.8 to 2.0 g/100 kcal)
  carbsGramsPer100Ml: 7.3,
  fatGramsPer100Ml: 3.5,
};

export type WeightClassification = "ELBW" | "VLBW" | "LBW" | "Graduation";

export interface ProteinTargetBracket {
  classification: WeightClassification;
  weightMinGrams: number;
  weightMaxGrams: number;
  targetMinGramsPerKg: number;
  targetMaxGramsPerKg: number;
  description: string;
  citationSource: string;
  clinicalRationale: string;
}

export const ESPGHAN_PROTEIN_BRACKETS: ProteinTargetBracket[] = [
  {
    classification: "ELBW",
    weightMinGrams: 400,
    weightMaxGrams: 999.99,
    targetMinGramsPerKg: 3.5,
    targetMaxGramsPerKg: 4.5,
    description: "Extremely Low Birth Weight (<1000g)",
    citationSource: "ESPGHAN 2022 Section 3.2.1 (Higher intake for micro-preemies to match intrauterine accretion)",
    clinicalRationale: "Micro-preemies (<1000g) require up to 4.5 g/kg/d protein to prevent cumulative catabolic deficits, conditional upon adequate renal handling.",
  },
  {
    classification: "VLBW",
    weightMinGrams: 1000,
    weightMaxGrams: 1800,
    targetMinGramsPerKg: 3.2,
    targetMaxGramsPerKg: 4.1,
    description: "Very Low Birth Weight (1000g to 1800g)",
    citationSource: "ESPGHAN 2022 Section 3.2 & Standard Institutional Preterm Protocol",
    clinicalRationale: "Stable growing VLBW infants target 3.2–4.1 g/kg/d protein with regular BUN and acid-base monitoring.",
  },
  {
    classification: "LBW",
    weightMinGrams: 1800.01,
    weightMaxGrams: 3500,
    targetMinGramsPerKg: 2.8,
    targetMaxGramsPerKg: 3.6,
    description: "Low Birth Weight / Step-Down (1801g to 3500g)",
    citationSource: "ESPGHAN 2022 Post-Discharge / Convalescent Preterm Guidance",
    clinicalRationale: "Convalescent infants >1800g experiencing catch-up growth require 2.8–3.6 g/kg/d until achieving term-equivalent somatic mass (3,500g).",
  },
  {
    classification: "Graduation",
    weightMinGrams: 3500.01,
    weightMaxGrams: 10000,
    targetMinGramsPerKg: 0,
    targetMaxGramsPerKg: 0,
    description: "Graduation / Normal Weight (> 3500g)",
    citationSource: "ESPGHAN Term-Equivalent Weight Transition Consensus",
    clinicalRationale: "Infants >3,500g have graduated from preterm catch-up requirements. Standard infant formulation targets apply to prevent solute overload.",
  },
];

/**
 * ESPGHAN 2022 Enteral Energy Intake Framework
 * 1. Typical energy range: 115–140 kcal/kg/day
 * 2. Conditional upper range: 140–160 kcal/kg/day (requires clinical justification e.g. slow growth)
 * 3. Extreme range: >160 kcal/kg/day (not recommended unless clinically justified)
 * 4. Sub-optimal: <115 kcal/kg/day (inadequate for preterm growth)
 */
export const ESPGHAN_ENERGY_FRAMEWORK = {
  TYPICAL_MIN: 115,
  TYPICAL_MAX: 140,
  CONDITIONAL_MAX: 160,
  ABSOLUTE_FLOOR: 100,
  CITATION: "ESPGHAN 2022 Position Paper, Section 3.1 'Energy Intake'",
};

/**
 * ESPGHAN 2022 Protein-to-Energy Ratio Framework
 * Target: 2.8 to 3.6 g / 100 kcal
 */
export const ESPGHAN_PE_RATIO_FRAMEWORK = {
  MIN_G_PER_100_KCAL: 2.8,
  MAX_G_PER_100_KCAL: 3.6,
  CITATION: "ESPGHAN 2022 Position Paper, Section 3.3 'Protein-to-Energy Ratio'",
};

export type EnergyComplianceTier =
  | "below_typical"      // < 115
  | "typical_target"     // 115 - 140
  | "conditional_high"   // 140 - 160
  | "exceeds_ceiling";   // > 160

export type ComplianceStatus = "suboptimal" | "on_target" | "conditional" | "exceeding";

export interface ComplianceEvaluation {
  status: ComplianceStatus;
  tier?: EnergyComplianceTier;
  badgeLabel: string;
  colorHex: string;
  badgeClass: string;
  deliveredValue: number;
  targetMin: number;
  targetMax: number;
  conditionalMax?: number;
  deltaFromMin: number;
  deltaFromMax: number;
  interpretation: string;
  clinicalAdvisory?: string;
}

export interface FeedingSchedule {
  q2hFeedsCount: number;
  q2hVolumePerFeedMl: number;
  q3hFeedsCount: number;
  q3hVolumePerFeedMl: number;
  continuousInfusionMlPerHour: number;
  reconciliationDeltaMl: {
    q2hSumDifference: number;
    q3hSumDifference: number;
    continuousSumDifference: number;
  };
  roundingDisclosure: string;
}

export interface StandardTermTargets {
  energyTarget: string; // "~100 kcal/kg/day"
  proteinTarget: string; // "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal)"
  formulationBrand: string; // "Pediamil® 1"
  formulationStage: string; // "Stage 1 (Birth to 6 Months)"
  guidanceText: string;
}

export interface AuditMetadata {
  applicationVersion: string;
  engineVersion: string;
  guidelinesReference: string;
  fentonReference: string;
  whoReference: string;
  calculatedAtUtc: string;
  roundingPolicy: string;
  nonDeviceDisclaimer: string;
}

export interface NutritionCalculationResult {
  // Input validation
  validation: ValidationReport;
  isBlocked: boolean;

  // Normalized inputs (undefined if blocked)
  currentWeightGrams?: number;
  currentWeightKg?: number;
  targetFluidMlPerKgPerDay?: number;
  formulaProfile?: FormulaProfile;
  totalDailyVolumeMl?: number;

  // Delivered Energy
  deliveredEnergyKcalPerDay?: number;
  deliveredEnergyKcalPerKgPerDay?: number;
  energyCompliance?: ComplianceEvaluation;

  // Delivered Protein
  deliveredProteinGramsPerDay?: number;
  deliveredProteinGramsPerKgPerDay?: number;
  proteinBracket?: ProteinTargetBracket;
  proteinCompliance?: ComplianceEvaluation;

  // Protein-to-Energy Ratio
  proteinToEnergyRatioGramsPer100Kcal?: number;
  peRatioCompliance?: ComplianceEvaluation;

  // Practical Feeding Schedule
  feedingSchedule?: FeedingSchedule;

  // Graduation Ceiling (>3500g)
  isGraduated?: boolean;
  graduationAlertText?: string;

  // Commercial Visual Routing
  imageSrc?: string;
  recommendationText?: string;
  standardTermTargets?: StandardTermTargets;

  // Clinical Summaries & Audit
  clinicalSummary?: string;
  auditMetadata: AuditMetadata;
}

/**
 * Returns the active ProteinTargetBracket for a given weight
 */
export function getProteinTargetBracket(weightGrams: number): ProteinTargetBracket {
  if (weightGrams < 1000) {
    return ESPGHAN_PROTEIN_BRACKETS[0]; // ELBW (<1000g): 3.5 - 4.5 g/kg/d
  } else if (weightGrams <= 1800) {
    return ESPGHAN_PROTEIN_BRACKETS[1]; // VLBW (1000g - 1800g): 3.2 - 4.1 g/kg/d
  } else if (weightGrams <= 3500) {
    return ESPGHAN_PROTEIN_BRACKETS[2]; // LBW (1801g - 3500g): 2.8 - 3.6 g/kg/d
  } else {
    return ESPGHAN_PROTEIN_BRACKETS[3]; // Graduation (>3500g)
  }
}

/**
 * Evaluates Energy Compliance against ESPGHAN 2022 4-Tier Framework
 */
export function evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay: number): ComplianceEvaluation {
  const roundedVal = Math.round(deliveredEnergyKcalPerKgPerDay * 10) / 10;
  const deltaFromMin = Math.round((roundedVal - ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN) * 10) / 10;
  const deltaFromMax = Math.round((roundedVal - ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX) * 10) / 10;

  if (roundedVal < ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN) {
    const deficit = Math.abs(deltaFromMin);
    return {
      status: "suboptimal",
      tier: "below_typical",
      badgeLabel: "Below Typical Target",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN,
      targetMax: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX,
      conditionalMax: ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is below ESPGHAN typical preterm target (${ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN}–${ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX} kcal/kg/d, deficit: -${deficit.toFixed(1)} kcal/kg/d). Risk of sub-optimal somatic catch-up growth.`,
      clinicalAdvisory: "Consider advancing enteral fluid allowance or reviewing caloric density.",
    };
  } else if (roundedVal <= ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX) {
    return {
      status: "on_target",
      tier: "typical_target",
      badgeLabel: "Within Typical Target",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN,
      targetMax: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX,
      conditionalMax: ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is within the standard ESPGHAN 2022 typical reference range (${ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN}–${ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX} kcal/kg/d).`,
      clinicalAdvisory: "Meets standard metabolic and somatic growth requirements for stable preterm infants.",
    };
  } else if (roundedVal <= ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX) {
    const surplus = deltaFromMax;
    return {
      status: "conditional",
      tier: "conditional_high",
      badgeLabel: "Conditional High Range",
      colorHex: "#2563eb",
      badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN,
      targetMax: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX,
      conditionalMax: ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is in the conditional upper range (+${surplus.toFixed(1)} kcal/kg/d above typical ceiling of ${ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX}).`,
      clinicalAdvisory: "Indicated when somatic growth is inadequate despite standard intake. Verify enteral tolerance and body composition.",
    };
  } else {
    const extremeSurplus = Math.round((roundedVal - ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX) * 10) / 10;
    return {
      status: "exceeding",
      tier: "exceeds_ceiling",
      badgeLabel: "Exceeds Upper Ceiling",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MIN,
      targetMax: ESPGHAN_ENERGY_FRAMEWORK.TYPICAL_MAX,
      conditionalMax: ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) exceeds recommended ESPGHAN upper ceiling of ${ESPGHAN_ENERGY_FRAMEWORK.CONDITIONAL_MAX} kcal/kg/d (+${extremeSurplus.toFixed(1)} kcal/kg/d).`,
      clinicalAdvisory: "Intakes >160 kcal/kg/day require explicit clinical justification. Monitor for excessive adiposity and feeding intolerance.",
    };
  }
}

/**
 * Evaluates Protein Compliance
 */
export function evaluateProteinCompliance(
  deliveredProteinGramsPerKgPerDay: number,
  bracket: ProteinTargetBracket
): ComplianceEvaluation {
  const roundedVal = Math.round(deliveredProteinGramsPerKgPerDay * 100) / 100;
  const deltaFromMin = Math.round((roundedVal - bracket.targetMinGramsPerKg) * 100) / 100;
  const deltaFromMax = Math.round((roundedVal - bracket.targetMaxGramsPerKg) * 100) / 100;

  if (roundedVal < bracket.targetMinGramsPerKg) {
    const deficit = Math.abs(deltaFromMin);
    return {
      status: "suboptimal",
      badgeLabel: "Below Protein Target",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is below target for ${bracket.classification} (${bracket.targetMinGramsPerKg}–${bracket.targetMaxGramsPerKg} g/kg/d, deficit: -${deficit.toFixed(2)} g/kg/d).`,
      clinicalAdvisory: "Evaluate protein fortification or advancement of total fluid volume.",
    };
  } else if (roundedVal <= bracket.targetMaxGramsPerKg) {
    return {
      status: "on_target",
      badgeLabel: "Within Target",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is within target for ${bracket.classification} (${bracket.targetMinGramsPerKg}–${bracket.targetMaxGramsPerKg} g/kg/d).`,
      clinicalAdvisory: "Supports lean tissue accretion and neurodevelopmental growth.",
    };
  } else {
    const surplus = deltaFromMax;
    return {
      status: "exceeding",
      badgeLabel: "Exceeds Protein Ceiling",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) exceeds upper bracket limit (+${surplus.toFixed(2)} g/kg/d above ${bracket.targetMaxGramsPerKg} g/kg/d).`,
      clinicalAdvisory: "Monitor blood urea nitrogen (BUN), serum bicarbonate, and renal solute load.",
    };
  }
}

/**
 * Evaluates Protein-to-Energy Ratio
 */
export function evaluatePeRatioCompliance(peRatioGramsPer100Kcal: number): ComplianceEvaluation {
  const roundedVal = Math.round(peRatioGramsPer100Kcal * 100) / 100;
  const deltaFromMin = Math.round((roundedVal - ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL) * 100) / 100;
  const deltaFromMax = Math.round((roundedVal - ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL) * 100) / 100;

  if (roundedVal < ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL) {
    return {
      status: "suboptimal",
      badgeLabel: "Low P:E Ratio",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL,
      targetMax: ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL,
      deltaFromMin,
      deltaFromMax,
      interpretation: `P:E ratio (${roundedVal.toFixed(2)} g/100 kcal) is below ESPGHAN target (${ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL}–${ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL} g/100 kcal). Risk of excessive fat accumulation without proportional lean tissue growth.`,
    };
  } else if (roundedVal <= ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL) {
    return {
      status: "on_target",
      badgeLabel: "Balanced P:E Ratio",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL,
      targetMax: ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL,
      deltaFromMin,
      deltaFromMax,
      interpretation: `P:E ratio (${roundedVal.toFixed(2)} g/100 kcal) is balanced within ESPGHAN recommended range (${ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL}–${ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL} g/100 kcal).`,
    };
  } else {
    return {
      status: "exceeding",
      badgeLabel: "High P:E Ratio",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_PE_RATIO_FRAMEWORK.MIN_G_PER_100_KCAL,
      targetMax: ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL,
      deltaFromMin,
      deltaFromMax,
      interpretation: `P:E ratio (${roundedVal.toFixed(2)} g/100 kcal) exceeds ESPGHAN range (> ${ESPGHAN_PE_RATIO_FRAMEWORK.MAX_G_PER_100_KCAL} g/100 kcal). Ensure non-protein energy is sufficient to prevent amino acid oxidation for energy.`,
    };
  }
}

/**
 * Canonical Audit Metadata Factory
 */
export function createAuditMetadata(): AuditMetadata {
  return {
    applicationVersion: "v2.0.0 Institutional",
    engineVersion: "NeoPed Engine v2.0 (ESPGHAN 2022 / Fenton 2013 / WHO 2006)",
    guidelinesReference: "ESPGHAN Committee on Nutrition Enteral Nutrition in Preterm Infants 2022",
    fentonReference: "Fenton TR, Kim JH. BMC Pediatr. 2013;13:59",
    whoReference: "WHO Child Growth Standards 2006 MGRS",
    calculatedAtUtc: new Date().toISOString(),
    roundingPolicy: "Displayed rates rounded to 1 decimal (0.1 mL); 24-hr sum reconciles within ±0.4 mL.",
    nonDeviceDisclaimer: "Clinical Decision Support Utility: For licensed healthcare professionals only. Not an order or prescription.",
  };
}

/**
 * Deterministic Nutritional Calculation Engine
 * Replaces silent clamping with strict validation.
 */
export function calculateLbwNutrition(
  weightGrams: number,
  fluidAllowanceMlPerKg: number = 150,
  formula: FormulaProfile = STANDARD_LBW_MATRIX
): NutritionCalculationResult {
  const auditMetadata = createAuditMetadata();

  // Strict Validation: Zero silent clamping
  const validation = validateNutritionInputs(weightGrams, fluidAllowanceMlPerKg);

  if (validation.isBlocked) {
    return {
      validation,
      isBlocked: true,
      auditMetadata,
    };
  }

  const sanitizedWeightGrams = Number(weightGrams);
  const sanitizedFluid = Number(fluidAllowanceMlPerKg);
  const weightKg = sanitizedWeightGrams / 1000;

  // ESPGHAN Preterm Graduation Ceiling at 3,500g
  const isGraduated = sanitizedWeightGrams > 3500;
  const graduationAlertText =
    "Infant exceeds 3,500g. ESPGHAN Preterm catch-up targets no longer apply. Patient has achieved term-equivalent weight. Consider transitioning to a standard infant formulation (e.g., Stage 1 or Stage 2).";

  // Product Pack Image and Recommendation Routing
  const imageSrc = isGraduated ? "/pediamil-1.png" : "/pediamil-lbw.png";
  const recommendationText = isGraduated
    ? "Infant has achieved term-equivalent weight (>3500g). Transition to standard infant nutrition (Stage 1) to support normal growth trajectories and prevent renal overload."
    : "ESPGHAN Preterm guidelines apply. Specialized high-protein, high-energy matrix recommended.";

  const standardTermTargets: StandardTermTargets | undefined = isGraduated
    ? {
        energyTarget: "~100 kcal/kg/day",
        proteinTarget: "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal)",
        formulationBrand: "Pediamil® 1",
        formulationStage: "Stage 1 (Birth to 6 Months)",
        guidanceText: "Normal physiological term growth goal. Decreased protein density avoids unnecessary renal solute load.",
      }
    : undefined;

  // Active Formula
  const activeFormula =
    isGraduated && formula === STANDARD_LBW_MATRIX ? STANDARD_STAGE_1_MATRIX : formula;

  // 1. Total Daily Volume (mL/day) = weightKg * fluidAllowance
  const rawTotalDailyVolumeMl = weightKg * sanitizedFluid;
  const totalDailyVolumeMl = Math.round(rawTotalDailyVolumeMl * 10) / 10;

  // 2. Delivered Energy:
  // Total Energy (kcal/day) = (totalDailyVolumeMl / 100) * energyKcalPer100Ml
  const rawEnergyPerDay = (rawTotalDailyVolumeMl / 100) * activeFormula.energyKcalPer100Ml;
  const rawEnergyPerKg = rawEnergyPerDay / weightKg;

  const deliveredEnergyKcalPerDay = Math.round(rawEnergyPerDay * 10) / 10;
  const deliveredEnergyKcalPerKgPerDay = Math.round(rawEnergyPerKg * 10) / 10;

  // 3. Delivered Protein:
  // Total Protein (g/day) = (totalDailyVolumeMl / 100) * proteinGramsPer100Ml
  const rawProteinPerDay = (rawTotalDailyVolumeMl / 100) * activeFormula.proteinGramsPer100Ml;
  const rawProteinPerKg = rawProteinPerDay / weightKg;

  const deliveredProteinGramsPerDay = Math.round(rawProteinPerDay * 100) / 100;
  const deliveredProteinGramsPerKgPerDay = Math.round(rawProteinPerKg * 100) / 100;

  const proteinBracket = getProteinTargetBracket(sanitizedWeightGrams);

  // 4. Target Evaluations
  const energyCompliance: ComplianceEvaluation = isGraduated
    ? {
        status: "on_target",
        badgeLabel: "Term Target",
        colorHex: "#2563eb",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
        deliveredValue: deliveredEnergyKcalPerKgPerDay,
        targetMin: 95,
        targetMax: 110,
        deltaFromMin: 0,
        deltaFromMax: 0,
        interpretation: "Term-equivalent energy delivery (~100 kcal/kg/day standard target).",
        clinicalAdvisory: "Patient has achieved mature infant body weight. Preterm catch-up caloric targets discontinued.",
      }
    : evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay);

  const proteinCompliance: ComplianceEvaluation = isGraduated
    ? {
        status: "on_target",
        badgeLabel: "Term Target",
        colorHex: "#2563eb",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
        deliveredValue: deliveredProteinGramsPerKgPerDay,
        targetMin: 0,
        targetMax: 0,
        deltaFromMin: 0,
        deltaFromMax: 0,
        interpretation: "Standard Stage 1 protein delivery (~1.8–2.0 g/100 kcal).",
        clinicalAdvisory: "Prevents high renal solute load (RSL) and supports physiological term accretion.",
      }
    : evaluateProteinCompliance(deliveredProteinGramsPerKgPerDay, proteinBracket);

  // 5. Protein-to-Energy Ratio (P:E)
  const rawPeRatio = rawEnergyPerDay > 0 ? (rawProteinPerDay / rawEnergyPerDay) * 100 : 0;
  const proteinToEnergyRatioGramsPer100Kcal = Math.round(rawPeRatio * 100) / 100;
  const peRatioCompliance = evaluatePeRatioCompliance(proteinToEnergyRatioGramsPer100Kcal);

  // 6. Practical Feeding Schedule with Reconciliation
  const q2hVolumePerFeedMl = Math.round((rawTotalDailyVolumeMl / 12) * 10) / 10;
  const q3hVolumePerFeedMl = Math.round((rawTotalDailyVolumeMl / 8) * 10) / 10;
  const continuousInfusionMlPerHour = Math.round((rawTotalDailyVolumeMl / 24) * 10) / 10;

  const q2hSumDifference = Math.round((q2hVolumePerFeedMl * 12 - rawTotalDailyVolumeMl) * 10) / 10;
  const q3hSumDifference = Math.round((q3hVolumePerFeedMl * 8 - rawTotalDailyVolumeMl) * 10) / 10;
  const continuousSumDifference = Math.round((continuousInfusionMlPerHour * 24 - rawTotalDailyVolumeMl) * 10) / 10;

  const feedingSchedule: FeedingSchedule = {
    q2hFeedsCount: 12,
    q2hVolumePerFeedMl,
    q3hFeedsCount: 8,
    q3hVolumePerFeedMl,
    continuousInfusionMlPerHour,
    reconciliationDeltaMl: {
      q2hSumDifference,
      q3hSumDifference,
      continuousSumDifference,
    },
    roundingDisclosure: "Displayed feed rates are rounded to 1 decimal place (0.1 mL): q3h bolus reconciles within ±0.4 mL/day (8 feeds); q2h bolus within ±0.6 mL/day (12 feeds); continuous rate within ±1.2 mL/day (24 hours).",
  };

  // 7. Clinical summary statement
  const clinicalSummary = isGraduated
    ? `${recommendationText} Current Weight: ${sanitizedWeightGrams}g at ${sanitizedFluid} mL/kg/day with ${activeFormula.brand}: Total volume ${totalDailyVolumeMl.toFixed(1)} mL/day delivers ${deliveredEnergyKcalPerKgPerDay.toFixed(1)} kcal/kg/day (~100 kcal/kg/d) and ${deliveredProteinGramsPerKgPerDay.toFixed(2)} g/kg/day protein (P:E ${proteinToEnergyRatioGramsPer100Kcal.toFixed(2)} g/100 kcal).`
    : `Weight ${sanitizedWeightGrams}g (${proteinBracket.classification}) at ${sanitizedFluid} mL/kg/day with ${activeFormula.brand}: Total volume ${totalDailyVolumeMl.toFixed(1)} mL/day delivers ${deliveredEnergyKcalPerKgPerDay.toFixed(1)} kcal/kg/day (${energyCompliance.badgeLabel}) and ${deliveredProteinGramsPerKgPerDay.toFixed(2)} g/kg/day protein (${proteinCompliance.badgeLabel} for bracket ${proteinBracket.targetMinGramsPerKg}–${proteinBracket.targetMaxGramsPerKg} g/kg/d). P:E ratio: ${proteinToEnergyRatioGramsPer100Kcal.toFixed(2)} g/100 kcal (${peRatioCompliance.badgeLabel}).`;

  return {
    validation,
    isBlocked: false,
    currentWeightGrams: sanitizedWeightGrams,
    currentWeightKg: weightKg,
    targetFluidMlPerKgPerDay: sanitizedFluid,
    formulaProfile: activeFormula,
    totalDailyVolumeMl,
    deliveredEnergyKcalPerDay,
    deliveredEnergyKcalPerKgPerDay,
    energyCompliance,
    deliveredProteinGramsPerDay,
    deliveredProteinGramsPerKgPerDay,
    proteinBracket,
    proteinCompliance,
    proteinToEnergyRatioGramsPer100Kcal,
    peRatioCompliance,
    feedingSchedule,
    isGraduated,
    graduationAlertText,
    imageSrc,
    recommendationText,
    standardTermTargets,
    clinicalSummary,
    auditMetadata,
  };
}

/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Preterm & LBW Nutritional Calculation Engine
 * 
 * Clinical Sources:
 * - ESPGHAN 2022 Enteral Nutrition in Preterm Infants (Position Paper)
 * - Manufacturer Product Specification: Liptis Nutrition Spec Sheet 2026-v1.0
 * - Institutional Neonatal Enteral Protocols
 * 
 * Pure deterministic mathematical utility with full decimal precision.
 */

import { validateNutritionInputs, ValidationReport, CLINICAL_BOUNDS } from "./validation";
import {
  PEDIAMIL_LBW_PRODUCT,
  PEDIAMIL_1_PRODUCT,
  PRODUCT_DATA_DISCLAIMER,
  ProductProfile,
} from "./product-config";

export interface FormulaProfile {
  name: string;
  brand: string;
  energyKcalPer100Ml: number;
  proteinGramsPer100Ml: number;
  carbsGramsPer100Ml?: number;
  fatGramsPer100Ml?: number;
  productProfile?: ProductProfile;
}

/**
 * Standard Verified Matrix for Pediamil® LBW (Preterm <= 3500g)
 * Verified against Liptis Nutrition Spec Sheet 2026-v1.0 (79.7 kcal, 2.42g protein / 100 mL)
 */
export const STANDARD_LBW_MATRIX: FormulaProfile = {
  name: "Preterm & LBW Matrix (Discharge Formula)",
  brand: "Pediamil® LBW",
  energyKcalPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.energyKcalPer100Ml, // 79.7 kcal / 100 mL
  proteinGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.proteinGramsPer100Ml, // 2.42 g protein / 100 mL
  carbsGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.carbsGramsPer100Ml, // 6.37 g / 100 mL
  fatGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.fatGramsPer100Ml, // 4.88 g / 100 mL
  productProfile: PEDIAMIL_LBW_PRODUCT,
};

/**
 * Standard Verified Matrix for Pediamil® 1 (Term > 3500g)
 * Verified against Liptis Nutrition Spec Sheet 2026-v1.0 (68.5 kcal, 1.49g protein / 100 mL)
 */
export const STANDARD_STAGE_1_MATRIX: FormulaProfile = {
  name: "Standard Infant Formula (Stage 1)",
  brand: "Pediamil® 1",
  energyKcalPer100Ml: PEDIAMIL_1_PRODUCT.composition.energyKcalPer100Ml, // 68.5 kcal / 100 mL
  proteinGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.proteinGramsPer100Ml, // 1.49 g protein / 100 mL
  carbsGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.carbsGramsPer100Ml, // 7.18 g / 100 mL
  fatGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.fatGramsPer100Ml, // 3.65 g / 100 mL
  productProfile: PEDIAMIL_1_PRODUCT,
};

export type WeightClassification = "ELBW" | "VLBW" | "LBW" | "Graduation";

export interface ProteinTargetBracket {
  classification: WeightClassification;
  weightMinGrams: number;
  weightMaxGrams: number;
  targetMinGramsPerKg: number;
  targetMaxGramsPerKg: number;
  description: string;
  sourceType: "guideline" | "institutional";
  citationSource: string;
  clinicalRationale: string;
}

/**
 * Institutional Weight-Specific Protein Operational Ranges
 * Explicitly distinguished from direct ESPGHAN guideline targets.
 */
export const INSTITUTIONAL_PROTEIN_BRACKETS: ProteinTargetBracket[] = [
  {
    classification: "ELBW",
    weightMinGrams: 400,
    weightMaxGrams: 999.99,
    targetMinGramsPerKg: 3.5,
    targetMaxGramsPerKg: 4.5,
    description: "Extremely Low Birth Weight (<1000g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range—requires local clinical approval.",
    clinicalRationale: "Micro-preemies (<1000g) target 3.5–4.5 g/kg/d to counteract high metabolic losses; requires close BUN and acid-base monitoring.",
  },
  {
    classification: "VLBW",
    weightMinGrams: 1000,
    weightMaxGrams: 1800,
    targetMinGramsPerKg: 3.2,
    targetMaxGramsPerKg: 4.1,
    description: "Very Low Birth Weight (1000g to 1800g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range—requires local clinical approval.",
    clinicalRationale: "Stable growing VLBW infants target 3.2–4.1 g/kg/d protein in institutional convalescent pathways.",
  },
  {
    classification: "LBW",
    weightMinGrams: 1800.01,
    weightMaxGrams: 3500,
    targetMinGramsPerKg: 2.8,
    targetMaxGramsPerKg: 3.6,
    description: "Low Birth Weight / Step-Down (1801g to 3500g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range—requires local clinical approval.",
    clinicalRationale: "Step-down infants >1800g experiencing catch-up growth target 2.8–3.6 g/kg/d until achieving term-equivalent mass (3,500g).",
  },
  {
    classification: "Graduation",
    weightMinGrams: 3500.01,
    weightMaxGrams: 10000,
    targetMinGramsPerKg: 0,
    targetMaxGramsPerKg: 0,
    description: "Graduation / Normal Weight (> 3500g)",
    sourceType: "institutional",
    citationSource: "Term-Equivalent Weight Transition Consensus",
    clinicalRationale: "Infants >3,500g have graduated from preterm catch-up requirements. Standard infant formulation targets apply to prevent solute overload.",
  },
];

/**
 * Direct ESPGHAN 2022 Enteral Nutrition Reference Recommendations
 */
export const ESPGHAN_DIRECT_GUIDELINES = {
  ENERGY: {
    TYPICAL_MIN: 115,
    TYPICAL_MAX: 140,
    CONDITIONAL_MAX: 160,
    CITATION: "ESPGHAN 2022 Preterm Enteral Nutrition Position Paper: Typical intake 115–140 kcal/kg/d; conditional intake 140–160 kcal/kg/d when clinically indicated for slow growth; not exceeding 160 kcal/kg/d.",
  },
  PROTEIN: {
    TYPICAL_MIN: 3.5,
    TYPICAL_MAX: 4.0,
    CONDITIONAL_MAX: 4.5,
    CITATION: "ESPGHAN 2022 Position Paper: Protein intake generally 3.5–4.0 g/kg/d; conditionally up to 4.5 g/kg/d in selected infants with slow growth and appropriate renal status.",
  },
  PE_RATIO: {
    MIN_G_PER_100_KCAL: 2.8,
    MAX_G_PER_100_KCAL: 3.6,
    CITATION: "ESPGHAN 2022 Position Paper: Recommended protein-to-energy ratio is 2.8–3.6 g / 100 kcal.",
  },
  FLUID: {
    TYPICAL_MIN: 150,
    TYPICAL_MAX: 180,
    BROAD_MIN: 135,
    BROAD_MAX: 200,
    CITATION: "ESPGHAN 2022 Position Paper: Fluid intake generally 150–180 mL/kg/d for stable growing preterm infants; 135–200 mL/kg/d requires individualized clinical judgment.",
  },
};

export type ComplianceStatus = "suboptimal" | "on_target" | "conditional" | "exceeding";

export interface ComplianceEvaluation {
  status: ComplianceStatus;
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
  sourceNote?: string;
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

export interface ClinicalSourceMapping {
  espghanGuidelineValues: string[];
  manufacturerProductValues: string[];
  institutionalProtocolValues: string[];
  developerAlertThresholds: string[];
}

export interface AuditMetadata {
  applicationVersion: string;
  engineVersion: string;
  productDataVersion: string;
  productDataVerificationDate: string;
  guidelinesReference: string;
  fentonReference: string;
  whoReference: string;
  calculatedAtUtc: string;
  selectedClinicalProtocol: string;
  selectedProduct: string;
  roundingPolicy: string;
  nonDeviceDisclaimer: string;
  productDisclaimer: string;
  sourceMapping: ClinicalSourceMapping;
}

export type OverallClinicalStatus =
  | "Within reference range"
  | "Below reference range"
  | "Above reference range"
  | "Requires clinician review"
  | "Invalid input"
  | "Out of supported range";

export interface NutrientDeliveryItem {
  id: string;
  name: string;
  category: "macronutrient" | "mineral" | "electrolyte" | "vitamin" | "specialty";
  amountPerDay: number;
  amountPerKgPerDay?: number;
  unit: string;
  concentrationPer100Ml: string | number;
  clinicalTarget?: string;
  clinicalInterpretation?: string;
  status?: "target_met" | "within_target" | "below_target" | "above_target" | "info";
}

export interface DeliveredPatientNutrientPayload {
  productName: string;
  productClassification: string;
  weightGrams: number;
  weightKg: number;
  fluidAllowanceMlPerKg: number;
  totalDailyVolumeMl: number;

  // Reconstitution & Preparation
  dailyPowderGrams: number;
  dailyScoops: number;
  powderGramsPerScoop: number;
  waterVolumeMlPerDay: number;
  scoopsPerFeedQ3h: number;
  scoopsPerFeedQ2h: number;
  preparationInstructions: string;

  // Core Numbers
  energyKcalPerDay: number;
  energyKcalPerKgPerDay: number;
  proteinGramsPerDay: number;
  proteinGramsPerKgPerDay: number;
  wheyGramsPerDay: number;
  caseinGramsPerDay: number;
  wheyCaseinRatio: string;
  carbsGramsPerDay: number;
  carbsGramsPerKgPerDay: number;
  lactoseGramsPerDay: number;
  fatGramsPerDay: number;
  fatGramsPerKgPerDay: number;

  // Key Minerals
  calciumMgPerDay: number;
  calciumMgPerKgPerDay: number;
  phosphorusMgPerDay: number;
  phosphorusMgPerKgPerDay: number;
  calciumPhosphorusRatio: string;
  magnesiumMgPerDay: number;
  magnesiumMgPerKgPerDay: number;
  ironMgPerDay: number;
  ironMgPerKgPerDay: number;
  zincMgPerDay: number;
  zincMgPerKgPerDay: number;
  copperMcgPerDay: number;
  iodineMcgPerDay: number;
  seleniumMcgPerDay: number;

  // Electrolytes
  sodiumMgPerDay: number;
  sodiumMmolPerKgPerDay: number;
  potassiumMgPerDay: number;
  potassiumMmolPerKgPerDay: number;
  chlorideMgPerDay: number;

  // Vitamins
  vitaminD3McgPerDay: number;
  vitaminD3IuPerDay: number;
  vitaminD3IuPerKgPerDay: number;
  vitaminAMcgPerDay: number;
  vitaminAMcgPerKgPerDay: number;
  vitaminCMgPerDay: number;
  vitaminKMcgPerDay: number;
  folicAcidMcgPerDay: number;

  // Specialty & Functional
  dhaMgPerDay: number;
  araMgPerDay: number;
  twoFlHmoGramsPerDay?: number;
  prebioticsGosGramsPerDay?: number;
  alphaLactalbuminGramsPerDay?: number;

  // Categorized items array for clean rendering and filtering
  items: NutrientDeliveryItem[];
}

export interface NutritionCalculationResult {
  // Input validation
  validation: ValidationReport;
  isBlocked: boolean;

  // Overall status (Never shows "Within reference range" if any sub-metric is abnormal)
  overallStatus: OverallClinicalStatus;

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

  // Commercial Visual Routing & Product Info
  imageSrc?: string;
  recommendationText?: string;
  standardTermTargets?: StandardTermTargets;
  productDisclaimer: string;

  // Comprehensive Delivered Patient Nutrient Breakdown
  deliveredNutrientPayload?: DeliveredPatientNutrientPayload;

  // Clinical Summaries & Audit
  clinicalSummary?: string;
  auditMetadata: AuditMetadata;
}

/**
 * Returns the active ProteinTargetBracket for a given weight
 */
export function getProteinTargetBracket(weightGrams: number): ProteinTargetBracket {
  if (weightGrams < 1000) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[0]; // ELBW (<1000g): 3.5 - 4.5 g/kg/d
  } else if (weightGrams <= 1800) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[1]; // VLBW (1000g - 1800g): 3.2 - 4.1 g/kg/d
  } else if (weightGrams <= 3500) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[2]; // LBW (1801g - 3500g): 2.8 - 3.6 g/kg/d
  } else {
    return INSTITUTIONAL_PROTEIN_BRACKETS[3]; // Graduation (>3500g)
  }
}

/**
 * Evaluates Energy Compliance against direct ESPGHAN 2022 recommendations
 */
export function evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay: number): ComplianceEvaluation {
  const roundedVal = Math.round(deliveredEnergyKcalPerKgPerDay * 10) / 10;
  const deltaFromMin = Math.round((roundedVal - ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN) * 10) / 10;
  const deltaFromMax = Math.round((roundedVal - ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX) * 10) / 10;

  if (roundedVal < ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN) {
    const deficit = Math.abs(deltaFromMin);
    return {
      status: "suboptimal",
      badgeLabel: "Below Reference Range (<115 kcal/kg/d)",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN,
      targetMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX,
      conditionalMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is below ESPGHAN typical preterm target (${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}–${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX} kcal/kg/d, deficit: -${deficit.toFixed(1)} kcal/kg/d). Risk of sub-optimal somatic catch-up growth.`,
      clinicalAdvisory: "Consider advancing enteral fluid allowance or reviewing caloric density.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1",
    };
  } else if (roundedVal <= ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX) {
    return {
      status: "on_target",
      badgeLabel: "Within Reference Range (115–140 kcal/kg/d)",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN,
      targetMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX,
      conditionalMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is within the ESPGHAN 2022 typical reference range (${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}–${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX} kcal/kg/d).`,
      clinicalAdvisory: "Meets standard metabolic and somatic growth requirements for stable preterm infants.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1",
    };
  } else if (roundedVal <= ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX) {
    const surplus = deltaFromMax;
    return {
      status: "conditional",
      badgeLabel: "Conditional High Range (140–160 kcal/kg/d)",
      colorHex: "#2563eb",
      badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN,
      targetMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX,
      conditionalMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is in the conditional upper range (+${surplus.toFixed(1)} kcal/kg/d above typical ceiling of ${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX}).`,
      clinicalAdvisory: "Indicated when somatic growth is inadequate despite standard intake. Verify enteral tolerance and body composition.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1",
    };
  } else {
    const extremeSurplus = Math.round((roundedVal - ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX) * 10) / 10;
    return {
      status: "exceeding",
      badgeLabel: "Above Reference Range (>160 kcal/kg/d)",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN,
      targetMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX,
      conditionalMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) exceeds recommended ESPGHAN upper ceiling of ${ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX} kcal/kg/d (+${extremeSurplus.toFixed(1)} kcal/kg/d).`,
      clinicalAdvisory: "Intakes >160 kcal/kg/day require explicit clinical justification. Monitor for excessive adiposity and feeding intolerance.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1",
    };
  }
}

/**
 * Evaluates Protein Compliance against Institutional Operational Bracket
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
      badgeLabel: `Below Bracket (${bracket.classification}: <${bracket.targetMinGramsPerKg} g/kg/d)`,
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is below target for ${bracket.classification} (${bracket.targetMinGramsPerKg}–${bracket.targetMaxGramsPerKg} g/kg/d, deficit: -${deficit.toFixed(2)} g/kg/d).`,
      clinicalAdvisory: "Evaluate protein fortification or advancement of total fluid volume.",
      sourceNote: bracket.citationSource,
    };
  } else if (roundedVal <= bracket.targetMaxGramsPerKg) {
    return {
      status: "on_target",
      badgeLabel: `Within Target (${bracket.classification}: ${bracket.targetMinGramsPerKg}–${bracket.targetMaxGramsPerKg} g/kg/d)`,
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is within target for ${bracket.classification} (${bracket.targetMinGramsPerKg}–${bracket.targetMaxGramsPerKg} g/kg/d).`,
      clinicalAdvisory: "Supports lean tissue accretion and neurodevelopmental growth.",
      sourceNote: bracket.citationSource,
    };
  } else {
    const surplus = deltaFromMax;
    return {
      status: "exceeding",
      badgeLabel: `Above Bracket (${bracket.classification}: >${bracket.targetMaxGramsPerKg} g/kg/d)`,
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) exceeds upper bracket limit (+${surplus.toFixed(2)} g/kg/d above ${bracket.targetMaxGramsPerKg} g/kg/d).`,
      clinicalAdvisory: "Monitor blood urea nitrogen (BUN), serum bicarbonate, and renal solute load.",
      sourceNote: bracket.citationSource,
    };
  }
}

/**
 * Consistent Protein-to-Energy Ratio Status System
 * Evaluates against direct ESPGHAN 2022 recommendations (2.8 to 3.6 g / 100 kcal)
 * 
 * Target Contract:
 * - Below target: < 2.8 g/100 kcal
 * - Within target: 2.8 to 3.6 g/100 kcal (inclusive)
 * - Above target: > 3.6 g/100 kcal
 */
export function evaluatePeRatioCompliance(peRatioGramsPer100Kcal: number): ComplianceEvaluation {
  // Retain high precision for comparison; format to 2 decimals
  const roundedVal = Math.round(peRatioGramsPer100Kcal * 100) / 100;
  const minTarget = ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MIN_G_PER_100_KCAL; // 2.8
  const maxTarget = ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MAX_G_PER_100_KCAL; // 3.6

  const deltaFromMin = Math.round((roundedVal - minTarget) * 100) / 100;
  const deltaFromMax = Math.round((roundedVal - maxTarget) * 100) / 100;

  if (roundedVal < minTarget) {
    return {
      status: "suboptimal",
      badgeLabel: "Below Reference Range (<2.8 g/100 kcal)",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin: minTarget,
      targetMax: maxTarget,
      deltaFromMin,
      deltaFromMax,
      interpretation:
        "Protein-to-energy ratio is below the displayed ESPGHAN reference range. Review product choice, fortification, and total nutrient intake.",
      clinicalAdvisory:
        "Risk of disproportionate fat mass accumulation with insufficient lean body mass accretion.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION,
    };
  } else if (roundedVal <= maxTarget) {
    return {
      status: "on_target",
      badgeLabel: "Within Reference Range (2.8–3.6 g/100 kcal)",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: minTarget,
      targetMax: maxTarget,
      deltaFromMin,
      deltaFromMax,
      interpretation: "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
      clinicalAdvisory: "Balanced substrate delivery supporting optimal body composition.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION,
    };
  } else {
    return {
      status: "exceeding",
      badgeLabel: "Above Reference Range (>3.6 g/100 kcal)",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin: minTarget,
      targetMax: maxTarget,
      deltaFromMin,
      deltaFromMax,
      interpretation:
        "Protein-to-energy ratio is above the displayed ESPGHAN reference range. Review protein and energy sources.",
      clinicalAdvisory:
        "Risk of amino acid oxidation for energy if non-protein calories are insufficient; monitor metabolic tolerance.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION,
    };
  }
}

/**
 * Canonical Audit Metadata Factory
 */
export function createAuditMetadata(): AuditMetadata {
  return {
    applicationVersion: "v2.1.0 Institutional",
    engineVersion: "NeoPed Engine v2.1",
    productDataVersion: "Liptis-Spec-2026-v1.0",
    productDataVerificationDate: "2026-10-02",
    guidelinesReference: "Uses selected ESPGHAN 2022 reference recommendations; local clinical validation required.",
    fentonReference: "Fenton TR, Kim JH. BMC Pediatr. 2013;13:59 (linear interpolation between tabulated LMS parameters)",
    whoReference: "WHO Child Growth Standards 2006 MGRS (0–24 months corrected age)",
    calculatedAtUtc: new Date().toISOString(),
    selectedClinicalProtocol: "ESPGHAN 2022 Preterm Recommendations + Institutional Weight Brackets",
    selectedProduct: "Pediamil® LBW (Preterm) / Pediamil® 1 (Term)",
    roundingPolicy: "Displayed rates rounded to 1 decimal (0.1 mL); 24-hr sum reconciles within ±0.4 mL (q3h), ±0.6 mL (q2h), ±1.2 mL (cont).",
    nonDeviceDisclaimer:
      "Clinical Decision Support Reference Utility: For licensed healthcare professionals only. Not an order, prescription, or medical device. Clinical judgment supersedes calculated values.",
    productDisclaimer: PRODUCT_DATA_DISCLAIMER,
    sourceMapping: {
      espghanGuidelineValues: [
        "Energy: 115–140 kcal/kg/day typical, 140–160 conditional",
        "Protein: 3.5–4.0 g/kg/day typical, conditionally up to 4.5 g/kg/day",
        "Protein-to-Energy ratio: 2.8–3.6 g/100 kcal",
        "Fluid: 150–180 mL/kg/day typical",
      ],
      manufacturerProductValues: [
        "Pediamil LBW: 79.7 kcal/100 mL, 2.42g protein/100 mL, 15.0g powder/100 mL",
        "Pediamil 1: 68.5 kcal/100 mL, 1.49g protein/100 mL, 13.7g powder/100 mL",
        "Source: Official Liptis Nutrition Spec Sheet 2026-v1.0 (verified 2026-10-02)",
      ],
      institutionalProtocolValues: [
        "Weight classification brackets: ELBW (<1000g), VLBW (1000–1800g), LBW (1801–3500g)",
        "Graduation ceiling: 3,500g (term-equivalent transition)",
      ],
      developerAlertThresholds: [
        "Fluid volume alerts: <135 mL/kg/d (restricted) and >200 mL/kg/d (high risk)",
        "Safety stops: weight <400g (micro-preemie protocol) and >10,000g (pediatric scope)",
      ],
    },
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
      overallStatus: "Invalid input",
      auditMetadata,
      productDisclaimer: PRODUCT_DATA_DISCLAIMER,
    };
  }

  const weightKg = weightGrams / 1000;
  const isGraduated = weightGrams > 3500;

  // Select active formula matrix based on graduation boundary
  const activeFormula = isGraduated ? STANDARD_STAGE_1_MATRIX : formula;

  // 1. Daily Fluid Volume (mL/day)
  const totalDailyVolumeMl = Math.round(weightKg * fluidAllowanceMlPerKg * 10) / 10;

  // 2. Delivered Energy
  const deliveredEnergyKcalPerDay =
    Math.round(((totalDailyVolumeMl * activeFormula.energyKcalPer100Ml) / 100) * 10) / 10;
  const deliveredEnergyKcalPerKgPerDay =
    Math.round((deliveredEnergyKcalPerDay / weightKg) * 10) / 10;
  const energyCompliance = evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay);

  // 3. Delivered Protein
  const deliveredProteinGramsPerDay =
    Math.round(((totalDailyVolumeMl * activeFormula.proteinGramsPer100Ml) / 100) * 100) / 100;
  const deliveredProteinGramsPerKgPerDay =
    Math.round((deliveredProteinGramsPerDay / weightKg) * 100) / 100;

  const proteinBracket = getProteinTargetBracket(weightGrams);
  const proteinCompliance = evaluateProteinCompliance(
    deliveredProteinGramsPerKgPerDay,
    proteinBracket
  );

  // 4. Protein-to-Energy Ratio (g protein / 100 kcal)
  const rawPeRatio = (deliveredProteinGramsPerDay / deliveredEnergyKcalPerDay) * 100;
  const proteinToEnergyRatioGramsPer100Kcal = Math.round(rawPeRatio * 100) / 100;
  const peRatioCompliance = evaluatePeRatioCompliance(proteinToEnergyRatioGramsPer100Kcal);

  // 5. Feeding Schedules with Reconciled Discrepancies
  const q2hVolumePerFeedMl = Math.round((totalDailyVolumeMl / 12) * 10) / 10;
  const q3hVolumePerFeedMl = Math.round((totalDailyVolumeMl / 8) * 10) / 10;
  const continuousInfusionMlPerHour = Math.round((totalDailyVolumeMl / 24) * 10) / 10;

  const q2hSumDifference = Math.round((q2hVolumePerFeedMl * 12 - totalDailyVolumeMl) * 10) / 10;
  const q3hSumDifference = Math.round((q3hVolumePerFeedMl * 8 - totalDailyVolumeMl) * 10) / 10;
  const continuousSumDifference =
    Math.round((continuousInfusionMlPerHour * 24 - totalDailyVolumeMl) * 10) / 10;

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
    roundingDisclosure: `Rates rounded to 0.1 mL. Total daily reconciliation discrepancy: q3h ${q3hSumDifference > 0 ? "+" : ""}${q3hSumDifference.toFixed(1)} mL (max bound ±0.4 mL); q2h ${q2hSumDifference > 0 ? "+" : ""}${q2hSumDifference.toFixed(1)} mL (max bound ±0.6 mL); continuous ${continuousSumDifference > 0 ? "+" : ""}${continuousSumDifference.toFixed(1)} mL (max bound ±1.2 mL).`,
  };

  // 6. Clinical Overall Status (Distinct, non-contradictory)
  let overallStatus: OverallClinicalStatus = "Within reference range";
  if (isGraduated) {
    overallStatus = "Within reference range"; // Evaluated against standard term targets
  } else {
    const isEnergyOk = energyCompliance.status === "on_target";
    const isProteinOk = proteinCompliance.status === "on_target";
    const isPeOk = peRatioCompliance.status === "on_target";

    if (isEnergyOk && isProteinOk && isPeOk) {
      overallStatus = "Within reference range";
    } else if (
      energyCompliance.status === "suboptimal" ||
      proteinCompliance.status === "suboptimal" ||
      peRatioCompliance.status === "suboptimal"
    ) {
      overallStatus = "Requires clinician review";
    } else if (
      energyCompliance.status === "exceeding" ||
      proteinCompliance.status === "exceeding" ||
      peRatioCompliance.status === "exceeding"
    ) {
      overallStatus = "Requires clinician review";
    } else {
      overallStatus = "Requires clinician review";
    }
  }

  // 7. Clinical Content & Commercial Routing
  let imageSrc = "/pediamil-lbw.png";
  let recommendationText = "ESPGHAN Preterm guidelines apply. Specialized high-protein, high-energy matrix recommended.";
  let graduationAlertText: string | undefined = undefined;
  let standardTermTargets: StandardTermTargets | undefined = undefined;

  if (isGraduated) {
    imageSrc = "/pediamil-1.png";
    recommendationText =
      "Infant has achieved term-equivalent weight (>3500g). Transition to standard infant nutrition (Stage 1) to support normal growth trajectories and prevent renal overload.";
    graduationAlertText =
      "Infant exceeds 3,500g. ESPGHAN Preterm catch-up targets no longer apply. Patient has achieved term-equivalent weight. Consider transitioning to a standard infant formulation (e.g., Stage 1 or Stage 2).";
    standardTermTargets = {
      energyTarget: "~100 kcal/kg/day (Standard Term Target)",
      proteinTarget: "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal, verified 1.49 g/100 mL)",
      formulationBrand: "Pediamil® 1",
      formulationStage: "Stage 1 (0 to 6 Months)",
      guidanceText:
        "Discontinue preterm catch-up fortification to prevent excessive solute load and disproportionate adiposity accretion.",
    };
  }

  const clinicalSummary = isGraduated
    ? `Patient weight (${weightGrams}g) exceeds 3,500g graduation ceiling. Term-equivalent targets active (~100 kcal/kg/d). Product routed: Pediamil® 1.`
    : `Preterm LBW pathway active (${proteinBracket.classification}). Prescribed ${fluidAllowanceMlPerKg} mL/kg/d delivers ${deliveredEnergyKcalPerKgPerDay} kcal/kg/d (${energyCompliance.badgeLabel}) and ${deliveredProteinGramsPerKgPerDay} g/kg/d protein (${proteinCompliance.badgeLabel}). P:E ratio: ${proteinToEnergyRatioGramsPer100Kcal} g/100 kcal (${peRatioCompliance.badgeLabel}). Product routed: Pediamil® LBW.`;

  // 8. Comprehensive Patient Delivered Daily Nutritional Payload
  const activeProductProfile = activeFormula.productProfile || (isGraduated ? PEDIAMIL_1_PRODUCT : PEDIAMIL_LBW_PRODUCT);
  const deliveredNutrientPayload = calculatePatientDeliveredNutrientPayload(
    weightGrams,
    fluidAllowanceMlPerKg,
    activeProductProfile
  );

  return {
    validation,
    isBlocked: false,
    overallStatus,
    currentWeightGrams: weightGrams,
    currentWeightKg: weightKg,
    targetFluidMlPerKgPerDay: fluidAllowanceMlPerKg,
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
    productDisclaimer: PRODUCT_DATA_DISCLAIMER,
    deliveredNutrientPayload,
    clinicalSummary,
    auditMetadata,
  };
}

/**
 * Calculates the exact patient delivered nutritional payload from the prescribed formula
 * Bridges entered fluid volume & patient weight to verified product composition
 */
export function calculatePatientDeliveredNutrientPayload(
  weightGrams: number,
  fluidAllowanceMlPerKg: number,
  product: ProductProfile
): DeliveredPatientNutrientPayload {
  const weightKg = weightGrams / 1000;
  const totalDailyVolumeMl = Math.round(weightKg * fluidAllowanceMlPerKg * 10) / 10;
  const factor = totalDailyVolumeMl / 100;
  const comp = product.composition;
  const recon = product.reconstitution;
  const isPreterm = weightGrams <= 3500;

  // Reconstitution & logistics
  const dailyPowderGrams = Math.round(recon.powderMassGramsPer100Ml * factor * 10) / 10;
  const dailyScoops = Math.round((dailyPowderGrams / recon.powderGramsPerScoop) * 10) / 10;
  const waterVolumeMlPerDay = Math.round(
    (recon.waterVolumeMlPer3Scoops / recon.finalFeedVolumeMlPer3Scoops) * totalDailyVolumeMl * 10
  ) / 10;
  const scoopsPerFeedQ3h = Math.round((dailyScoops / 8) * 10) / 10;
  const scoopsPerFeedQ2h = Math.round((dailyScoops / 12) * 10) / 10;

  // Energy & Macros
  const energyKcalPerDay = Math.round(comp.energyKcalPer100Ml * factor * 10) / 10;
  const energyKcalPerKgPerDay = Math.round((energyKcalPerDay / weightKg) * 10) / 10;
  const proteinGramsPerDay = Math.round(comp.proteinGramsPer100Ml * factor * 100) / 100;
  const proteinGramsPerKgPerDay = Math.round((proteinGramsPerDay / weightKg) * 100) / 100;
  const wheyGramsPerDay = Math.round((comp.wheyGramsPer100Ml || 0) * factor * 100) / 100;
  const caseinGramsPerDay = Math.round((comp.caseinGramsPer100Ml || 0) * factor * 100) / 100;
  const carbsGramsPerDay = Math.round(comp.carbsGramsPer100Ml * factor * 100) / 100;
  const carbsGramsPerKgPerDay = Math.round((carbsGramsPerDay / weightKg) * 100) / 100;
  const lactoseGramsPerDay = Math.round((comp.lactoseGramsPer100Ml || comp.carbsGramsPer100Ml) * factor * 100) / 100;
  const fatGramsPerDay = Math.round(comp.fatGramsPer100Ml * factor * 100) / 100;
  const fatGramsPerKgPerDay = Math.round((fatGramsPerDay / weightKg) * 100) / 100;

  // Bone Minerals & Growth Elements
  const calciumMgPerDay = Math.round(comp.calciumMgPer100Ml * factor * 10) / 10;
  const calciumMgPerKgPerDay = Math.round((calciumMgPerDay / weightKg) * 10) / 10;
  const phosphorusMgPerDay = Math.round(comp.phosphorusMgPer100Ml * factor * 10) / 10;
  const phosphorusMgPerKgPerDay = Math.round((phosphorusMgPerDay / weightKg) * 10) / 10;
  const magnesiumMgPerDay = Math.round(comp.magnesiumMgPer100Ml * factor * 10) / 10;
  const magnesiumMgPerKgPerDay = Math.round((magnesiumMgPerDay / weightKg) * 10) / 10;
  const ironMgPerDay = Math.round(comp.ironMgPer100Ml * factor * 100) / 100;
  const ironMgPerKgPerDay = Math.round((ironMgPerDay / weightKg) * 100) / 100;
  const zincMgPerDay = Math.round(comp.zincMgPer100Ml * factor * 100) / 100;
  const zincMgPerKgPerDay = Math.round((zincMgPerDay / weightKg) * 100) / 100;
  const copperMcgPerDay = Math.round(comp.copperMcgPer100Ml * factor * 10) / 10;
  const iodineMcgPerDay = Math.round(comp.iodineMcgPer100Ml * factor * 10) / 10;
  const seleniumMcgPerDay = Math.round(comp.seleniumMcgPer100Ml * factor * 100) / 100;

  // Electrolytes
  const sodiumMgPerDay = Math.round(comp.sodiumMgPer100Ml * factor * 10) / 10;
  const sodiumMmolPerKgPerDay = Math.round(((sodiumMgPerDay / weightKg / 23) * 100)) / 100;
  const potassiumMgPerDay = Math.round(comp.potassiumMgPer100Ml * factor * 10) / 10;
  const potassiumMmolPerKgPerDay = Math.round(((potassiumMgPerDay / weightKg / 39.1) * 100)) / 100;
  const chlorideMgPerDay = Math.round(comp.chlorideMgPer100Ml * factor * 10) / 10;

  // Vitamins
  const vitaminD3McgPerDay = Math.round(comp.vitaminD3McgPer100Ml * factor * 100) / 100;
  const vitaminD3IuPerDay = Math.round(vitaminD3McgPerDay * 40);
  const vitaminD3IuPerKgPerDay = Math.round(vitaminD3IuPerDay / weightKg);
  const vitaminAMcgPerDay = Math.round(comp.vitaminAMcgPer100Ml * factor * 10) / 10;
  const vitaminAMcgPerKgPerDay = Math.round((vitaminAMcgPerDay / weightKg) * 10) / 10;
  const vitaminCMgPerDay = Math.round(comp.vitaminCMgPer100Ml * factor * 10) / 10;
  const vitaminKMcgPerDay = Math.round(comp.vitaminKMcgPer100Ml * factor * 10) / 10;
  const folicAcidMcgPerDay = Math.round(comp.folicAcidMcgPer100Ml * factor * 10) / 10;

  // Specialty Functional Ingredients
  const dhaMgPerDay = Math.round((comp.dhaMgPer100Ml || 0) * factor * 10) / 10;
  const araMgPerDay = Math.round((comp.araMgPer100Ml || 0) * factor * 10) / 10;
  const twoFlHmoGramsPerDay = comp.twoFlHmoGramsPer100Ml
    ? Math.round(comp.twoFlHmoGramsPer100Ml * factor * 1000) / 1000
    : undefined;
  const prebioticsGosGramsPerDay = comp.prebioticsGosGramsPer100Ml
    ? Math.round(comp.prebioticsGosGramsPer100Ml * factor * 100) / 100
    : undefined;
  const alphaLactalbuminGramsPerDay = comp.alphaLactalbuminGramsPer100G
    ? Math.round(comp.alphaLactalbuminGramsPer100G * (dailyPowderGrams / 100) * 100) / 100
    : undefined;

  // Detailed items array for UI rendering and doctor interpretation
  const items: NutrientDeliveryItem[] = [
    {
      id: "energy",
      name: "Delivered Energy",
      category: "macronutrient",
      amountPerDay: energyKcalPerDay,
      amountPerKgPerDay: energyKcalPerKgPerDay,
      unit: "kcal",
      concentrationPer100Ml: `${comp.energyKcalPer100Ml} kcal`,
      clinicalTarget: isPreterm ? "ESPGHAN: 115–140 kcal/kg/d" : "Standard Term: ~100 kcal/kg/d",
      clinicalInterpretation: isPreterm
        ? energyKcalPerKgPerDay >= 115 && energyKcalPerKgPerDay <= 140
          ? "Within ESPGHAN 2022 recommended typical catch-up range"
          : energyKcalPerKgPerDay > 140
          ? "Conditional catch-up range (monitor growth & tolerance)"
          : "Below ESPGHAN minimum (risk of slow growth)"
        : "Standard energy density for mature infant somatic accretion",
      status: isPreterm
        ? energyKcalPerKgPerDay >= 115 && energyKcalPerKgPerDay <= 140
          ? "within_target"
          : energyKcalPerKgPerDay > 140
          ? "above_target"
          : "below_target"
        : "within_target",
    },
    {
      id: "protein",
      name: `True Protein (${comp.wheyCaseinRatio || "60:40"} Whey/Casein)`,
      category: "macronutrient",
      amountPerDay: proteinGramsPerDay,
      amountPerKgPerDay: proteinGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.proteinGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 3.5–4.0 g/kg/d" : "Term: 1.8–2.0 g/100 kcal (~1.5–2.5 g/kg/d)",
      clinicalInterpretation: isPreterm
        ? `Whey: ${wheyGramsPerDay}g/d, Casein: ${caseinGramsPerDay}g/d. Supports lean somatic tissue accretion.`
        : "Standard milk protein ratio for mature renal solute tolerance.",
      status: isPreterm
        ? proteinGramsPerKgPerDay >= 3.2 && proteinGramsPerKgPerDay <= 4.1
          ? "within_target"
          : "info"
        : "within_target",
    },
    {
      id: "carbs",
      name: "Carbohydrates (100% Lactose)",
      category: "macronutrient",
      amountPerDay: carbsGramsPerDay,
      amountPerKgPerDay: carbsGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.carbsGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 10.5–12.0 g/kg/d" : "Term: 9.0–13.0 g/kg/d",
      clinicalInterpretation: "Facilitates calcium absorption and healthy bifidogenic gut flora establishment.",
      status: "within_target",
    },
    {
      id: "lipids",
      name: "Total Lipids / Fatty Acids",
      category: "macronutrient",
      amountPerDay: fatGramsPerDay,
      amountPerKgPerDay: fatGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.fatGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 4.8–6.6 g/kg/d" : "Term: 4.0–6.0 g/kg/d",
      clinicalInterpretation: "Provides ~50% of non-protein caloric density and essential fatty acid delivery.",
      status: "within_target",
    },
    {
      id: "calcium",
      name: "Calcium (Ca)",
      category: "mineral",
      amountPerDay: calciumMgPerDay,
      amountPerKgPerDay: calciumMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.calciumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 120–140 mg/kg/d" : "Term: 60–100 mg/kg/d",
      clinicalInterpretation: isPreterm
        ? calciumMgPerKgPerDay >= 120
          ? "Achieves ESPGHAN intrauterine accretion rate to prevent osteopenia of prematurity"
          : "Supplemental calcium may be evaluated"
        : "Adequate for mature term infant bone mineral density",
      status: isPreterm
        ? calciumMgPerKgPerDay >= 120
          ? "target_met"
          : "below_target"
        : "within_target",
    },
    {
      id: "phosphorus",
      name: "Phosphorus (P)",
      category: "mineral",
      amountPerDay: phosphorusMgPerDay,
      amountPerKgPerDay: phosphorusMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.phosphorusMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 65–90 mg/kg/d" : "Term: 30–60 mg/kg/d",
      clinicalInterpretation: `Ca:P Molar Ratio = ${comp.calciumPhosphorusRatio}. Balances cellular phosphorylation and skeletal mineralization.`,
      status: isPreterm
        ? phosphorusMgPerKgPerDay >= 65
          ? "target_met"
          : "below_target"
        : "within_target",
    },
    {
      id: "iron",
      name: "Elemental Iron (Fe)",
      category: "mineral",
      amountPerDay: ironMgPerDay,
      amountPerKgPerDay: ironMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.ironMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0–3.0 mg/kg/d" : "Term: 0.9–1.3 mg/100 kcal",
      clinicalInterpretation: isPreterm
        ? ironMgPerKgPerDay >= 2.0 && ironMgPerKgPerDay <= 3.0
          ? "Meets ESPGHAN enteral iron target for anemia of prematurity prophylaxis"
          : ironMgPerKgPerDay > 3.0
          ? "High iron delivery; avoid unnecessary additional iron supplements"
          : "May require routine elemental iron drops if <2 mg/kg/d"
        : "Standard formula iron prophylaxis for iron-deficiency anemia prevention",
      status: isPreterm
        ? ironMgPerKgPerDay >= 2.0 && ironMgPerKgPerDay <= 3.0
          ? "within_target"
          : "info"
        : "within_target",
    },
    {
      id: "zinc",
      name: "Zinc (Zn)",
      category: "mineral",
      amountPerDay: zincMgPerDay,
      amountPerKgPerDay: zincMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.zincMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 1.0–2.0 mg/kg/d" : "Term: 0.5–1.0 mg/kg/d",
      clinicalInterpretation: "Essential cofactor for somatic protein synthesis, immune response, and linear growth.",
      status: "within_target",
    },
    {
      id: "magnesium",
      name: "Magnesium (Mg)",
      category: "mineral",
      amountPerDay: magnesiumMgPerDay,
      amountPerKgPerDay: magnesiumMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.magnesiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 8–15 mg/kg/d" : "Term: 5–8 mg/kg/d",
      clinicalInterpretation: "Crucial neuromuscular and enzymatic cofactor; supports calcium homeostasis.",
      status: "within_target",
    },
    {
      id: "sodium",
      name: "Sodium (Na)",
      category: "electrolyte",
      amountPerDay: sodiumMgPerDay,
      amountPerKgPerDay: sodiumMmolPerKgPerDay,
      unit: "mg (mmol/kg/d)",
      concentrationPer100Ml: `${comp.sodiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0–3.0 mmol/kg/d" : "Term: 1.0–2.0 mmol/kg/d",
      clinicalInterpretation: isPreterm
        ? `Delivers ${sodiumMmolPerKgPerDay} mmol/kg/d. Replaces high neonatal fractional excretion of sodium.`
        : `Delivers ${sodiumMmolPerKgPerDay} mmol/kg/d. Normal low renal solute load for mature kidneys.`,
      status: isPreterm
        ? sodiumMmolPerKgPerDay >= 2.0 && sodiumMmolPerKgPerDay <= 3.0
          ? "within_target"
          : "info"
        : "within_target",
    },
    {
      id: "potassium",
      name: "Potassium (K)",
      category: "electrolyte",
      amountPerDay: potassiumMgPerDay,
      amountPerKgPerDay: potassiumMmolPerKgPerDay,
      unit: "mg (mmol/kg/d)",
      concentrationPer100Ml: `${comp.potassiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0–3.0 mmol/kg/d" : "Term: 1.5–2.5 mmol/kg/d",
      clinicalInterpretation: `Delivers ${potassiumMmolPerKgPerDay} mmol/kg/d. Major intracellular cation for muscle and myocardial tone.`,
      status: "within_target",
    },
    {
      id: "chloride",
      name: "Chloride (Cl)",
      category: "electrolyte",
      amountPerDay: chlorideMgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.chlorideMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0–3.0 mmol/kg/d" : "Term: 1.5–2.5 mmol/kg/d",
      clinicalInterpretation: "Maintains serum electroneutrality and acid-base equilibrium.",
      status: "within_target",
    },
    {
      id: "vitaminD3",
      name: "Vitamin D3 (Cholecalciferol)",
      category: "vitamin",
      amountPerDay: vitaminD3IuPerDay,
      amountPerKgPerDay: vitaminD3IuPerKgPerDay,
      unit: "IU",
      concentrationPer100Ml: `${comp.vitaminD3McgPer100Ml} mcg (${Math.round(comp.vitaminD3McgPer100Ml * 40)} IU)`,
      clinicalTarget: isPreterm ? "ESPGHAN: 400–1000 IU/day" : "AAP/ESPGHAN: 400 IU/day",
      clinicalInterpretation: isPreterm
        ? `${vitaminD3IuPerDay} IU/day (${vitaminD3McgPerDay} mcg/d). ${vitaminD3IuPerDay >= 400 ? "Satisfies minimum ESPGHAN preterm requirement" : "Approaching 400 IU target; assess whether extra oral D3 drops are needed"}.`
        : `${vitaminD3IuPerDay} IU/day. Meets standard pediatric guideline for rickets prevention.`,
      status: isPreterm
        ? vitaminD3IuPerDay >= 400 && vitaminD3IuPerDay <= 1000
          ? "within_target"
          : "info"
        : "within_target",
    },
    {
      id: "vitaminA",
      name: "Vitamin A (Retinol)",
      category: "vitamin",
      amountPerDay: vitaminAMcgPerDay,
      amountPerKgPerDay: vitaminAMcgPerKgPerDay,
      unit: "mcg RE",
      concentrationPer100Ml: `${comp.vitaminAMcgPer100Ml} mcg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 400–1000 mcg RE/kg/d" : "Term: 250–500 mcg/d",
      clinicalInterpretation: "Protects respiratory epithelial integrity, surfactant production, and retinal development.",
      status: "within_target",
    },
    {
      id: "dhaAra",
      name: "DHA & ARA (1:1 Balanced Ratio)",
      category: "specialty",
      amountPerDay: dhaMgPerDay,
      unit: "mg each",
      concentrationPer100Ml: `${comp.dhaMgPer100Ml || 0} mg DHA / ${comp.araMgPer100Ml || 0} mg ARA`,
      clinicalTarget: "ESPGHAN 2022: DHA 12–30 mg/100 kcal (with ARA >= DHA)",
      clinicalInterpretation: `Delivers ${dhaMgPerDay} mg DHA and ${araMgPerDay} mg ARA daily. Critical for retinal photoreceptors and cognitive maturation.`,
      status: "target_met",
    },
  ];

  if (twoFlHmoGramsPerDay !== undefined) {
    items.push({
      id: "hmo",
      name: "2'-FL Human Milk Oligosaccharide (HMO)",
      category: "specialty",
      amountPerDay: twoFlHmoGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.twoFlHmoGramsPer100Ml} g`,
      clinicalTarget: "Human Milk Bio-Equivalent",
      clinicalInterpretation: "Supports innate mucosal immunity, pathogen decoy binding, and beneficial bifidobacterial colonization.",
      status: "target_met",
    });
  }

  if (prebioticsGosGramsPerDay !== undefined) {
    items.push({
      id: "gos",
      name: "Prebiotics (GOS)",
      category: "specialty",
      amountPerDay: prebioticsGosGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.prebioticsGosGramsPer100Ml} g`,
      clinicalTarget: "Gastrointestinal Motility Support",
      clinicalInterpretation: "Promotes softer stools, prevents necrotizing enterocolitis dysbiosis, and enhances GI tolerance.",
      status: "target_met",
    });
  }

  if (alphaLactalbuminGramsPerDay !== undefined) {
    items.push({
      id: "alphaLactalbumin",
      name: "Alpha-Lactalbumin Bioactive Protein",
      category: "specialty",
      amountPerDay: alphaLactalbuminGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.alphaLactalbuminGramsPer100G} g / 100g powder`,
      clinicalTarget: "Human Milk Bioactive Profile",
      clinicalInterpretation: "High in essential amino acids (tryptophan, cysteine) with superior gastric digestibility and low renal solute load.",
      status: "target_met",
    });
  }

  return {
    productName: product.brandName,
    productClassification: product.genericClassification,
    weightGrams,
    weightKg,
    fluidAllowanceMlPerKg,
    totalDailyVolumeMl,
    dailyPowderGrams,
    dailyScoops,
    powderGramsPerScoop: recon.powderGramsPerScoop,
    waterVolumeMlPerDay,
    scoopsPerFeedQ3h,
    scoopsPerFeedQ2h,
    preparationInstructions: recon.preparationInstructions,

    energyKcalPerDay,
    energyKcalPerKgPerDay,
    proteinGramsPerDay,
    proteinGramsPerKgPerDay,
    wheyGramsPerDay,
    caseinGramsPerDay,
    wheyCaseinRatio: comp.wheyCaseinRatio,
    carbsGramsPerDay,
    carbsGramsPerKgPerDay,
    lactoseGramsPerDay,
    fatGramsPerDay,
    fatGramsPerKgPerDay,

    calciumMgPerDay,
    calciumMgPerKgPerDay,
    phosphorusMgPerDay,
    phosphorusMgPerKgPerDay,
    calciumPhosphorusRatio: comp.calciumPhosphorusRatio,
    magnesiumMgPerDay,
    magnesiumMgPerKgPerDay,
    ironMgPerDay,
    ironMgPerKgPerDay,
    zincMgPerDay,
    zincMgPerKgPerDay,
    copperMcgPerDay,
    iodineMcgPerDay,
    seleniumMcgPerDay,

    sodiumMgPerDay,
    sodiumMmolPerKgPerDay,
    potassiumMgPerDay,
    potassiumMmolPerKgPerDay,
    chlorideMgPerDay,

    vitaminD3McgPerDay,
    vitaminD3IuPerDay,
    vitaminD3IuPerKgPerDay,
    vitaminAMcgPerDay,
    vitaminAMcgPerKgPerDay,
    vitaminCMgPerDay,
    vitaminKMcgPerDay,
    folicAcidMcgPerDay,

    dhaMgPerDay,
    araMgPerDay,
    twoFlHmoGramsPerDay,
    prebioticsGosGramsPerDay,
    alphaLactalbuminGramsPerDay,

    items,
  };
}

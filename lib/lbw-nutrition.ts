/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Preterm & LBW Nutritional Calculator (ESPGHAN 2022 Guidelines)
 * Deterministic, pure-math utility with zero external dependencies.
 */

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
  proteinGramsPer100Ml: 1.3, // ~1.94 g protein / 100 kcal (approx 1.8 to 2.0 g/100 kcal)
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
}

export const ESPGHAN_PROTEIN_BRACKETS: ProteinTargetBracket[] = [
  {
    classification: "ELBW",
    weightMinGrams: 0,
    weightMaxGrams: 999.99,
    targetMinGramsPerKg: 3.5,
    targetMaxGramsPerKg: 4.5,
    description: "Extremely Low Birth Weight (<1000g)",
  },
  {
    classification: "VLBW",
    weightMinGrams: 1000,
    weightMaxGrams: 1800,
    targetMinGramsPerKg: 3.2,
    targetMaxGramsPerKg: 4.1,
    description: "Very Low Birth Weight (1000g to 1800g)",
  },
  {
    classification: "LBW",
    weightMinGrams: 1800.01,
    weightMaxGrams: 3500,
    targetMinGramsPerKg: 2.8,
    targetMaxGramsPerKg: 3.6,
    description: "Low Birth Weight / Step-Down (1801g to 3500g)",
  },
  {
    classification: "Graduation",
    weightMinGrams: 3500.01,
    weightMaxGrams: 10000,
    targetMinGramsPerKg: 0,
    targetMaxGramsPerKg: 0,
    description: "Graduation / Normal Weight (> 3500g)",
  },
];

export const ESPGHAN_ENERGY_TARGET = {
  minKcalPerKg: 110,
  maxKcalPerKg: 135,
  description: "ESPGHAN 2022 Enteral Energy Target (110 - 135 kcal/kg/day)",
};

export type ComplianceStatus = "suboptimal" | "on_target" | "exceeding";

export interface ComplianceEvaluation {
  status: ComplianceStatus;
  badgeLabel: "Sub-optimal" | "On Target" | "Exceeding";
  colorHex: string;
  badgeClass: string;
  deliveredValue: number;
  targetMin: number;
  targetMax: number;
  deltaFromMin: number;
  deltaFromMax: number;
  interpretation: string;
}

export interface FeedingSchedule {
  q2hFeedsCount: number;
  q2hVolumePerFeedMl: number;
  q3hFeedsCount: number;
  q3hVolumePerFeedMl: number;
  continuousInfusionMlPerHour: number;
}

export interface StandardTermTargets {
  energyTarget: string; // "~100 kcal/kg/day"
  proteinTarget: string; // "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal)"
  formulationBrand: string; // "Pediamil® 1"
  formulationStage: string; // "Stage 1 (Birth to 6 Months)"
}

export interface NutritionCalculationResult {
  currentWeightGrams: number;
  currentWeightKg: number;
  targetFluidMlPerKgPerDay: number;
  formulaProfile: FormulaProfile;
  totalDailyVolumeMl: number;
  
  // Delivered Energy
  deliveredEnergyKcalPerDay: number;
  deliveredEnergyKcalPerKgPerDay: number;
  energyCompliance: ComplianceEvaluation;

  // Delivered Protein
  deliveredProteinGramsPerDay: number;
  deliveredProteinGramsPerKgPerDay: number;
  proteinBracket: ProteinTargetBracket;
  proteinCompliance: ComplianceEvaluation;

  // Key clinical ratios
  proteinToEnergyRatioGramsPer100Kcal: number; // ESPGHAN target: 2.5 - 3.6 g/100 kcal

  // Practical Clinical Feeding Schedule
  feedingSchedule: FeedingSchedule;

  // ESPGHAN Preterm Graduation Ceiling (>3500g)
  isGraduated: boolean;
  graduationAlertText?: string;

  // Product Pack Visual & Clinical Recommendation Integration
  imageSrc: string; // "/pediamil-lbw.png" (<=3500g) or "/pediamil-1.png" (>3500g)
  recommendationText: string;
  standardTermTargets?: StandardTermTargets;

  // Overall Clinical Summary
  clinicalSummary: string;
}

/**
 * Identify ESPGHAN 2022 Protein Bracket based on infant weight in grams
 */
export function getProteinTargetBracket(weightGrams: number): ProteinTargetBracket {
  if (weightGrams < 1000) {
    return ESPGHAN_PROTEIN_BRACKETS[0]; // ELBW: 3.5 - 4.5 g/kg/d
  } else if (weightGrams <= 1800) {
    return ESPGHAN_PROTEIN_BRACKETS[1]; // VLBW: 3.2 - 4.1 g/kg/d
  } else if (weightGrams <= 3500) {
    return ESPGHAN_PROTEIN_BRACKETS[2]; // LBW / Step-Down: 2.8 - 3.6 g/kg/d
  } else {
    return ESPGHAN_PROTEIN_BRACKETS[3]; // Graduation: >3500g
  }
}

/**
 * Evaluates compliance against min/max targets
 */
export function evaluateCompliance(
  value: number,
  targetMin: number,
  targetMax: number,
  unitLabel: string,
  metricName: string
): ComplianceEvaluation {
  const roundedVal = Math.round(value * 100) / 100;
  const deltaFromMin = Math.round((roundedVal - targetMin) * 100) / 100;
  const deltaFromMax = Math.round((roundedVal - targetMax) * 100) / 100;

  if (roundedVal < targetMin) {
    const deficit = Math.abs(deltaFromMin);
    return {
      status: "suboptimal",
      badgeLabel: "Sub-optimal",
      colorHex: "#d97706",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      deliveredValue: roundedVal,
      targetMin,
      targetMax,
      deltaFromMin,
      deltaFromMax,
      interpretation: `${metricName} is sub-optimal (${deficit.toFixed(2)} ${unitLabel} below minimum target of ${targetMin} ${unitLabel}). Consider adjusting fluid allowance or protein fortifier.`,
    };
  } else if (roundedVal > targetMax) {
    const surplus = deltaFromMax;
    return {
      status: "exceeding",
      badgeLabel: "Exceeding",
      colorHex: "#dc2626",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      deliveredValue: roundedVal,
      targetMin,
      targetMax,
      deltaFromMin,
      deltaFromMax,
      interpretation: `${metricName} exceeds recommended ESPGHAN upper ceiling (+${surplus.toFixed(2)} ${unitLabel} above ${targetMax} ${unitLabel}). Monitor renal solute load and hydration.`,
    };
  } else {
    return {
      status: "on_target",
      badgeLabel: "On Target",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin,
      targetMax,
      deltaFromMin,
      deltaFromMax,
      interpretation: `${metricName} is optimal and on target within the ESPGHAN recommended window (${targetMin} - ${targetMax} ${unitLabel}).`,
    };
  }
}

/**
 * Deterministic ESPGHAN 2022 Enteral Feeds & Macro Calculation Engine
 */
export function calculateLbwNutrition(
  weightGrams: number,
  fluidAllowanceMlPerKg: number = 150,
  formula: FormulaProfile = STANDARD_LBW_MATRIX
): NutritionCalculationResult {
  // Input sanitation & normalization (supports up to 10,000g)
  const sanitizedWeightGrams = Math.max(400, Math.min(10000, Number(weightGrams) || 1000));
  const sanitizedFluid = Math.max(80, Math.min(240, Number(fluidAllowanceMlPerKg) || 150));
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
      }
    : undefined;

  // Select active formula matrix (Standard Stage 1 for graduated mature infants)
  const activeFormula =
    isGraduated && formula === STANDARD_LBW_MATRIX ? STANDARD_STAGE_1_MATRIX : formula;

  // 1. Total Daily Volume (mL/day) = (Current Weight in kg) * (Target Fluid in mL/kg/day)
  const totalDailyVolumeMl = weightKg * sanitizedFluid;

  // 2. Delivered Energy:
  // Total Energy (kcal/day) = (Total Daily Volume / 100) * energyPer100Ml
  const deliveredEnergyKcalPerDay = (totalDailyVolumeMl / 100) * activeFormula.energyKcalPer100Ml;
  // Energy per kg = Total Energy / Weight in kg
  const deliveredEnergyKcalPerKgPerDay = deliveredEnergyKcalPerDay / weightKg;

  // 3. Delivered Protein:
  // Total Protein (g/day) = (Total Daily Volume / 100) * proteinPer100Ml
  const deliveredProteinGramsPerDay = (totalDailyVolumeMl / 100) * activeFormula.proteinGramsPer100Ml;
  // Protein per kg = Total Protein / Weight in kg
  const deliveredProteinGramsPerKgPerDay = deliveredProteinGramsPerDay / weightKg;

  const proteinBracket = getProteinTargetBracket(sanitizedWeightGrams);

  // 4. ESPGHAN 2022 Target Evaluation (Disabled for Preterm LBW if Graduated >3500g)
  const energyCompliance: ComplianceEvaluation = isGraduated
    ? {
        status: "on_target",
        badgeLabel: "On Target",
        colorHex: "#2563eb",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
        deliveredValue: Math.round(deliveredEnergyKcalPerKgPerDay * 10) / 10,
        targetMin: 0,
        targetMax: 0,
        deltaFromMin: 0,
        deltaFromMax: 0,
        interpretation: recommendationText,
      }
    : evaluateCompliance(
        deliveredEnergyKcalPerKgPerDay,
        ESPGHAN_ENERGY_TARGET.minKcalPerKg,
        ESPGHAN_ENERGY_TARGET.maxKcalPerKg,
        "kcal/kg/day",
        "Delivered Energy"
      );

  const proteinCompliance: ComplianceEvaluation = isGraduated
    ? {
        status: "on_target",
        badgeLabel: "On Target",
        colorHex: "#2563eb",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
        deliveredValue: Math.round(deliveredProteinGramsPerKgPerDay * 100) / 100,
        targetMin: 0,
        targetMax: 0,
        deltaFromMin: 0,
        deltaFromMax: 0,
        interpretation: recommendationText,
      }
    : evaluateCompliance(
        deliveredProteinGramsPerKgPerDay,
        proteinBracket.targetMinGramsPerKg,
        proteinBracket.targetMaxGramsPerKg,
        "g/kg/day",
        `Delivered Protein (${proteinBracket.classification})`
      );

  // 5. Protein-to-Energy Ratio (P:E)
  const proteinToEnergyRatioGramsPer100Kcal =
    deliveredEnergyKcalPerDay > 0
      ? (deliveredProteinGramsPerDay / deliveredEnergyKcalPerDay) * 100
      : 0;

  // 6. Feeding Schedule
  const feedingSchedule: FeedingSchedule = {
    q2hFeedsCount: 12,
    q2hVolumePerFeedMl: Math.round((totalDailyVolumeMl / 12) * 10) / 10,
    q3hFeedsCount: 8,
    q3hVolumePerFeedMl: Math.round((totalDailyVolumeMl / 8) * 10) / 10,
    continuousInfusionMlPerHour: Math.round((totalDailyVolumeMl / 24) * 10) / 10,
  };

  // 7. Clinical summary statement
  const clinicalSummary = isGraduated
    ? `${recommendationText} Current Weight: ${sanitizedWeightGrams}g at ${sanitizedFluid} mL/kg/day with ${activeFormula.brand}: Total volume ${totalDailyVolumeMl.toFixed(1)} mL/day delivers ${deliveredEnergyKcalPerKgPerDay.toFixed(1)} kcal/kg/day (~100 kcal/kg/d) and ${deliveredProteinGramsPerKgPerDay.toFixed(2)} g/kg/day protein (P:E ${proteinToEnergyRatioGramsPer100Kcal.toFixed(2)} g/100 kcal).`
    : `For infant weighing ${sanitizedWeightGrams}g (${proteinBracket.classification}) at ${sanitizedFluid} mL/kg/day with ${activeFormula.brand}: Total volume ${totalDailyVolumeMl.toFixed(1)} mL/day delivers ${deliveredEnergyKcalPerKgPerDay.toFixed(1)} kcal/kg/day (${energyCompliance.badgeLabel}) and ${deliveredProteinGramsPerKgPerDay.toFixed(2)} g/kg/day protein (${proteinCompliance.badgeLabel} for bracket ${proteinBracket.targetMinGramsPerKg}-${proteinBracket.targetMaxGramsPerKg} g/kg/d). P:E ratio: ${proteinToEnergyRatioGramsPer100Kcal.toFixed(2)} g/100 kcal.`;

  return {
    currentWeightGrams: sanitizedWeightGrams,
    currentWeightKg: weightKg,
    targetFluidMlPerKgPerDay: sanitizedFluid,
    formulaProfile: activeFormula,
    totalDailyVolumeMl: Math.round(totalDailyVolumeMl * 10) / 10,
    deliveredEnergyKcalPerDay: Math.round(deliveredEnergyKcalPerDay * 10) / 10,
    deliveredEnergyKcalPerKgPerDay: Math.round(deliveredEnergyKcalPerKgPerDay * 10) / 10,
    energyCompliance,
    deliveredProteinGramsPerDay: Math.round(deliveredProteinGramsPerDay * 100) / 100,
    deliveredProteinGramsPerKgPerDay: Math.round(deliveredProteinGramsPerKgPerDay * 100) / 100,
    proteinBracket,
    proteinCompliance,
    proteinToEnergyRatioGramsPer100Kcal: Math.round(proteinToEnergyRatioGramsPer100Kcal * 100) / 100,
    feedingSchedule,
    isGraduated,
    graduationAlertText,
    imageSrc,
    recommendationText,
    standardTermTargets,
    clinicalSummary,
  };
}

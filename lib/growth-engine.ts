/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Authoritative Sex-Specific Growth, Age Correction & Longitudinal Tracking Engine
 * 
 * Clinical Reference Standards:
 * 1. Preterm Growth Horizon (PMA 22 to 50 weeks):
 *    - Fenton 2013 Preterm Growth Curves (Fenton TR, Kim JH. BMC Pediatr. 2013;13:59)
 *    - Actual-age calibration benchmarked against authorized reference calculator (PediTools / University of Calgary)
 *    - Commercial distribution note: Innovate Calgary requires commercial permission (jmatic@innovatecalgary.com)
 * 2. Post-Fenton Horizon (PMA > 50 weeks, CCA 0 to 24 completed months):
 *    - WHO Child Growth Standards (2006) Multicentre Growth Reference Study (MGRS)
 *    - Official WHO Box-Cox LMS workbooks (wfa, lhfa, hcfa) imported with exact source precision
 *    - License: WHO Open Access under CC BY-NC-SA 3.0 IGO
 * 
 * Technical Implementation:
 * - Linear interpolation between tabulated LMS parameters
 * - Exact Box-Cox Z-score calculation: Z = ((X/M)^L - 1)/(L*S) for L != 0; Z = ln(X/M)/S for L == 0
 * - WHO MGRS restricted adjustment for extreme weight tails (|Z| > 3 SD)
 * - Abramowitz & Stegun 7.1.26 standard normal CDF Phi(Z)
 * - Single boundary layer unit conversion (kg in WHO LMS vs grams in user interface)
 * - Non-diagnostic, screening decision-support clinical wording
 * - Patel et al. 2005 2-point exponential weight velocity model
 */

import {
  WHO_2006_BOYS_POINTS,
  WHO_2006_GIRLS_POINTS,
  WHO_2006_METADATA_BOYS,
  WHO_2006_METADATA_GIRLS,
  WhoGrowthPoint,
  GrowthDatasetMetadata,
} from "./data/who-2006-dataset";

import {
  FENTON_2013_BOYS_POINTS,
  FENTON_2013_GIRLS_POINTS,
  FENTON_2013_METADATA_BOYS,
  FENTON_2013_METADATA_GIRLS,
  FentonGrowthPoint,
  FentonDatasetMetadata,
} from "./data/fenton-2013-dataset";

import {
  validateGrowthInputs,
  ValidationReport,
  CLINICAL_BOUNDS,
  parseStrictCalendarDate,
} from "./validation";

export type BiologicalSex = "male" | "female";
export type GrowthMetric = "weight" | "length" | "headCircumference";

export interface GestationalAge {
  weeks: number; // 22 to 36
  days: number;  // 0 to 6
}

export interface AgeCalculations {
  // Input validation
  validation: ValidationReport;
  isBlocked: boolean;

  // Chronological Age (CA)
  caTotalDays: number;
  caWeeks: number;
  caDays: number;
  caWeeksDecimal: number;
  caMonthsDecimal: number;
  dayOfLife: number; // DOL 1 on day of birth
  caFormatted: string;

  // Post-Menstrual Age (PMA) = GA + CA
  pmaTotalDays: number;
  pmaWeeks: number;
  pmaDays: number;
  pmaWeeksDecimal: number;
  pmaFormatted: string;

  // Corrected Chronological Age (CCA) = PMA - 280 days (40 weeks)
  ccaTotalDays: number;
  isPretermUncorrected: boolean; // if PMA < 40 weeks
  ccaWeeks: number;
  ccaDays: number;
  ccaWeeksDecimal: number;
  ccaMonthsDecimal: number;
  ccaFormatted: string;
}

export interface LmsParams {
  L: number;
  M: number;
  S: number;
}

export interface MetricLmsPoint {
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
  lms: LmsParams;
  sd3neg?: number;
  sd2neg?: number;
  sd1neg?: number;
  sd0?: number;
  sd1?: number;
  sd2?: number;
  sd3?: number;
}

export interface CurvePoint {
  age: number; // PMA weeks for Fenton, CCA months for WHO
  weight: MetricLmsPoint;
  length: MetricLmsPoint;
  headCircumference: MetricLmsPoint;
}

export interface GrowthChartDataset {
  chartType: "fenton" | "who";
  standardName: string;
  datasetVersion: string;
  datasetKey: "fenton_male" | "fenton_female" | "who_male" | "who_female";
  sex: BiologicalSex;
  xAxisLabel: string;
  xAxisUnit: "weeks PMA" | "months CCA";
  weightUnit: "g" | "kg";
  lengthUnit: "cm";
  headCircumferenceUnit: "cm";
  patientPlotAge: number;
  isAgeOutOfRange: boolean;
  ageOutOfRangeWarning?: string;
  routingRationale: string;
  supportedAgeRange: string;
  metadata: GrowthDatasetMetadata | FentonDatasetMetadata;
  data: CurvePoint[];
}

export interface TechnicalMethodology {
  interpolationType: "Linear interpolation between tabulated LMS parameters";
  lmsFormula: string;
  percentileFormula: string;
  extremeZHandling: string;
  outOfRangeHandling: string;
}

export const TECHNICAL_METHODOLOGY: TechnicalMethodology = {
  interpolationType: "Linear interpolation between tabulated LMS parameters",
  lmsFormula: "Z = ((X / M)^L - 1) / (L * S) for L != 0; Z = ln(X / M) / S for L == 0",
  percentileFormula: "Percentile = Phi(Z) * 100 via standard normal cumulative distribution function (Abramowitz & Stegun 7.1.26)",
  extremeZHandling: "WHO MGRS restricted tail adjustment applied for weight-for-age (|Z| > 3 SD) per official WHO specification. Length and Head Circumference use exact Gaussian distribution (L = 1.0).",
  outOfRangeHandling: "Values outside supported dataset age horizons (Fenton < 22 weeks PMA or WHO > 24 months CCA) return 'Out of Range' status with zero fabricated percentiles or Z-scores.",
};

export const CLINICAL_INTERPRETATION_FACTORS = [
  "Accurate gestational-age dating at birth (ultrasound dating vs reliable LMP)",
  "Standardized anthropometric measurement technique using calibrated neonatal equipment",
  "Evaluation of longitudinal serial trajectory rather than an isolated cross-sectional measurement",
  "Hydration balance, fluid shifts, and extracellular third-spacing",
  "Intrauterine growth history, birth weight, and birth percentile status",
  "Concurrent acute or chronic neonatal illness (e.g. BPD, NEC, sepsis, hemodynamically significant PDA)",
  "Quantified enteral and parenteral macronutrient and micronutrient delivery",
  "Biochemical markers of accretion and metabolic stability (BUN, creatinine, alkaline phosphatase, phosphorus, electrolytes)",
];

export interface PercentileEvaluation {
  metric: GrowthMetric;
  observedValue: number;
  plotAge: number;
  ageUnit: string;
  p50Value: number;
  zScore: number; // rounded for clinical display (2 decimal places)
  zScoreUnrounded: number; // continuous floating point precision
  zScoreFormatted: string; // e.g. "+0.60 SD" or "-1.42 SD"
  percentile: number; // rounded for clinical display (1 decimal place)
  percentileUnrounded: number; // continuous floating point precision (0 to 100)
  percentileFormatted: string; // e.g. "73.0th Percentile"
  percentileBracket: string;
  shortBadge: "<3rd" | "3rd-10th" | "10th-50th" | "50th-90th" | "90th-97th" | ">97th" | "Out of Range" | "N/A";
  badgeClass: string;
  clinicalNote: string;
  clinicalCaveat: string;
  interpolatedLms: LmsParams;
  methodology: string;
  standard: string;
  version: string;
  validationStatus: "validated" | "pending";
}

export interface LongitudinalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightGrams: number;
  lengthCm?: number;
  headCircumferenceCm?: number;
  caDays: number;
  pmaWeeksDecimal: number;
  ccaMonthsDecimal: number;
  weightZScore: number;
  weightPercentile: number;
  deltaWeightZScore?: number; // delta Z compared to previous record
  weightVelocityGPerKgPerDay?: number; // Patel et al. 2005 2-point exponential model
  lengthZScore?: number;
  lengthPercentile?: number;
  hcZScore?: number;
  hcPercentile?: number;
  trendAlert?: string;
  isDuplicateDate?: boolean;
}

/**
 * Standard Normal Cumulative Distribution Function Phi(Z)
 * Precision error < 1.5e-7 (Abramowitz & Stegun 7.1.26)
 */
export function normalCdf(z: number): number {
  if (isNaN(z)) return 0.5;
  if (z < -8) return 0;
  if (z > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * erf);
}

/**
 * Calculates genuine Z-score from LMS parameters
 * Rigorously validates: value > 0, M > 0, S > 0.
 * Preserves source floating point precision internally.
 */
export function calculateZScoreFromLms(value: number, lms: LmsParams): number {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0 || S <= 0 || isNaN(value) || isNaN(M) || isNaN(S)) return 0;

  if (Math.abs(L) < 0.0001) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1.0) / (L * S);
}

/**
 * WHO Adjusted Z-score for extreme weight tails (|Z| > 3 SD)
 * Conforms to the official WHO Multicentre Growth Reference Study (MGRS) specification.
 * For |Z| <= 3 SD, returns the exact Box-Cox Z-score.
 */
export function calculateWhoAdjustedWeightZScore(
  weightKg: number,
  lms: LmsParams,
  sdPoints?: { sd2neg?: number; sd3neg?: number; sd2pos?: number; sd3pos?: number }
): number {
  const rawZ = calculateZScoreFromLms(weightKg, lms);
  const { L, M, S } = lms;

  if (rawZ > 3) {
    const sd3pos = sdPoints?.sd3pos ?? (Math.abs(L) < 0.0001 ? M * Math.exp(S * 3) : M * Math.pow(1 + L * S * 3, 1 / L));
    const sd2pos = sdPoints?.sd2pos ?? (Math.abs(L) < 0.0001 ? M * Math.exp(S * 2) : M * Math.pow(1 + L * S * 2, 1 / L));
    const sd23pos = sd3pos - sd2pos;
    if (sd23pos > 0) {
      return 3 + (weightKg - sd3pos) / sd23pos;
    }
  } else if (rawZ < -3) {
    const sd3neg = sdPoints?.sd3neg ?? (Math.abs(L) < 0.0001 ? M * Math.exp(S * -3) : M * Math.pow(1 + L * S * -3, 1 / L));
    const sd2neg = sdPoints?.sd2neg ?? (Math.abs(L) < 0.0001 ? M * Math.exp(S * -2) : M * Math.pow(1 + L * S * -2, 1 / L));
    const sd23neg = sd2neg - sd3neg;
    if (sd23neg > 0) {
      return -3 + (weightKg - sd3neg) / sd23neg;
    }
  }

  return rawZ;
}

/**
 * Deterministic UTC-Safe Age Calculation Engine
 * Rejects invalid dates, chronological inversions, impossible calendar dates, and future assessment dates.
 */
export function calculateAges(
  gaWeeks: number,
  gaDays: number,
  dateOfBirth: unknown,
  dateOfMeasurement: unknown
): AgeCalculations {
  const validation = validateGrowthInputs({
    gaWeeks,
    gaDays,
    dob: dateOfBirth,
    dom: dateOfMeasurement,
  });

  const emptyAge: AgeCalculations = {
    validation,
    isBlocked: true,
    caTotalDays: 0,
    caWeeks: 0,
    caDays: 0,
    caWeeksDecimal: 0,
    caMonthsDecimal: 0,
    dayOfLife: 0,
    caFormatted: "Validation Blocked",
    pmaTotalDays: 0,
    pmaWeeks: 0,
    pmaDays: 0,
    pmaWeeksDecimal: 0,
    pmaFormatted: "Validation Blocked",
    ccaTotalDays: 0,
    isPretermUncorrected: true,
    ccaWeeks: 0,
    ccaDays: 0,
    ccaWeeksDecimal: 0,
    ccaMonthsDecimal: 0,
    ccaFormatted: "Validation Blocked",
  };

  if (validation.isBlocked) {
    return emptyAge;
  }

  const parsedDob = parseStrictCalendarDate(dateOfBirth);
  const parsedDom = parseStrictCalendarDate(dateOfMeasurement);

  if (!parsedDob.isValid || !parsedDom.isValid || !parsedDob.utcTimestamp || !parsedDom.utcTimestamp) {
    return emptyAge;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const caTotalDays = Math.floor((parsedDom.utcTimestamp - parsedDob.utcTimestamp) / msPerDay);

  const caWeeks = Math.floor(caTotalDays / 7);
  const caDays = caTotalDays % 7;
  const caWeeksDecimal = Math.round((caTotalDays / 7) * 100) / 100;
  const caMonthsDecimal = Math.round((caTotalDays / 30.4375) * 100) / 100;
  const dayOfLife = caTotalDays + 1; // DOL 1 on day of birth
  const caFormatted = `${caWeeks}w ${caDays}d (DOL ${dayOfLife})`;

  // Post-Menstrual Age (PMA) = GA at birth + Chronological Age
  const gaTotalDays = Number(gaWeeks) * 7 + Number(gaDays);
  const pmaTotalDays = gaTotalDays + caTotalDays;
  const pmaWeeks = Math.floor(pmaTotalDays / 7);
  const pmaDays = pmaTotalDays % 7;
  const pmaWeeksDecimal = Math.round((pmaTotalDays / 7) * 100) / 100;
  const pmaFormatted = `${pmaWeeks}w ${pmaDays}d PMA`;

  // Corrected Chronological Age (CCA) = PMA - 280 days (40 weeks full-term reference)
  const termTotalDays = 40 * 7;
  const ccaTotalDays = pmaTotalDays - termTotalDays;
  const isPretermUncorrected = ccaTotalDays < 0;

  let ccaWeeks = 0;
  let ccaDays = 0;
  let ccaWeeksDecimal = 0;
  let ccaMonthsDecimal = 0;
  let ccaFormatted = "";

  if (isPretermUncorrected) {
    const daysUntilTerm = Math.abs(ccaTotalDays);
    const weeksUntilTerm = Math.floor(daysUntilTerm / 7);
    const remDays = daysUntilTerm % 7;
    ccaWeeks = -weeksUntilTerm;
    ccaDays = -remDays;
    ccaWeeksDecimal = Math.round((ccaTotalDays / 7) * 100) / 100;
    ccaMonthsDecimal = 0;
    ccaFormatted = `Preterm (-${weeksUntilTerm}w ${remDays}d to 40w term)`;
  } else {
    ccaWeeks = Math.floor(ccaTotalDays / 7);
    ccaDays = ccaTotalDays % 7;
    ccaWeeksDecimal = Math.round((ccaTotalDays / 7) * 100) / 100;
    ccaMonthsDecimal = Math.round((ccaTotalDays / 30.4375) * 100) / 100;
    ccaFormatted = `${ccaWeeks}w ${ccaDays}d (${ccaMonthsDecimal.toFixed(1)} mo corrected)`;
  }

  return {
    validation,
    isBlocked: false,
    caTotalDays,
    caWeeks,
    caDays,
    caWeeksDecimal,
    caMonthsDecimal,
    dayOfLife,
    caFormatted,
    pmaTotalDays,
    pmaWeeks,
    pmaDays,
    pmaWeeksDecimal,
    pmaFormatted,
    ccaTotalDays,
    isPretermUncorrected,
    ccaWeeks,
    ccaDays,
    ccaWeeksDecimal,
    ccaMonthsDecimal,
    ccaFormatted,
  };
}

/**
 * Standardizes CurvePoint representation across Fenton and WHO datasets.
 * In Fenton, weights are in grams. In WHO, weight M is in kg and percentiles in kg.
 */
function normalizeWhoPoints(points: WhoGrowthPoint[]): CurvePoint[] {
  return points.map(pt => ({
    age: pt.age,
    weight: {
      p3: pt.weight.p3,
      p10: pt.weight.p10,
      p50: pt.weight.p50,
      p90: pt.weight.p90,
      p97: pt.weight.p97,
      lms: { L: pt.weight.L, M: pt.weight.M, S: pt.weight.S },
      sd3neg: pt.weight.sd3neg,
      sd2neg: pt.weight.sd2neg,
      sd1neg: pt.weight.sd1neg,
      sd0: pt.weight.sd0,
      sd1: pt.weight.sd1,
      sd2: pt.weight.sd2,
      sd3: pt.weight.sd3,
    },
    length: {
      p3: pt.length.p3,
      p10: pt.length.p10,
      p50: pt.length.p50,
      p90: pt.length.p90,
      p97: pt.length.p97,
      lms: { L: pt.length.L, M: pt.length.M, S: pt.length.S },
      sd3neg: pt.length.sd3neg,
      sd2neg: pt.length.sd2neg,
      sd1neg: pt.length.sd1neg,
      sd0: pt.length.sd0,
      sd1: pt.length.sd1,
      sd2: pt.length.sd2,
      sd3: pt.length.sd3,
    },
    headCircumference: {
      p3: pt.headCircumference.p3,
      p10: pt.headCircumference.p10,
      p50: pt.headCircumference.p50,
      p90: pt.headCircumference.p90,
      p97: pt.headCircumference.p97,
      lms: { L: pt.headCircumference.L, M: pt.headCircumference.M, S: pt.headCircumference.S },
      sd3neg: pt.headCircumference.sd3neg,
      sd2neg: pt.headCircumference.sd2neg,
      sd1neg: pt.headCircumference.sd1neg,
      sd0: pt.headCircumference.sd0,
      sd1: pt.headCircumference.sd1,
      sd2: pt.headCircumference.sd2,
      sd3: pt.headCircumference.sd3,
    },
  }));
}

function normalizeFentonPoints(points: FentonGrowthPoint[]): CurvePoint[] {
  return points.map(pt => ({
    age: pt.age,
    weight: {
      p3: pt.weight.p3,
      p10: pt.weight.p10,
      p50: pt.weight.p50,
      p90: pt.weight.p90,
      p97: pt.weight.p97,
      lms: { L: pt.weight.lms.L, M: pt.weight.lms.M, S: pt.weight.lms.S },
    },
    length: {
      p3: pt.length.p3,
      p10: pt.length.p10,
      p50: pt.length.p50,
      p90: pt.length.p90,
      p97: pt.length.p97,
      lms: { L: pt.length.lms.L, M: pt.length.lms.M, S: pt.length.lms.S },
    },
    headCircumference: {
      p3: pt.headCircumference.p3,
      p10: pt.headCircumference.p10,
      p50: pt.headCircumference.p50,
      p90: pt.headCircumference.p90,
      p97: pt.headCircumference.p97,
      lms: { L: pt.headCircumference.lms.L, M: pt.headCircumference.lms.M, S: pt.headCircumference.lms.S },
    },
  }));
}

/**
 * Dynamic Growth Standard Routing Engine:
 * - If PMA <= 50.0 completed weeks: Fenton 2013 Preterm Standard (PMA on X-axis)
 * - If PMA > 50.0 weeks: WHO Child Growth Standards 2006 (CCA in months on X-axis)
 * - Returns explicit routing metadata, supported horizons, units, and clinical rationale.
 */
export function getGrowthDataset(
  sex: BiologicalSex,
  ages: AgeCalculations
): GrowthChartDataset {
  const fentonMetadata = sex === "male" ? FENTON_2013_METADATA_BOYS : FENTON_2013_METADATA_GIRLS;
  const fentonPoints = sex === "male" ? FENTON_2013_BOYS_POINTS : FENTON_2013_GIRLS_POINTS;
  const whoMetadata = sex === "male" ? WHO_2006_METADATA_BOYS : WHO_2006_METADATA_GIRLS;
  const whoPoints = sex === "male" ? WHO_2006_BOYS_POINTS : WHO_2006_GIRLS_POINTS;

  if (ages.isBlocked) {
    return {
      chartType: "fenton",
      standardName: fentonMetadata.standard,
      datasetVersion: fentonMetadata.version,
      datasetKey: sex === "male" ? "fenton_male" : "fenton_female",
      sex,
      xAxisLabel: "Post-Menstrual Age (Weeks)",
      xAxisUnit: "weeks PMA",
      weightUnit: "g",
      lengthUnit: "cm",
      headCircumferenceUnit: "cm",
      patientPlotAge: 28,
      isAgeOutOfRange: true,
      ageOutOfRangeWarning: "Age calculation blocked by input validation.",
      routingRationale: "Validation blocked; chart display inactive.",
      supportedAgeRange: "22 to 50 completed weeks PMA",
      metadata: fentonMetadata,
      data: normalizeFentonPoints(fentonPoints),
    };
  }

  // Routing threshold: PMA <= 50.0 weeks uses Fenton; PMA > 50.0 weeks transitions to WHO
  const isFenton = ages.pmaWeeksDecimal <= CLINICAL_BOUNDS.FENTON_MAX_PMA_WEEKS;

  if (isFenton) {
    const datasetKey = sex === "male" ? "fenton_male" : "fenton_female";
    const isUnderMin = ages.pmaWeeksDecimal < CLINICAL_BOUNDS.FENTON_MIN_PMA_WEEKS;
    const isAgeOutOfRange = isUnderMin;
    const ageOutOfRangeWarning = isUnderMin
      ? `Post-menstrual age (${ages.pmaWeeksDecimal.toFixed(1)} weeks PMA) is below the Fenton 2013 chart lower limit of 22 completed weeks PMA.`
      : undefined;

    return {
      chartType: "fenton",
      standardName: fentonMetadata.standard,
      datasetVersion: fentonMetadata.version,
      datasetKey,
      sex,
      xAxisLabel: "Post-Menstrual Age (Weeks)",
      xAxisUnit: "weeks PMA",
      weightUnit: "g",
      lengthUnit: "cm",
      headCircumferenceUnit: "cm",
      patientPlotAge: ages.pmaWeeksDecimal,
      isAgeOutOfRange,
      ageOutOfRangeWarning,
      routingRationale: `Patient PMA is ${ages.pmaWeeksDecimal.toFixed(1)} weeks (≤ 50.0 completed weeks). Fenton 2013 preterm reference standard applies.`,
      supportedAgeRange: "22 to 50 completed weeks PMA",
      metadata: fentonMetadata,
      data: normalizeFentonPoints(fentonPoints),
    };
  } else {
    const datasetKey = sex === "male" ? "who_male" : "who_female";
    const ccaMonths = ages.ccaMonthsDecimal;
    const isUnderMin = ccaMonths < 0;
    const isOverMax = ccaMonths > CLINICAL_BOUNDS.WHO_MAX_CCA_MONTHS;
    const isAgeOutOfRange = isUnderMin || isOverMax;

    let ageOutOfRangeWarning: string | undefined = undefined;
    if (isUnderMin) {
      ageOutOfRangeWarning = `Patient PMA exceeds 50 weeks, but corrected chronological age is below 0 months (pre-term). Cannot plot on WHO infant chart.`;
    } else if (isOverMax) {
      ageOutOfRangeWarning = `Corrected chronological age (${ccaMonths.toFixed(1)} months CCA) exceeds the supported WHO 0–24 month infant growth standard horizon.`;
    }

    return {
      chartType: "who",
      standardName: whoMetadata.standard,
      datasetVersion: whoMetadata.version,
      datasetKey,
      sex,
      xAxisLabel: "Corrected Age (Months)",
      xAxisUnit: "months CCA",
      weightUnit: "kg",
      lengthUnit: "cm",
      headCircumferenceUnit: "cm",
      patientPlotAge: ccaMonths,
      isAgeOutOfRange,
      ageOutOfRangeWarning,
      routingRationale: `Patient PMA (${ages.pmaWeeksDecimal.toFixed(1)} weeks) exceeds 50.0 weeks. Standard WHO 2006 Child Growth Standards applied with age corrected for prematurity (${ccaMonths.toFixed(1)} months CCA).`,
      supportedAgeRange: "0 to 24 completed months Corrected Chronological Age",
      metadata: whoMetadata,
      data: normalizeWhoPoints(whoPoints),
    };
  }
}

/**
 * Linear interpolation between tabulated LMS parameters
 */
export function interpolateLms(
  targetAge: number,
  metric: GrowthMetric,
  data: CurvePoint[]
): {
  lms: LmsParams;
  p50: number;
  sdPoints?: { sd2neg?: number; sd3neg?: number; sd2pos?: number; sd3pos?: number };
} {
  const sorted = [...data].sort((a, b) => a.age - b.age);

  if (targetAge <= sorted[0].age) {
    const pt = sorted[0][metric];
    return {
      lms: pt.lms,
      p50: pt.p50,
      sdPoints: {
        sd2neg: pt.sd2neg,
        sd3neg: pt.sd3neg,
        sd2pos: pt.sd2,
        sd3pos: pt.sd3,
      },
    };
  }
  if (targetAge >= sorted[sorted.length - 1].age) {
    const pt = sorted[sorted.length - 1][metric];
    return {
      lms: pt.lms,
      p50: pt.p50,
      sdPoints: {
        sd2neg: pt.sd2neg,
        sd3neg: pt.sd3neg,
        sd2pos: pt.sd2,
        sd3pos: pt.sd3,
      },
    };
  }

  // Find bounding tabulated points
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].age <= targetAge && sorted[i + 1].age >= targetAge) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const ageDiff = upper.age - lower.age;
  const factor = ageDiff > 0 ? (targetAge - lower.age) / ageDiff : 0;

  const lowPt = lower[metric];
  const upPt = upper[metric];

  const L = lowPt.lms.L + (upPt.lms.L - lowPt.lms.L) * factor;
  const M = lowPt.lms.M + (upPt.lms.M - lowPt.lms.M) * factor;
  const S = lowPt.lms.S + (upPt.lms.S - lowPt.lms.S) * factor;
  const p50 = lowPt.p50 + (upPt.p50 - lowPt.p50) * factor;

  const sd2neg = lowPt.sd2neg !== undefined && upPt.sd2neg !== undefined ? lowPt.sd2neg + (upPt.sd2neg - lowPt.sd2neg) * factor : undefined;
  const sd3neg = lowPt.sd3neg !== undefined && upPt.sd3neg !== undefined ? lowPt.sd3neg + (upPt.sd3neg - lowPt.sd3neg) * factor : undefined;
  const sd2pos = lowPt.sd2 !== undefined && upPt.sd2 !== undefined ? lowPt.sd2 + (upPt.sd2 - lowPt.sd2) * factor : undefined;
  const sd3pos = lowPt.sd3 !== undefined && upPt.sd3 !== undefined ? lowPt.sd3 + (upPt.sd3 - lowPt.sd3) * factor : undefined;

  return {
    lms: {
      L: Math.round(L * 10000) / 10000,
      M: Math.round(M * 10000) / 10000,
      S: Math.round(S * 100000) / 100000,
    },
    p50: Math.round(p50 * 100) / 100,
    sdPoints: {
      sd2neg,
      sd3neg,
      sd2pos,
      sd3pos,
    },
  };
}

/**
 * Anthropometric Percentile and Z-Score Evaluation Engine
 * Single tested boundary layer unit conversion:
 * - If WHO weight: input weight in grams is converted to kg for LMS evaluation.
 * - Displays unrounded continuous values alongside clinically rounded figures.
 * - Non-diagnostic, screening decision-support clinical wording.
 */
export function evaluatePercentile(
  value: number | undefined,
  metric: GrowthMetric,
  dataset: GrowthChartDataset
): PercentileEvaluation {
  const clinicalCaveat =
    "Screening reference calculation only; not an autonomous diagnosis, prescription, or clinical adequacy decision. Evaluate alongside serial growth velocity, systemic illness, and fluid balance.";

  const emptyEval: PercentileEvaluation = {
    metric,
    observedValue: 0,
    plotAge: dataset.patientPlotAge,
    ageUnit: dataset.xAxisUnit,
    p50Value: 0,
    zScore: 0,
    zScoreUnrounded: 0,
    zScoreFormatted: "N/A",
    percentile: 0,
    percentileUnrounded: 0,
    percentileFormatted: "N/A",
    percentileBracket: "Measurement pending",
    shortBadge: "N/A",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    clinicalNote: "Enter a valid measurement to evaluate exact reference percentile and Z-score.",
    clinicalCaveat,
    interpolatedLms: { L: 1, M: 0, S: 0 },
    methodology: "Linear interpolation between tabulated LMS parameters",
    standard: dataset.standardName,
    version: dataset.datasetVersion,
    validationStatus: dataset.metadata.validationStatus,
  };

  if (value === undefined || value === null || isNaN(value) || value <= 0) {
    return emptyEval;
  }

  if (dataset.isAgeOutOfRange) {
    return {
      ...emptyEval,
      observedValue: value,
      shortBadge: "Out of Range",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      clinicalNote: dataset.ageOutOfRangeWarning || "Patient age is outside supported growth reference horizons.",
      clinicalCaveat,
    };
  }

  // Linear interpolation of LMS parameters
  const { lms, p50, sdPoints } = interpolateLms(dataset.patientPlotAge, metric, dataset.data);

  // Single boundary layer unit conversion:
  // WHO dataset has weight M in kilograms (kg), while user inputs weight in grams (g).
  const isWhoWeight = dataset.chartType === "who" && metric === "weight";
  const measurementForLms = isWhoWeight ? value / 1000 : value;

  // Compute exact continuous Z-score
  let rawZ = 0;
  if (isWhoWeight) {
    rawZ = calculateWhoAdjustedWeightZScore(measurementForLms, lms, sdPoints);
  } else {
    rawZ = calculateZScoreFromLms(measurementForLms, lms);
  }

  const roundedZ = Math.round(rawZ * 100) / 100;
  const zScoreFormatted = `${roundedZ > 0 ? "+" : ""}${roundedZ.toFixed(2)} SD`;

  // Compute exact continuous percentile via Standard Normal CDF
  const pNorm = normalCdf(rawZ) * 100;
  const roundedPercentile = Math.round(pNorm * 10) / 10;
  const percentileFormatted = `${roundedPercentile.toFixed(1)}th Percentile`;

  // Standardized p50 for clinical display (in grams if weight was entered in grams)
  const displayP50 = isWhoWeight ? Math.round(p50 * 1000) : Math.round(p50 * 10) / 10;

  // Non-diagnostic clinical decision support brackets
  let bracket = "";
  let shortBadge: PercentileEvaluation["shortBadge"] = "N/A";
  let badgeClass = "";
  let clinicalNote = "";

  if (roundedZ < -1.88) {
    bracket = "< 3rd Percentile — Screening Flag for Clinical Review";
    shortBadge = "<3rd";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
    clinicalNote =
      "Measurement falls below the 3rd percentile reference line (< -1.88 SD). This is a screening flag for clinician review, not an autonomous diagnosis of growth restriction or SGA. Interpret alongside serial trajectory, clinical illness, and fluid balance.";
  } else if (roundedZ < -1.28) {
    bracket = "3rd–10th Percentile — Low Reference Channel";
    shortBadge = "3rd-10th";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    clinicalNote =
      "Measurement lies within the low reference channel (-1.88 to -1.28 SD). Screening alert for clinician review; evaluate serial growth velocity and nutritional intake.";
  } else if (roundedZ <= 0) {
    bracket = "10th–50th Percentile — Reference Channel";
    shortBadge = "10th-50th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote =
      "Trajectory tracks within the standard reference channel (10th to 50th percentile). Interpret alongside overall clinical and nutritional context.";
  } else if (roundedZ <= 1.28) {
    bracket = "50th–90th Percentile — Reference Channel";
    shortBadge = "50th-90th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote =
      "Trajectory tracks within the standard reference channel (50th to 90th percentile). Interpret alongside overall clinical and nutritional context.";
  } else if (roundedZ <= 1.88) {
    bracket = "90th–97th Percentile — Upper Reference Channel";
    shortBadge = "90th-97th";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
    clinicalNote =
      "Measurement tracks within the upper reference channel (+1.28 to +1.88 SD). Monitor somatic accretion and hydration status.";
  } else {
    bracket = "> 97th Percentile — Screening Flag for Clinical Review";
    shortBadge = ">97th";
    badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    clinicalNote =
      "Measurement exceeds the 97th percentile reference line (> +1.88 SD). This is a screening flag for clinician review, not an autonomous diagnosis of LGA or macrocephaly. Evaluate for fluid retention or maternal metabolic factors.";
  }

  const methodology = `${dataset.standardName} (${dataset.sex === "male" ? "Boys" : "Girls"}) linear interpolation between tabulated LMS parameters (L=${lms.L}, M=${lms.M}, S=${lms.S})`;

  return {
    metric,
    observedValue: value,
    plotAge: dataset.patientPlotAge,
    ageUnit: dataset.xAxisUnit,
    p50Value: displayP50,
    zScore: roundedZ,
    zScoreUnrounded: rawZ,
    zScoreFormatted,
    percentile: roundedPercentile,
    percentileUnrounded: pNorm,
    percentileFormatted,
    percentileBracket: bracket,
    shortBadge,
    badgeClass,
    clinicalNote,
    clinicalCaveat,
    interpolatedLms: lms,
    methodology,
    standard: dataset.standardName,
    version: dataset.datasetVersion,
    validationStatus: dataset.metadata.validationStatus,
  };
}

/**
 * Computes Patel et al. 2005 2-point exponential weight velocity
 * Formula: Velocity = 1000 * ln(W2 / W1) / deltaDays (g/kg/day)
 * If deltaDays <= 0 or weights are invalid, returns 0.
 */
export function calculateWeightVelocity(
  w1Grams: number,
  w2Grams: number,
  deltaDays: number
): number {
  if (deltaDays <= 0 || w1Grams <= 0 || w2Grams <= 0) return 0;
  const velocity = (1000 * Math.log(w2Grams / w1Grams)) / deltaDays;
  return Math.round(velocity * 10) / 10;
}

/**
 * Evaluates serial measurements for longitudinal tracking and percentile crossing alerts
 * Safely handles duplicate dates, chronologically reversed records, and weight loss.
 */
export function evaluateLongitudinalRecords(
  records: Array<{ date: string; weightGrams: number; lengthCm?: number; headCircumferenceCm?: number }>,
  gaWeeks: number,
  gaDays: number,
  dob: unknown,
  sex: BiologicalSex
): LongitudinalRecord[] {
  if (!records || records.length === 0) return [];

  // Sort chronologically by parsed UTC timestamp
  const sorted = [...records].sort((a, b) => {
    const pA = parseStrictCalendarDate(a.date);
    const pB = parseStrictCalendarDate(b.date);
    return (pA.utcTimestamp || 0) - (pB.utcTimestamp || 0);
  });

  const evaluated: LongitudinalRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const age = calculateAges(gaWeeks, gaDays, dob, item.date);
    const dataset = getGrowthDataset(sex, age);

    const wEval = evaluatePercentile(item.weightGrams, "weight", dataset);
    const lEval = item.lengthCm ? evaluatePercentile(item.lengthCm, "length", dataset) : undefined;
    const hcEval = item.headCircumferenceCm ? evaluatePercentile(item.headCircumferenceCm, "headCircumference", dataset) : undefined;

    let deltaWeightZScore: number | undefined = undefined;
    let weightVelocity: number | undefined = undefined;
    let trendAlert: string | undefined = undefined;
    let isDuplicateDate = false;

    if (i > 0) {
      const prev = evaluated[i - 1];
      const pPrev = parseStrictCalendarDate(sorted[i - 1].date);
      const pCurr = parseStrictCalendarDate(item.date);

      const msPerDay = 24 * 60 * 60 * 1000;
      const deltaDays = Math.floor(
        ((pCurr.utcTimestamp || 0) - (pPrev.utcTimestamp || 0)) / msPerDay
      );

      if (deltaDays === 0) {
        isDuplicateDate = true;
        trendAlert = "Duplicate date entry; velocity cannot be computed across zero days.";
      } else if (deltaDays > 0) {
        deltaWeightZScore = Math.round((wEval.zScore - prev.weightZScore) * 100) / 100;
        weightVelocity = calculateWeightVelocity(sorted[i - 1].weightGrams, item.weightGrams, deltaDays);

        if (item.weightGrams < sorted[i - 1].weightGrams) {
          trendAlert = `Screening alert for clinician review—not a diagnosis. Patient demonstrated negative weight velocity (${weightVelocity.toFixed(1)} g/kg/d).`;
        } else if (deltaWeightZScore < -0.67) {
          trendAlert = `Screening alert for clinician review—not a diagnosis. Weight Z-score declined by ${Math.abs(deltaWeightZScore).toFixed(2)} SD (>0.67 SD indicates dropping a full percentile channel).`;
        } else if (deltaWeightZScore > 0.67) {
          trendAlert = `Screening alert for clinician review—not a diagnosis. Rapid upward channel crossing (+${deltaWeightZScore.toFixed(2)} SD); monitor somatic accretion.`;
        } else {
          trendAlert = "Trajectory tracking within reference growth channel (ΔZ within ±0.67 SD).";
        }
      }
    }

    evaluated.push({
      id: `record-${i + 1}-${item.date}`,
      date: item.date,
      weightGrams: item.weightGrams,
      lengthCm: item.lengthCm,
      headCircumferenceCm: item.headCircumferenceCm,
      caDays: age.caTotalDays,
      pmaWeeksDecimal: age.pmaWeeksDecimal,
      ccaMonthsDecimal: age.ccaMonthsDecimal,
      weightZScore: wEval.zScore,
      weightPercentile: wEval.percentile,
      deltaWeightZScore,
      weightVelocityGPerKgPerDay: weightVelocity,
      lengthZScore: lEval?.zScore,
      lengthPercentile: lEval?.percentile,
      hcZScore: hcEval?.zScore,
      hcPercentile: hcEval?.percentile,
      trendAlert,
      isDuplicateDate,
    });
  }

  return evaluated;
}

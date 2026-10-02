/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Sex-Specific Growth, Age Correction & Longitudinal Tracking Engine
 * Reference: Fenton 2013 Preterm Growth Curves & WHO 2006 Child Growth Standards
 * 
 * Technical Implementation:
 * - Linear interpolation between tabulated LMS parameters
 * - Exact Box-Cox Z-score calculation
 * - Cumulative normal CDF percentiles
 * - Patel et al. 2005 2-point exponential weight velocity
 * - Cautious decision-support clinical interpretation wording
 */

import growthLmsData from "./data/growth-curves-lms.json";
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
  datasetKey: "fenton_male" | "fenton_female" | "who_male" | "who_female";
  sex: BiologicalSex;
  xAxisLabel: string;
  xAxisUnit: "weeks PMA" | "months CCA";
  patientPlotAge: number;
  isAgeOutOfRange: boolean;
  ageOutOfRangeWarning?: string;
  routingRationale: string;
  supportedAgeRange: string;
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
  percentileFormula: "Percentile = Phi(Z) * 100 via standard normal cumulative distribution function",
  extremeZHandling: "WHO right-tail and left-tail standard deviation adjustments applied for |Z| > 3 SD per WHO MGRS specification",
  outOfRangeHandling: "Values outside supported dataset age horizons (Fenton <22w or WHO >24m) return 'Out of range' status with no fabricated percentiles",
};

export const CLINICAL_INTERPRETATION_FACTORS = [
  "Accurate gestational-age dating at birth (ultrasound vs LMP)",
  "Reliable and standardized anthropometric measurement techniques",
  "Serial longitudinal data rather than isolated single cross-sectional points",
  "Fluid balance, third-spacing, and peripheral edema",
  "Birth size, intrauterine growth trajectory, and birth percentile",
  "Acute and chronic systemic illness (e.g. BPD, NEC, sepsis)",
  "Actual enteral and parenteral nutrient intake",
  "Serial laboratory and metabolic status (BUN, creatinine, electrolytes, acid-base)",
];

export interface PercentileEvaluation {
  metric: GrowthMetric;
  observedValue: number;
  plotAge: number;
  ageUnit: string;
  p50Value: number;
  zScore: number;
  zScoreFormatted: string; // e.g. "-1.42 SD"
  percentile: number;
  percentileFormatted: string; // e.g. "7.8th Percentile"
  percentileBracket: string;
  shortBadge: "<3rd" | "3rd-10th" | "10th-50th" | "50th-90th" | "90th-97th" | ">97th" | "Out of Range" | "N/A";
  badgeClass: string;
  clinicalNote: string;
  clinicalCaveat: string;
  interpolatedLms: LmsParams;
  methodology: string;
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
 */
export function calculateZScoreFromLms(value: number, lms: LmsParams): number {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0 || S <= 0) return 0;

  if (Math.abs(L) < 0.0001) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1.0) / (L * S);
}

/**
 * WHO Adjusted Z-score for extreme weight tails (|Z| > 3)
 */
export function calculateWhoAdjustedWeightZScore(weightGrams: number, lms: LmsParams): number {
  const rawZ = calculateZScoreFromLms(weightGrams, lms);
  const { L, M, S } = lms;

  if (rawZ > 3) {
    const sd3pos = Math.abs(L) < 0.0001 ? M * Math.exp(S * 3) : M * Math.pow(1 + L * S * 3, 1 / L);
    const sd2pos = Math.abs(L) < 0.0001 ? M * Math.exp(S * 2) : M * Math.pow(1 + L * S * 2, 1 / L);
    const sd23pos = sd3pos - sd2pos;
    if (sd23pos > 0) {
      return 3 + (weightGrams - sd3pos) / sd23pos;
    }
  } else if (rawZ < -3) {
    const sd3neg = Math.abs(L) < 0.0001 ? M * Math.exp(S * -3) : M * Math.pow(1 + L * S * -3, 1 / L);
    const sd2neg = Math.abs(L) < 0.0001 ? M * Math.exp(S * -2) : M * Math.pow(1 + L * S * -2, 1 / L);
    const sd23neg = sd2neg - sd3neg;
    if (sd23neg > 0) {
      return -3 + (weightGrams - sd3neg) / sd23neg;
    }
  }

  return rawZ;
}

/**
 * Deterministic UTC-Safe Age Calculation Engine
 * Rejects invalid dates, impossible dates, and future assessment dates.
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
 * Dynamic Dataset Routing:
 * - If PMA <= 50 weeks: Fenton Preterm Chart (PMA on X-axis)
 * - If PMA > 50 weeks: WHO Child Growth Standards (CCA in months on X-axis)
 * - Returns explicit routing metadata, supported range, and clinical rationale.
 */
export function getGrowthDataset(
  sex: BiologicalSex,
  ages: AgeCalculations
): GrowthChartDataset {
  if (ages.isBlocked) {
    const raw = (growthLmsData as Record<string, any>)["fenton_male"];
    return {
      chartType: "fenton",
      standardName: raw.standard,
      datasetKey: "fenton_male",
      sex,
      xAxisLabel: "Post-Menstrual Age (Weeks)",
      xAxisUnit: "weeks PMA",
      patientPlotAge: 28,
      isAgeOutOfRange: true,
      ageOutOfRangeWarning: "Age calculation blocked by input validation.",
      routingRationale: "Validation blocked; chart display inactive.",
      supportedAgeRange: "22 to 50 weeks PMA",
      data: raw.points,
    };
  }

  const isFenton = ages.pmaWeeksDecimal <= CLINICAL_BOUNDS.FENTON_MAX_PMA_WEEKS;

  if (isFenton) {
    const datasetKey = sex === "male" ? "fenton_male" : "fenton_female";
    const raw = (growthLmsData as Record<string, any>)[datasetKey];

    const isUnderMin = ages.pmaWeeksDecimal < CLINICAL_BOUNDS.FENTON_MIN_PMA_WEEKS;
    const isAgeOutOfRange = isUnderMin;
    const ageOutOfRangeWarning = isUnderMin
      ? `Post-menstrual age (${ages.pmaWeeksDecimal} weeks PMA) is below the Fenton 2013 chart lower limit of 22 weeks PMA.`
      : undefined;

    return {
      chartType: "fenton",
      standardName: raw.standard,
      datasetKey,
      sex,
      xAxisLabel: "Post-Menstrual Age (Weeks)",
      xAxisUnit: "weeks PMA",
      patientPlotAge: ages.pmaWeeksDecimal,
      isAgeOutOfRange,
      ageOutOfRangeWarning,
      routingRationale: `Patient PMA is ${ages.pmaWeeksDecimal} weeks (<= 50 completed weeks). Fenton 2013 preterm reference standard applies.`,
      supportedAgeRange: "22 to 50 completed weeks PMA",
      data: raw.points,
    };
  } else {
    const datasetKey = sex === "male" ? "who_male" : "who_female";
    const raw = (growthLmsData as Record<string, any>)[datasetKey];

    const ccaMonths = ages.ccaMonthsDecimal;
    const isOverMax = ccaMonths > CLINICAL_BOUNDS.WHO_MAX_CCA_MONTHS;
    const isAgeOutOfRange = isOverMax;
    const ageOutOfRangeWarning = isOverMax
      ? `Corrected chronological age (${ccaMonths.toFixed(1)} months) exceeds the supported WHO 0–24 month infant growth standard.`
      : undefined;

    return {
      chartType: "who",
      standardName: raw.standard,
      datasetKey,
      sex,
      xAxisLabel: "Corrected Age (Months)",
      xAxisUnit: "months CCA",
      patientPlotAge: ccaMonths,
      isAgeOutOfRange,
      ageOutOfRangeWarning,
      routingRationale: `Patient PMA (${ages.pmaWeeksDecimal} weeks) exceeds 50 weeks. Standard WHO 2006 Child Growth Standards applied with age corrected for prematurity.`,
      supportedAgeRange: "0 to 24 months Corrected Chronological Age",
      data: raw.points,
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
): { lms: LmsParams; p50: number } {
  const sorted = [...data].sort((a, b) => a.age - b.age);

  if (targetAge <= sorted[0].age) {
    const pt = sorted[0][metric];
    return { lms: pt.lms, p50: pt.p50 };
  }
  if (targetAge >= sorted[sorted.length - 1].age) {
    const pt = sorted[sorted.length - 1][metric];
    return { lms: pt.lms, p50: pt.p50 };
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

  const lowLms = lower[metric].lms;
  const upLms = upper[metric].lms;

  const L = lowLms.L + (upLms.L - lowLms.L) * factor;
  const M = lowLms.M + (upLms.M - lowLms.M) * factor;
  const S = lowLms.S + (upLms.S - lowLms.S) * factor;
  const p50 = lower[metric].p50 + (upper[metric].p50 - lower[metric].p50) * factor;

  return {
    lms: {
      L: Math.round(L * 10000) / 10000,
      M: Math.round(M * 100) / 100,
      S: Math.round(S * 100000) / 100000,
    },
    p50: Math.round(p50 * 10) / 10,
  };
}

/**
 * Anthropometric Percentile and Z-Score Evaluation Engine
 * Uses linear interpolation between tabulated LMS parameters and cautious clinical wording.
 */
export function evaluatePercentile(
  value: number | undefined,
  metric: GrowthMetric,
  dataset: GrowthChartDataset
): PercentileEvaluation {
  const clinicalCaveat =
    "Screening assessment only; not a diagnosis or automatic treatment recommendation. Evaluate alongside serial trajectory, clinical illness, and hydration.";

  const emptyEval: PercentileEvaluation = {
    metric,
    observedValue: 0,
    plotAge: dataset.patientPlotAge,
    ageUnit: dataset.xAxisUnit,
    p50Value: 0,
    zScore: 0,
    zScoreFormatted: "N/A",
    percentile: 0,
    percentileFormatted: "N/A",
    percentileBracket: "Measurement pending",
    shortBadge: "N/A",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    clinicalNote: "Enter a valid measurement to determine exact percentile and Z-score.",
    clinicalCaveat,
    interpolatedLms: { L: 1, M: 0, S: 0 },
    methodology: "Linear interpolation between tabulated LMS parameters",
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
      clinicalNote: dataset.ageOutOfRangeWarning || "Patient age is outside supported growth reference curves.",
      clinicalCaveat,
    };
  }

  // Linear interpolation of LMS parameters
  const { lms, p50 } = interpolateLms(dataset.patientPlotAge, metric, dataset.data);

  // Compute exact continuous Z-score
  let rawZ = 0;
  if (dataset.chartType === "who" && metric === "weight") {
    rawZ = calculateWhoAdjustedWeightZScore(value, lms);
  } else {
    rawZ = calculateZScoreFromLms(value, lms);
  }

  const roundedZ = Math.round(rawZ * 100) / 100;
  const zScoreFormatted = `${roundedZ > 0 ? "+" : ""}${roundedZ.toFixed(2)} SD`;

  // Compute exact percentile via Normal CDF
  const pNorm = normalCdf(rawZ) * 100;
  const roundedPercentile = Math.round(pNorm * 10) / 10;
  const percentileFormatted = `${roundedPercentile.toFixed(1)}th Percentile`;

  // Determine standard clinical percentile bracket with cautious decision-support language
  let bracket = "";
  let shortBadge: PercentileEvaluation["shortBadge"] = "N/A";
  let badgeClass = "";
  let clinicalNote = "";

  if (roundedZ < -1.88) {
    bracket = "< 3rd Percentile (Significant Growth Restriction / Small for Gestational Age)";
    shortBadge = "<3rd";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
    clinicalNote =
      "This value is a screening flag for clinician review. Interpret with serial growth, fluid status, measurement quality, illness severity, and nutrient intake.";
  } else if (roundedZ < -1.28) {
    bracket = "3rd to 10th Percentile (Mild Growth Restriction / Borderline Low Zone)";
    shortBadge = "3rd-10th";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    clinicalNote =
      "Value lies in borderline low reference channel (-1.88 to -1.28 SD). Screening alert for clinician review; interpret with nutritional intake and serial growth.";
  } else if (roundedZ <= 0) {
    bracket = "10th to 50th Percentile (Normal Appropriate Range)";
    shortBadge = "10th-50th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote =
      "Trajectory is within the selected reference channel; interpret alongside clinical context.";
  } else if (roundedZ <= 1.28) {
    bracket = "50th to 90th Percentile (Normal Appropriate Range)";
    shortBadge = "50th-90th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote =
      "Trajectory is within the selected reference channel; interpret alongside clinical context.";
  } else if (roundedZ <= 1.88) {
    bracket = "90th to 97th Percentile (Upper Physiological Range)";
    shortBadge = "90th-97th";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
    clinicalNote =
      "Upper reference channel (+1.28 to +1.88 SD). Monitor somatic accretion and verify fluid balance.";
  } else {
    bracket = "> 97th Percentile (Large for Gestational Age / Macrocephaly)";
    shortBadge = ">97th";
    badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    clinicalNote =
      "Value exceeds 97th percentile reference line (> +1.88 SD). Screening alert for clinician review; evaluate for fluid retention or maternal metabolic factors.";
  }

  const methodology = `${dataset.standardName} (${dataset.sex === "male" ? "Boys" : "Girls"}) linear interpolation between tabulated LMS parameters (L=${lms.L}, M=${lms.M}, S=${lms.S})`;

  return {
    metric,
    observedValue: value,
    plotAge: dataset.patientPlotAge,
    ageUnit: dataset.xAxisUnit,
    p50Value: p50,
    zScore: roundedZ,
    zScoreFormatted,
    percentile: roundedPercentile,
    percentileFormatted,
    percentileBracket: bracket,
    shortBadge,
    badgeClass,
    clinicalNote,
    clinicalCaveat,
    interpolatedLms: lms,
    methodology,
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
  // Exponential model: 1000 * ln(W2 / W1) / deltaDays
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
          trendAlert = `Screening alert for clinician review—not a diagnosis. Rapid upward channel crossing (+${deltaWeightZScore.toFixed(2)} SD); monitor body composition.`;
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

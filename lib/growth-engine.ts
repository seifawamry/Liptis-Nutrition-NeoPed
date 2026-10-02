/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Sex-Specific Growth, Age Correction & Longitudinal Tracking Engine
 * Reference: Fenton 2013 Preterm Growth Curves & WHO 2006 Child Growth Standards
 * Features continuous LMS interpolation, exact Z-scores, normal CDF percentiles,
 * and serial weight velocity calculations.
 */

import growthLmsData from "./data/growth-curves-lms.json";
import { validateGrowthInputs, ValidationReport, CLINICAL_BOUNDS } from "./validation";

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
  data: CurvePoint[];
}

export interface PercentileEvaluation {
  metric: GrowthMetric;
  observedValue: number;
  plotAge: number;
  ageUnit: string;
  p50Value: number;
  zScore: number; // Exact continuous Z-score (e.g. -1.42)
  zScoreFormatted: string; // "-1.42 SD"
  percentile: number; // Exact continuous percentile (e.g. 7.8)
  percentileFormatted: string; // "7.8th Percentile"
  percentileBracket: string;
  shortBadge: "<3rd" | "3rd-10th" | "10th-50th" | "50th-90th" | "90th-97th" | ">97th" | "Out of Range" | "N/A";
  badgeClass: string;
  clinicalNote: string;
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
  weightVelocityGPerKgPerDay?: number; // Average weight velocity
  lengthZScore?: number;
  lengthPercentile?: number;
  hcZScore?: number;
  hcPercentile?: number;
  trendAlert?: string;
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
 * Strict verification: Zero silent clamping of DOM < DOB.
 */
export function calculateAges(
  gaWeeks: number,
  gaDays: number,
  dateOfBirth: string | Date,
  dateOfMeasurement: string | Date = new Date()
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
    dayOfLife: 1,
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

  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const dom = typeof dateOfMeasurement === "string" ? new Date(dateOfMeasurement) : dateOfMeasurement;

  const dobUtc = Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate());
  const domUtc = Date.UTC(dom.getFullYear(), dom.getMonth(), dom.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const caTotalDays = Math.floor((domUtc - dobUtc) / msPerDay);

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
 * - Strict checking: flags if age exceeds chart boundary instead of silent clamping.
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
      data: raw.points,
    };
  }

  const isFenton = ages.pmaWeeksDecimal <= CLINICAL_BOUNDS.FENTON_MAX_PMA_WEEKS;

  if (isFenton) {
    const datasetKey = sex === "male" ? "fenton_male" : "fenton_female";
    const raw = (growthLmsData as Record<string, any>)[datasetKey];

    const isUnderMin = ages.pmaWeeksDecimal < 22;
    const isAgeOutOfRange = isUnderMin;
    const ageOutOfRangeWarning = isUnderMin
      ? `PMA (${ages.pmaWeeksDecimal} weeks) is below the Fenton 2013 chart minimum of 22 weeks.`
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
      data: raw.points,
    };
  } else {
    const datasetKey = sex === "male" ? "who_male" : "who_female";
    const raw = (growthLmsData as Record<string, any>)[datasetKey];

    const ccaMonths = ages.ccaMonthsDecimal;
    const isOverMax = ccaMonths > CLINICAL_BOUNDS.WHO_MAX_CCA_MONTHS;
    const isAgeOutOfRange = isOverMax;
    const ageOutOfRangeWarning = isOverMax
      ? `Corrected age (${ccaMonths.toFixed(1)} months) exceeds the supported WHO 0–24 month infant growth standard.`
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
      data: raw.points,
    };
  }
}

/**
 * Continuous linear interpolation of LMS parameters between curve points
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

  // Find bounding points
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
 * Continuous LMS Percentile and Z-Score Evaluation Engine
 */
export function evaluatePercentile(
  value: number | undefined,
  metric: GrowthMetric,
  dataset: GrowthChartDataset
): PercentileEvaluation {
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
    interpolatedLms: { L: 1, M: 0, S: 0 },
    methodology: "LMS continuous interpolation",
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
    };
  }

  // Interpolate continuous LMS
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

  // Determine standard clinical percentile bracket
  let bracket = "";
  let shortBadge: PercentileEvaluation["shortBadge"] = "N/A";
  let badgeClass = "";
  let clinicalNote = "";

  if (roundedZ < -1.88) {
    bracket = "< 3rd Percentile (Significant Growth Restriction / Small for Gestational Age)";
    shortBadge = "<3rd";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
    clinicalNote = "Significantly below expected percentile channel (Z < -1.88 SD). Indicates high risk of extrauterine growth restriction (EUGR); requires nutritional intensification review.";
  } else if (roundedZ < -1.28) {
    bracket = "3rd to 10th Percentile (Mild Growth Restriction / Borderline Low Zone)";
    shortBadge = "3rd-10th";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    clinicalNote = "Borderline low somatic growth channel (-1.88 to -1.28 SD). Close clinical monitoring and optimized protein-to-energy ratio recommended.";
  } else if (roundedZ <= 0) {
    bracket = "10th to 50th Percentile (Normal Appropriate Range)";
    shortBadge = "10th-50th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote = "Appropriate for gestational age (AGA, -1.28 to 0 SD). Stable somatic growth trajectory.";
  } else if (roundedZ <= 1.28) {
    bracket = "50th to 90th Percentile (Normal Appropriate Range)";
    shortBadge = "50th-90th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote = "Optimal catch-up trajectory within standard physiological limits (0 to +1.28 SD).";
  } else if (roundedZ <= 1.88) {
    bracket = "90th to 97th Percentile (Upper Physiological Range)";
    shortBadge = "90th-97th";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
    clinicalNote = "Robust somatic accretion (+1.28 to +1.88 SD). Verify fluid balance and metabolic tolerance.";
  } else {
    bracket = "> 97th Percentile (Large for Gestational Age / Macrocephaly)";
    shortBadge = ">97th";
    badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    clinicalNote = "Exceeds 97th percentile band (Z > +1.88 SD). Screen for excessive fat accretion or fluid retention.";
  }

  const methodology = `${dataset.standardName} (${dataset.sex === "male" ? "Boys" : "Girls"}) continuous LMS interpolation (L=${lms.L}, M=${lms.M}, S=${lms.S})`;

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
    interpolatedLms: lms,
    methodology,
  };
}

/**
 * Computes Patel et al. 2005 average-weight neonatal growth velocity
 * Velocity = (W2 - W1) / [((W1 + W2)/2000) * deltaDays] (g/kg/day)
 */
export function calculateWeightVelocity(
  w1Grams: number,
  w2Grams: number,
  deltaDays: number
): number {
  if (deltaDays <= 0 || w1Grams <= 0 || w2Grams <= 0) return 0;
  const avgWeightKg = (w1Grams + w2Grams) / 2000;
  const velocity = (w2Grams - w1Grams) / (avgWeightKg * deltaDays);
  return Math.round(velocity * 10) / 10;
}

/**
 * Evaluates serial measurements for longitudinal tracking and percentile crossing alerts
 */
export function evaluateLongitudinalRecords(
  records: Array<{ date: string; weightGrams: number; lengthCm?: number; headCircumferenceCm?: number }>,
  gaWeeks: number,
  gaDays: number,
  dob: string | Date,
  sex: BiologicalSex
): LongitudinalRecord[] {
  if (!records || records.length === 0) return [];

  // Sort chronologically
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    if (i > 0) {
      const prev = evaluated[i - 1];
      const prevDate = new Date(sorted[i - 1].date);
      const currDate = new Date(item.date);
      const deltaDays = Math.max(1, Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)));

      deltaWeightZScore = Math.round((wEval.zScore - prev.weightZScore) * 100) / 100;
      weightVelocity = calculateWeightVelocity(sorted[i - 1].weightGrams, item.weightGrams, deltaDays);

      // Clinical alert for channel crossing
      if (deltaWeightZScore < -0.67) {
        trendAlert = `Warning: Weight Z-score dropped by ${Math.abs(deltaWeightZScore).toFixed(2)} SD (>0.67 SD indicates dropping a full percentile channel, risk of EUGR).`;
      } else if (deltaWeightZScore > 0.67) {
        trendAlert = `Rapid catch-up growth: Weight Z-score increased by +${deltaWeightZScore.toFixed(2)} SD (>0.67 SD channel crossing).`;
      } else {
        trendAlert = "Stable trajectory tracking along growth channel (ΔZ within ±0.67 SD).";
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
    });
  }

  return evaluated;
}

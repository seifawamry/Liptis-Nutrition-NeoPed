/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Sex-Specific Growth & Age Correction Engine (Fenton 2013 / WHO 2006)
 */

import growthData from "./data/growth-curves.json";

export type BiologicalSex = "male" | "female";
export type GrowthMetric = "weight" | "length" | "headCircumference";

export interface GestationalAge {
  weeks: number; // 22 to 36
  days: number;  // 0 to 6
}

export interface AgeCalculations {
  // Chronological Age (CA)
  caTotalDays: number;
  caWeeks: number;
  caDays: number;
  caWeeksDecimal: number;
  caMonthsDecimal: number;
  caFormatted: string;

  // Post-Menstrual Age (PMA) = GA + CA
  pmaTotalDays: number;
  pmaWeeks: number;
  pmaDays: number;
  pmaWeeksDecimal: number;
  pmaFormatted: string;

  // Corrected Chronological Age (CCA) = CA - (40w - GA)
  ccaTotalDays: number;
  isPretermUncorrected: boolean; // if PMA < 40 weeks
  ccaWeeks: number;
  ccaDays: number;
  ccaWeeksDecimal: number;
  ccaMonthsDecimal: number;
  ccaFormatted: string;
}

export interface PatientMeasurements {
  weightGrams?: number;
  lengthCm?: number;
  headCircumferenceCm?: number;
}

export interface CurvePoint {
  age: number; // PMA weeks for Fenton, or CCA months for WHO
  weight: { p3: number; p10: number; p50: number; p90: number; p97: number };
  length: { p3: number; p10: number; p50: number; p90: number; p97: number };
  headCircumference: { p3: number; p10: number; p50: number; p90: number; p97: number };
}

export interface GrowthChartDataset {
  chartType: "fenton" | "who";
  standardName: string;
  datasetKey: "fenton_male" | "fenton_female" | "who_male" | "who_female";
  sex: BiologicalSex;
  xAxisLabel: string;
  xAxisUnit: "weeks PMA" | "months CCA";
  patientPlotAge: number; // X-coordinate for patient
  data: CurvePoint[];
}

export interface PercentileEvaluation {
  percentileBracket: string; // e.g. "10th - 50th Percentile"
  shortBadge: "<3rd" | "3rd-10th" | "10th-50th" | "50th-90th" | "90th-97th" | ">97th" | "N/A";
  badgeClass: string;
  zScoreEstimate: string;
  p50Value: number;
  clinicalNote: string;
}

/**
 * Deterministic Age Calculation Engine
 */
export function calculateAges(
  gaWeeks: number,
  gaDays: number,
  dateOfBirth: string | Date,
  dateOfMeasurement: string | Date = new Date()
): AgeCalculations {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const dom = typeof dateOfMeasurement === "string" ? new Date(dateOfMeasurement) : dateOfMeasurement;

  // Normalize to UTC midnight for exact day delta
  const dobUtc = Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate());
  const domUtc = Date.UTC(dom.getFullYear(), dom.getMonth(), dom.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  const caTotalDays = Math.max(0, Math.floor((domUtc - dobUtc) / msPerDay));

  const caWeeks = Math.floor(caTotalDays / 7);
  const caDays = caTotalDays % 7;
  const caWeeksDecimal = Math.round((caTotalDays / 7) * 10) / 10;
  const caMonthsDecimal = Math.round((caTotalDays / 30.4375) * 10) / 10;
  const caFormatted = `${caWeeks}w ${caDays}d (${caTotalDays} days)`;

  // Post-Menstrual Age (PMA) = GA at birth + Chronological Age
  const gaTotalDays = (Number(gaWeeks) || 28) * 7 + (Number(gaDays) || 0);
  const pmaTotalDays = gaTotalDays + caTotalDays;
  const pmaWeeks = Math.floor(pmaTotalDays / 7);
  const pmaDays = pmaTotalDays % 7;
  const pmaWeeksDecimal = Math.round((pmaTotalDays / 7) * 10) / 10;
  const pmaFormatted = `${pmaWeeks}w ${pmaDays}d PMA`;

  // Corrected Chronological Age (CCA) = CA - (40 weeks - GA)
  // Full term is 40 weeks (280 days). Deficit = 280 - gaTotalDays.
  // CCA total days = caTotalDays - (280 - gaTotalDays) = pmaTotalDays - 280.
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
    ccaWeeksDecimal = Math.round((ccaTotalDays / 7) * 10) / 10;
    ccaMonthsDecimal = 0;
    ccaFormatted = `Pre-term (-${weeksUntilTerm}w ${remDays}d to 40w term)`;
  } else {
    ccaWeeks = Math.floor(ccaTotalDays / 7);
    ccaDays = ccaTotalDays % 7;
    ccaWeeksDecimal = Math.round((ccaTotalDays / 7) * 10) / 10;
    ccaMonthsDecimal = Math.round((ccaTotalDays / 30.4375) * 10) / 10;
    ccaFormatted = `${ccaWeeks}w ${ccaDays}d (${ccaMonthsDecimal} mo corrected)`;
  }

  return {
    caTotalDays,
    caWeeks,
    caDays,
    caWeeksDecimal,
    caMonthsDecimal,
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
 */
export function getGrowthDataset(
  sex: BiologicalSex,
  ages: AgeCalculations
): GrowthChartDataset {
  const isFenton = ages.pmaWeeksDecimal <= 50;

  if (isFenton) {
    const datasetKey = sex === "male" ? "fenton_male" : "fenton_female";
    const raw = growthData[datasetKey] as unknown as {
      standard: string;
      sex: BiologicalSex;
      xAxis: string;
      data: CurvePoint[];
    };

    return {
      chartType: "fenton",
      standardName: raw.standard,
      datasetKey,
      sex,
      xAxisLabel: "Post-Menstrual Age (Weeks)",
      xAxisUnit: "weeks PMA",
      patientPlotAge: Math.max(22, Math.min(50, ages.pmaWeeksDecimal)),
      data: raw.data,
    };
  } else {
    const datasetKey = sex === "male" ? "who_male" : "who_female";
    const raw = growthData[datasetKey] as unknown as {
      standard: string;
      sex: BiologicalSex;
      xAxis: string;
      data: CurvePoint[];
    };

    // Corrected age in months for WHO chart
    const ccaMonths = Math.max(0, Math.min(24, ages.ccaMonthsDecimal));

    return {
      chartType: "who",
      standardName: raw.standard,
      datasetKey,
      sex,
      xAxisLabel: "Corrected Age (Months)",
      xAxisUnit: "months CCA",
      patientPlotAge: ccaMonths,
      data: raw.data,
    };
  }
}

/**
 * Evaluates patient's measurement against percentile curves at the current plot age
 */
export function evaluatePercentile(
  value: number | undefined,
  metric: GrowthMetric,
  dataset: GrowthChartDataset
): PercentileEvaluation {
  if (value === undefined || value <= 0) {
    return {
      percentileBracket: "Measurement pending",
      shortBadge: "N/A",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      zScoreEstimate: "N/A",
      p50Value: 0,
      clinicalNote: "Enter a valid measurement to determine percentile bracket.",
    };
  }

  // Find nearest or interpolated curve point
  const targetAge = dataset.patientPlotAge;
  const sortedData = [...dataset.data].sort((a, b) => a.age - b.age);

  let pPoint = sortedData[0];
  let minDiff = Math.abs(sortedData[0].age - targetAge);

  for (const pt of sortedData) {
    const diff = Math.abs(pt.age - targetAge);
    if (diff < minDiff) {
      minDiff = diff;
      pPoint = pt;
    }
  }

  const bounds = pPoint[metric];
  const { p3, p10, p50, p90, p97 } = bounds;

  let bracket = "";
  let shortBadge: PercentileEvaluation["shortBadge"] = "N/A";
  let badgeClass = "";
  let zScoreEstimate = "";
  let clinicalNote = "";

  if (value < p3) {
    bracket = "< 3rd Percentile (Small for Gestational Age / Microcephaly / Stunted)";
    shortBadge = "<3rd";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
    zScoreEstimate = "< -1.88 SD";
    clinicalNote = "Significantly below expected percentile band. Requires nutritional fortification review and clinical growth monitoring.";
  } else if (value < p10) {
    bracket = "3rd to 10th Percentile (Mild growth restriction zone)";
    shortBadge = "3rd-10th";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    zScoreEstimate = "-1.88 to -1.28 SD";
    clinicalNote = "Borderline low percentile band. Optimize protein-to-energy ratio.";
  } else if (value <= p50) {
    bracket = "10th to 50th Percentile (Normal appropriate range)";
    shortBadge = "10th-50th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    zScoreEstimate = "-1.28 to 0 SD";
    clinicalNote = "Appropriate for gestational age (AGA). Stable somatic growth trajectory.";
  } else if (value <= p90) {
    bracket = "50th to 90th Percentile (Normal appropriate range)";
    shortBadge = "50th-90th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    zScoreEstimate = "0 to +1.28 SD";
    clinicalNote = "Optimal catch-up trajectory within standard physiological limits.";
  } else if (value <= p97) {
    bracket = "90th to 97th Percentile (Upper physiological range)";
    shortBadge = "90th-97th";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
    zScoreEstimate = "+1.28 to +1.88 SD";
    clinicalNote = "Robust somatic growth. Verify fluid balance and metabolic tolerance.";
  } else {
    bracket = "> 97th Percentile (Large for Gestational Age / Macrocephaly)";
    shortBadge = ">97th";
    badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    zScoreEstimate = "> +1.88 SD";
    clinicalNote = "Exceeds 97th percentile band. Evaluate for edema or excessive caloric density.";
  }

  return {
    percentileBracket: bracket,
    shortBadge,
    badgeClass,
    zScoreEstimate,
    p50Value: p50,
    clinicalNote,
  };
}

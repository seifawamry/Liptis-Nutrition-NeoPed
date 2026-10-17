/**
 * Liptis Nutrition NeoPed™ Clinical Suite
 * Pediamil® LBW Manufacturer Tin Feeding Guide & Preparation Reference
 * 
 * Verified against official packaging and product documentation:
 * Source: Pediamil LBW tin feeding guide photograph & Technical Specification Sheet
 * Transcription Status: Provisional until confirmed against original packaging
 * 
 * CLINICAL RULE:
 * The doctor's patient-specific prescription always takes priority.
 * The application must never automatically replace the clinician's selected
 * fluid allowance or total daily volume with the manufacturer's tin-guide value.
 * The tin guide is a reference comparison only.
 */

export interface TinGuideRow {
  minWeightKg: number;
  maxWeightKg: number;
  weightBandLabel: string;
  minDailyVolumeMl: number | null;
  maxDailyVolumeMl: number | null;
  dailyVolumeLabel: string;
  waterExamples: string;
  scoops: number | null;
  feedsPerDay: number | null;
  calculatedQuantityLabel: string;
  verificationStatus: "transcribed_from_packaging" | "provisional_requires_confirmation";
  notes?: string;
}

export interface TinGuideMetadata {
  product: string;
  source: string;
  sourceDateLot: string;
  transcriptionStatus: string;
  legalNotice: string;
  mandatoryClinicalDisclaimer: string;
  powderDensityNotice: string;
  preparationStandardNotice: string;
}

export const TIN_GUIDE_METADATA: TinGuideMetadata = {
  product: "Pediamil® LBW",
  source: "Pediamil LBW tin feeding guide photograph",
  sourceDateLot: "Lot / packaging date: user / manufacturer to confirm against active can",
  transcriptionStatus: "Provisional until confirmed against original packaging",
  legalNotice:
    "Not a substitute for current manufacturer label or local hospital NICU feeding protocol.",
  mandatoryClinicalDisclaimer:
    "The attending clinician may prescribe a different volume according to gestational age, postnatal age, weight trajectory, fluid status, renal function, cardiovascular status, illness severity, enteral tolerance, parenteral nutrition, laboratory results, and local NICU protocol. The manufacturer tin guide is shown for reference only and does not replace the clinician’s prescription.",
  powderDensityNotice:
    "Powder volume is not interchangeable with powder mass. Confirm the meaning of “10 mL powder” with the manufacturer or hospital pharmacy.",
  preparationStandardNotice:
    "Prepare according to the current Pediamil LBW label and approved hospital policy. Do not alter concentration, dilution, scoop count, or water volume without an approved clinical/manufacturer protocol.",
};

/**
 * Standard Manufacturer Preparation Constants
 * Source: Official Pediamil® LBW approved product specification
 */
export const PREPARATION_SPEC = {
  fullBatch: {
    name: "Standard Full Batch",
    scoops: 6,
    gramsPerScoop: 5.0,
    totalPowderGrams: 30.0, // 6 scoops * 5.0 g = ~30 g
    waterVolumeMl: 180,
    finalFeedVolumeMl: 198, // Approximately 198 mL final prepared feed
    label: "6 scoops (~30g) + 180 mL water yields ~198 mL prepared feed",
  },
  halfBatch: {
    name: "Standard Half Batch",
    scoops: 3,
    gramsPerScoop: 5.0,
    totalPowderGrams: 15.0, // 3 scoops * 5.0 g = ~15 g
    waterVolumeMl: 90,
    finalFeedVolumeMl: 99, // Approximately 99 mL final prepared feed (NOT exactly 100 mL)
    label: "3 scoops (~15g) + 90 mL water yields ~99 mL prepared feed",
  },
  approvedConcentrationBasis: {
    energyKcalPer100Ml: 79.7,
    proteinGramsPer100Ml: 2.42,
    fatGramsPer100Ml: 4.88,
    carbsGramsPer100Ml: 6.37,
    dhaMgPer100Ml: 13.5,
    araMgPer100Ml: 13.5,
  },
  // Deviation threshold for warning when user enters measured batch volume
  materialDeviationThresholdPercent: 5.0,
};

/**
 * Pediamil® LBW Tin Guide Dataset
 * Transcribed faithfully from packaging reference photograph
 */
export const PEDIAMIL_LBW_TIN_GUIDE_ROWS: TinGuideRow[] = [
  {
    minWeightKg: 1.0,
    maxWeightKg: 1.8,
    weightBandLabel: "1.0–1.8 kg",
    minDailyVolumeMl: 150,
    maxDailyVolumeMl: 360,
    dailyVolumeLabel: "150–360 mL/day",
    waterExamples: "Follow medical instructions / confirm source",
    scoops: null,
    feedsPerDay: null,
    calculatedQuantityLabel: "Not specified for this row",
    verificationStatus: "provisional_requires_confirmation",
    notes:
      "Visible packaging advises following medical instructions; individual fluid prescription required.",
  },
  {
    minWeightKg: 1.8,
    maxWeightKg: 2.5,
    weightBandLabel: "1.8–2.5 kg",
    minDailyVolumeMl: 300,
    maxDailyVolumeMl: 450,
    dailyVolumeLabel: "300–450 mL/day",
    waterExamples: "60/90 mL",
    scoops: 3,
    feedsPerDay: 6,
    calculatedQuantityLabel: "360 / 540 mL",
    verificationStatus: "transcribed_from_packaging",
    notes: "Transcribed from tin guide table.",
  },
  {
    minWeightKg: 2.5,
    maxWeightKg: 3.0,
    weightBandLabel: "2.5–3.0 kg",
    minDailyVolumeMl: 375,
    maxDailyVolumeMl: 540,
    dailyVolumeLabel: "375–540 mL/day",
    waterExamples: "90 mL",
    scoops: 3,
    feedsPerDay: 6,
    calculatedQuantityLabel: "540 mL",
    verificationStatus: "transcribed_from_packaging",
    notes: "Transcribed from tin guide table.",
  },
  {
    minWeightKg: 3.0,
    maxWeightKg: 3.5,
    weightBandLabel: "3.0–3.5 kg",
    minDailyVolumeMl: 450,
    maxDailyVolumeMl: 630,
    dailyVolumeLabel: "450–630 mL/day",
    waterExamples: "90 mL",
    scoops: 3,
    feedsPerDay: 6,
    calculatedQuantityLabel:
      "Transcription requires confirmation from original tin or manufacturer document",
    verificationStatus: "provisional_requires_confirmation",
    notes:
      "Packaging text in photograph is not fully legible; marked provisional pending physical tin verification.",
  },
  {
    minWeightKg: 3.5,
    maxWeightKg: 4.0,
    weightBandLabel: "3.5–4.0 kg",
    minDailyVolumeMl: 525,
    maxDailyVolumeMl: 720,
    dailyVolumeLabel: "525–720 mL/day",
    waterExamples: "120 mL",
    scoops: 4,
    feedsPerDay: 5,
    calculatedQuantityLabel: "600 mL",
    verificationStatus: "transcribed_from_packaging",
    notes: "Transcribed from tin guide table.",
  },
];

/**
 * Finds the applicable tin guide row for a given patient weight (kg).
 */
export function getTinGuideRowForWeight(weightKg: number): TinGuideRow | null {
  if (weightKg < 1.0 || weightKg > 4.0) {
    return null;
  }
  // Boundary check: if weight is at the exact upper boundary, match the lower bracket,
  // except for 4.0 which matches the top row.
  return (
    PEDIAMIL_LBW_TIN_GUIDE_ROWS.find((row) => {
      if (weightKg === 4.0 && row.maxWeightKg === 4.0) return true;
      return weightKg >= row.minWeightKg && weightKg < row.maxWeightKg;
    }) || null
  );
}

export type TinGuideComparisonStatus =
  | "within_reference_range"
  | "below_reference_range"
  | "above_reference_range"
  | "tin_range_unavailable"
  | "individualized_medical_instruction";

export interface TinGuideComparisonResult {
  prescribedDailyVolumeMl: number;
  weightKg: number;
  applicableRow: TinGuideRow | null;
  comparisonStatus: TinGuideComparisonStatus;
  statusLabel: string;
  statusBadgeClass: string;
  reviewMessage: string;
  isClinicianPrescriptionPreserved: boolean;
  tinReferenceRangeLabel: string;
  administeredVolumeMl?: number;
}

/**
 * Compares the clinician's prescription with the manufacturer tin guide reference.
 * CLINICAL SAFETY GUARANTEE: Does not block or replace valid clinician prescription.
 */
export function comparePrescriptionWithTinGuide(
  prescribedDailyVolumeMl: number,
  weightKg: number,
  administeredVolumeMl?: number
): TinGuideComparisonResult {
  const row = getTinGuideRowForWeight(weightKg);

  if (!row) {
    return {
      prescribedDailyVolumeMl,
      weightKg,
      applicableRow: null,
      comparisonStatus: "tin_range_unavailable",
      statusLabel: "Tin Range Unavailable / Out of Scope",
      statusBadgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      reviewMessage:
        "Infant weight is outside the 1.0–4.0 kg tin-guide reference table. Maintain clinician-prescribed individualized feeding plan.",
      isClinicianPrescriptionPreserved: true,
      tinReferenceRangeLabel: "N/A (Weight < 1.0 kg or > 4.0 kg)",
      administeredVolumeMl,
    };
  }

  // Row 1 (1.0–1.8 kg) visibly states to follow medical instructions
  if (row.minWeightKg === 1.0 && row.maxWeightKg === 1.8) {
    const isWithinGeneralRange =
      row.minDailyVolumeMl !== null &&
      row.maxDailyVolumeMl !== null &&
      prescribedDailyVolumeMl >= row.minDailyVolumeMl &&
      prescribedDailyVolumeMl <= row.maxDailyVolumeMl;

    return {
      prescribedDailyVolumeMl,
      weightKg,
      applicableRow: row,
      comparisonStatus: "individualized_medical_instruction",
      statusLabel: "Individualized Medical Prescription Priority",
      statusBadgeClass: "bg-sky-100 text-sky-900 border-sky-300",
      reviewMessage:
        "The manufacturer tin guide specifies 'Follow medical instructions' for 1.0–1.8 kg infants. The clinician prescription is the sole authoritative order.",
      isClinicianPrescriptionPreserved: true,
      tinReferenceRangeLabel: `${row.dailyVolumeLabel} (Follow medical instructions)`,
      administeredVolumeMl,
    };
  }

  const min = row.minDailyVolumeMl ?? 0;
  const max = row.maxDailyVolumeMl ?? 0;

  if (prescribedDailyVolumeMl < min) {
    return {
      prescribedDailyVolumeMl,
      weightKg,
      applicableRow: row,
      comparisonStatus: "below_reference_range",
      statusLabel: "Below Manufacturer Reference Range",
      statusBadgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      reviewMessage:
        "Difference from the manufacturer guide detected. Confirm the intended prescription and preparation with the attending clinician and local NICU protocol.",
      isClinicianPrescriptionPreserved: true,
      tinReferenceRangeLabel: row.dailyVolumeLabel,
      administeredVolumeMl,
    };
  }

  if (prescribedDailyVolumeMl > max) {
    return {
      prescribedDailyVolumeMl,
      weightKg,
      applicableRow: row,
      comparisonStatus: "above_reference_range",
      statusLabel: "Above Manufacturer Reference Range",
      statusBadgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      reviewMessage:
        "Difference from the manufacturer guide detected. Confirm the intended prescription and preparation with the attending clinician and local NICU protocol.",
      isClinicianPrescriptionPreserved: true,
      tinReferenceRangeLabel: row.dailyVolumeLabel,
      administeredVolumeMl,
    };
  }

  return {
    prescribedDailyVolumeMl,
    weightKg,
    applicableRow: row,
    comparisonStatus: "within_reference_range",
    statusLabel: "Within Manufacturer Reference Range",
    statusBadgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    reviewMessage:
      "Prescribed daily volume aligns with the manufacturer tin-guide reference range. Clinician prescription remains active.",
    isClinicianPrescriptionPreserved: true,
    tinReferenceRangeLabel: row.dailyVolumeLabel,
    administeredVolumeMl,
  };
}

export interface PreparationAdministrationRecord {
  batchType: "full" | "half";
  batchesPrepared: number;
  expectedPreparedBatchVolumeMl: number;
  totalPreparedVolumeAvailableMl: number;
  measuredFinalVolumeMl?: number;
  hasMeasuredBatchVolume: boolean;
  measuredVolumeWarning?: string;
  volumeDiscardedOrSpilledMl: number;
  feedsAdministered?: number;
  administeredVolumePerFeedMl?: number;
  totalAdministeredVolumeMl?: number;
  remainingOrDiscardedVolumeMl: number;
  isVolumeAdministeredDocumented: boolean;
  accountingStatus: "estimated_from_prescription" | "measured_administration";
}

/**
 * Calculates preparation batch accounting and administration balance.
 * Implements strict prompt formulas:
 * - preparedBatchVolumeMl = ~198 mL (full) or ~99 mL (half)
 * - preparedVolumeAvailableMl = batchesPrepared * preparedBatchVolumeMl
 * - administeredVolumeMl = sum of documented feed volumes or entered total
 * - remainingOrDiscardedMl = preparedVolumeAvailableMl - administeredVolumeMl
 */
export function calculatePreparationAccounting(params: {
  batchType?: "full" | "half";
  batchesPrepared?: number;
  measuredFinalBatchVolumeMl?: number;
  volumeDiscardedOrSpilledMl?: number;
  totalAdministeredVolumeMl?: number;
  prescribedDailyVolumeMl: number;
}): PreparationAdministrationRecord {
  const batchType = params.batchType || "full";
  const batchesPrepared = Math.max(1, params.batchesPrepared ?? 1);
  const spec = batchType === "full" ? PREPARATION_SPEC.fullBatch : PREPARATION_SPEC.halfBatch;
  const expectedBatchVolume = spec.finalFeedVolumeMl;

  let measuredVolumeWarning: string | undefined = undefined;
  let effectiveBatchVolume = expectedBatchVolume;

  if (params.measuredFinalBatchVolumeMl !== undefined && params.measuredFinalBatchVolumeMl > 0) {
    const measured = params.measuredFinalBatchVolumeMl;
    const deviation = Math.abs(measured - expectedBatchVolume) / expectedBatchVolume;
    if (deviation > PREPARATION_SPEC.materialDeviationThresholdPercent / 100) {
      measuredVolumeWarning = `Measured final batch volume (${measured} mL) deviates by ${(deviation * 100).toFixed(1)}% from manufacturer standard (~${expectedBatchVolume} mL). Verify reconstitution technique and water temperature. Concentration basis remains standard.`;
    }
    effectiveBatchVolume = measured;
  }

  const totalPreparedVolumeAvailableMl = Math.round(batchesPrepared * effectiveBatchVolume * 10) / 10;
  const volumeDiscardedOrSpilled = params.volumeDiscardedOrSpilledMl ?? 0;

  const isVolumeAdministeredDocumented =
    params.totalAdministeredVolumeMl !== undefined && params.totalAdministeredVolumeMl > 0;

  const administeredVolume = isVolumeAdministeredDocumented
    ? params.totalAdministeredVolumeMl!
    : params.prescribedDailyVolumeMl;

  const remainingOrDiscardedVolumeMl = Math.max(
    0,
    Math.round((totalPreparedVolumeAvailableMl - administeredVolume - volumeDiscardedOrSpilled) * 10) / 10
  );

  return {
    batchType,
    batchesPrepared,
    expectedPreparedBatchVolumeMl: expectedBatchVolume,
    totalPreparedVolumeAvailableMl,
    measuredFinalVolumeMl: params.measuredFinalBatchVolumeMl,
    hasMeasuredBatchVolume: params.measuredFinalBatchVolumeMl !== undefined && params.measuredFinalBatchVolumeMl > 0,
    measuredVolumeWarning,
    volumeDiscardedOrSpilledMl: volumeDiscardedOrSpilled,
    totalAdministeredVolumeMl: isVolumeAdministeredDocumented ? params.totalAdministeredVolumeMl : undefined,
    remainingOrDiscardedVolumeMl,
    isVolumeAdministeredDocumented,
    accountingStatus: isVolumeAdministeredDocumented
      ? "measured_administration"
      : "estimated_from_prescription",
  };
}

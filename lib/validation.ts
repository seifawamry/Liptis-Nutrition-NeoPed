/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Institutional Clinical Input Validation & Safety Engine
 * 
 * Enforces zero silent clamping, explicit range contracts,
 * strict calendar date verification, and auditable validation reporting.
 */

export interface ValidationError {
  field: string;
  fieldLabel: string;
  value: unknown;
  message: string;
  acceptedRange: string;
  remediation: string;
  severity: "critical" | "warning";
}

export interface ValidationReport {
  isValid: boolean;
  isBlocked: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summaryMessage?: string;
}

export const CLINICAL_BOUNDS = {
  WEIGHT_GRAMS: {
    MIN: 400,
    MAX: 10000,
    LABEL: "Current Weight",
    UNIT: "grams",
    RANGE_STR: "400g to 10,000g",
    UNDER_400_RATIONALE:
      "Weight is below the supported neonatal minimum of 400g. Standard enteral formulation calculations are contraindicated below 400g; manage with specialized micro-preemie parenteral nutrition and individualized fluid resuscitation under direct attending neonatologist supervision.",
    OVER_10000_RATIONALE:
      "Weight exceeds maximum supported neonatal threshold of 10,000g (10 kg). For infants >10kg, refer to pediatric growth and nutrition protocols.",
  },
  FLUID_ML_PER_KG_DAY: {
    ABSOLUTE_MIN: 80,
    ABSOLUTE_MAX: 240,
    TYPICAL_MIN: 150,
    TYPICAL_MAX: 180,
    ALERT_LOW: 135,
    ALERT_HIGH: 200,
    LABEL: "Target Fluid Allowance",
    UNIT: "mL/kg/day",
    RANGE_STR: "80 to 240 mL/kg/day (Typical: 150–180 mL/kg/day)",
  },
  GA_WEEKS: {
    MIN: 22,
    MAX: 36,
    LABEL: "Gestational Age (Weeks)",
    RANGE_STR: "22 to 36 completed weeks",
  },
  GA_DAYS: {
    MIN: 0,
    MAX: 6,
    LABEL: "Gestational Age (Days)",
    RANGE_STR: "0 to 6 days",
  },
  LENGTH_CM: {
    MIN: 20.0,
    MAX: 70.0,
    LABEL: "Crown-Heel Length",
    UNIT: "cm",
    RANGE_STR: "20.0 to 70.0 cm",
  },
  HEAD_CIRCUMFERENCE_CM: {
    MIN: 15.0,
    MAX: 45.0,
    LABEL: "Occipitofrontal Circumference (OFC)",
    UNIT: "cm",
    RANGE_STR: "15.0 to 45.0 cm",
  },
  WHO_MAX_CCA_MONTHS: 24,
  FENTON_MIN_PMA_WEEKS: 22,
  FENTON_MAX_PMA_WEEKS: 50,
  MAX_CHRONOLOGICAL_DAYS: 1095, // 3 years
};

/**
 * Days in month lookup with leap year support
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 1: // Jan
    case 3: // Mar
    case 5: // May
    case 7: // Jul
    case 8: // Aug
    case 10: // Oct
    case 12: // Dec
      return 31;
    case 4: // Apr
    case 6: // Jun
    case 9: // Sep
    case 11: // Nov
      return 30;
    case 2: // Feb
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}

export interface ParsedDateResult {
  isValid: boolean;
  year?: number;
  month?: number;
  day?: number;
  utcTimestamp?: number;
  errorMessage?: string;
}

/**
 * Robust calendar date parser rejecting impossible dates (e.g. Feb 30, April 31)
 * without relying on permissive JavaScript rollover parsing.
 */
export function parseStrictCalendarDate(dateInput: unknown): ParsedDateResult {
  if (dateInput === undefined || dateInput === null || (typeof dateInput === "string" && dateInput.trim() === "")) {
    return { isValid: false, errorMessage: "Date string is empty or missing." };
  }

  let str = "";
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      return { isValid: false, errorMessage: "Invalid Date object." };
    }
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");
    str = `${year}-${month}-${day}`;
  } else {
    str = String(dateInput).trim();
  }

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return {
      isValid: false,
      errorMessage: `Date '${str}' is malformed. Format must strictly match YYYY-MM-DD with a 4-digit year.`,
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 2000 || year > 2030) {
    return {
      isValid: false,
      errorMessage: `Year ${year} is outside reasonable clinical range (2000–2030).`,
    };
  }

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      errorMessage: `Month ${month} is invalid. Month must be between 01 and 12.`,
    };
  }

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return {
      isValid: false,
      errorMessage: `Day ${day} is invalid for month ${month}/${year} (maximum days in this month: ${maxDays}).`,
    };
  }

  const utcTimestamp = Date.UTC(year, month - 1, day);
  return {
    isValid: true,
    year,
    month,
    day,
    utcTimestamp,
  };
}

/**
 * Validates neonatal nutritional parameters
 */
export function validateNutritionInputs(
  weightGrams: unknown,
  fluidAllowanceMlPerKg: unknown
): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Weight validation
  const strWeight = String(weightGrams ?? "").trim();
  const numWeight = Number(weightGrams);

  if (
    weightGrams === undefined ||
    weightGrams === null ||
    strWeight === "" ||
    isNaN(numWeight) ||
    !isFinite(numWeight)
  ) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: weightGrams,
      message: "Patient weight is required and must be a valid numeric value.",
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Enter an accurate verified patient weight in grams (e.g., 1350).",
      severity: "critical",
    });
  } else if (numWeight < CLINICAL_BOUNDS.WEIGHT_GRAMS.MIN) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: numWeight,
      message: CLINICAL_BOUNDS.WEIGHT_GRAMS.UNDER_400_RATIONALE,
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Verify entered weight. For infants <400g, defer to micro-preemie ICU parenteral protocols.",
      severity: "critical",
    });
  } else if (numWeight > CLINICAL_BOUNDS.WEIGHT_GRAMS.MAX) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: numWeight,
      message: CLINICAL_BOUNDS.WEIGHT_GRAMS.OVER_10000_RATIONALE,
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Verify weight entry. For infants >10kg, refer to pediatric growth and nutrition protocols.",
      severity: "critical",
    });
  }

  // Fluid Allowance validation
  const strFluid = String(fluidAllowanceMlPerKg ?? "").trim();
  const numFluid = Number(fluidAllowanceMlPerKg);

  if (
    fluidAllowanceMlPerKg === undefined ||
    fluidAllowanceMlPerKg === null ||
    strFluid === "" ||
    isNaN(numFluid) ||
    !isFinite(numFluid)
  ) {
    errors.push({
      field: "fluidAllowance",
      fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
      value: fluidAllowanceMlPerKg,
      message: "Target fluid allowance is required and must be a valid numeric value.",
      acceptedRange: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.RANGE_STR,
      remediation: "Specify enteral fluid target in mL/kg/day (e.g., 150).",
      severity: "critical",
    });
  } else if (
    numFluid < CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MIN ||
    numFluid > CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MAX
  ) {
    errors.push({
      field: "fluidAllowance",
      fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
      value: numFluid,
      message: `Prescribed fluid allowance (${numFluid} mL/kg/d) is outside safe physiological enteral boundaries (${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MIN}–${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MAX} mL/kg/d).`,
      acceptedRange: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.RANGE_STR,
      remediation: "Re-evaluate fluid volume against hydration, cardiorespiratory status, and diuresis.",
      severity: "critical",
    });
  } else {
    // Clinical Warnings within acceptable boundaries
    if (numFluid < CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_LOW) {
      warnings.push({
        field: "fluidAllowance",
        fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
        value: numFluid,
        message: `Fluid intake is restricted (<${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_LOW} mL/kg/d). Monitor hydration status, serum sodium, and urine output; caloric delivery may be insufficient for catch-up growth.`,
        acceptedRange: "150 to 180 mL/kg/day (Typical)",
        remediation: "Verify clinical indication for fluid restriction (e.g., patent ductus arteriosus, acute oliguria).",
        severity: "warning",
      });
    } else if (numFluid > CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_HIGH) {
      warnings.push({
        field: "fluidAllowance",
        fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
        value: numFluid,
        message: `Fluid allowance exceeds ${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_HIGH} mL/kg/d. Elevated risk of cardiopulmonary volume overload, hemodynamically significant PDA, and pulmonary edema.`,
        acceptedRange: "150 to 180 mL/kg/day (Typical)",
        remediation: "Verify renal concentrating capacity and cardiac tolerance before maintaining high enteral volume.",
        severity: "warning",
      });
    }
  }

  const isBlocked = errors.length > 0;
  return {
    isValid: errors.length === 0,
    isBlocked,
    errors,
    warnings,
    summaryMessage: isBlocked
      ? `Calculation blocked: ${errors[0].message}`
      : warnings.length > 0
      ? `Clinical notice: ${warnings[0].message}`
      : undefined,
  };
}

/**
 * Validates growth assessment, age parameters, and dates with strict calendar verification.
 */
export function validateGrowthInputs(params: {
  gaWeeks: unknown;
  gaDays: unknown;
  dob: unknown;
  dom: unknown;
  weightGrams?: unknown;
  lengthCm?: unknown;
  headCircumferenceCm?: unknown;
}): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // GA Weeks
  const strWeeks = String(params.gaWeeks ?? "").trim();
  const numWeeks = Number(params.gaWeeks);
  if (
    params.gaWeeks === undefined ||
    params.gaWeeks === null ||
    strWeeks === "" ||
    isNaN(numWeeks) ||
    !isFinite(numWeeks) ||
    numWeeks < CLINICAL_BOUNDS.GA_WEEKS.MIN ||
    numWeeks > CLINICAL_BOUNDS.GA_WEEKS.MAX
  ) {
    errors.push({
      field: "gaWeeks",
      fieldLabel: CLINICAL_BOUNDS.GA_WEEKS.LABEL,
      value: params.gaWeeks,
      message: `Gestational age weeks must be between ${CLINICAL_BOUNDS.GA_WEEKS.MIN} and ${CLINICAL_BOUNDS.GA_WEEKS.MAX} completed weeks.`,
      acceptedRange: CLINICAL_BOUNDS.GA_WEEKS.RANGE_STR,
      remediation: "Enter confirmed gestational age at delivery (22–36 weeks for preterm calculation).",
      severity: "critical",
    });
  }

  // GA Days
  const strDays = String(params.gaDays ?? "").trim();
  const numDays = Number(params.gaDays);
  if (
    params.gaDays === undefined ||
    params.gaDays === null ||
    strDays === "" ||
    isNaN(numDays) ||
    !isFinite(numDays) ||
    numDays < CLINICAL_BOUNDS.GA_DAYS.MIN ||
    numDays > CLINICAL_BOUNDS.GA_DAYS.MAX
  ) {
    errors.push({
      field: "gaDays",
      fieldLabel: CLINICAL_BOUNDS.GA_DAYS.LABEL,
      value: params.gaDays,
      message: `Gestational age additional days must be between 0 and 6.`,
      acceptedRange: CLINICAL_BOUNDS.GA_DAYS.RANGE_STR,
      remediation: "Enter additional completed days (0 to 6).",
      severity: "critical",
    });
  }

  // Strict Calendar Date Parsing for Date of Birth
  const parsedDob = parseStrictCalendarDate(params.dob);
  if (!parsedDob.isValid) {
    errors.push({
      field: "dob",
      fieldLabel: "Date of Birth",
      value: params.dob,
      message: `Date of birth is invalid: ${parsedDob.errorMessage}`,
      acceptedRange: "Valid past calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid birth date matching YYYY-MM-DD with existing calendar day.",
      severity: "critical",
    });
  }

  // Strict Calendar Date Parsing for Date of Measurement
  const parsedDom = parseStrictCalendarDate(params.dom);
  if (!parsedDom.isValid) {
    errors.push({
      field: "dom",
      fieldLabel: "Date of Measurement",
      value: params.dom,
      message: `Growth calculation blocked: the measurement date is invalid or cannot be interpreted as a valid calendar date (${parsedDom.errorMessage}).`,
      acceptedRange: "Valid calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid clinical assessment date matching YYYY-MM-DD with existing calendar day.",
      severity: "critical",
    });
  }

  // Chronological checks if both dates are structurally valid
  if (parsedDob.isValid && parsedDom.isValid && parsedDob.utcTimestamp && parsedDom.utcTimestamp) {
    if (parsedDom.utcTimestamp < parsedDob.utcTimestamp) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: "Measurement date precedes date of birth (DOM < DOB). Chronological age cannot be negative.",
        acceptedRange: "Date of measurement must be on or after Date of Birth.",
        remediation: "Adjust measurement date to be equal to or subsequent to birth date.",
        severity: "critical",
      });
    }

    // Future date verification
    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (parsedDom.utcTimestamp > todayUtc) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: "Growth calculation blocked: the measurement date cannot be in the future relative to the clinical assessment date.",
        acceptedRange: "Assessment date on or before today's date.",
        remediation: "Verify and correct the clinical measurement date.",
        severity: "critical",
      });
    }

    // Impossible age check (> 3 years)
    const msPerDay = 24 * 60 * 60 * 1000;
    const caTotalDays = Math.floor((parsedDom.utcTimestamp - parsedDob.utcTimestamp) / msPerDay);
    if (caTotalDays > CLINICAL_BOUNDS.MAX_CHRONOLOGICAL_DAYS) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: `Calculated chronological age (${caTotalDays} days) exceeds maximum supported neonatal/infant follow-up horizon of 3 years.`,
        acceptedRange: `Chronological age <= ${CLINICAL_BOUNDS.MAX_CHRONOLOGICAL_DAYS} days (3 years)`,
        remediation: "Verify patient birth date and assessment date.",
        severity: "critical",
      });
    }
  }

  // Optional anthropometrics validation (reject empty invalid text, non-numeric, or out of physiological range)
  if (params.lengthCm !== undefined && params.lengthCm !== null) {
    const strLen = String(params.lengthCm).trim();
    if (strLen !== "") {
      const numLength = Number(params.lengthCm);
      if (isNaN(numLength) || !isFinite(numLength) || numLength < CLINICAL_BOUNDS.LENGTH_CM.MIN || numLength > CLINICAL_BOUNDS.LENGTH_CM.MAX) {
        errors.push({
          field: "lengthCm",
          fieldLabel: CLINICAL_BOUNDS.LENGTH_CM.LABEL,
          value: params.lengthCm,
          message: `Crown-heel length (${strLen} cm) is invalid or outside physiological boundaries (${CLINICAL_BOUNDS.LENGTH_CM.RANGE_STR}).`,
          acceptedRange: CLINICAL_BOUNDS.LENGTH_CM.RANGE_STR,
          remediation: "Re-verify supine length measurement using a calibrated neonatal length board.",
          severity: "critical",
        });
      }
    }
  }

  if (params.headCircumferenceCm !== undefined && params.headCircumferenceCm !== null) {
    const strHc = String(params.headCircumferenceCm).trim();
    if (strHc !== "") {
      const numHc = Number(params.headCircumferenceCm);
      if (isNaN(numHc) || !isFinite(numHc) || numHc < CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.MIN || numHc > CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.MAX) {
        errors.push({
          field: "headCircumferenceCm",
          fieldLabel: CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.LABEL,
          value: params.headCircumferenceCm,
          message: `Head circumference (${strHc} cm) is invalid or outside physiological boundaries (${CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.RANGE_STR}).`,
          acceptedRange: CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.RANGE_STR,
          remediation: "Re-measure maximal occipitofrontal circumference using a non-stretchable measuring tape.",
          severity: "critical",
        });
      }
    }
  }

  const isBlocked = errors.length > 0;
  return {
    isValid: errors.length === 0,
    isBlocked,
    errors,
    warnings,
    summaryMessage: isBlocked
      ? `Growth evaluation blocked: ${errors[0].message}`
      : warnings.length > 0
      ? `Notice: ${warnings[0].message}`
      : undefined,
  };
}

/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Institutional Clinical Input Validation & Safety Engine
 * 
 * Enforces zero silent clamping, explicit range contracts,
 * and auditable validation reporting.
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
  FENTON_MAX_PMA_WEEKS: 50,
};

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
  const numWeight = Number(weightGrams);
  if (weightGrams === undefined || weightGrams === null || isNaN(numWeight) || String(weightGrams).trim() === "") {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: weightGrams,
      message: "Patient weight is required for enteral calculations.",
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Enter an accurate verified patient weight in grams.",
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
      message: `Weight exceeds maximum supported neonatal threshold of ${CLINICAL_BOUNDS.WEIGHT_GRAMS.MAX}g (10 kg).`,
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Verify weight entry. For infants >10kg, refer to pediatric growth and nutrition protocols.",
      severity: "critical",
    });
  }

  // Fluid Allowance validation
  const numFluid = Number(fluidAllowanceMlPerKg);
  if (fluidAllowanceMlPerKg === undefined || fluidAllowanceMlPerKg === null || isNaN(numFluid) || String(fluidAllowanceMlPerKg).trim() === "") {
    errors.push({
      field: "fluidAllowance",
      fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
      value: fluidAllowanceMlPerKg,
      message: "Target fluid allowance is required.",
      acceptedRange: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.RANGE_STR,
      remediation: "Specify enteral fluid target in mL/kg/day.",
      severity: "critical",
    });
  } else if (numFluid < CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MIN || numFluid > CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MAX) {
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
 * Validates growth assessment and age parameters
 */
export function validateGrowthInputs(params: {
  gaWeeks: unknown;
  gaDays: unknown;
  dob: string | Date;
  dom: string | Date;
  weightGrams?: unknown;
  lengthCm?: unknown;
  headCircumferenceCm?: unknown;
}): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // GA Weeks
  const numWeeks = Number(params.gaWeeks);
  if (isNaN(numWeeks) || numWeeks < CLINICAL_BOUNDS.GA_WEEKS.MIN || numWeeks > CLINICAL_BOUNDS.GA_WEEKS.MAX) {
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
  const numDays = Number(params.gaDays);
  if (isNaN(numDays) || numDays < CLINICAL_BOUNDS.GA_DAYS.MIN || numDays > CLINICAL_BOUNDS.GA_DAYS.MAX) {
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

  // Date parsing & comparison
  const dobDate = typeof params.dob === "string" ? new Date(params.dob) : params.dob;
  const domDate = typeof params.dom === "string" ? new Date(params.dom) : params.dom;

  if (!dobDate || isNaN(dobDate.getTime())) {
    errors.push({
      field: "dob",
      fieldLabel: "Date of Birth",
      value: params.dob,
      message: "Date of birth is invalid or unparseable.",
      acceptedRange: "Valid past or current calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid birth date.",
      severity: "critical",
    });
  }

  if (!domDate || isNaN(domDate.getTime())) {
    errors.push({
      field: "dom",
      fieldLabel: "Date of Measurement",
      value: params.dom,
      message: "Date of measurement is invalid or unparseable.",
      acceptedRange: "Valid calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid clinical assessment date.",
      severity: "critical",
    });
  }

  if (dobDate && !isNaN(dobDate.getTime()) && domDate && !isNaN(domDate.getTime())) {
    const dobUtc = Date.UTC(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate());
    const domUtc = Date.UTC(domDate.getFullYear(), domDate.getMonth(), domDate.getDate());

    if (domUtc < dobUtc) {
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

    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    if (domUtc > todayUtc) {
      warnings.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: "Measurement date is in the future relative to the system clock. Ensure assessment date is accurate.",
        acceptedRange: "Current or past calendar date",
        remediation: "Verify measurement date.",
        severity: "warning",
      });
    }
  }

  // Optional anthropometrics validation
  if (params.lengthCm !== undefined && params.lengthCm !== null && String(params.lengthCm).trim() !== "") {
    const numLength = Number(params.lengthCm);
    if (!isNaN(numLength) && (numLength < CLINICAL_BOUNDS.LENGTH_CM.MIN || numLength > CLINICAL_BOUNDS.LENGTH_CM.MAX)) {
      errors.push({
        field: "lengthCm",
        fieldLabel: CLINICAL_BOUNDS.LENGTH_CM.LABEL,
        value: numLength,
        message: `Length (${numLength} cm) is outside physiological range (${CLINICAL_BOUNDS.LENGTH_CM.RANGE_STR}).`,
        acceptedRange: CLINICAL_BOUNDS.LENGTH_CM.RANGE_STR,
        remediation: "Re-verify supine length measurement.",
        severity: "critical",
      });
    }
  }

  if (params.headCircumferenceCm !== undefined && params.headCircumferenceCm !== null && String(params.headCircumferenceCm).trim() !== "") {
    const numHc = Number(params.headCircumferenceCm);
    if (!isNaN(numHc) && (numHc < CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.MIN || numHc > CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.MAX)) {
      errors.push({
        field: "headCircumferenceCm",
        fieldLabel: CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.LABEL,
        value: numHc,
        message: `Head circumference (${numHc} cm) is outside physiological range (${CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.RANGE_STR}).`,
        acceptedRange: CLINICAL_BOUNDS.HEAD_CIRCUMFERENCE_CM.RANGE_STR,
        remediation: "Re-measure maximal occipitofrontal circumference.",
        severity: "critical",
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
      ? `Growth evaluation blocked: ${errors[0].message}`
      : warnings.length > 0
      ? `Notice: ${warnings[0].message}`
      : undefined,
  };
}

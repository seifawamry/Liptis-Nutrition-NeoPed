"use strict";

// lib/validation.ts
var CLINICAL_BOUNDS = {
  WEIGHT_GRAMS: {
    MIN: 400,
    MAX: 1e4,
    LABEL: "Current Weight",
    UNIT: "grams",
    RANGE_STR: "400g to 10,000g",
    UNDER_400_RATIONALE: "Weight is below the supported neonatal minimum of 400g. Standard enteral formulation calculations are contraindicated below 400g; manage with specialized micro-preemie parenteral nutrition and individualized fluid resuscitation under direct attending neonatologist supervision.",
    OVER_10000_RATIONALE: "Weight exceeds maximum supported neonatal threshold of 10,000g (10 kg). For infants >10kg, refer to pediatric growth and nutrition protocols."
  },
  FLUID_ML_PER_KG_DAY: {
    MIN: 135,
    MAX: 200,
    ABSOLUTE_MIN: 135,
    ABSOLUTE_MAX: 200,
    TYPICAL_MIN: 150,
    TYPICAL_MAX: 180,
    ALERT_LOW: 135,
    ALERT_HIGH: 200,
    LABEL: "Target Fluid Allowance",
    UNIT: "mL/kg/day",
    RANGE_STR: "135 to 200 mL/kg/day (Typical: 150\u2013180 mL/kg/day)"
  },
  GA_WEEKS: {
    MIN: 22,
    MAX: 36,
    LABEL: "Gestational Age (Weeks)",
    RANGE_STR: "22 to 36 completed weeks"
  },
  GA_DAYS: {
    MIN: 0,
    MAX: 6,
    LABEL: "Gestational Age (Days)",
    RANGE_STR: "0 to 6 days"
  },
  LENGTH_CM: {
    MIN: 20,
    MAX: 70,
    LABEL: "Crown-Heel Length",
    UNIT: "cm",
    RANGE_STR: "20.0 to 70.0 cm"
  },
  HEAD_CIRCUMFERENCE_CM: {
    MIN: 15,
    MAX: 45,
    LABEL: "Occipitofrontal Circumference (OFC)",
    UNIT: "cm",
    RANGE_STR: "15.0 to 45.0 cm"
  },
  WHO_MAX_CCA_MONTHS: 24,
  FENTON_MIN_PMA_WEEKS: 22,
  FENTON_MAX_PMA_WEEKS: 50,
  MAX_CHRONOLOGICAL_DAYS: 1095
  // 3 years
};
function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function getDaysInMonth(year, month) {
  switch (month) {
    case 1:
    // Jan
    case 3:
    // Mar
    case 5:
    // May
    case 7:
    // Jul
    case 8:
    // Aug
    case 10:
    // Oct
    case 12:
      return 31;
    case 4:
    // Apr
    case 6:
    // Jun
    case 9:
    // Sep
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}
function parseStrictCalendarDate(dateInput) {
  if (dateInput === void 0 || dateInput === null || typeof dateInput === "string" && dateInput.trim() === "") {
    return { isValid: false, errorMessage: "Date string is empty or missing." };
  }
  let str = "";
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      return { isValid: false, errorMessage: "Invalid Date object." };
    }
    const year2 = dateInput.getFullYear();
    const month2 = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day2 = String(dateInput.getDate()).padStart(2, "0");
    str = `${year2}-${month2}-${day2}`;
  } else {
    str = String(dateInput).trim();
  }
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return {
      isValid: false,
      errorMessage: `Date '${str}' is malformed. Format must strictly match YYYY-MM-DD with a 4-digit year.`
    };
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (year < 2e3 || year > 2030) {
    return {
      isValid: false,
      errorMessage: `Year ${year} is outside reasonable clinical range (2000\u20132030).`
    };
  }
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      errorMessage: `Month ${month} is invalid. Month must be between 01 and 12.`
    };
  }
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return {
      isValid: false,
      errorMessage: `Day ${day} is invalid for month ${month}/${year} (maximum days in this month: ${maxDays}).`
    };
  }
  const utcTimestamp = Date.UTC(year, month - 1, day);
  return {
    isValid: true,
    year,
    month,
    day,
    utcTimestamp
  };
}
function validateNutritionInputs(weightGrams, fluidAllowanceMlPerKg) {
  const errors = [];
  const warnings = [];
  const strWeight = String(weightGrams ?? "").trim();
  const numWeight = Number(weightGrams);
  if (weightGrams === void 0 || weightGrams === null || strWeight === "" || isNaN(numWeight) || !isFinite(numWeight)) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: weightGrams,
      message: "Patient weight is required and must be a valid numeric value.",
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Enter an accurate verified patient weight in grams (e.g., 1350).",
      severity: "critical"
    });
  } else if (numWeight < CLINICAL_BOUNDS.WEIGHT_GRAMS.MIN) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: numWeight,
      message: CLINICAL_BOUNDS.WEIGHT_GRAMS.UNDER_400_RATIONALE,
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Verify entered weight. For infants <400g, defer to micro-preemie ICU parenteral protocols.",
      severity: "critical"
    });
  } else if (numWeight > CLINICAL_BOUNDS.WEIGHT_GRAMS.MAX) {
    errors.push({
      field: "weightGrams",
      fieldLabel: CLINICAL_BOUNDS.WEIGHT_GRAMS.LABEL,
      value: numWeight,
      message: CLINICAL_BOUNDS.WEIGHT_GRAMS.OVER_10000_RATIONALE,
      acceptedRange: CLINICAL_BOUNDS.WEIGHT_GRAMS.RANGE_STR,
      remediation: "Verify weight entry. For infants >10kg, refer to pediatric growth and nutrition protocols.",
      severity: "critical"
    });
  }
  const strFluid = String(fluidAllowanceMlPerKg ?? "").trim();
  const numFluid = Number(fluidAllowanceMlPerKg);
  if (fluidAllowanceMlPerKg === void 0 || fluidAllowanceMlPerKg === null || strFluid === "" || isNaN(numFluid) || !isFinite(numFluid)) {
    errors.push({
      field: "fluidAllowance",
      fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
      value: fluidAllowanceMlPerKg,
      message: "Target fluid allowance is required and must be a valid numeric value.",
      acceptedRange: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.RANGE_STR,
      remediation: "Specify enteral fluid target in mL/kg/day (e.g., 150).",
      severity: "critical"
    });
  } else if (numFluid < CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MIN || numFluid > CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MAX) {
    errors.push({
      field: "fluidAllowance",
      fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
      value: numFluid,
      message: `Prescribed fluid allowance (${numFluid} mL/kg/d) is outside safe physiological enteral boundaries (${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MIN}\u2013${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ABSOLUTE_MAX} mL/kg/d).`,
      acceptedRange: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.RANGE_STR,
      remediation: "Re-evaluate fluid volume against hydration, cardiorespiratory status, and diuresis.",
      severity: "critical"
    });
  } else {
    if (numFluid < CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_LOW) {
      warnings.push({
        field: "fluidAllowance",
        fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
        value: numFluid,
        message: `Fluid intake is restricted (<${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_LOW} mL/kg/d). Monitor hydration status, serum sodium, and urine output; caloric delivery may be insufficient for catch-up growth.`,
        acceptedRange: "150 to 180 mL/kg/day (Typical)",
        remediation: "Verify clinical indication for fluid restriction (e.g., patent ductus arteriosus, acute oliguria).",
        severity: "warning"
      });
    } else if (numFluid > CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_HIGH) {
      warnings.push({
        field: "fluidAllowance",
        fieldLabel: CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.LABEL,
        value: numFluid,
        message: `Fluid allowance exceeds ${CLINICAL_BOUNDS.FLUID_ML_PER_KG_DAY.ALERT_HIGH} mL/kg/d. Elevated risk of cardiopulmonary volume overload, hemodynamically significant PDA, and pulmonary edema.`,
        acceptedRange: "150 to 180 mL/kg/day (Typical)",
        remediation: "Verify renal concentrating capacity and cardiac tolerance before maintaining high enteral volume.",
        severity: "warning"
      });
    }
  }
  const isBlocked = errors.length > 0;
  return {
    isValid: errors.length === 0,
    isBlocked,
    errors,
    warnings,
    summaryMessage: isBlocked ? `Calculation blocked: ${errors[0].message}` : warnings.length > 0 ? `Clinical notice: ${warnings[0].message}` : void 0
  };
}
function validateGrowthInputs(params) {
  const errors = [];
  const warnings = [];
  const strWeeks = String(params.gaWeeks ?? "").trim();
  const numWeeks = Number(params.gaWeeks);
  if (params.gaWeeks === void 0 || params.gaWeeks === null || strWeeks === "" || isNaN(numWeeks) || !isFinite(numWeeks) || numWeeks < CLINICAL_BOUNDS.GA_WEEKS.MIN || numWeeks > CLINICAL_BOUNDS.GA_WEEKS.MAX) {
    errors.push({
      field: "gaWeeks",
      fieldLabel: CLINICAL_BOUNDS.GA_WEEKS.LABEL,
      value: params.gaWeeks,
      message: `Gestational age weeks must be between ${CLINICAL_BOUNDS.GA_WEEKS.MIN} and ${CLINICAL_BOUNDS.GA_WEEKS.MAX} completed weeks.`,
      acceptedRange: CLINICAL_BOUNDS.GA_WEEKS.RANGE_STR,
      remediation: "Enter confirmed gestational age at delivery (22\u201336 weeks for preterm calculation).",
      severity: "critical"
    });
  }
  const strDays = String(params.gaDays ?? "").trim();
  const numDays = Number(params.gaDays);
  if (params.gaDays === void 0 || params.gaDays === null || strDays === "" || isNaN(numDays) || !isFinite(numDays) || numDays < CLINICAL_BOUNDS.GA_DAYS.MIN || numDays > CLINICAL_BOUNDS.GA_DAYS.MAX) {
    errors.push({
      field: "gaDays",
      fieldLabel: CLINICAL_BOUNDS.GA_DAYS.LABEL,
      value: params.gaDays,
      message: `Gestational age additional days must be between 0 and 6.`,
      acceptedRange: CLINICAL_BOUNDS.GA_DAYS.RANGE_STR,
      remediation: "Enter additional completed days (0 to 6).",
      severity: "critical"
    });
  }
  const parsedDob = parseStrictCalendarDate(params.dob);
  if (!parsedDob.isValid) {
    errors.push({
      field: "dob",
      fieldLabel: "Date of Birth",
      value: params.dob,
      message: `Date of birth is invalid: ${parsedDob.errorMessage}`,
      acceptedRange: "Valid past calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid birth date matching YYYY-MM-DD with existing calendar day.",
      severity: "critical"
    });
  }
  const parsedDom = parseStrictCalendarDate(params.dom);
  if (!parsedDom.isValid) {
    errors.push({
      field: "dom",
      fieldLabel: "Date of Measurement",
      value: params.dom,
      message: `Growth calculation blocked: the measurement date is invalid or cannot be interpreted as a valid calendar date (${parsedDom.errorMessage}).`,
      acceptedRange: "Valid calendar date (YYYY-MM-DD)",
      remediation: "Provide a valid clinical assessment date matching YYYY-MM-DD with existing calendar day.",
      severity: "critical"
    });
  }
  if (parsedDob.isValid && parsedDom.isValid && parsedDob.utcTimestamp && parsedDom.utcTimestamp) {
    if (parsedDom.utcTimestamp < parsedDob.utcTimestamp) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: "Measurement date precedes date of birth (DOM < DOB). Chronological age cannot be negative.",
        acceptedRange: "Date of measurement must be on or after Date of Birth.",
        remediation: "Adjust measurement date to be equal to or subsequent to birth date.",
        severity: "critical"
      });
    }
    const now = /* @__PURE__ */ new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (parsedDom.utcTimestamp > todayUtc) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: "Growth calculation blocked: the measurement date cannot be in the future relative to the clinical assessment date.",
        acceptedRange: "Assessment date on or before today's date.",
        remediation: "Verify and correct the clinical measurement date.",
        severity: "critical"
      });
    }
    const msPerDay = 24 * 60 * 60 * 1e3;
    const caTotalDays = Math.floor((parsedDom.utcTimestamp - parsedDob.utcTimestamp) / msPerDay);
    if (caTotalDays > CLINICAL_BOUNDS.MAX_CHRONOLOGICAL_DAYS) {
      errors.push({
        field: "dom",
        fieldLabel: "Date of Measurement",
        value: params.dom,
        message: `Calculated chronological age (${caTotalDays} days) exceeds maximum supported neonatal/infant follow-up horizon of 3 years.`,
        acceptedRange: `Chronological age <= ${CLINICAL_BOUNDS.MAX_CHRONOLOGICAL_DAYS} days (3 years)`,
        remediation: "Verify patient birth date and assessment date.",
        severity: "critical"
      });
    }
  }
  if (params.lengthCm !== void 0 && params.lengthCm !== null) {
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
          severity: "critical"
        });
      }
    }
  }
  if (params.headCircumferenceCm !== void 0 && params.headCircumferenceCm !== null) {
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
          severity: "critical"
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
    summaryMessage: isBlocked ? `Growth evaluation blocked: ${errors[0].message}` : warnings.length > 0 ? `Notice: ${warnings[0].message}` : void 0
  };
}

// lib/product-config.ts
var PRODUCT_DATA_DISCLAIMER = "Product nutrient values are manufacturer-specific and must be verified against the current product label and preparation instructions before clinical use. Commercial nutrient specifications are independent of ESPGHAN clinical guidelines and are not validated or endorsed by clinical societies.";
var PEDIAMIL_LBW_PRODUCT = {
  id: "pediamil-lbw",
  brandName: "Pediamil\xAE LBW",
  genericClassification: "Special Preterm & Low Birth Weight Infant Formula",
  market: "Liptis Nutrition Switzerland / MENA & International",
  productVersion: "2026 Institutional Specification",
  isVerifiedByManufacturer: true,
  verificationStatus: "verified",
  sourceDocumentName: "Pediamil LBW Specs Sheet (Liptis Nutrition)",
  sourceDocumentVersion: "Liptis-Spec-2026-v1.0",
  verificationDate: "2026-10-02",
  nutritionalBasis: "Standard dilution of prepared feed (100 mL) & dry powder (100 g)",
  disclaimer: PRODUCT_DATA_DISCLAIMER,
  reconstitution: {
    standardDilutionPercent: 15,
    // 15.0 g powder per 100 mL prepared feed (531 kcal / 100g -> 79.7 kcal / 100mL)
    powderMassGramsPer100Ml: 15,
    powderGramsPerScoop: 5,
    scoopsPerStandardVolume: "3 level scoops (15.0g) added to 90 mL water to yield 100 mL prepared feed",
    waterVolumeMlPer3Scoops: 90,
    finalFeedVolumeMlPer3Scoops: 100,
    preparationInstructions: "Wash hands and sterilize all feeding utensils. Boil fresh drinking water for 5 minutes and allow to cool to ~40\xB0C. Pour 90 mL of lukewarm water into sterilized feeding bottle. Add exactly 3 level scoops (15.0g) of Pediamil LBW powder using the enclosed measuring scoop. Cap bottle and shake vigorously until completely dissolved. Check temperature on inner wrist before administration."
  },
  composition: {
    energyKcalPer100Ml: 79.7,
    // 79.7 kcal / 100 mL (~0.80 kcal/mL)
    energyKcalPer100G: 531,
    proteinGramsPer100Ml: 2.42,
    // 2.42 g / 100 mL
    proteinGramsPer100G: 16.1,
    wheyGramsPer100Ml: 1.45,
    wheyGramsPer100G: 9.66,
    caseinGramsPer100Ml: 0.97,
    caseinGramsPer100G: 6.44,
    wheyCaseinRatio: "60:40",
    fatGramsPer100Ml: 4.88,
    fatGramsPer100G: 32.5,
    carbsGramsPer100Ml: 6.37,
    carbsGramsPer100G: 42.5,
    lactoseGramsPer100Ml: 6.32,
    lactoseGramsPer100G: 42.2,
    twoFlHmoGramsPer100Ml: 0.14,
    prebioticsGosGramsPer100Ml: 0.3,
    araMgPer100Ml: 13.5,
    dhaMgPer100Ml: 13.5,
    sodiumMgPer100Ml: 34.65,
    // 1.51 mmol / 100 mL
    potassiumMgPer100Ml: 71.25,
    chlorideMgPer100Ml: 75,
    calciumMgPer100Ml: 130.05,
    phosphorusMgPer100Ml: 65.1,
    calciumPhosphorusRatio: "2.0 : 1",
    magnesiumMgPer100Ml: 7.5,
    ironMgPer100Ml: 1.95,
    zincMgPer100Ml: 0.89,
    copperMcgPer100Ml: 97.5,
    iodineMcgPer100Ml: 21.75,
    seleniumMcgPer100Ml: 3.75,
    vitaminAMcgPer100Ml: 311,
    vitaminD3McgPer100Ml: 4.13,
    // 165.2 IU / 100 mL
    vitaminKMcgPer100Ml: 11.25,
    vitaminCMgPer100Ml: 18,
    vitaminEMgOrIuPer100Ml: "4.8 IU",
    folicAcidMcgPer100Ml: 30
  }
};
var PEDIAMIL_1_PRODUCT = {
  id: "pediamil-1",
  brandName: "Pediamil\xAE 1",
  genericClassification: "Standard Infant Formula (Stage 1: 0\u20136 Months)",
  market: "Liptis Nutrition Switzerland / MENA & International",
  productVersion: "2026 Institutional Specification",
  isVerifiedByManufacturer: true,
  verificationStatus: "verified",
  sourceDocumentName: "PEDIAMIL 1 Specs Sheet (Liptis Nutrition)",
  sourceDocumentVersion: "Liptis-Spec-2026-v1.0",
  verificationDate: "2026-10-02",
  nutritionalBasis: "Standard dilution of prepared feed (100 mL) & dry powder (100 g)",
  disclaimer: PRODUCT_DATA_DISCLAIMER,
  reconstitution: {
    standardDilutionPercent: 13.7,
    // 13.7 g powder per 100 mL prepared feed (500 kcal / 100g -> 68.5 kcal / 100mL)
    powderMassGramsPer100Ml: 13.7,
    powderGramsPerScoop: 4.57,
    scoopsPerStandardVolume: "3 level scoops (13.7g) added to 90 mL water to yield 100 mL prepared feed",
    waterVolumeMlPer3Scoops: 90,
    finalFeedVolumeMlPer3Scoops: 100,
    preparationInstructions: "Wash hands thoroughly. Sterilize bottle, teat, and cap in boiling water for 10 minutes. Boil drinking water for 5 minutes; cool to approximately 40\xB0C. Pour 90 mL of water into feeding bottle. Add exactly 3 level scoops (13.7g) of Pediamil 1 using the provided scoop. Close bottle tightly and shake vigorously until powder is dissolved. Test temperature before feeding."
  },
  composition: {
    energyKcalPer100Ml: 68.5,
    // 68.5 kcal / 100 mL
    energyKcalPer100G: 500,
    proteinGramsPer100Ml: 1.49,
    // 1.49 g / 100 mL
    proteinGramsPer100G: 11,
    wheyGramsPer100Ml: 0.89,
    wheyGramsPer100G: 6.6,
    caseinGramsPer100Ml: 0.59,
    caseinGramsPer100G: 4.4,
    wheyCaseinRatio: "60:40",
    fatGramsPer100Ml: 3.65,
    fatGramsPer100G: 27,
    carbsGramsPer100Ml: 7.18,
    carbsGramsPer100G: 53.2,
    lactoseGramsPer100Ml: 7.18,
    lactoseGramsPer100G: 53.2,
    alphaLactalbuminGramsPer100G: 1.9,
    prebioticsGosGramsPer100Ml: 0.55,
    araMgPer100Ml: 8.1,
    dhaMgPer100Ml: 8.1,
    sodiumMgPer100Ml: 20.25,
    potassiumMgPer100Ml: 70.2,
    chlorideMgPer100Ml: 40.5,
    calciumMgPer100Ml: 47.25,
    phosphorusMgPer100Ml: 29.7,
    calciumPhosphorusRatio: "1.6 : 1",
    magnesiumMgPer100Ml: 5.4,
    ironMgPer100Ml: 0.78,
    zincMgPer100Ml: 0.61,
    copperMcgPer100Ml: 47.25,
    iodineMcgPer100Ml: 9.45,
    seleniumMcgPer100Ml: 0.95,
    vitaminAMcgPer100Ml: 72.9,
    vitaminD3McgPer100Ml: 1.15,
    vitaminKMcgPer100Ml: 4.73,
    vitaminCMgPer100Ml: 13,
    vitaminEMgOrIuPer100Ml: "1.07 mg",
    folicAcidMcgPer100Ml: 10.8
  }
};

// lib/lbw-nutrition.ts
var STANDARD_LBW_MATRIX = {
  name: "Preterm & LBW Matrix (Discharge Formula)",
  brand: "Pediamil\xAE LBW",
  energyKcalPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.energyKcalPer100Ml,
  // 79.7 kcal / 100 mL
  proteinGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.proteinGramsPer100Ml,
  // 2.42 g protein / 100 mL
  carbsGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.carbsGramsPer100Ml,
  // 6.37 g / 100 mL
  fatGramsPer100Ml: PEDIAMIL_LBW_PRODUCT.composition.fatGramsPer100Ml,
  // 4.88 g / 100 mL
  productProfile: PEDIAMIL_LBW_PRODUCT
};
var STANDARD_STAGE_1_MATRIX = {
  name: "Standard Infant Formula (Stage 1)",
  brand: "Pediamil\xAE 1",
  energyKcalPer100Ml: PEDIAMIL_1_PRODUCT.composition.energyKcalPer100Ml,
  // 68.5 kcal / 100 mL
  proteinGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.proteinGramsPer100Ml,
  // 1.49 g protein / 100 mL
  carbsGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.carbsGramsPer100Ml,
  // 7.18 g / 100 mL
  fatGramsPer100Ml: PEDIAMIL_1_PRODUCT.composition.fatGramsPer100Ml,
  // 3.65 g / 100 mL
  productProfile: PEDIAMIL_1_PRODUCT
};
var INSTITUTIONAL_PROTEIN_BRACKETS = [
  {
    classification: "ELBW",
    weightMinGrams: 400,
    weightMaxGrams: 999.99,
    targetMinGramsPerKg: 3.5,
    targetMaxGramsPerKg: 4.5,
    description: "Extremely Low Birth Weight (<1000g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range\u2014requires local clinical approval.",
    clinicalRationale: "Micro-preemies (<1000g) target 3.5\u20134.5 g/kg/d to counteract high metabolic losses; requires close BUN and acid-base monitoring."
  },
  {
    classification: "VLBW",
    weightMinGrams: 1e3,
    weightMaxGrams: 1800,
    targetMinGramsPerKg: 3.2,
    targetMaxGramsPerKg: 4.1,
    description: "Very Low Birth Weight (1000g to 1800g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range\u2014requires local clinical approval.",
    clinicalRationale: "Stable growing VLBW infants target 3.2\u20134.1 g/kg/d protein in institutional convalescent pathways."
  },
  {
    classification: "LBW",
    weightMinGrams: 1800.01,
    weightMaxGrams: 3500,
    targetMinGramsPerKg: 2.8,
    targetMaxGramsPerKg: 3.6,
    description: "Low Birth Weight / Step-Down (1801g to 3500g)",
    sourceType: "institutional",
    citationSource: "Local protocol / institutional operational range\u2014requires local clinical approval.",
    clinicalRationale: "Step-down infants >1800g experiencing catch-up growth target 2.8\u20133.6 g/kg/d until achieving term-equivalent mass (3,500g)."
  },
  {
    classification: "Graduation",
    weightMinGrams: 3500.01,
    weightMaxGrams: 1e4,
    targetMinGramsPerKg: 0,
    targetMaxGramsPerKg: 0,
    description: "Graduation / Normal Weight (> 3500g)",
    sourceType: "institutional",
    citationSource: "Term-Equivalent Weight Transition Consensus",
    clinicalRationale: "Infants >3,500g have graduated from preterm catch-up requirements. Standard infant formulation targets apply to prevent solute overload."
  }
];
var ESPGHAN_DIRECT_GUIDELINES = {
  ENERGY: {
    TYPICAL_MIN: 115,
    TYPICAL_MAX: 140,
    CONDITIONAL_MAX: 160,
    CITATION: "ESPGHAN 2022 Preterm Enteral Nutrition Position Paper: Typical intake 115\u2013140 kcal/kg/d; conditional intake 140\u2013160 kcal/kg/d when clinically indicated for slow growth; not exceeding 160 kcal/kg/d."
  },
  PROTEIN: {
    TYPICAL_MIN: 3.5,
    TYPICAL_MAX: 4,
    CONDITIONAL_MAX: 4.5,
    CITATION: "ESPGHAN 2022 Position Paper: Protein intake generally 3.5\u20134.0 g/kg/d; conditionally up to 4.5 g/kg/d in selected infants with slow growth and appropriate renal status."
  },
  PE_RATIO: {
    MIN_G_PER_100_KCAL: 2.8,
    MAX_G_PER_100_KCAL: 3.6,
    CITATION: "ESPGHAN 2022 Position Paper: Recommended protein-to-energy ratio is 2.8\u20133.6 g / 100 kcal."
  },
  FLUID: {
    TYPICAL_MIN: 150,
    TYPICAL_MAX: 180,
    BROAD_MIN: 135,
    BROAD_MAX: 200,
    CITATION: "ESPGHAN 2022 Position Paper: Fluid intake generally 150\u2013180 mL/kg/d for stable growing preterm infants; 135\u2013200 mL/kg/d requires individualized clinical judgment."
  }
};
function getProteinTargetBracket(weightGrams) {
  if (weightGrams < 1e3) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[0];
  } else if (weightGrams <= 1800) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[1];
  } else if (weightGrams <= 3500) {
    return INSTITUTIONAL_PROTEIN_BRACKETS[2];
  } else {
    return INSTITUTIONAL_PROTEIN_BRACKETS[3];
  }
}
function evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay) {
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
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is below ESPGHAN typical preterm target (${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}\u2013${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX} kcal/kg/d, deficit: -${deficit.toFixed(1)} kcal/kg/d). Risk of sub-optimal somatic catch-up growth.`,
      clinicalAdvisory: "Consider advancing enteral fluid allowance or reviewing caloric density.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1"
    };
  } else if (roundedVal <= ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX) {
    return {
      status: "on_target",
      badgeLabel: "Within Reference Range (115\u2013140 kcal/kg/d)",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN,
      targetMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX,
      conditionalMax: ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered energy (${roundedVal} kcal/kg/d) is within the ESPGHAN 2022 typical reference range (${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MIN}\u2013${ESPGHAN_DIRECT_GUIDELINES.ENERGY.TYPICAL_MAX} kcal/kg/d).`,
      clinicalAdvisory: "Meets standard metabolic and somatic growth requirements for stable preterm infants.",
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1"
    };
  } else if (roundedVal <= ESPGHAN_DIRECT_GUIDELINES.ENERGY.CONDITIONAL_MAX) {
    const surplus = deltaFromMax;
    return {
      status: "conditional",
      badgeLabel: "Conditional High Range (140\u2013160 kcal/kg/d)",
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
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1"
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
      sourceNote: "ESPGHAN 2022 Position Paper Section 3.1"
    };
  }
}
function evaluateProteinCompliance(deliveredProteinGramsPerKgPerDay, bracket) {
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
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is below target for ${bracket.classification} (${bracket.targetMinGramsPerKg}\u2013${bracket.targetMaxGramsPerKg} g/kg/d, deficit: -${deficit.toFixed(2)} g/kg/d).`,
      clinicalAdvisory: "Evaluate protein fortification or advancement of total fluid volume.",
      sourceNote: bracket.citationSource
    };
  } else if (roundedVal <= bracket.targetMaxGramsPerKg) {
    return {
      status: "on_target",
      badgeLabel: `Within Target (${bracket.classification}: ${bracket.targetMinGramsPerKg}\u2013${bracket.targetMaxGramsPerKg} g/kg/d)`,
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: bracket.targetMinGramsPerKg,
      targetMax: bracket.targetMaxGramsPerKg,
      deltaFromMin,
      deltaFromMax,
      interpretation: `Delivered protein (${roundedVal.toFixed(2)} g/kg/d) is within target for ${bracket.classification} (${bracket.targetMinGramsPerKg}\u2013${bracket.targetMaxGramsPerKg} g/kg/d).`,
      clinicalAdvisory: "Supports lean tissue accretion and neurodevelopmental growth.",
      sourceNote: bracket.citationSource
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
      sourceNote: bracket.citationSource
    };
  }
}
function evaluatePeRatioCompliance(peRatioGramsPer100Kcal) {
  const roundedVal = Math.round(peRatioGramsPer100Kcal * 100) / 100;
  const minTarget = ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MIN_G_PER_100_KCAL;
  const maxTarget = ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.MAX_G_PER_100_KCAL;
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
      interpretation: "Protein-to-energy ratio is below the displayed ESPGHAN reference range. Review product choice, fortification, and total nutrient intake.",
      clinicalAdvisory: "Risk of disproportionate fat mass accumulation with insufficient lean body mass accretion.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION
    };
  } else if (roundedVal <= maxTarget) {
    return {
      status: "on_target",
      badgeLabel: "Within Reference Range (2.8\u20133.6 g/100 kcal)",
      colorHex: "#16a34a",
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      deliveredValue: roundedVal,
      targetMin: minTarget,
      targetMax: maxTarget,
      deltaFromMin,
      deltaFromMax,
      interpretation: "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
      clinicalAdvisory: "Balanced substrate delivery supporting optimal body composition.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION
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
      interpretation: "Protein-to-energy ratio is above the displayed ESPGHAN reference range. Review protein and energy sources.",
      clinicalAdvisory: "Risk of amino acid oxidation for energy if non-protein calories are insufficient; monitor metabolic tolerance.",
      sourceNote: ESPGHAN_DIRECT_GUIDELINES.PE_RATIO.CITATION
    };
  }
}
function createAuditMetadata() {
  return {
    applicationVersion: "v2.1.0 Institutional",
    engineVersion: "NeoPed Engine v2.1",
    productDataVersion: "Liptis-Spec-2026-v1.0",
    productDataVerificationDate: "2026-10-02",
    guidelinesReference: "Uses selected ESPGHAN 2022 reference recommendations; local clinical validation required.",
    fentonReference: "Fenton TR, Kim JH. BMC Pediatr. 2013;13:59 (linear interpolation between tabulated LMS parameters)",
    whoReference: "WHO Child Growth Standards 2006 MGRS (0\u201324 months corrected age)",
    calculatedAtUtc: (/* @__PURE__ */ new Date()).toISOString(),
    selectedClinicalProtocol: "ESPGHAN 2022 Preterm Recommendations + Institutional Weight Brackets",
    selectedProduct: "Pediamil\xAE LBW (Preterm) / Pediamil\xAE 1 (Term)",
    roundingPolicy: "Displayed rates rounded to 1 decimal (0.1 mL); 24-hr sum reconciles within \xB10.4 mL (q3h), \xB10.6 mL (q2h), \xB11.2 mL (cont).",
    nonDeviceDisclaimer: "Clinical Decision Support Reference Utility: For licensed healthcare professionals only. Not an order, prescription, or medical device. Clinical judgment supersedes calculated values.",
    productDisclaimer: PRODUCT_DATA_DISCLAIMER,
    sourceMapping: {
      espghanGuidelineValues: [
        "Energy: 115\u2013140 kcal/kg/day typical, 140\u2013160 conditional",
        "Protein: 3.5\u20134.0 g/kg/day typical, conditionally up to 4.5 g/kg/day",
        "Protein-to-Energy ratio: 2.8\u20133.6 g/100 kcal",
        "Fluid: 150\u2013180 mL/kg/day typical"
      ],
      manufacturerProductValues: [
        "Pediamil LBW: 79.7 kcal/100 mL, 2.42g protein/100 mL, 15.0g powder/100 mL",
        "Pediamil 1: 68.5 kcal/100 mL, 1.49g protein/100 mL, 13.7g powder/100 mL",
        "Source: Official Liptis Nutrition Spec Sheet 2026-v1.0 (verified 2026-10-02)"
      ],
      institutionalProtocolValues: [
        "Weight classification brackets: ELBW (<1000g), VLBW (1000\u20131800g), LBW (1801\u20133500g)",
        "Graduation ceiling: 3,500g (term-equivalent transition)"
      ],
      developerAlertThresholds: [
        "Fluid volume alerts: <135 mL/kg/d (restricted) and >200 mL/kg/d (high risk)",
        "Safety stops: weight <400g (micro-preemie protocol) and >10,000g (pediatric scope)"
      ]
    }
  };
}
function calculateLbwNutrition(weightGrams, fluidAllowanceMlPerKg = 150, formula = STANDARD_LBW_MATRIX) {
  const auditMetadata = createAuditMetadata();
  const validation = validateNutritionInputs(weightGrams, fluidAllowanceMlPerKg);
  if (validation.isBlocked) {
    return {
      validation,
      isBlocked: true,
      overallStatus: "Invalid input",
      auditMetadata,
      productDisclaimer: PRODUCT_DATA_DISCLAIMER
    };
  }
  const weightKg = weightGrams / 1e3;
  const isGraduated = weightGrams > 3500;
  const activeFormula = isGraduated ? STANDARD_STAGE_1_MATRIX : formula;
  const totalDailyVolumeMl = Math.round(weightKg * fluidAllowanceMlPerKg * 10) / 10;
  const deliveredEnergyKcalPerDay = Math.round(totalDailyVolumeMl * activeFormula.energyKcalPer100Ml / 100 * 10) / 10;
  const deliveredEnergyKcalPerKgPerDay = Math.round(deliveredEnergyKcalPerDay / weightKg * 10) / 10;
  const energyCompliance = evaluateEnergyCompliance(deliveredEnergyKcalPerKgPerDay);
  const deliveredProteinGramsPerDay = Math.round(totalDailyVolumeMl * activeFormula.proteinGramsPer100Ml / 100 * 100) / 100;
  const deliveredProteinGramsPerKgPerDay = Math.round(deliveredProteinGramsPerDay / weightKg * 100) / 100;
  const proteinBracket = getProteinTargetBracket(weightGrams);
  const proteinCompliance = evaluateProteinCompliance(
    deliveredProteinGramsPerKgPerDay,
    proteinBracket
  );
  const rawPeRatio = deliveredProteinGramsPerDay / deliveredEnergyKcalPerDay * 100;
  const proteinToEnergyRatioGramsPer100Kcal = Math.round(rawPeRatio * 100) / 100;
  const peRatioCompliance = evaluatePeRatioCompliance(proteinToEnergyRatioGramsPer100Kcal);
  const q2hVolumePerFeedMl = Math.round(totalDailyVolumeMl / 12 * 10) / 10;
  const q3hVolumePerFeedMl = Math.round(totalDailyVolumeMl / 8 * 10) / 10;
  const continuousInfusionMlPerHour = Math.round(totalDailyVolumeMl / 24 * 10) / 10;
  const q2hSumDifference = Math.round((q2hVolumePerFeedMl * 12 - totalDailyVolumeMl) * 10) / 10;
  const q3hSumDifference = Math.round((q3hVolumePerFeedMl * 8 - totalDailyVolumeMl) * 10) / 10;
  const continuousSumDifference = Math.round((continuousInfusionMlPerHour * 24 - totalDailyVolumeMl) * 10) / 10;
  const feedingSchedule = {
    q2hFeedsCount: 12,
    q2hVolumePerFeedMl,
    q3hFeedsCount: 8,
    q3hVolumePerFeedMl,
    continuousInfusionMlPerHour,
    reconciliationDeltaMl: {
      q2hSumDifference,
      q3hSumDifference,
      continuousSumDifference
    },
    roundingDisclosure: `Rates rounded to 0.1 mL. Total daily reconciliation discrepancy: q3h ${q3hSumDifference > 0 ? "+" : ""}${q3hSumDifference.toFixed(1)} mL (max bound \xB10.4 mL); q2h ${q2hSumDifference > 0 ? "+" : ""}${q2hSumDifference.toFixed(1)} mL (max bound \xB10.6 mL); continuous ${continuousSumDifference > 0 ? "+" : ""}${continuousSumDifference.toFixed(1)} mL (max bound \xB11.2 mL).`
  };
  let overallStatus = "Within reference range";
  if (isGraduated) {
    overallStatus = "Within reference range";
  } else {
    const isEnergyOk = energyCompliance.status === "on_target";
    const isProteinOk = proteinCompliance.status === "on_target";
    const isPeOk = peRatioCompliance.status === "on_target";
    if (isEnergyOk && isProteinOk && isPeOk) {
      overallStatus = "Within reference range";
    } else if (energyCompliance.status === "suboptimal" || proteinCompliance.status === "suboptimal" || peRatioCompliance.status === "suboptimal") {
      overallStatus = "Requires clinician review";
    } else if (energyCompliance.status === "exceeding" || proteinCompliance.status === "exceeding" || peRatioCompliance.status === "exceeding") {
      overallStatus = "Requires clinician review";
    } else {
      overallStatus = "Requires clinician review";
    }
  }
  let imageSrc = "/pediamil-lbw.png";
  let recommendationText = "ESPGHAN Preterm guidelines apply. Specialized high-protein, high-energy matrix recommended.";
  let graduationAlertText = void 0;
  let standardTermTargets = void 0;
  if (isGraduated) {
    imageSrc = "/pediamil-1.png";
    recommendationText = "Infant has achieved term-equivalent weight (>3500g). Transition to standard infant nutrition (Stage 1) to support normal growth trajectories and prevent renal overload.";
    graduationAlertText = "Infant exceeds 3,500g. ESPGHAN Preterm catch-up targets no longer apply. Patient has achieved term-equivalent weight. Consider transitioning to a standard infant formulation (e.g., Stage 1 or Stage 2).";
    standardTermTargets = {
      energyTarget: "~100 kcal/kg/day (Standard Term Target)",
      proteinTarget: "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal, verified 1.49 g/100 mL)",
      formulationBrand: "Pediamil\xAE 1",
      formulationStage: "Stage 1 (0 to 6 Months)",
      guidanceText: "Discontinue preterm catch-up fortification to prevent excessive solute load and disproportionate adiposity accretion."
    };
  }
  const clinicalSummary = isGraduated ? `Patient weight (${weightGrams}g) exceeds 3,500g graduation ceiling. Term-equivalent targets active (~100 kcal/kg/d). Product routed: Pediamil\xAE 1.` : `Preterm LBW pathway active (${proteinBracket.classification}). Prescribed ${fluidAllowanceMlPerKg} mL/kg/d delivers ${deliveredEnergyKcalPerKgPerDay} kcal/kg/d (${energyCompliance.badgeLabel}) and ${deliveredProteinGramsPerKgPerDay} g/kg/d protein (${proteinCompliance.badgeLabel}). P:E ratio: ${proteinToEnergyRatioGramsPer100Kcal} g/100 kcal (${peRatioCompliance.badgeLabel}). Product routed: Pediamil\xAE LBW.`;
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
    auditMetadata
  };
}
function calculatePatientDeliveredNutrientPayload(weightGrams, fluidAllowanceMlPerKg, product) {
  const weightKg = weightGrams / 1e3;
  const totalDailyVolumeMl = Math.round(weightKg * fluidAllowanceMlPerKg * 10) / 10;
  const factor = totalDailyVolumeMl / 100;
  const comp = product.composition;
  const recon = product.reconstitution;
  const isPreterm = weightGrams <= 3500;
  const dailyPowderGrams = Math.round(recon.powderMassGramsPer100Ml * factor * 10) / 10;
  const dailyScoops = Math.round(dailyPowderGrams / recon.powderGramsPerScoop * 10) / 10;
  const waterVolumeMlPerDay = Math.round(
    recon.waterVolumeMlPer3Scoops / recon.finalFeedVolumeMlPer3Scoops * totalDailyVolumeMl * 10
  ) / 10;
  const scoopsPerFeedQ3h = Math.round(dailyScoops / 8 * 10) / 10;
  const scoopsPerFeedQ2h = Math.round(dailyScoops / 12 * 10) / 10;
  const energyKcalPerDay = Math.round(comp.energyKcalPer100Ml * factor * 10) / 10;
  const energyKcalPerKgPerDay = Math.round(energyKcalPerDay / weightKg * 10) / 10;
  const proteinGramsPerDay = Math.round(comp.proteinGramsPer100Ml * factor * 100) / 100;
  const proteinGramsPerKgPerDay = Math.round(proteinGramsPerDay / weightKg * 100) / 100;
  const wheyGramsPerDay = Math.round((comp.wheyGramsPer100Ml || 0) * factor * 100) / 100;
  const caseinGramsPerDay = Math.round((comp.caseinGramsPer100Ml || 0) * factor * 100) / 100;
  const carbsGramsPerDay = Math.round(comp.carbsGramsPer100Ml * factor * 100) / 100;
  const carbsGramsPerKgPerDay = Math.round(carbsGramsPerDay / weightKg * 100) / 100;
  const lactoseGramsPerDay = Math.round((comp.lactoseGramsPer100Ml || comp.carbsGramsPer100Ml) * factor * 100) / 100;
  const fatGramsPerDay = Math.round(comp.fatGramsPer100Ml * factor * 100) / 100;
  const fatGramsPerKgPerDay = Math.round(fatGramsPerDay / weightKg * 100) / 100;
  const calciumMgPerDay = Math.round(comp.calciumMgPer100Ml * factor * 10) / 10;
  const calciumMgPerKgPerDay = Math.round(calciumMgPerDay / weightKg * 10) / 10;
  const phosphorusMgPerDay = Math.round(comp.phosphorusMgPer100Ml * factor * 10) / 10;
  const phosphorusMgPerKgPerDay = Math.round(phosphorusMgPerDay / weightKg * 10) / 10;
  const magnesiumMgPerDay = Math.round(comp.magnesiumMgPer100Ml * factor * 10) / 10;
  const magnesiumMgPerKgPerDay = Math.round(magnesiumMgPerDay / weightKg * 10) / 10;
  const ironMgPerDay = Math.round(comp.ironMgPer100Ml * factor * 100) / 100;
  const ironMgPerKgPerDay = Math.round(ironMgPerDay / weightKg * 100) / 100;
  const zincMgPerDay = Math.round(comp.zincMgPer100Ml * factor * 100) / 100;
  const zincMgPerKgPerDay = Math.round(zincMgPerDay / weightKg * 100) / 100;
  const copperMcgPerDay = Math.round(comp.copperMcgPer100Ml * factor * 10) / 10;
  const iodineMcgPerDay = Math.round(comp.iodineMcgPer100Ml * factor * 10) / 10;
  const seleniumMcgPerDay = Math.round(comp.seleniumMcgPer100Ml * factor * 100) / 100;
  const sodiumMgPerDay = Math.round(comp.sodiumMgPer100Ml * factor * 10) / 10;
  const sodiumMmolPerKgPerDay = Math.round(sodiumMgPerDay / weightKg / 23 * 100) / 100;
  const potassiumMgPerDay = Math.round(comp.potassiumMgPer100Ml * factor * 10) / 10;
  const potassiumMmolPerKgPerDay = Math.round(potassiumMgPerDay / weightKg / 39.1 * 100) / 100;
  const chlorideMgPerDay = Math.round(comp.chlorideMgPer100Ml * factor * 10) / 10;
  const vitaminD3McgPerDay = Math.round(comp.vitaminD3McgPer100Ml * factor * 100) / 100;
  const vitaminD3IuPerDay = Math.round(vitaminD3McgPerDay * 40);
  const vitaminD3IuPerKgPerDay = Math.round(vitaminD3IuPerDay / weightKg);
  const vitaminAMcgPerDay = Math.round(comp.vitaminAMcgPer100Ml * factor * 10) / 10;
  const vitaminAMcgPerKgPerDay = Math.round(vitaminAMcgPerDay / weightKg * 10) / 10;
  const vitaminCMgPerDay = Math.round(comp.vitaminCMgPer100Ml * factor * 10) / 10;
  const vitaminKMcgPerDay = Math.round(comp.vitaminKMcgPer100Ml * factor * 10) / 10;
  const folicAcidMcgPerDay = Math.round(comp.folicAcidMcgPer100Ml * factor * 10) / 10;
  const dhaMgPerDay = Math.round((comp.dhaMgPer100Ml || 0) * factor * 10) / 10;
  const araMgPerDay = Math.round((comp.araMgPer100Ml || 0) * factor * 10) / 10;
  const twoFlHmoGramsPerDay = comp.twoFlHmoGramsPer100Ml ? Math.round(comp.twoFlHmoGramsPer100Ml * factor * 1e3) / 1e3 : void 0;
  const prebioticsGosGramsPerDay = comp.prebioticsGosGramsPer100Ml ? Math.round(comp.prebioticsGosGramsPer100Ml * factor * 100) / 100 : void 0;
  const alphaLactalbuminGramsPerDay = comp.alphaLactalbuminGramsPer100G ? Math.round(comp.alphaLactalbuminGramsPer100G * (dailyPowderGrams / 100) * 100) / 100 : void 0;
  const items = [
    {
      id: "energy",
      name: "Delivered Energy",
      category: "macronutrient",
      amountPerDay: energyKcalPerDay,
      amountPerKgPerDay: energyKcalPerKgPerDay,
      unit: "kcal",
      concentrationPer100Ml: `${comp.energyKcalPer100Ml} kcal`,
      clinicalTarget: isPreterm ? "ESPGHAN: 115\u2013140 kcal/kg/d" : "Standard Term: ~100 kcal/kg/d",
      clinicalInterpretation: isPreterm ? energyKcalPerKgPerDay >= 115 && energyKcalPerKgPerDay <= 140 ? "Within ESPGHAN 2022 recommended typical catch-up range" : energyKcalPerKgPerDay > 140 ? "Conditional catch-up range (monitor growth & tolerance)" : "Below ESPGHAN minimum (risk of slow growth)" : "Standard energy density for mature infant somatic accretion",
      status: isPreterm ? energyKcalPerKgPerDay >= 115 && energyKcalPerKgPerDay <= 140 ? "within_target" : energyKcalPerKgPerDay > 140 ? "above_target" : "below_target" : "within_target"
    },
    {
      id: "protein",
      name: `True Protein (${comp.wheyCaseinRatio || "60:40"} Whey/Casein)`,
      category: "macronutrient",
      amountPerDay: proteinGramsPerDay,
      amountPerKgPerDay: proteinGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.proteinGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 3.5\u20134.0 g/kg/d" : "Term: 1.8\u20132.0 g/100 kcal (~1.5\u20132.5 g/kg/d)",
      clinicalInterpretation: isPreterm ? `Whey: ${wheyGramsPerDay}g/d, Casein: ${caseinGramsPerDay}g/d. Supports lean somatic tissue accretion.` : "Standard milk protein ratio for mature renal solute tolerance.",
      status: isPreterm ? proteinGramsPerKgPerDay >= 3.2 && proteinGramsPerKgPerDay <= 4.1 ? "within_target" : "info" : "within_target"
    },
    {
      id: "carbs",
      name: "Carbohydrates (100% Lactose)",
      category: "macronutrient",
      amountPerDay: carbsGramsPerDay,
      amountPerKgPerDay: carbsGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.carbsGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 10.5\u201312.0 g/kg/d" : "Term: 9.0\u201313.0 g/kg/d",
      clinicalInterpretation: "Facilitates calcium absorption and healthy bifidogenic gut flora establishment.",
      status: "within_target"
    },
    {
      id: "lipids",
      name: "Total Lipids / Fatty Acids",
      category: "macronutrient",
      amountPerDay: fatGramsPerDay,
      amountPerKgPerDay: fatGramsPerKgPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.fatGramsPer100Ml} g`,
      clinicalTarget: isPreterm ? "ESPGHAN: 4.8\u20136.6 g/kg/d" : "Term: 4.0\u20136.0 g/kg/d",
      clinicalInterpretation: "Provides ~50% of non-protein caloric density and essential fatty acid delivery.",
      status: "within_target"
    },
    {
      id: "calcium",
      name: "Calcium (Ca)",
      category: "mineral",
      amountPerDay: calciumMgPerDay,
      amountPerKgPerDay: calciumMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.calciumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 120\u2013140 mg/kg/d" : "Term: 60\u2013100 mg/kg/d",
      clinicalInterpretation: isPreterm ? calciumMgPerKgPerDay >= 120 ? "Achieves ESPGHAN intrauterine accretion rate to prevent osteopenia of prematurity" : "Supplemental calcium may be evaluated" : "Adequate for mature term infant bone mineral density",
      status: isPreterm ? calciumMgPerKgPerDay >= 120 ? "target_met" : "below_target" : "within_target"
    },
    {
      id: "phosphorus",
      name: "Phosphorus (P)",
      category: "mineral",
      amountPerDay: phosphorusMgPerDay,
      amountPerKgPerDay: phosphorusMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.phosphorusMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 65\u201390 mg/kg/d" : "Term: 30\u201360 mg/kg/d",
      clinicalInterpretation: `Ca:P Molar Ratio = ${comp.calciumPhosphorusRatio}. Balances cellular phosphorylation and skeletal mineralization.`,
      status: isPreterm ? phosphorusMgPerKgPerDay >= 65 ? "target_met" : "below_target" : "within_target"
    },
    {
      id: "iron",
      name: "Elemental Iron (Fe)",
      category: "mineral",
      amountPerDay: ironMgPerDay,
      amountPerKgPerDay: ironMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.ironMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0\u20133.0 mg/kg/d" : "Term: 0.9\u20131.3 mg/100 kcal",
      clinicalInterpretation: isPreterm ? ironMgPerKgPerDay >= 2 && ironMgPerKgPerDay <= 3 ? "Meets ESPGHAN enteral iron target for anemia of prematurity prophylaxis" : ironMgPerKgPerDay > 3 ? "High iron delivery; avoid unnecessary additional iron supplements" : "May require routine elemental iron drops if <2 mg/kg/d" : "Standard formula iron prophylaxis for iron-deficiency anemia prevention",
      status: isPreterm ? ironMgPerKgPerDay >= 2 && ironMgPerKgPerDay <= 3 ? "within_target" : "info" : "within_target"
    },
    {
      id: "zinc",
      name: "Zinc (Zn)",
      category: "mineral",
      amountPerDay: zincMgPerDay,
      amountPerKgPerDay: zincMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.zincMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 1.0\u20132.0 mg/kg/d" : "Term: 0.5\u20131.0 mg/kg/d",
      clinicalInterpretation: "Essential cofactor for somatic protein synthesis, immune response, and linear growth.",
      status: "within_target"
    },
    {
      id: "magnesium",
      name: "Magnesium (Mg)",
      category: "mineral",
      amountPerDay: magnesiumMgPerDay,
      amountPerKgPerDay: magnesiumMgPerKgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.magnesiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 8\u201315 mg/kg/d" : "Term: 5\u20138 mg/kg/d",
      clinicalInterpretation: "Crucial neuromuscular and enzymatic cofactor; supports calcium homeostasis.",
      status: "within_target"
    },
    {
      id: "sodium",
      name: "Sodium (Na)",
      category: "electrolyte",
      amountPerDay: sodiumMgPerDay,
      amountPerKgPerDay: sodiumMmolPerKgPerDay,
      unit: "mg (mmol/kg/d)",
      concentrationPer100Ml: `${comp.sodiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0\u20133.0 mmol/kg/d" : "Term: 1.0\u20132.0 mmol/kg/d",
      clinicalInterpretation: isPreterm ? `Delivers ${sodiumMmolPerKgPerDay} mmol/kg/d. Replaces high neonatal fractional excretion of sodium.` : `Delivers ${sodiumMmolPerKgPerDay} mmol/kg/d. Normal low renal solute load for mature kidneys.`,
      status: isPreterm ? sodiumMmolPerKgPerDay >= 2 && sodiumMmolPerKgPerDay <= 3 ? "within_target" : "info" : "within_target"
    },
    {
      id: "potassium",
      name: "Potassium (K)",
      category: "electrolyte",
      amountPerDay: potassiumMgPerDay,
      amountPerKgPerDay: potassiumMmolPerKgPerDay,
      unit: "mg (mmol/kg/d)",
      concentrationPer100Ml: `${comp.potassiumMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0\u20133.0 mmol/kg/d" : "Term: 1.5\u20132.5 mmol/kg/d",
      clinicalInterpretation: `Delivers ${potassiumMmolPerKgPerDay} mmol/kg/d. Major intracellular cation for muscle and myocardial tone.`,
      status: "within_target"
    },
    {
      id: "chloride",
      name: "Chloride (Cl)",
      category: "electrolyte",
      amountPerDay: chlorideMgPerDay,
      unit: "mg",
      concentrationPer100Ml: `${comp.chlorideMgPer100Ml} mg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 2.0\u20133.0 mmol/kg/d" : "Term: 1.5\u20132.5 mmol/kg/d",
      clinicalInterpretation: "Maintains serum electroneutrality and acid-base equilibrium.",
      status: "within_target"
    },
    {
      id: "vitaminD3",
      name: "Vitamin D3 (Cholecalciferol)",
      category: "vitamin",
      amountPerDay: vitaminD3IuPerDay,
      amountPerKgPerDay: vitaminD3IuPerKgPerDay,
      unit: "IU",
      concentrationPer100Ml: `${comp.vitaminD3McgPer100Ml} mcg (${Math.round(comp.vitaminD3McgPer100Ml * 40)} IU)`,
      clinicalTarget: isPreterm ? "ESPGHAN: 400\u20131000 IU/day" : "AAP/ESPGHAN: 400 IU/day",
      clinicalInterpretation: isPreterm ? `${vitaminD3IuPerDay} IU/day (${vitaminD3McgPerDay} mcg/d). ${vitaminD3IuPerDay >= 400 ? "Satisfies minimum ESPGHAN preterm requirement" : "Approaching 400 IU target; assess whether extra oral D3 drops are needed"}.` : `${vitaminD3IuPerDay} IU/day. Meets standard pediatric guideline for rickets prevention.`,
      status: isPreterm ? vitaminD3IuPerDay >= 400 && vitaminD3IuPerDay <= 1e3 ? "within_target" : "info" : "within_target"
    },
    {
      id: "vitaminA",
      name: "Vitamin A (Retinol)",
      category: "vitamin",
      amountPerDay: vitaminAMcgPerDay,
      amountPerKgPerDay: vitaminAMcgPerKgPerDay,
      unit: "mcg RE",
      concentrationPer100Ml: `${comp.vitaminAMcgPer100Ml} mcg`,
      clinicalTarget: isPreterm ? "ESPGHAN: 400\u20131000 mcg RE/kg/d" : "Term: 250\u2013500 mcg/d",
      clinicalInterpretation: "Protects respiratory epithelial integrity, surfactant production, and retinal development.",
      status: "within_target"
    },
    {
      id: "dhaAra",
      name: "DHA & ARA (1:1 Balanced Ratio)",
      category: "specialty",
      amountPerDay: dhaMgPerDay,
      unit: "mg each",
      concentrationPer100Ml: `${comp.dhaMgPer100Ml || 0} mg DHA / ${comp.araMgPer100Ml || 0} mg ARA`,
      clinicalTarget: "ESPGHAN 2022: DHA 12\u201330 mg/100 kcal (with ARA >= DHA)",
      clinicalInterpretation: `Delivers ${dhaMgPerDay} mg DHA and ${araMgPerDay} mg ARA daily. Critical for retinal photoreceptors and cognitive maturation.`,
      status: "target_met"
    }
  ];
  if (twoFlHmoGramsPerDay !== void 0) {
    items.push({
      id: "hmo",
      name: "2'-FL Human Milk Oligosaccharide (HMO)",
      category: "specialty",
      amountPerDay: twoFlHmoGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.twoFlHmoGramsPer100Ml} g`,
      clinicalTarget: "Human Milk Bio-Equivalent",
      clinicalInterpretation: "Supports innate mucosal immunity, pathogen decoy binding, and beneficial bifidobacterial colonization.",
      status: "target_met"
    });
  }
  if (prebioticsGosGramsPerDay !== void 0) {
    items.push({
      id: "gos",
      name: "Prebiotics (GOS)",
      category: "specialty",
      amountPerDay: prebioticsGosGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.prebioticsGosGramsPer100Ml} g`,
      clinicalTarget: "Gastrointestinal Motility Support",
      clinicalInterpretation: "Promotes softer stools, prevents necrotizing enterocolitis dysbiosis, and enhances GI tolerance.",
      status: "target_met"
    });
  }
  if (alphaLactalbuminGramsPerDay !== void 0) {
    items.push({
      id: "alphaLactalbumin",
      name: "Alpha-Lactalbumin Bioactive Protein",
      category: "specialty",
      amountPerDay: alphaLactalbuminGramsPerDay,
      unit: "g",
      concentrationPer100Ml: `${comp.alphaLactalbuminGramsPer100G} g / 100g powder`,
      clinicalTarget: "Human Milk Bioactive Profile",
      clinicalInterpretation: "High in essential amino acids (tryptophan, cysteine) with superior gastric digestibility and low renal solute load.",
      status: "target_met"
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
    items
  };
}

// lib/data/growth-curves-lms.json
var growth_curves_lms_default = {
  fenton_male: {
    standard: "Fenton Preterm Growth Chart (2013)",
    sex: "male",
    xAxis: "Post-Menstrual Age (weeks)",
    minAge: 22,
    maxAge: 50,
    points: [
      {
        age: 22,
        weight: {
          p3: 360,
          p10: 400,
          p50: 480,
          p90: 570,
          p97: 620,
          lms: {
            L: 0.428,
            M: 480,
            S: 0.142
          }
        },
        length: {
          p3: 26.5,
          p10: 27.5,
          p50: 29.5,
          p90: 31.5,
          p97: 32.5,
          lms: {
            L: 1.032,
            M: 29.5,
            S: 0.0535
          }
        },
        headCircumference: {
          p3: 17.8,
          p10: 18.7,
          p50: 20,
          p90: 21.4,
          p97: 22.1,
          lms: {
            L: 1.296,
            M: 20,
            S: 0.0555
          }
        }
      },
      {
        age: 23,
        weight: {
          p3: 430,
          p10: 475,
          p50: 570,
          p90: 675,
          p97: 735,
          lms: {
            L: 0.4,
            M: 570,
            S: 0.1405
          }
        },
        length: {
          p3: 28,
          p10: 29.2,
          p50: 31.2,
          p90: 33.3,
          p97: 34.4,
          lms: {
            L: 0.922,
            M: 31.2,
            S: 0.0535
          }
        },
        headCircumference: {
          p3: 19,
          p10: 20,
          p50: 21.3,
          p90: 22.7,
          p97: 23.5,
          lms: {
            L: 1.314,
            M: 21.3,
            S: 0.054
          }
        }
      },
      {
        age: 24,
        weight: {
          p3: 510,
          p10: 560,
          p50: 670,
          p90: 790,
          p97: 860,
          lms: {
            L: 0.376,
            M: 670,
            S: 0.137
          }
        },
        length: {
          p3: 29.8,
          p10: 31,
          p50: 33,
          p90: 35.1,
          p97: 36.2,
          lms: {
            L: 0.922,
            M: 33,
            S: 0.0505
          }
        },
        headCircumference: {
          p3: 20.2,
          p10: 21.2,
          p50: 22.5,
          p90: 24,
          p97: 24.8,
          lms: {
            L: 0.732,
            M: 22.5,
            S: 0.0525
          }
        }
      },
      {
        age: 25,
        weight: {
          p3: 600,
          p10: 660,
          p50: 785,
          p90: 925,
          p97: 1005,
          lms: {
            L: 0.338,
            M: 785,
            S: 0.135
          }
        },
        length: {
          p3: 31.4,
          p10: 32.7,
          p50: 34.7,
          p90: 36.9,
          p97: 38,
          lms: {
            L: 0.794,
            M: 34.7,
            S: 0.0495
          }
        },
        headCircumference: {
          p3: 21.4,
          p10: 22.4,
          p50: 23.8,
          p90: 25.3,
          p97: 26.1,
          lms: {
            L: 1.278,
            M: 23.8,
            S: 0.051
          }
        }
      },
      {
        age: 26,
        weight: {
          p3: 705,
          p10: 770,
          p50: 915,
          p90: 1075,
          p97: 1165,
          lms: {
            L: 0.33,
            M: 915,
            S: 0.132
          }
        },
        length: {
          p3: 33.1,
          p10: 34.4,
          p50: 36.3,
          p90: 38.6,
          p97: 39.8,
          lms: {
            L: -0.352,
            M: 36.3,
            S: 0.0475
          }
        },
        headCircumference: {
          p3: 22.6,
          p10: 23.6,
          p50: 25,
          p90: 26.5,
          p97: 27.3,
          lms: {
            L: 1.294,
            M: 25,
            S: 0.0485
          }
        }
      },
      {
        age: 27,
        weight: {
          p3: 820,
          p10: 895,
          p50: 1055,
          p90: 1240,
          p97: 1340,
          lms: {
            L: 0.198,
            M: 1055,
            S: 0.1295
          }
        },
        length: {
          p3: 34.7,
          p10: 36,
          p50: 38,
          p90: 40.3,
          p97: 41.5,
          lms: {
            L: 0.066,
            M: 38,
            S: 0.0465
          }
        },
        headCircumference: {
          p3: 23.7,
          p10: 24.7,
          p50: 26.1,
          p90: 27.7,
          p97: 28.5,
          lms: {
            L: 0.702,
            M: 26.1,
            S: 0.0475
          }
        }
      },
      {
        age: 28,
        weight: {
          p3: 950,
          p10: 1030,
          p50: 1210,
          p90: 1420,
          p97: 1530,
          lms: {
            L: 0.114,
            M: 1210,
            S: 0.126
          }
        },
        length: {
          p3: 36.3,
          p10: 37.6,
          p50: 39.6,
          p90: 41.9,
          p97: 43.1,
          lms: {
            L: 0.024,
            M: 39.6,
            S: 0.0445
          }
        },
        headCircumference: {
          p3: 24.7,
          p10: 25.8,
          p50: 27.2,
          p90: 28.8,
          p97: 29.7,
          lms: {
            L: 0.74,
            M: 27.2,
            S: 0.047
          }
        }
      },
      {
        age: 29,
        weight: {
          p3: 1090,
          p10: 1180,
          p50: 1380,
          p90: 1615,
          p97: 1735,
          lms: {
            L: 0.104,
            M: 1380,
            S: 0.123
          }
        },
        length: {
          p3: 37.8,
          p10: 39.1,
          p50: 41.1,
          p90: 43.4,
          p97: 44.7,
          lms: {
            L: -0.296,
            M: 41.1,
            S: 0.0435
          }
        },
        headCircumference: {
          p3: 25.7,
          p10: 26.8,
          p50: 28.2,
          p90: 29.9,
          p97: 30.7,
          lms: {
            L: 0.5,
            M: 28.2,
            S: 0.046
          }
        }
      },
      {
        age: 30,
        weight: {
          p3: 1240,
          p10: 1340,
          p50: 1560,
          p90: 1820,
          p97: 1955,
          lms: {
            L: 0.046,
            M: 1560,
            S: 0.1205
          }
        },
        length: {
          p3: 39.2,
          p10: 40.5,
          p50: 42.5,
          p90: 44.9,
          p97: 46.2,
          lms: {
            L: -0.76,
            M: 42.5,
            S: 0.0425
          }
        },
        headCircumference: {
          p3: 26.6,
          p10: 27.7,
          p50: 29.2,
          p90: 30.9,
          p97: 31.7,
          lms: {
            L: 1.072,
            M: 29.2,
            S: 0.0455
          }
        }
      },
      {
        age: 31,
        weight: {
          p3: 1400,
          p10: 1510,
          p50: 1750,
          p90: 2040,
          p97: 2190,
          lms: {
            L: -0.064,
            M: 1750,
            S: 0.1185
          }
        },
        length: {
          p3: 40.6,
          p10: 41.9,
          p50: 43.9,
          p90: 46.3,
          p97: 47.6,
          lms: {
            L: -0.836,
            M: 43.9,
            S: 0.041
          }
        },
        headCircumference: {
          p3: 27.5,
          p10: 28.6,
          p50: 30.1,
          p90: 31.8,
          p97: 32.7,
          lms: {
            L: 0.708,
            M: 30.1,
            S: 0.0445
          }
        }
      },
      {
        age: 32,
        weight: {
          p3: 1570,
          p10: 1690,
          p50: 1950,
          p90: 2270,
          p97: 2430,
          lms: {
            L: -0.128,
            M: 1950,
            S: 0.116
          }
        },
        length: {
          p3: 41.9,
          p10: 43.2,
          p50: 45.2,
          p90: 47.6,
          p97: 49,
          lms: {
            L: -1.14,
            M: 45.2,
            S: 0.0405
          }
        },
        headCircumference: {
          p3: 28.4,
          p10: 29.5,
          p50: 31,
          p90: 32.7,
          p97: 33.6,
          lms: {
            L: 0.712,
            M: 31,
            S: 0.043
          }
        }
      },
      {
        age: 33,
        weight: {
          p3: 1750,
          p10: 1880,
          p50: 2160,
          p90: 2510,
          p97: 2685,
          lms: {
            L: -0.222,
            M: 2160,
            S: 0.1135
          }
        },
        length: {
          p3: 43.1,
          p10: 44.4,
          p50: 46.4,
          p90: 48.9,
          p97: 50.3,
          lms: {
            L: -1.588,
            M: 46.4,
            S: 0.04
          }
        },
        headCircumference: {
          p3: 29.2,
          p10: 30.3,
          p50: 31.8,
          p90: 33.6,
          p97: 34.5,
          lms: {
            L: 0.096,
            M: 31.8,
            S: 0.043
          }
        }
      },
      {
        age: 34,
        weight: {
          p3: 1940,
          p10: 2080,
          p50: 2380,
          p90: 2760,
          p97: 2950,
          lms: {
            L: -0.312,
            M: 2380,
            S: 0.111
          }
        },
        length: {
          p3: 44.3,
          p10: 45.6,
          p50: 47.6,
          p90: 50.1,
          p97: 51.5,
          lms: {
            L: -1.654,
            M: 47.6,
            S: 0.039
          }
        },
        headCircumference: {
          p3: 30,
          p10: 31.1,
          p50: 32.6,
          p90: 34.4,
          p97: 35.3,
          lms: {
            L: 0.07,
            M: 32.6,
            S: 0.042
          }
        }
      },
      {
        age: 35,
        weight: {
          p3: 2140,
          p10: 2290,
          p50: 2610,
          p90: 3020,
          p97: 3225,
          lms: {
            L: -0.396,
            M: 2610,
            S: 0.1085
          }
        },
        length: {
          p3: 45.4,
          p10: 46.7,
          p50: 48.7,
          p90: 51.3,
          p97: 52.7,
          lms: {
            L: -1.66,
            M: 48.7,
            S: 0.0385
          }
        },
        headCircumference: {
          p3: 30.7,
          p10: 31.8,
          p50: 33.4,
          p90: 35.2,
          p97: 36.1,
          lms: {
            L: 0.74,
            M: 33.4,
            S: 0.042
          }
        }
      },
      {
        age: 36,
        weight: {
          p3: 2350,
          p10: 2510,
          p50: 2850,
          p90: 3290,
          p97: 3510,
          lms: {
            L: -0.476,
            M: 2850,
            S: 0.106
          }
        },
        length: {
          p3: 46.4,
          p10: 47.7,
          p50: 49.8,
          p90: 52.4,
          p97: 53.8,
          lms: {
            L: -1.51,
            M: 49.8,
            S: 0.0385
          }
        },
        headCircumference: {
          p3: 31.4,
          p10: 32.5,
          p50: 34.1,
          p90: 35.9,
          p97: 36.8,
          lms: {
            L: 0.682,
            M: 34.1,
            S: 0.041
          }
        }
      },
      {
        age: 37,
        weight: {
          p3: 2560,
          p10: 2730,
          p50: 3090,
          p90: 3560,
          p97: 3800,
          lms: {
            L: -0.578,
            M: 3090,
            S: 0.104
          }
        },
        length: {
          p3: 47.4,
          p10: 48.7,
          p50: 50.8,
          p90: 53.4,
          p97: 54.9,
          lms: {
            L: -1.66,
            M: 50.8,
            S: 0.038
          }
        },
        headCircumference: {
          p3: 32.1,
          p10: 33.2,
          p50: 34.8,
          p90: 36.6,
          p97: 37.5,
          lms: {
            L: 0.65,
            M: 34.8,
            S: 0.0405
          }
        }
      },
      {
        age: 38,
        weight: {
          p3: 2770,
          p10: 2950,
          p50: 3330,
          p90: 3830,
          p97: 4085,
          lms: {
            L: -0.636,
            M: 3330,
            S: 0.1025
          }
        },
        length: {
          p3: 48.3,
          p10: 49.6,
          p50: 51.8,
          p90: 54.4,
          p97: 55.9,
          lms: {
            L: -1.31,
            M: 51.8,
            S: 0.038
          }
        },
        headCircumference: {
          p3: 32.7,
          p10: 33.8,
          p50: 35.4,
          p90: 37.2,
          p97: 38.1,
          lms: {
            L: 0.668,
            M: 35.4,
            S: 0.0395
          }
        }
      },
      {
        age: 39,
        weight: {
          p3: 2970,
          p10: 3160,
          p50: 3560,
          p90: 4085,
          p97: 4355,
          lms: {
            L: -0.652,
            M: 3560,
            S: 0.101
          }
        },
        length: {
          p3: 49.1,
          p10: 50.5,
          p50: 52.7,
          p90: 55.3,
          p97: 56.8,
          lms: {
            L: -1.01,
            M: 52.7,
            S: 0.0375
          }
        },
        headCircumference: {
          p3: 33.2,
          p10: 34.4,
          p50: 36,
          p90: 37.8,
          p97: 38.7,
          lms: {
            L: 1.1,
            M: 36,
            S: 0.0395
          }
        }
      },
      {
        age: 40,
        weight: {
          p3: 3150,
          p10: 3350,
          p50: 3770,
          p90: 4320,
          p97: 4600,
          lms: {
            L: -0.638,
            M: 3770,
            S: 0.1
          }
        },
        length: {
          p3: 49.9,
          p10: 51.3,
          p50: 53.5,
          p90: 56.1,
          p97: 57.6,
          lms: {
            L: -1.34,
            M: 53.5,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 33.7,
          p10: 34.9,
          p50: 36.5,
          p90: 38.3,
          p97: 39.2,
          lms: {
            L: 1.096,
            M: 36.5,
            S: 0.039
          }
        }
      },
      {
        age: 42,
        weight: {
          p3: 3480,
          p10: 3700,
          p50: 4180,
          p90: 4770,
          p97: 5070,
          lms: {
            L: -0.34,
            M: 4180,
            S: 0.0995
          }
        },
        length: {
          p3: 51.2,
          p10: 52.6,
          p50: 54.9,
          p90: 57.6,
          p97: 59.1,
          lms: {
            L: -1.29,
            M: 54.9,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 34.5,
          p10: 35.7,
          p50: 37.4,
          p90: 39.2,
          p97: 40.1,
          lms: {
            L: 1.66,
            M: 37.4,
            S: 0.0385
          }
        }
      },
      {
        age: 44,
        weight: {
          p3: 3810,
          p10: 4050,
          p50: 4580,
          p90: 5220,
          p97: 5540,
          lms: {
            L: -0.23,
            M: 4580,
            S: 0.0995
          }
        },
        length: {
          p3: 52.4,
          p10: 53.9,
          p50: 56.3,
          p90: 59,
          p97: 60.5,
          lms: {
            L: -0.278,
            M: 56.3,
            S: 0.0375
          }
        },
        headCircumference: {
          p3: 35.2,
          p10: 36.4,
          p50: 38.1,
          p90: 40,
          p97: 40.9,
          lms: {
            L: 1.072,
            M: 38.1,
            S: 0.039
          }
        }
      },
      {
        age: 46,
        weight: {
          p3: 4160,
          p10: 4420,
          p50: 5e3,
          p90: 5680,
          p97: 6020,
          lms: {
            L: -0.09,
            M: 5e3,
            S: 0.098
          }
        },
        length: {
          p3: 53.6,
          p10: 55.1,
          p50: 57.6,
          p90: 60.3,
          p97: 61.8,
          lms: {
            L: 0.164,
            M: 57.6,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 35.8,
          p10: 37,
          p50: 38.8,
          p90: 40.7,
          p97: 41.6,
          lms: {
            L: 1.654,
            M: 38.8,
            S: 0.039
          }
        }
      },
      {
        age: 48,
        weight: {
          p3: 4520,
          p10: 4800,
          p50: 5420,
          p90: 6140,
          p97: 6510,
          lms: {
            L: -0.08,
            M: 5420,
            S: 0.0965
          }
        },
        length: {
          p3: 54.8,
          p10: 56.3,
          p50: 58.8,
          p90: 61.6,
          p97: 63.1,
          lms: {
            L: -0.28,
            M: 58.8,
            S: 0.0365
          }
        },
        headCircumference: {
          p3: 36.4,
          p10: 37.6,
          p50: 39.4,
          p90: 41.3,
          p97: 42.2,
          lms: {
            L: 1.56,
            M: 39.4,
            S: 0.0385
          }
        }
      },
      {
        age: 50,
        weight: {
          p3: 4900,
          p10: 5200,
          p50: 5860,
          p90: 6620,
          p97: 7010,
          lms: {
            L: -0.036,
            M: 5860,
            S: 0.095
          }
        },
        length: {
          p3: 56,
          p10: 57.5,
          p50: 60,
          p90: 62.8,
          p97: 64.3,
          lms: {
            L: -0.298,
            M: 60,
            S: 0.036
          }
        },
        headCircumference: {
          p3: 37,
          p10: 38.2,
          p50: 40,
          p90: 41.9,
          p97: 42.8,
          lms: {
            L: 1.46,
            M: 40,
            S: 0.038
          }
        }
      }
    ]
  },
  fenton_female: {
    standard: "Fenton Preterm Growth Chart (2013)",
    sex: "female",
    xAxis: "Post-Menstrual Age (weeks)",
    minAge: 22,
    maxAge: 50,
    points: [
      {
        age: 22,
        weight: {
          p3: 340,
          p10: 375,
          p50: 450,
          p90: 535,
          p97: 580,
          lms: {
            L: 0.366,
            M: 450,
            S: 0.1405
          }
        },
        length: {
          p3: 26,
          p10: 27,
          p50: 29,
          p90: 31,
          p97: 32,
          lms: {
            L: 1.026,
            M: 29,
            S: 0.0545
          }
        },
        headCircumference: {
          p3: 17.3,
          p10: 18.2,
          p50: 19.5,
          p90: 20.9,
          p97: 21.6,
          lms: {
            L: 1.39,
            M: 19.5,
            S: 0.057
          }
        }
      },
      {
        age: 23,
        weight: {
          p3: 405,
          p10: 450,
          p50: 535,
          p90: 635,
          p97: 690,
          lms: {
            L: 0.306,
            M: 535,
            S: 0.139
          }
        },
        length: {
          p3: 27.5,
          p10: 28.7,
          p50: 30.6,
          p90: 32.7,
          p97: 33.8,
          lms: {
            L: 0.53,
            M: 30.6,
            S: 0.0535
          }
        },
        headCircumference: {
          p3: 18.5,
          p10: 19.5,
          p50: 20.8,
          p90: 22.2,
          p97: 22.9,
          lms: {
            L: 1.67,
            M: 20.8,
            S: 0.0545
          }
        }
      },
      {
        age: 24,
        weight: {
          p3: 480,
          p10: 530,
          p50: 630,
          p90: 745,
          p97: 810,
          lms: {
            L: 0.29,
            M: 630,
            S: 0.137
          }
        },
        length: {
          p3: 29.2,
          p10: 30.4,
          p50: 32.4,
          p90: 34.5,
          p97: 35.6,
          lms: {
            L: 0.92,
            M: 32.4,
            S: 0.0515
          }
        },
        headCircumference: {
          p3: 19.7,
          p10: 20.7,
          p50: 22,
          p90: 23.4,
          p97: 24.2,
          lms: {
            L: 1.49,
            M: 22,
            S: 0.052
          }
        }
      },
      {
        age: 25,
        weight: {
          p3: 565,
          p10: 625,
          p50: 740,
          p90: 870,
          p97: 945,
          lms: {
            L: 0.378,
            M: 740,
            S: 0.134
          }
        },
        length: {
          p3: 30.8,
          p10: 32,
          p50: 34.1,
          p90: 36.3,
          p97: 37.4,
          lms: {
            L: 0.93,
            M: 34.1,
            S: 0.0505
          }
        },
        headCircumference: {
          p3: 20.9,
          p10: 21.9,
          p50: 23.2,
          p90: 24.7,
          p97: 25.5,
          lms: {
            L: 0.714,
            M: 23.2,
            S: 0.051
          }
        }
      },
      {
        age: 26,
        weight: {
          p3: 665,
          p10: 730,
          p50: 865,
          p90: 1010,
          p97: 1095,
          lms: {
            L: 0.476,
            M: 865,
            S: 0.13
          }
        },
        length: {
          p3: 32.4,
          p10: 33.7,
          p50: 35.7,
          p90: 37.9,
          p97: 39.1,
          lms: {
            L: 0.522,
            M: 35.7,
            S: 0.0485
          }
        },
        headCircumference: {
          p3: 22,
          p10: 23,
          p50: 24.4,
          p90: 25.9,
          p97: 26.7,
          lms: {
            L: 1.314,
            M: 24.4,
            S: 0.0495
          }
        }
      },
      {
        age: 27,
        weight: {
          p3: 770,
          p10: 845,
          p50: 1e3,
          p90: 1165,
          p97: 1260,
          lms: {
            L: 0.534,
            M: 1e3,
            S: 0.1285
          }
        },
        length: {
          p3: 34,
          p10: 35.3,
          p50: 37.3,
          p90: 39.5,
          p97: 40.7,
          lms: {
            L: 0.492,
            M: 37.3,
            S: 0.0465
          }
        },
        headCircumference: {
          p3: 23.1,
          p10: 24.1,
          p50: 25.5,
          p90: 27,
          p97: 27.8,
          lms: {
            L: 1.54,
            M: 25.5,
            S: 0.0475
          }
        }
      },
      {
        age: 28,
        weight: {
          p3: 890,
          p10: 970,
          p50: 1140,
          p90: 1335,
          p97: 1445,
          lms: {
            L: 0.176,
            M: 1140,
            S: 0.1275
          }
        },
        length: {
          p3: 35.5,
          p10: 36.8,
          p50: 38.8,
          p90: 41.1,
          p97: 42.3,
          lms: {
            L: 0.046,
            M: 38.8,
            S: 0.0455
          }
        },
        headCircumference: {
          p3: 24.1,
          p10: 25.2,
          p50: 26.6,
          p90: 28.1,
          p97: 29,
          lms: {
            L: 1.49,
            M: 26.6,
            S: 0.047
          }
        }
      },
      {
        age: 29,
        weight: {
          p3: 1020,
          p10: 1110,
          p50: 1300,
          p90: 1520,
          p97: 1640,
          lms: {
            L: 0.166,
            M: 1300,
            S: 0.125
          }
        },
        length: {
          p3: 37,
          p10: 38.3,
          p50: 40.3,
          p90: 42.6,
          p97: 43.8,
          lms: {
            L: 6e-3,
            M: 40.3,
            S: 0.044
          }
        },
        headCircumference: {
          p3: 25.1,
          p10: 26.2,
          p50: 27.6,
          p90: 29.2,
          p97: 30,
          lms: {
            L: 1.142,
            M: 27.6,
            S: 0.0455
          }
        }
      },
      {
        age: 30,
        weight: {
          p3: 1160,
          p10: 1260,
          p50: 1470,
          p90: 1715,
          p97: 1850,
          lms: {
            L: 0.108,
            M: 1470,
            S: 0.123
          }
        },
        length: {
          p3: 38.4,
          p10: 39.7,
          p50: 41.7,
          p90: 44,
          p97: 45.3,
          lms: {
            L: -0.328,
            M: 41.7,
            S: 0.0425
          }
        },
        headCircumference: {
          p3: 26,
          p10: 27.1,
          p50: 28.6,
          p90: 30.2,
          p97: 31,
          lms: {
            L: 1.726,
            M: 28.6,
            S: 0.045
          }
        }
      },
      {
        age: 31,
        weight: {
          p3: 1315,
          p10: 1420,
          p50: 1650,
          p90: 1920,
          p97: 2070,
          lms: {
            L: -8e-3,
            M: 1650,
            S: 0.1195
          }
        },
        length: {
          p3: 39.7,
          p10: 41,
          p50: 43,
          p90: 45.4,
          p97: 46.7,
          lms: {
            L: -0.84,
            M: 43,
            S: 0.042
          }
        },
        headCircumference: {
          p3: 26.9,
          p10: 28,
          p50: 29.5,
          p90: 31.1,
          p97: 32,
          lms: {
            L: 1.296,
            M: 29.5,
            S: 0.0445
          }
        }
      },
      {
        age: 32,
        weight: {
          p3: 1480,
          p10: 1590,
          p50: 1845,
          p90: 2140,
          p97: 2305,
          lms: {
            L: -0.034,
            M: 1845,
            S: 0.117
          }
        },
        length: {
          p3: 41,
          p10: 42.3,
          p50: 44.3,
          p90: 46.7,
          p97: 48,
          lms: {
            L: -0.818,
            M: 44.3,
            S: 0.041
          }
        },
        headCircumference: {
          p3: 27.7,
          p10: 28.8,
          p50: 30.3,
          p90: 32,
          p97: 32.9,
          lms: {
            L: 0.722,
            M: 30.3,
            S: 0.044
          }
        }
      },
      {
        age: 33,
        weight: {
          p3: 1650,
          p10: 1775,
          p50: 2045,
          p90: 2370,
          p97: 2545,
          lms: {
            L: -0.122,
            M: 2045,
            S: 0.1145
          }
        },
        length: {
          p3: 42.2,
          p10: 43.5,
          p50: 45.5,
          p90: 48,
          p97: 49.3,
          lms: {
            L: -1.266,
            M: 45.5,
            S: 0.0405
          }
        },
        headCircumference: {
          p3: 28.5,
          p10: 29.6,
          p50: 31.1,
          p90: 32.8,
          p97: 33.7,
          lms: {
            L: 0.7,
            M: 31.1,
            S: 0.043
          }
        }
      },
      {
        age: 34,
        weight: {
          p3: 1835,
          p10: 1970,
          p50: 2260,
          p90: 2610,
          p97: 2800,
          lms: {
            L: -0.17,
            M: 2260,
            S: 0.1115
          }
        },
        length: {
          p3: 43.4,
          p10: 44.7,
          p50: 46.7,
          p90: 49.2,
          p97: 50.5,
          lms: {
            L: -1.318,
            M: 46.7,
            S: 0.0395
          }
        },
        headCircumference: {
          p3: 29.3,
          p10: 30.4,
          p50: 31.9,
          p90: 33.6,
          p97: 34.5,
          lms: {
            L: 0.74,
            M: 31.9,
            S: 0.042
          }
        }
      },
      {
        age: 35,
        weight: {
          p3: 2030,
          p10: 2170,
          p50: 2480,
          p90: 2860,
          p97: 3060,
          lms: {
            L: -0.28,
            M: 2480,
            S: 0.1085
          }
        },
        length: {
          p3: 44.5,
          p10: 45.8,
          p50: 47.8,
          p90: 50.3,
          p97: 51.7,
          lms: {
            L: -1.61,
            M: 47.8,
            S: 0.0385
          }
        },
        headCircumference: {
          p3: 30,
          p10: 31.1,
          p50: 32.6,
          p90: 34.4,
          p97: 35.3,
          lms: {
            L: 0.07,
            M: 32.6,
            S: 0.042
          }
        }
      },
      {
        age: 36,
        weight: {
          p3: 2230,
          p10: 2380,
          p50: 2710,
          p90: 3115,
          p97: 3330,
          lms: {
            L: -0.32,
            M: 2710,
            S: 0.106
          }
        },
        length: {
          p3: 45.5,
          p10: 46.8,
          p50: 48.9,
          p90: 51.4,
          p97: 52.8,
          lms: {
            L: -1.16,
            M: 48.9,
            S: 0.0385
          }
        },
        headCircumference: {
          p3: 30.7,
          p10: 31.8,
          p50: 33.4,
          p90: 35.1,
          p97: 36,
          lms: {
            L: 1.302,
            M: 33.4,
            S: 0.041
          }
        }
      },
      {
        age: 37,
        weight: {
          p3: 2430,
          p10: 2590,
          p50: 2940,
          p90: 3375,
          p97: 3605,
          lms: {
            L: -0.402,
            M: 2940,
            S: 0.104
          }
        },
        length: {
          p3: 46.5,
          p10: 47.8,
          p50: 49.9,
          p90: 52.4,
          p97: 53.8,
          lms: {
            L: -1.11,
            M: 49.9,
            S: 0.038
          }
        },
        headCircumference: {
          p3: 31.3,
          p10: 32.4,
          p50: 34,
          p90: 35.8,
          p97: 36.7,
          lms: {
            L: 0.694,
            M: 34,
            S: 0.041
          }
        }
      },
      {
        age: 38,
        weight: {
          p3: 2630,
          p10: 2800,
          p50: 3170,
          p90: 3635,
          p97: 3880,
          lms: {
            L: -0.472,
            M: 3170,
            S: 0.1025
          }
        },
        length: {
          p3: 47.4,
          p10: 48.7,
          p50: 50.8,
          p90: 53.4,
          p97: 54.8,
          lms: {
            L: -1.46,
            M: 50.8,
            S: 0.0375
          }
        },
        headCircumference: {
          p3: 31.9,
          p10: 33,
          p50: 34.6,
          p90: 36.4,
          p97: 37.3,
          lms: {
            L: 0.67,
            M: 34.6,
            S: 0.0405
          }
        }
      },
      {
        age: 39,
        weight: {
          p3: 2825,
          p10: 3e3,
          p50: 3390,
          p90: 3885,
          p97: 4140,
          lms: {
            L: -0.548,
            M: 3390,
            S: 0.101
          }
        },
        length: {
          p3: 48.2,
          p10: 49.5,
          p50: 51.7,
          p90: 54.3,
          p97: 55.7,
          lms: {
            L: -1.06,
            M: 51.7,
            S: 0.0375
          }
        },
        headCircumference: {
          p3: 32.5,
          p10: 33.6,
          p50: 35.2,
          p90: 37,
          p97: 37.9,
          lms: {
            L: 0.648,
            M: 35.2,
            S: 0.04
          }
        }
      },
      {
        age: 40,
        weight: {
          p3: 3e3,
          p10: 3190,
          p50: 3590,
          p90: 4110,
          p97: 4380,
          lms: {
            L: -0.642,
            M: 3590,
            S: 0.0995
          }
        },
        length: {
          p3: 49,
          p10: 50.3,
          p50: 52.5,
          p90: 55.1,
          p97: 56.5,
          lms: {
            L: -1.34,
            M: 52.5,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 33,
          p10: 34.1,
          p50: 35.7,
          p90: 37.5,
          p97: 38.4,
          lms: {
            L: 0.638,
            M: 35.7,
            S: 0.0395
          }
        }
      },
      {
        age: 42,
        weight: {
          p3: 3310,
          p10: 3520,
          p50: 3980,
          p90: 4540,
          p97: 4830,
          lms: {
            L: -0.31,
            M: 3980,
            S: 0.1
          }
        },
        length: {
          p3: 50.2,
          p10: 51.6,
          p50: 53.9,
          p90: 56.5,
          p97: 57.9,
          lms: {
            L: -0.366,
            M: 53.9,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 33.7,
          p10: 34.9,
          p50: 36.6,
          p90: 38.3,
          p97: 39.2,
          lms: {
            L: 2.21,
            M: 36.6,
            S: 0.0385
          }
        }
      },
      {
        age: 44,
        weight: {
          p3: 3620,
          p10: 3850,
          p50: 4360,
          p90: 4970,
          p97: 5280,
          lms: {
            L: -0.198,
            M: 4360,
            S: 0.1
          }
        },
        length: {
          p3: 51.4,
          p10: 52.8,
          p50: 55.2,
          p90: 57.8,
          p97: 59.3,
          lms: {
            L: -0.182,
            M: 55.2,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 34.4,
          p10: 35.6,
          p50: 37.3,
          p90: 39.1,
          p97: 40,
          lms: {
            L: 1.66,
            M: 37.3,
            S: 0.039
          }
        }
      },
      {
        age: 46,
        weight: {
          p3: 3950,
          p10: 4200,
          p50: 4760,
          p90: 5410,
          p97: 5740,
          lms: {
            L: -0.048,
            M: 4760,
            S: 0.099
          }
        },
        length: {
          p3: 52.6,
          p10: 54,
          p50: 56.5,
          p90: 59.1,
          p97: 60.6,
          lms: {
            L: 0.276,
            M: 56.5,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 35,
          p10: 36.2,
          p50: 38,
          p90: 39.8,
          p97: 40.7,
          lms: {
            L: 2.16,
            M: 38,
            S: 0.039
          }
        }
      },
      {
        age: 48,
        weight: {
          p3: 4300,
          p10: 4560,
          p50: 5160,
          p90: 5850,
          p97: 6210,
          lms: {
            L: -0.092,
            M: 5160,
            S: 0.0975
          }
        },
        length: {
          p3: 53.7,
          p10: 55.2,
          p50: 57.7,
          p90: 60.4,
          p97: 61.9,
          lms: {
            L: 0.162,
            M: 57.7,
            S: 0.037
          }
        },
        headCircumference: {
          p3: 35.6,
          p10: 36.8,
          p50: 38.6,
          p90: 40.5,
          p97: 41.3,
          lms: {
            L: 1.96,
            M: 38.6,
            S: 0.0385
          }
        }
      },
      {
        age: 50,
        weight: {
          p3: 4660,
          p10: 4940,
          p50: 5580,
          p90: 6310,
          p97: 6680,
          lms: {
            L: -8e-3,
            M: 5580,
            S: 0.0955
          }
        },
        length: {
          p3: 54.8,
          p10: 56.4,
          p50: 58.9,
          p90: 61.6,
          p97: 63.1,
          lms: {
            L: 0.472,
            M: 58.9,
            S: 0.0365
          }
        },
        headCircumference: {
          p3: 36.2,
          p10: 37.4,
          p50: 39.2,
          p90: 41.1,
          p97: 41.9,
          lms: {
            L: 1.86,
            M: 39.2,
            S: 0.038
          }
        }
      }
    ]
  },
  who_male: {
    standard: "WHO Child Growth Standards (2006)",
    sex: "male",
    xAxis: "Corrected Age (months)",
    minAge: 0,
    maxAge: 24,
    points: [
      {
        age: 0,
        weight: {
          p3: 2500,
          p10: 2900,
          p50: 3300,
          p90: 3900,
          p97: 4300,
          lms: {
            L: -0.032,
            M: 3300,
            S: 0.1355
          }
        },
        length: {
          p3: 46.3,
          p10: 47.9,
          p50: 49.9,
          p90: 51.8,
          p97: 53.4,
          lms: {
            L: 1.748,
            M: 49.9,
            S: 0.0355
          }
        },
        headCircumference: {
          p3: 32.1,
          p10: 33.2,
          p50: 34.5,
          p90: 35.8,
          p97: 36.9,
          lms: {
            L: 1.204,
            M: 34.5,
            S: 0.0345
          }
        }
      },
      {
        age: 1,
        weight: {
          p3: 3400,
          p10: 3900,
          p50: 4500,
          p90: 5100,
          p97: 5700,
          lms: {
            L: 0.868,
            M: 4500,
            S: 0.1255
          }
        },
        length: {
          p3: 51.1,
          p10: 52.8,
          p50: 54.7,
          p90: 56.7,
          p97: 58.4,
          lms: {
            L: 0.586,
            M: 54.7,
            S: 0.033
          }
        },
        headCircumference: {
          p3: 35.1,
          p10: 36.1,
          p50: 37.3,
          p90: 38.6,
          p97: 39.5,
          lms: {
            L: 0.826,
            M: 37.3,
            S: 0.0295
          }
        }
      },
      {
        age: 2,
        weight: {
          p3: 4400,
          p10: 4900,
          p50: 5600,
          p90: 6300,
          p97: 7e3,
          lms: {
            L: 0.506,
            M: 5600,
            S: 0.115
          }
        },
        length: {
          p3: 54.7,
          p10: 56.4,
          p50: 58.4,
          p90: 60.5,
          p97: 62.2,
          lms: {
            L: 0.69,
            M: 58.4,
            S: 0.032
          }
        },
        headCircumference: {
          p3: 36.9,
          p10: 37.9,
          p50: 39.1,
          p90: 40.4,
          p97: 41.3,
          lms: {
            L: 0.758,
            M: 39.1,
            S: 0.0285
          }
        }
      },
      {
        age: 3,
        weight: {
          p3: 5100,
          p10: 5700,
          p50: 6400,
          p90: 7200,
          p97: 7900,
          lms: {
            L: 0.362,
            M: 6400,
            S: 0.1085
          }
        },
        length: {
          p3: 57.6,
          p10: 59.4,
          p50: 61.4,
          p90: 63.5,
          p97: 65.3,
          lms: {
            L: 0.58,
            M: 61.4,
            S: 0.031
          }
        },
        headCircumference: {
          p3: 38.3,
          p10: 39.3,
          p50: 40.5,
          p90: 41.8,
          p97: 42.7,
          lms: {
            L: 1.14,
            M: 40.5,
            S: 0.0275
          }
        }
      },
      {
        age: 4,
        weight: {
          p3: 5600,
          p10: 6200,
          p50: 7e3,
          p90: 7900,
          p97: 8600,
          lms: {
            L: 0.396,
            M: 7e3,
            S: 0.1075
          }
        },
        length: {
          p3: 60,
          p10: 61.8,
          p50: 63.9,
          p90: 66,
          p97: 67.8,
          lms: {
            L: 1.154,
            M: 63.9,
            S: 0.0305
          }
        },
        headCircumference: {
          p3: 39.4,
          p10: 40.4,
          p50: 41.6,
          p90: 42.9,
          p97: 43.8,
          lms: {
            L: 0.94,
            M: 41.6,
            S: 0.0265
          }
        }
      },
      {
        age: 6,
        weight: {
          p3: 6400,
          p10: 7100,
          p50: 7900,
          p90: 8900,
          p97: 9700,
          lms: {
            L: 0.016,
            M: 7900,
            S: 0.1035
          }
        },
        length: {
          p3: 63.6,
          p10: 65.5,
          p50: 67.6,
          p90: 69.8,
          p97: 71.6,
          lms: {
            L: 0.972,
            M: 67.6,
            S: 0.0295
          }
        },
        headCircumference: {
          p3: 41,
          p10: 42,
          p50: 43.3,
          p90: 44.6,
          p97: 45.5,
          lms: {
            L: 2.34,
            M: 43.3,
            S: 0.026
          }
        }
      },
      {
        age: 8,
        weight: {
          p3: 7e3,
          p10: 7700,
          p50: 8600,
          p90: 9600,
          p97: 10500,
          lms: {
            L: 0.184,
            M: 8600,
            S: 0.101
          }
        },
        length: {
          p3: 66.5,
          p10: 68.4,
          p50: 70.6,
          p90: 72.8,
          p97: 74.7,
          lms: {
            L: 1.156,
            M: 70.6,
            S: 0.029
          }
        },
        headCircumference: {
          p3: 42.1,
          p10: 43.1,
          p50: 44.4,
          p90: 45.7,
          p97: 46.6,
          lms: {
            L: 2.09,
            M: 44.4,
            S: 0.0255
          }
        }
      },
      {
        age: 10,
        weight: {
          p3: 7500,
          p10: 8200,
          p50: 9200,
          p90: 10200,
          p97: 11200,
          lms: {
            L: 0.36,
            M: 9200,
            S: 0.0995
          }
        },
        length: {
          p3: 69,
          p10: 71,
          p50: 73.3,
          p90: 75.6,
          p97: 77.6,
          lms: {
            L: 1.21,
            M: 73.3,
            S: 0.029
          }
        },
        headCircumference: {
          p3: 42.9,
          p10: 44,
          p50: 45.3,
          p90: 46.6,
          p97: 47.5,
          lms: {
            L: 2.66,
            M: 45.3,
            S: 0.0255
          }
        }
      },
      {
        age: 12,
        weight: {
          p3: 7800,
          p10: 8600,
          p50: 9600,
          p90: 10800,
          p97: 11800,
          lms: {
            L: -0.032,
            M: 9600,
            S: 0.1035
          }
        },
        length: {
          p3: 71.3,
          p10: 73.4,
          p50: 75.7,
          p90: 78.1,
          p97: 80.2,
          lms: {
            L: 0.634,
            M: 75.7,
            S: 0.029
          }
        },
        headCircumference: {
          p3: 43.6,
          p10: 44.7,
          p50: 46.1,
          p90: 47.4,
          p97: 48.3,
          lms: {
            L: 2.66,
            M: 46.1,
            S: 0.026
          }
        }
      },
      {
        age: 15,
        weight: {
          p3: 8300,
          p10: 9100,
          p50: 10300,
          p90: 11500,
          p97: 12600,
          lms: {
            L: 0.488,
            M: 10300,
            S: 0.1045
          }
        },
        length: {
          p3: 74.4,
          p10: 76.6,
          p50: 79.1,
          p90: 81.7,
          p97: 83.9,
          lms: {
            L: 0.644,
            M: 79.1,
            S: 0.03
          }
        },
        headCircumference: {
          p3: 44.4,
          p10: 45.5,
          p50: 46.9,
          p90: 48.2,
          p97: 49.2,
          lms: {
            L: 2.66,
            M: 46.9,
            S: 0.0255
          }
        }
      },
      {
        age: 18,
        weight: {
          p3: 8800,
          p10: 9700,
          p50: 10900,
          p90: 12200,
          p97: 13400,
          lms: {
            L: 0.242,
            M: 10900,
            S: 0.1045
          }
        },
        length: {
          p3: 77.2,
          p10: 79.6,
          p50: 82.3,
          p90: 85,
          p97: 87.3,
          lms: {
            L: 1.508,
            M: 82.3,
            S: 0.0305
          }
        },
        headCircumference: {
          p3: 45,
          p10: 46.1,
          p50: 47.6,
          p90: 48.9,
          p97: 49.9,
          lms: {
            L: 2.66,
            M: 47.6,
            S: 0.026
          }
        }
      },
      {
        age: 21,
        weight: {
          p3: 9200,
          p10: 10200,
          p50: 11500,
          p90: 12900,
          p97: 14100,
          lms: {
            L: 0.498,
            M: 11500,
            S: 0.1065
          }
        },
        length: {
          p3: 79.9,
          p10: 82.3,
          p50: 85.1,
          p90: 88,
          p97: 90.4,
          lms: {
            L: 0.75,
            M: 85.1,
            S: 0.0305
          }
        },
        headCircumference: {
          p3: 45.5,
          p10: 46.6,
          p50: 48.1,
          p90: 49.5,
          p97: 50.5,
          lms: {
            L: 2.66,
            M: 48.1,
            S: 0.0265
          }
        }
      },
      {
        age: 24,
        weight: {
          p3: 9700,
          p10: 10800,
          p50: 12200,
          p90: 13600,
          p97: 14900,
          lms: {
            L: 0.83,
            M: 12200,
            S: 0.1055
          }
        },
        length: {
          p3: 82.5,
          p10: 85,
          p50: 87.8,
          p90: 90.9,
          p97: 93.3,
          lms: {
            L: 0.148,
            M: 87.8,
            S: 0.0305
          }
        },
        headCircumference: {
          p3: 46,
          p10: 47.1,
          p50: 48.6,
          p90: 50,
          p97: 51,
          lms: {
            L: 2.66,
            M: 48.6,
            S: 0.026
          }
        }
      }
    ]
  },
  who_female: {
    standard: "WHO Child Growth Standards (2006)",
    sex: "female",
    xAxis: "Corrected Age (months)",
    minAge: 0,
    maxAge: 24,
    points: [
      {
        age: 0,
        weight: {
          p3: 2400,
          p10: 2800,
          p50: 3200,
          p90: 3700,
          p97: 4200,
          lms: {
            L: 0.196,
            M: 3200,
            S: 0.136
          }
        },
        length: {
          p3: 45.6,
          p10: 47.2,
          p50: 49.1,
          p90: 51,
          p97: 52.7,
          lms: {
            L: 0.778,
            M: 49.1,
            S: 0.036
          }
        },
        headCircumference: {
          p3: 31.5,
          p10: 32.7,
          p50: 33.9,
          p90: 35.2,
          p97: 36.2,
          lms: {
            L: 1.51,
            M: 33.9,
            S: 0.0345
          }
        }
      },
      {
        age: 1,
        weight: {
          p3: 3200,
          p10: 3600,
          p50: 4200,
          p90: 4800,
          p97: 5500,
          lms: {
            L: 0.204,
            M: 4200,
            S: 0.1335
          }
        },
        length: {
          p3: 50,
          p10: 51.7,
          p50: 53.7,
          p90: 55.6,
          p97: 57.4,
          lms: {
            L: 1.36,
            M: 53.7,
            S: 0.034
          }
        },
        headCircumference: {
          p3: 34.3,
          p10: 35.3,
          p50: 36.5,
          p90: 37.8,
          p97: 38.8,
          lms: {
            L: 0.106,
            M: 36.5,
            S: 0.031
          }
        }
      },
      {
        age: 2,
        weight: {
          p3: 4e3,
          p10: 4500,
          p50: 5100,
          p90: 5800,
          p97: 6600,
          lms: {
            L: -0.244,
            M: 5100,
            S: 0.122
          }
        },
        length: {
          p3: 53.2,
          p10: 55,
          p50: 57.1,
          p90: 59.1,
          p97: 60.9,
          lms: {
            L: 1.56,
            M: 57.1,
            S: 0.0335
          }
        },
        headCircumference: {
          p3: 36,
          p10: 37,
          p50: 38.3,
          p90: 39.5,
          p97: 40.5,
          lms: {
            L: 2.21,
            M: 38.3,
            S: 0.0295
          }
        }
      },
      {
        age: 3,
        weight: {
          p3: 4600,
          p10: 5200,
          p50: 5800,
          p90: 6600,
          p97: 7400,
          lms: {
            L: -0.358,
            M: 5800,
            S: 0.116
          }
        },
        length: {
          p3: 55.8,
          p10: 57.7,
          p50: 59.8,
          p90: 61.9,
          p97: 63.8,
          lms: {
            L: 1.06,
            M: 59.8,
            S: 0.033
          }
        },
        headCircumference: {
          p3: 37.2,
          p10: 38.3,
          p50: 39.5,
          p90: 40.8,
          p97: 41.8,
          lms: {
            L: 0.832,
            M: 39.5,
            S: 0.029
          }
        }
      },
      {
        age: 4,
        weight: {
          p3: 5100,
          p10: 5700,
          p50: 6400,
          p90: 7300,
          p97: 8100,
          lms: {
            L: -0.278,
            M: 6400,
            S: 0.1145
          }
        },
        length: {
          p3: 58,
          p10: 59.9,
          p50: 62.1,
          p90: 64.3,
          p97: 66.2,
          lms: {
            L: 1.06,
            M: 62.1,
            S: 0.0325
          }
        },
        headCircumference: {
          p3: 38.2,
          p10: 39.3,
          p50: 40.6,
          p90: 41.9,
          p97: 42.9,
          lms: {
            L: 1.76,
            M: 40.6,
            S: 0.029
          }
        }
      },
      {
        age: 6,
        weight: {
          p3: 5800,
          p10: 6500,
          p50: 7300,
          p90: 8200,
          p97: 9e3,
          lms: {
            L: 0.474,
            M: 7300,
            S: 0.1085
          }
        },
        length: {
          p3: 61.5,
          p10: 63.5,
          p50: 65.7,
          p90: 68,
          p97: 70,
          lms: {
            L: 0.79,
            M: 65.7,
            S: 0.032
          }
        },
        headCircumference: {
          p3: 39.7,
          p10: 40.8,
          p50: 42.2,
          p90: 43.5,
          p97: 44.5,
          lms: {
            L: 2.46,
            M: 42.2,
            S: 0.0285
          }
        }
      },
      {
        age: 8,
        weight: {
          p3: 6400,
          p10: 7100,
          p50: 7900,
          p90: 9e3,
          p97: 9900,
          lms: {
            L: -0.526,
            M: 7900,
            S: 0.1085
          }
        },
        length: {
          p3: 64.3,
          p10: 66.4,
          p50: 68.7,
          p90: 71.1,
          p97: 73.2,
          lms: {
            L: 0.84,
            M: 68.7,
            S: 0.032
          }
        },
        headCircumference: {
          p3: 40.8,
          p10: 41.9,
          p50: 43.3,
          p90: 44.7,
          p97: 45.7,
          lms: {
            L: 1.61,
            M: 43.3,
            S: 0.0285
          }
        }
      },
      {
        age: 10,
        weight: {
          p3: 6800,
          p10: 7600,
          p50: 8500,
          p90: 9600,
          p97: 10600,
          lms: {
            L: -0.014,
            M: 8500,
            S: 0.1095
          }
        },
        length: {
          p3: 66.8,
          p10: 69,
          p50: 71.5,
          p90: 73.9,
          p97: 76.1,
          lms: {
            L: 2.34,
            M: 71.5,
            S: 0.032
          }
        },
        headCircumference: {
          p3: 41.7,
          p10: 42.8,
          p50: 44.2,
          p90: 45.6,
          p97: 46.6,
          lms: {
            L: 1.51,
            M: 44.2,
            S: 0.028
          }
        }
      },
      {
        age: 12,
        weight: {
          p3: 7100,
          p10: 7900,
          p50: 8900,
          p90: 10100,
          p97: 11100,
          lms: {
            L: 0.058,
            M: 8900,
            S: 0.1115
          }
        },
        length: {
          p3: 69.2,
          p10: 71.4,
          p50: 74,
          p90: 76.6,
          p97: 78.9,
          lms: {
            L: 1.24,
            M: 74,
            S: 0.0325
          }
        },
        headCircumference: {
          p3: 42.4,
          p10: 43.5,
          p50: 44.9,
          p90: 46.4,
          p97: 47.4,
          lms: {
            L: 0.76,
            M: 44.9,
            S: 0.028
          }
        }
      },
      {
        age: 15,
        weight: {
          p3: 7600,
          p10: 8500,
          p50: 9600,
          p90: 10900,
          p97: 12e3,
          lms: {
            L: 0.184,
            M: 9600,
            S: 0.1135
          }
        },
        length: {
          p3: 72.4,
          p10: 74.8,
          p50: 77.5,
          p90: 80.2,
          p97: 82.7,
          lms: {
            L: 0.81,
            M: 77.5,
            S: 0.033
          }
        },
        headCircumference: {
          p3: 43.2,
          p10: 44.3,
          p50: 45.8,
          p90: 47.2,
          p97: 48.3,
          lms: {
            L: 1.76,
            M: 45.8,
            S: 0.028
          }
        }
      },
      {
        age: 18,
        weight: {
          p3: 8100,
          p10: 9100,
          p50: 10200,
          p90: 11600,
          p97: 12800,
          lms: {
            L: -0.034,
            M: 10200,
            S: 0.1135
          }
        },
        length: {
          p3: 75.3,
          p10: 77.8,
          p50: 80.7,
          p90: 83.6,
          p97: 86.2,
          lms: {
            L: 0.91,
            M: 80.7,
            S: 0.0335
          }
        },
        headCircumference: {
          p3: 43.8,
          p10: 45,
          p50: 46.4,
          p90: 47.9,
          p97: 49,
          lms: {
            L: 0.81,
            M: 46.4,
            S: 0.028
          }
        }
      },
      {
        age: 21,
        weight: {
          p3: 8600,
          p10: 9600,
          p50: 10900,
          p90: 12300,
          p97: 13600,
          lms: {
            L: 0.392,
            M: 10900,
            S: 0.1135
          }
        },
        length: {
          p3: 78,
          p10: 80.6,
          p50: 83.7,
          p90: 86.7,
          p97: 89.4,
          lms: {
            L: 1.26,
            M: 83.7,
            S: 0.0335
          }
        },
        headCircumference: {
          p3: 44.4,
          p10: 45.5,
          p50: 47,
          p90: 48.5,
          p97: 49.6,
          lms: {
            L: 1.01,
            M: 47,
            S: 0.028
          }
        }
      },
      {
        age: 24,
        weight: {
          p3: 9e3,
          p10: 10200,
          p50: 11500,
          p90: 13e3,
          p97: 14400,
          lms: {
            L: 0.41,
            M: 11500,
            S: 0.115
          }
        },
        length: {
          p3: 80.7,
          p10: 83.4,
          p50: 86.4,
          p90: 89.6,
          p97: 92.4,
          lms: {
            L: 0.174,
            M: 86.4,
            S: 0.0335
          }
        },
        headCircumference: {
          p3: 44.9,
          p10: 46,
          p50: 47.5,
          p90: 49,
          p97: 50.1,
          lms: {
            L: 0.96,
            M: 47.5,
            S: 0.0275
          }
        }
      }
    ]
  }
};

// lib/growth-engine.ts
function normalCdf(z) {
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
  const t = 1 / (1 + p * x);
  const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}
function calculateZScoreFromLms(value, lms) {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0 || S <= 0) return 0;
  if (Math.abs(L) < 1e-4) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}
function calculateWhoAdjustedWeightZScore(weightGrams, lms) {
  const rawZ = calculateZScoreFromLms(weightGrams, lms);
  const { L, M, S } = lms;
  if (rawZ > 3) {
    const sd3pos = Math.abs(L) < 1e-4 ? M * Math.exp(S * 3) : M * Math.pow(1 + L * S * 3, 1 / L);
    const sd2pos = Math.abs(L) < 1e-4 ? M * Math.exp(S * 2) : M * Math.pow(1 + L * S * 2, 1 / L);
    const sd23pos = sd3pos - sd2pos;
    if (sd23pos > 0) {
      return 3 + (weightGrams - sd3pos) / sd23pos;
    }
  } else if (rawZ < -3) {
    const sd3neg = Math.abs(L) < 1e-4 ? M * Math.exp(S * -3) : M * Math.pow(1 + L * S * -3, 1 / L);
    const sd2neg = Math.abs(L) < 1e-4 ? M * Math.exp(S * -2) : M * Math.pow(1 + L * S * -2, 1 / L);
    const sd23neg = sd2neg - sd3neg;
    if (sd23neg > 0) {
      return -3 + (weightGrams - sd3neg) / sd23neg;
    }
  }
  return rawZ;
}
function calculateAges(gaWeeks, gaDays, dateOfBirth, dateOfMeasurement) {
  const validation = validateGrowthInputs({
    gaWeeks,
    gaDays,
    dob: dateOfBirth,
    dom: dateOfMeasurement
  });
  const emptyAge = {
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
    ccaFormatted: "Validation Blocked"
  };
  if (validation.isBlocked) {
    return emptyAge;
  }
  const parsedDob = parseStrictCalendarDate(dateOfBirth);
  const parsedDom = parseStrictCalendarDate(dateOfMeasurement);
  if (!parsedDob.isValid || !parsedDom.isValid || !parsedDob.utcTimestamp || !parsedDom.utcTimestamp) {
    return emptyAge;
  }
  const msPerDay = 24 * 60 * 60 * 1e3;
  const caTotalDays = Math.floor((parsedDom.utcTimestamp - parsedDob.utcTimestamp) / msPerDay);
  const caWeeks = Math.floor(caTotalDays / 7);
  const caDays = caTotalDays % 7;
  const caWeeksDecimal = Math.round(caTotalDays / 7 * 100) / 100;
  const caMonthsDecimal = Math.round(caTotalDays / 30.4375 * 100) / 100;
  const dayOfLife = caTotalDays + 1;
  const caFormatted = `${caWeeks}w ${caDays}d (DOL ${dayOfLife})`;
  const gaTotalDays = Number(gaWeeks) * 7 + Number(gaDays);
  const pmaTotalDays = gaTotalDays + caTotalDays;
  const pmaWeeks = Math.floor(pmaTotalDays / 7);
  const pmaDays = pmaTotalDays % 7;
  const pmaWeeksDecimal = Math.round(pmaTotalDays / 7 * 100) / 100;
  const pmaFormatted = `${pmaWeeks}w ${pmaDays}d PMA`;
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
    ccaWeeksDecimal = Math.round(ccaTotalDays / 7 * 100) / 100;
    ccaMonthsDecimal = 0;
    ccaFormatted = `Preterm (-${weeksUntilTerm}w ${remDays}d to 40w term)`;
  } else {
    ccaWeeks = Math.floor(ccaTotalDays / 7);
    ccaDays = ccaTotalDays % 7;
    ccaWeeksDecimal = Math.round(ccaTotalDays / 7 * 100) / 100;
    ccaMonthsDecimal = Math.round(ccaTotalDays / 30.4375 * 100) / 100;
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
    ccaFormatted
  };
}
function getGrowthDataset(sex, ages) {
  if (ages.isBlocked) {
    const raw = growth_curves_lms_default["fenton_male"];
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
      data: raw.points
    };
  }
  const isFenton = ages.pmaWeeksDecimal <= CLINICAL_BOUNDS.FENTON_MAX_PMA_WEEKS;
  if (isFenton) {
    const datasetKey = sex === "male" ? "fenton_male" : "fenton_female";
    const raw = growth_curves_lms_default[datasetKey];
    const isUnderMin = ages.pmaWeeksDecimal < CLINICAL_BOUNDS.FENTON_MIN_PMA_WEEKS;
    const isAgeOutOfRange = isUnderMin;
    const ageOutOfRangeWarning = isUnderMin ? `Post-menstrual age (${ages.pmaWeeksDecimal} weeks PMA) is below the Fenton 2013 chart lower limit of 22 weeks PMA.` : void 0;
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
      data: raw.points
    };
  } else {
    const datasetKey = sex === "male" ? "who_male" : "who_female";
    const raw = growth_curves_lms_default[datasetKey];
    const ccaMonths = ages.ccaMonthsDecimal;
    const isOverMax = ccaMonths > CLINICAL_BOUNDS.WHO_MAX_CCA_MONTHS;
    const isAgeOutOfRange = isOverMax;
    const ageOutOfRangeWarning = isOverMax ? `Corrected chronological age (${ccaMonths.toFixed(1)} months) exceeds the supported WHO 0\u201324 month infant growth standard.` : void 0;
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
      data: raw.points
    };
  }
}
function interpolateLms(targetAge, metric, data) {
  const sorted = [...data].sort((a, b) => a.age - b.age);
  if (targetAge <= sorted[0].age) {
    const pt = sorted[0][metric];
    return { lms: pt.lms, p50: pt.p50 };
  }
  if (targetAge >= sorted[sorted.length - 1].age) {
    const pt = sorted[sorted.length - 1][metric];
    return { lms: pt.lms, p50: pt.p50 };
  }
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
      L: Math.round(L * 1e4) / 1e4,
      M: Math.round(M * 100) / 100,
      S: Math.round(S * 1e5) / 1e5
    },
    p50: Math.round(p50 * 10) / 10
  };
}
function evaluatePercentile(value, metric, dataset) {
  const clinicalCaveat = "Screening assessment only; not a diagnosis or automatic treatment recommendation. Evaluate alongside serial trajectory, clinical illness, and hydration.";
  const emptyEval = {
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
    methodology: "Linear interpolation between tabulated LMS parameters"
  };
  if (value === void 0 || value === null || isNaN(value) || value <= 0) {
    return emptyEval;
  }
  if (dataset.isAgeOutOfRange) {
    return {
      ...emptyEval,
      observedValue: value,
      shortBadge: "Out of Range",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      clinicalNote: dataset.ageOutOfRangeWarning || "Patient age is outside supported growth reference curves.",
      clinicalCaveat
    };
  }
  const { lms, p50 } = interpolateLms(dataset.patientPlotAge, metric, dataset.data);
  let rawZ = 0;
  if (dataset.chartType === "who" && metric === "weight") {
    rawZ = calculateWhoAdjustedWeightZScore(value, lms);
  } else {
    rawZ = calculateZScoreFromLms(value, lms);
  }
  const roundedZ = Math.round(rawZ * 100) / 100;
  const zScoreFormatted = `${roundedZ > 0 ? "+" : ""}${roundedZ.toFixed(2)} SD`;
  const pNorm = normalCdf(rawZ) * 100;
  const roundedPercentile = Math.round(pNorm * 10) / 10;
  const percentileFormatted = `${roundedPercentile.toFixed(1)}th Percentile`;
  let bracket = "";
  let shortBadge = "N/A";
  let badgeClass = "";
  let clinicalNote = "";
  if (roundedZ < -1.88) {
    bracket = "< 3rd Percentile (Significant Growth Restriction / Small for Gestational Age)";
    shortBadge = "<3rd";
    badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
    clinicalNote = "This value is a screening flag for clinician review. Interpret with serial growth, fluid status, measurement quality, illness severity, and nutrient intake.";
  } else if (roundedZ < -1.28) {
    bracket = "3rd to 10th Percentile (Mild Growth Restriction / Borderline Low Zone)";
    shortBadge = "3rd-10th";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    clinicalNote = "Value lies in borderline low reference channel (-1.88 to -1.28 SD). Screening alert for clinician review; interpret with nutritional intake and serial growth.";
  } else if (roundedZ <= 0) {
    bracket = "10th to 50th Percentile (Normal Appropriate Range)";
    shortBadge = "10th-50th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote = "Trajectory is within the selected reference channel; interpret alongside clinical context.";
  } else if (roundedZ <= 1.28) {
    bracket = "50th to 90th Percentile (Normal Appropriate Range)";
    shortBadge = "50th-90th";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    clinicalNote = "Trajectory is within the selected reference channel; interpret alongside clinical context.";
  } else if (roundedZ <= 1.88) {
    bracket = "90th to 97th Percentile (Upper Physiological Range)";
    shortBadge = "90th-97th";
    badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
    clinicalNote = "Upper reference channel (+1.28 to +1.88 SD). Monitor somatic accretion and verify fluid balance.";
  } else {
    bracket = "> 97th Percentile (Large for Gestational Age / Macrocephaly)";
    shortBadge = ">97th";
    badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    clinicalNote = "Value exceeds 97th percentile reference line (> +1.88 SD). Screening alert for clinician review; evaluate for fluid retention or maternal metabolic factors.";
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
    methodology
  };
}
function calculateWeightVelocity(w1Grams, w2Grams, deltaDays) {
  if (deltaDays <= 0 || w1Grams <= 0 || w2Grams <= 0) return 0;
  const velocity = 1e3 * Math.log(w2Grams / w1Grams) / deltaDays;
  return Math.round(velocity * 10) / 10;
}
function evaluateLongitudinalRecords(records, gaWeeks, gaDays, dob, sex) {
  if (!records || records.length === 0) return [];
  const sorted = [...records].sort((a, b) => {
    const pA = parseStrictCalendarDate(a.date);
    const pB = parseStrictCalendarDate(b.date);
    return (pA.utcTimestamp || 0) - (pB.utcTimestamp || 0);
  });
  const evaluated = [];
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const age = calculateAges(gaWeeks, gaDays, dob, item.date);
    const dataset = getGrowthDataset(sex, age);
    const wEval = evaluatePercentile(item.weightGrams, "weight", dataset);
    const lEval = item.lengthCm ? evaluatePercentile(item.lengthCm, "length", dataset) : void 0;
    const hcEval = item.headCircumferenceCm ? evaluatePercentile(item.headCircumferenceCm, "headCircumference", dataset) : void 0;
    let deltaWeightZScore = void 0;
    let weightVelocity = void 0;
    let trendAlert = void 0;
    let isDuplicateDate = false;
    if (i > 0) {
      const prev = evaluated[i - 1];
      const pPrev = parseStrictCalendarDate(sorted[i - 1].date);
      const pCurr = parseStrictCalendarDate(item.date);
      const msPerDay = 24 * 60 * 60 * 1e3;
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
          trendAlert = `Screening alert for clinician review\u2014not a diagnosis. Patient demonstrated negative weight velocity (${weightVelocity.toFixed(1)} g/kg/d).`;
        } else if (deltaWeightZScore < -0.67) {
          trendAlert = `Screening alert for clinician review\u2014not a diagnosis. Weight Z-score declined by ${Math.abs(deltaWeightZScore).toFixed(2)} SD (>0.67 SD indicates dropping a full percentile channel).`;
        } else if (deltaWeightZScore > 0.67) {
          trendAlert = `Screening alert for clinician review\u2014not a diagnosis. Rapid upward channel crossing (+${deltaWeightZScore.toFixed(2)} SD); monitor body composition.`;
        } else {
          trendAlert = "Trajectory tracking within reference growth channel (\u0394Z within \xB10.67 SD).";
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
      isDuplicateDate
    });
  }
  return evaluated;
}

// tests/verify-clinical.ts
console.log("================================================================================");
console.log("RUNNING LIPTIS NEOPED INSTITUTIONAL CLINICAL ACCEPTANCE TEST SUITE (v2.1.0)");
console.log("================================================================================");
var testsPassed = 0;
var testsFailed = 0;
function assert(condition, testName, failureDetail) {
  if (condition) {
    console.log(`  \u2713 PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  \u2717 FAIL: ${testName}`);
    if (failureDetail) console.error(`    Detail: ${failureDetail}`);
    testsFailed++;
  }
}
console.log("\n--- Domain 1: Nutrition Bounds & Manufacturer Product Verification ---");
var res400 = calculateLbwNutrition(400, 150);
assert(!res400.isBlocked, "Weight 400g lower boundary is accepted");
assert(res400.proteinBracket?.classification === "ELBW", "400g classified as ELBW");
var res399 = calculateLbwNutrition(399, 150);
assert(res399.isBlocked, "Weight 399g is strictly blocked (under 400g)");
assert(res399.overallStatus === "Invalid input", "Blocked 399g sets overallStatus to 'Invalid input'");
var res10k = calculateLbwNutrition(1e4, 150);
assert(!res10k.isBlocked, "Weight 10,000g upper boundary is accepted");
assert(res10k.isGraduated === true, "10,000g infant classified as Graduated");
var res10001 = calculateLbwNutrition(10001, 150);
assert(res10001.isBlocked, "Weight 10,001g is strictly blocked (exceeds 10,000g)");
assert(
  PEDIAMIL_LBW_PRODUCT.composition.energyKcalPer100Ml === 79.7,
  "Pediamil LBW verified energy is 79.7 kcal/100 mL"
);
assert(
  PEDIAMIL_LBW_PRODUCT.composition.proteinGramsPer100Ml === 2.42,
  "Pediamil LBW verified protein is 2.42 g/100 mL"
);
assert(
  PEDIAMIL_LBW_PRODUCT.reconstitution.powderMassGramsPer100Ml === 15,
  "Pediamil LBW verified reconstitution is 15.0 g powder/100 mL"
);
assert(
  PEDIAMIL_1_PRODUCT.composition.energyKcalPer100Ml === 68.5,
  "Pediamil 1 verified energy is 68.5 kcal/100 mL"
);
assert(
  PEDIAMIL_1_PRODUCT.composition.proteinGramsPer100Ml === 1.49,
  "Pediamil 1 verified protein is 1.49 g/100 mL"
);
assert(
  PEDIAMIL_1_PRODUCT.reconstitution.powderMassGramsPer100Ml === 13.7,
  "Pediamil 1 verified reconstitution is 13.7 g powder/100 mL"
);
console.log("\n--- Domain 2: Fluid Allowance Ranges & Alerts (135 to 200 mL/kg/day) ---");
var res135 = calculateLbwNutrition(1350, 135);
assert(!res135.isBlocked, "Fluid 135 mL/kg/d is accepted as lower range boundary");
assert(
  res135.validation.warnings.length === 0,
  "Fluid 135 mL/kg/d meets the boundary threshold without warning"
);
var res134 = calculateLbwNutrition(1350, 134);
assert(res134.isBlocked, "Fluid 134 mL/kg/d is strictly blocked (<135)");
var res150 = calculateLbwNutrition(1350, 150);
assert(!res150.isBlocked && res150.validation.warnings.length === 0, "Fluid 150 mL/kg/d is standard typical without warnings");
var res180 = calculateLbwNutrition(1350, 180);
assert(!res180.isBlocked && res180.validation.warnings.length === 0, "Fluid 180 mL/kg/d is typical target ceiling without warnings");
var res200 = calculateLbwNutrition(1350, 200);
assert(!res200.isBlocked, "Fluid 200 mL/kg/d is accepted as upper range boundary");
assert(
  res200.validation.warnings.length === 0,
  "Fluid 200 mL/kg/d meets upper threshold without warning"
);
var res201 = calculateLbwNutrition(1350, 201);
assert(res201.isBlocked, "Fluid 201 mL/kg/d is strictly blocked (>200)");
var res240 = calculateLbwNutrition(1350, 240);
assert(res240.isBlocked, "Fluid 240 mL/kg/d is strictly blocked (>200)");
var res241 = calculateLbwNutrition(1350, 241);
assert(res241.isBlocked, "Fluid 241 mL/kg/d is strictly blocked (>200)");
var res79 = calculateLbwNutrition(1350, 79);
assert(res79.isBlocked, "Fluid 79 mL/kg/d is strictly blocked (<135)");
console.log("\n--- Domain 3: ESPGHAN 2022 Energy 4-Tier Evaluation ---");
var evalE114 = evaluateEnergyCompliance(114.9);
assert(evalE114.status === "suboptimal", "Energy 114.9 kcal/kg/d is suboptimal (<115)");
assert(evalE114.badgeLabel.includes("Below Reference Range"), "114.9 badge indicates Below Reference Range");
var evalE115 = evaluateEnergyCompliance(115);
assert(evalE115.status === "on_target", "Energy 115.0 kcal/kg/d is on_target (Typical min)");
var evalE140 = evaluateEnergyCompliance(140);
assert(evalE140.status === "on_target", "Energy 140.0 kcal/kg/d is on_target (Typical max)");
var evalE140_1 = evaluateEnergyCompliance(140.1);
assert(evalE140_1.status === "conditional", "Energy 140.1 kcal/kg/d is conditional catch-up range");
assert(evalE140_1.badgeLabel.includes("Conditional High Range"), "140.1 badge indicates Conditional High Range");
var evalE160 = evaluateEnergyCompliance(160);
assert(evalE160.status === "conditional", "Energy 160.0 kcal/kg/d is within conditional ceiling");
var evalE160_1 = evaluateEnergyCompliance(160.1);
assert(evalE160_1.status === "exceeding", "Energy 160.1 kcal/kg/d exceeds upper ceiling (>160)");
assert(evalE160_1.badgeLabel.includes("Above Reference Range"), "160.1 badge indicates Above Reference Range");
console.log("\n--- Domain 4: Protein-to-Energy (P:E) Ratio Acceptance Tests ---");
var pe279 = evaluatePeRatioCompliance(2.79);
assert(pe279.status === "suboptimal", "P:E 2.79 is suboptimal (<2.8)");
assert(
  pe279.badgeLabel.includes("Below Reference Range"),
  `P:E 2.79 badge indicates Below Reference Range (got: ${pe279.badgeLabel})`
);
assert(
  pe279.interpretation === "Protein-to-energy ratio is below the displayed ESPGHAN reference range. Review product choice, fortification, and total nutrient intake.",
  "P:E 2.79 returns exact required clinician review guidance"
);
var pe280 = evaluatePeRatioCompliance(2.8);
assert(pe280.status === "on_target", "P:E 2.80 is on_target (exact lower boundary)");
assert(
  pe280.badgeLabel.includes("Within Reference Range"),
  `P:E 2.80 badge indicates Within Reference Range (got: ${pe280.badgeLabel})`
);
assert(
  pe280.interpretation === "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
  "P:E 2.80 returns exact required within-target guidance"
);
var pe360 = evaluatePeRatioCompliance(3.6);
assert(pe360.status === "on_target", "P:E 3.60 is on_target (exact upper boundary)");
assert(
  pe360.badgeLabel.includes("Within Reference Range"),
  `P:E 3.60 badge indicates Within Reference Range (got: ${pe360.badgeLabel})`
);
assert(
  pe360.interpretation === "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
  "P:E 3.60 returns exact required within-target guidance"
);
var pe361 = evaluatePeRatioCompliance(3.61);
assert(pe361.status === "exceeding", "P:E 3.61 is exceeding (>3.6)");
assert(
  pe361.badgeLabel.includes("Above Reference Range"),
  `P:E 3.61 badge indicates Above Reference Range (got: ${pe361.badgeLabel})`
);
assert(
  pe361.interpretation === "Protein-to-energy ratio is above the displayed ESPGHAN reference range. Review protein and energy sources.",
  "P:E 3.61 returns exact required above-range guidance"
);
var standardVlbw = calculateLbwNutrition(1350, 150);
assert(
  standardVlbw.overallStatus === "Within reference range",
  "Standard 1,350g VLBW with all metrics on-target achieves 'Within reference range'"
);
console.log("\n--- Domain 5: Strict Calendar Date Validation ---");
var validSameDay = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-10"
});
assert(validSameDay.isValid, "Valid same-day DOB and DOM (2026-05-10) is valid");
var validNextDay = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-11"
});
assert(validNextDay.isValid, "DOM 1 day after DOB is valid");
var invertedDates = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-09"
});
assert(invertedDates.isBlocked, "DOM preceding DOB is strictly blocked");
assert(
  invertedDates.errors.some((e) => e.message.includes("DOM < DOB")),
  "Error message specifically cites DOM < DOB"
);
var invalidMonth = parseStrictCalendarDate("2026-13-10");
assert(!invalidMonth.isValid, "Month 13 is rejected as invalid");
var feb30 = parseStrictCalendarDate("2026-02-30");
assert(!feb30.isValid, "February 30th is rejected as impossible calendar date");
var apr31 = parseStrictCalendarDate("2026-04-31");
assert(!apr31.isValid, "April 31st is rejected as impossible calendar date (April has 30 days)");
var leap2024 = parseStrictCalendarDate("2024-02-29");
assert(leap2024.isValid, "February 29th on leap year 2024 is valid");
var nonLeap2025 = parseStrictCalendarDate("2025-02-29");
assert(!nonLeap2025.isValid, "February 29th on non-leap year 2025 is rejected");
var malformedDate = parseStrictCalendarDate("2026/05/10");
assert(!malformedDate.isValid, "Date with slashes '2026/05/10' is rejected (must be YYYY-MM-DD)");
var non4Digit = parseStrictCalendarDate("26-05-10");
assert(!non4Digit.isValid, "Two-digit year '26-05-10' is rejected");
var emptyDate = parseStrictCalendarDate("");
assert(!emptyDate.isValid, "Empty date string is rejected");
var futureDate = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2027-01-01"
});
assert(futureDate.isBlocked, "Future measurement date (2027-01-01) is strictly blocked");
console.log("\n--- Domain 6: Growth Dataset Routing & Age Limits ---");
var under22wAges = calculateAges(22, 0, "2026-05-10", "2026-05-09");
assert(under22wAges.isBlocked, "PMA under 22w with inverted date is blocked");
var age22w = calculateAges(22, 0, "2026-05-10", "2026-05-10");
assert(!age22w.isBlocked && age22w.pmaWeeksDecimal === 22, "PMA exactly 22w0d is valid");
var ds22w = getGrowthDataset("male", age22w);
assert(ds22w.chartType === "fenton", "22w0d routes to Fenton chart");
assert(!ds22w.isAgeOutOfRange, "22w0d is within Fenton supported range");
var age50w = calculateAges(28, 0, "2026-01-01", "2026-06-04");
assert(age50w.pmaWeeksDecimal === 50, `PMA is 50.0 weeks (got: ${age50w.pmaWeeksDecimal})`);
var ds50w = getGrowthDataset("male", age50w);
assert(ds50w.chartType === "fenton", "PMA 50w0d routes to Fenton chart");
assert(!ds50w.isAgeOutOfRange, "PMA 50w0d is within Fenton supported range");
var age52w = calculateAges(28, 0, "2026-01-01", "2026-06-18");
assert(age52w.pmaWeeksDecimal === 52, `PMA is 52.0 weeks (got: ${age52w.pmaWeeksDecimal})`);
var ds52w = getGrowthDataset("male", age52w);
assert(ds52w.chartType === "who", "PMA > 50w transitions to WHO 2006 chart");
assert(ds52w.xAxisUnit === "months CCA", "WHO chart uses months CCA on X-axis");
var age24m = calculateAges(28, 0, "2024-01-01", "2026-01-01");
var ds24m = getGrowthDataset("male", age24m);
assert(ds24m.chartType === "who", "Older infant routes to WHO");
console.log("\n--- Domain 7: Anthropometrics & Optional Fields ---");
var evalMale = evaluatePercentile(1210, "weight", getGrowthDataset("male", age28w()));
assert(evalMale.zScore === 0, `28w Male 1,210g has Z-score 0.00 (got: ${evalMale.zScore})`);
assert(evalMale.percentile === 50, `28w Male 1,210g is 50.0th percentile (got: ${evalMale.percentile})`);
var evalFemale = evaluatePercentile(1140, "weight", getGrowthDataset("female", age28w()));
assert(evalFemale.zScore === 0, `28w Female 1,140g has Z-score 0.00 (got: ${evalFemale.zScore})`);
assert(evalFemale.percentile === 50, `28w Female 1,140g is 50.0th percentile (got: ${evalFemale.percentile})`);
var invalidLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: "abc"
});
assert(invalidLen.isBlocked, "Non-numeric optional length 'abc' is strictly blocked");
var outOfRangeLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: 15
});
assert(outOfRangeLen.isBlocked, "Length 15.0 cm (under 20 cm) is strictly blocked");
var validLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: 39.5
});
assert(validLen.isValid, "Length 39.5 cm is accepted");
console.log("\n--- Domain 8: Longitudinal Tracking & Growth Velocity ---");
var vel = calculateWeightVelocity(1e3, 1100, 7);
assert(vel === 13.6, `Patel exponential velocity for 1000g->1100g over 7d is 13.6 g/kg/d (got: ${vel})`);
var vel0 = calculateWeightVelocity(1e3, 1050, 0);
assert(vel0 === 0, "Duplicate date (deltaDays = 0) returns 0 velocity without dividing by zero");
var serialLoss = [
  { date: "2026-05-01", weightGrams: 1200 },
  { date: "2026-05-08", weightGrams: 1150 }
  // weight loss
];
var evaluatedLoss = evaluateLongitudinalRecords(serialLoss, 28, 0, "2026-05-01", "male");
assert(evaluatedLoss.length === 2, "Evaluated 2 serial records");
assert(
  /negative weight velocity/i.test(evaluatedLoss[1].trendAlert || ""),
  "Weight loss triggers screening alert for clinician review citing negative weight velocity"
);
var serialDrop = [
  { date: "2026-05-01", weightGrams: 1400 },
  // ~90th percentile
  { date: "2026-05-21", weightGrams: 1450 }
  // slowed growth over 20 days -> major Z drop
];
var evaluatedDrop = evaluateLongitudinalRecords(serialDrop, 28, 0, "2026-05-01", "male");
assert(
  evaluatedDrop[1].deltaWeightZScore !== void 0 && evaluatedDrop[1].deltaWeightZScore < -0.67,
  "Detected major Z-score drop (>0.67 SD loss)"
);
assert(
  evaluatedDrop[1].trendAlert?.includes("Screening alert for clinician review") || false,
  "Channel crossing alert uses cautious screening decision-support wording"
);
var outOfOrderRecords = [
  { date: "2026-05-15", weightGrams: 1300 },
  { date: "2026-05-01", weightGrams: 1100 }
];
var sortedEvaluation = evaluateLongitudinalRecords(outOfOrderRecords, 28, 0, "2026-05-01", "male");
assert(
  sortedEvaluation[0].date === "2026-05-01" && sortedEvaluation[1].date === "2026-05-15",
  "Out-of-order records are sorted chronologically by date"
);
var weightOnlyRecords = [
  { date: "2026-05-01", weightGrams: 1100 },
  { date: "2026-05-08", weightGrams: 1200 }
];
var weightOnlyEval = evaluateLongitudinalRecords(weightOnlyRecords, 28, 0, "2026-05-01", "male");
assert(
  weightOnlyEval[1].lengthZScore === void 0 && weightOnlyEval[1].weightVelocityGPerKgPerDay !== void 0,
  "Missing optional measurements (length/HC) calculate weight velocity cleanly"
);
console.log("\n--- Domain 9: Patient Delivered Daily Nutritional Payload ---");
var pretermNutrition = calculateLbwNutrition(1500, 150);
var pretermPayload = pretermNutrition.deliveredNutrientPayload;
assert(pretermPayload !== void 0, "Preterm patient delivered nutrient payload is calculated");
assert(pretermPayload?.totalDailyVolumeMl === 225, `Total daily volume is 225 mL (got: ${pretermPayload?.totalDailyVolumeMl})`);
assert(pretermPayload?.dailyPowderGrams === 33.8, `Daily powder requirement is 33.8g (got: ${pretermPayload?.dailyPowderGrams})`);
assert(pretermPayload?.dailyScoops === 6.8, `Daily scoop requirement is 6.8 scoops (got: ${pretermPayload?.dailyScoops})`);
assert(pretermPayload?.calciumMgPerDay === 292.6, `Delivered Calcium is 292.6 mg/d (got: ${pretermPayload?.calciumMgPerDay})`);
assert(pretermPayload?.calciumMgPerKgPerDay === 195.1, `Delivered Calcium is 195.1 mg/kg/d (got: ${pretermPayload?.calciumMgPerKgPerDay})`);
assert(pretermPayload?.phosphorusMgPerDay === 146.5, `Delivered Phosphorus is 146.5 mg/d (got: ${pretermPayload?.phosphorusMgPerDay})`);
assert(pretermPayload?.ironMgPerKgPerDay === 2.93, `Delivered Iron is 2.93 mg/kg/d within ESPGHAN 2-3 target (got: ${pretermPayload?.ironMgPerKgPerDay})`);
assert(pretermPayload?.sodiumMmolPerKgPerDay === 2.26, `Delivered Sodium is 2.26 mmol/kg/d within ESPGHAN 2-3 target (got: ${pretermPayload?.sodiumMmolPerKgPerDay})`);
assert(pretermPayload?.vitaminD3IuPerDay === 372, `Delivered Vitamin D3 is 372 IU/day (got: ${pretermPayload?.vitaminD3IuPerDay})`);
assert(pretermPayload?.items.length !== void 0 && pretermPayload.items.length >= 15, "Payload contains comprehensive categorized nutrient items");
var termNutrition = calculateLbwNutrition(4e3, 150);
var termPayload = termNutrition.deliveredNutrientPayload;
assert(termPayload !== void 0, "Term patient delivered nutrient payload is calculated");
assert(termPayload?.productName === "Pediamil\xAE 1", `Term product is Pediamil\xAE 1 (got: ${termPayload?.productName})`);
assert(termPayload?.totalDailyVolumeMl === 600, `Term total daily volume is 600 mL (got: ${termPayload?.totalDailyVolumeMl})`);
assert(termPayload?.dailyPowderGrams === 82.2, `Term daily powder requirement is 82.2g (got: ${termPayload?.dailyPowderGrams})`);
assert(termPayload?.proteinGramsPerDay === 8.94, `Term delivered protein is 8.94 g/d (got: ${termPayload?.proteinGramsPerDay})`);
function age28w() {
  return calculateAges(28, 0, "2026-05-01", "2026-05-01");
}
console.log("================================================================================");
console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("================================================================================");
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log(">> ALL 14 CLINICAL ACCEPTANCE TEST DOMAINS VERIFIED SUCCESSFULLY! <<\n");
}

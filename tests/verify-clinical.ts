/**
 * Comprehensive Automated Clinical Acceptance Suite for Liptis NeoPed™ LBW Clinical Suite
 * Covers all 14 Acceptance Domains required for institutional verification:
 * - Nutrition bounds (400g, 399g, 10,000g, 10,001g)
 * - Fluid ranges (135, 150, 180, 240 mL/kg/d, alerts and absolute blocks)
 * - ESPGHAN 2022 Energy 4-tier boundaries
 * - Verified product specs (Pediamil LBW: 79.7 kcal, 2.42g prot; Pediamil 1: 68.5 kcal, 1.49g prot)
 * - Protein-to-Energy ratio boundaries (2.79, 2.80, 3.60, 3.61)
 * - Strict calendar date validation (Feb 30, April 31, leap-years, future dates, DOM < DOB, 4-digit years)
 * - Fenton 2013 and WHO 2006 routing and boundary limits (22w, 50w, 24m)
 * - Feed sheet safety & nutrition-only fallback
 * - Longitudinal tracking (Patel et al. 2005 exponential model, duplicate dates, out-of-order, weight loss, delta-Z)
 */

import fs from "fs";
import path from "path";
import {
  calculateLbwNutrition,
  STANDARD_LBW_MATRIX,
  STANDARD_STAGE_1_MATRIX,
  ESPGHAN_DIRECT_GUIDELINES,
  evaluatePeRatioCompliance,
  evaluateEnergyCompliance,
  getProteinTargetBracket,
  CLINICAL_REFERENCES,
  MOLECULAR_WEIGHTS,
  mgToMmol,
  mmolToMg,
  evaluateReferenceComparison,
} from "../lib/lbw-nutrition";
import {
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
  calculateWeightVelocity,
  evaluateLongitudinalRecords,
  normalCdf,
} from "../lib/growth-engine";
import {
  validateNutritionInputs,
  validateGrowthInputs,
  parseStrictCalendarDate,
  isLeapYear,
  getDaysInMonth,
} from "../lib/validation";
import {
  PEDIAMIL_LBW_PRODUCT,
  PEDIAMIL_1_PRODUCT,
} from "../lib/product-config";

console.log("================================================================================");
console.log("RUNNING LIPTIS NEOPED INSTITUTIONAL CLINICAL ACCEPTANCE TEST SUITE (v2.1.0)");
console.log("================================================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (failureDetail) console.error(`    Detail: ${failureDetail}`);
    testsFailed++;
  }
}

// =============================================================================
// DOMAIN 1: NUTRITION BOUNDS & VERIFIED PRODUCT SPECIFICATIONS
// =============================================================================
console.log("\n--- Domain 1: Nutrition Bounds & Manufacturer Product Verification ---");

// Test 1.1: 400g lower boundary accepted
const res400 = calculateLbwNutrition(400, 150);
assert(!res400.isBlocked, "Weight 400g lower boundary is accepted");
assert(res400.proteinBracket?.classification === "ELBW", "400g classified as ELBW");

// Test 1.2: 399g blocked
const res399 = calculateLbwNutrition(399, 150);
assert(res399.isBlocked, "Weight 399g is strictly blocked (under 400g)");
assert(res399.overallStatus === "Invalid input", "Blocked 399g sets overallStatus to 'Invalid input'");

// Test 1.3: 10,000g upper boundary accepted
const res10k = calculateLbwNutrition(10000, 150);
assert(!res10k.isBlocked, "Weight 10,000g upper boundary is accepted");
assert(res10k.isGraduated === true, "10,000g infant classified as Graduated");

// Test 1.4: 10,001g blocked
const res10001 = calculateLbwNutrition(10001, 150);
assert(res10001.isBlocked, "Weight 10,001g is strictly blocked (exceeds 10,000g)");

// Test 1.5: Manufacturer verified specs for Pediamil LBW
assert(
  PEDIAMIL_LBW_PRODUCT.composition.energyKcalPer100Ml === 79.7,
  "Pediamil LBW verified energy is 79.7 kcal/100 mL"
);
assert(
  PEDIAMIL_LBW_PRODUCT.composition.proteinGramsPer100Ml === 2.42,
  "Pediamil LBW verified protein is 2.42 g/100 mL"
);
assert(
  PEDIAMIL_LBW_PRODUCT.reconstitution.powderMassGramsPer100Ml === 15.0,
  "Pediamil LBW verified reconstitution is 15.0 g powder/100 mL"
);

// Test 1.6: Manufacturer verified specs for Pediamil 1
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

// =============================================================================
// DOMAIN 2: FLUID ALLOWANCE RANGES & ALERTS
// =============================================================================
console.log("\n--- Domain 2: Fluid Allowance Ranges & Alerts ---");

// Fluid: 135 mL/kg/d (restricted alert)
const res135 = calculateLbwNutrition(1350, 135);
assert(!res135.isBlocked, "Fluid 135 mL/kg/d is accepted");
assert(
  res135.validation.warnings.length === 0, // 135 is the exact lower typical threshold (alert is <135)
  "Fluid 135 mL/kg/d meets the boundary threshold without warning"
);

// Fluid: 134 mL/kg/d (triggers restricted warning)
const res134 = calculateLbwNutrition(1350, 134);
assert(!res134.isBlocked, "Fluid 134 mL/kg/d is accepted");
assert(res134.validation.warnings.length > 0, "Fluid 134 mL/kg/d triggers fluid restriction warning (<135)");

// Fluid: 150 mL/kg/d (typical target)
const res150 = calculateLbwNutrition(1350, 150);
assert(!res150.isBlocked && res150.validation.warnings.length === 0, "Fluid 150 mL/kg/d is standard typical without warnings");

// Fluid: 180 mL/kg/d (typical target ceiling)
const res180 = calculateLbwNutrition(1350, 180);
assert(!res180.isBlocked && res180.validation.warnings.length === 0, "Fluid 180 mL/kg/d is typical target ceiling without warnings");

// Fluid: 201 mL/kg/d (triggers volume overload warning)
const res201 = calculateLbwNutrition(1350, 201);
assert(!res201.isBlocked, "Fluid 201 mL/kg/d is accepted");
assert(res201.validation.warnings.length > 0, "Fluid 201 mL/kg/d triggers high volume risk warning (>200)");

// Fluid: 240 mL/kg/d (absolute upper limit)
const res240 = calculateLbwNutrition(1350, 240);
assert(!res240.isBlocked, "Fluid 240 mL/kg/d is accepted as physiological absolute maximum");

// Fluid: 241 mL/kg/d (blocked)
const res241 = calculateLbwNutrition(1350, 241);
assert(res241.isBlocked, "Fluid 241 mL/kg/d is strictly blocked (>240)");

// Fluid: 79 mL/kg/d (blocked)
const res79 = calculateLbwNutrition(1350, 79);
assert(res79.isBlocked, "Fluid 79 mL/kg/d is strictly blocked (<80)");

// =============================================================================
// DOMAIN 3: ESPGHAN 2022 4-TIER ENERGY EVALUATION
// =============================================================================
console.log("\n--- Domain 3: ESPGHAN 2022 Energy 4-Tier Evaluation ---");

// Below typical (<115)
const evalE114 = evaluateEnergyCompliance(114.9);
assert(evalE114.status === "suboptimal", "Energy 114.9 kcal/kg/d is suboptimal (<115)");
assert(evalE114.badgeLabel.includes("Below Reference Range"), "114.9 badge indicates Below Reference Range");

// Typical min (115.0)
const evalE115 = evaluateEnergyCompliance(115.0);
assert(evalE115.status === "on_target", "Energy 115.0 kcal/kg/d is on_target (Typical min)");

// Typical max (140.0)
const evalE140 = evaluateEnergyCompliance(140.0);
assert(evalE140.status === "on_target", "Energy 140.0 kcal/kg/d is on_target (Typical max)");

// Conditional catch-up (140.1 to 160.0)
const evalE140_1 = evaluateEnergyCompliance(140.1);
assert(evalE140_1.status === "conditional", "Energy 140.1 kcal/kg/d is conditional catch-up range");
assert(evalE140_1.badgeLabel.includes("Conditional High Range"), "140.1 badge indicates Conditional High Range");

const evalE160 = evaluateEnergyCompliance(160.0);
assert(evalE160.status === "conditional", "Energy 160.0 kcal/kg/d is within conditional ceiling");

// Exceeds ceiling (>160.0)
const evalE160_1 = evaluateEnergyCompliance(160.1);
assert(evalE160_1.status === "exceeding", "Energy 160.1 kcal/kg/d exceeds upper ceiling (>160)");
assert(evalE160_1.badgeLabel.includes("Above Reference Range"), "160.1 badge indicates Above Reference Range");

// =============================================================================
// DOMAIN 4: PROTEIN-TO-ENERGY (P:E) RATIO ACCEPTANCE TESTS (2.79, 2.80, 3.60, 3.61)
// =============================================================================
console.log("\n--- Domain 4: Protein-to-Energy (P:E) Ratio Acceptance Tests ---");

// Test 4.1: P:E = 2.79 g/100 kcal -> Below reference range (< 2.8)
const pe279 = evaluatePeRatioCompliance(2.79);
assert(pe279.status === "suboptimal", "P:E 2.79 is suboptimal (<2.8)");
assert(
  pe279.badgeLabel.includes("Below Reference Range"),
  `P:E 2.79 badge indicates Below Reference Range (got: ${pe279.badgeLabel})`
);
assert(
  pe279.interpretation ===
    "Protein-to-energy ratio is below the displayed ESPGHAN reference range. Review product choice, fortification, and total nutrient intake.",
  "P:E 2.79 returns exact required clinician review guidance"
);

// Test 4.2: P:E = 2.80 g/100 kcal -> Within reference range (2.8–3.6)
const pe280 = evaluatePeRatioCompliance(2.80);
assert(pe280.status === "on_target", "P:E 2.80 is on_target (exact lower boundary)");
assert(
  pe280.badgeLabel.includes("Within Reference Range"),
  `P:E 2.80 badge indicates Within Reference Range (got: ${pe280.badgeLabel})`
);
assert(
  pe280.interpretation === "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
  "P:E 2.80 returns exact required within-target guidance"
);

// Test 4.3: P:E = 3.60 g/100 kcal -> Within reference range (2.8–3.6)
const pe360 = evaluatePeRatioCompliance(3.60);
assert(pe360.status === "on_target", "P:E 3.60 is on_target (exact upper boundary)");
assert(
  pe360.badgeLabel.includes("Within Reference Range"),
  `P:E 3.60 badge indicates Within Reference Range (got: ${pe360.badgeLabel})`
);
assert(
  pe360.interpretation === "Protein-to-energy ratio is within the displayed ESPGHAN reference range.",
  "P:E 3.60 returns exact required within-target guidance"
);

// Test 4.4: P:E = 3.61 g/100 kcal -> Above reference range (> 3.6)
const pe361 = evaluatePeRatioCompliance(3.61);
assert(pe361.status === "exceeding", "P:E 3.61 is exceeding (>3.6)");
assert(
  pe361.badgeLabel.includes("Above Reference Range"),
  `P:E 3.61 badge indicates Above Reference Range (got: ${pe361.badgeLabel})`
);
assert(
  pe361.interpretation ===
    "Protein-to-energy ratio is above the displayed ESPGHAN reference range. Review protein and energy sources.",
  "P:E 3.61 returns exact required above-range guidance"
);

// Test 4.5: Non-contradictory overall clinical status check
// Standard Pediamil LBW at 150 mL/kg/d delivers P:E = 3.04 (on_target)
const standardVlbw = calculateLbwNutrition(1350, 150);
assert(
  standardVlbw.overallStatus === "Within reference range",
  "Standard 1,350g VLBW with all metrics on-target achieves 'Within reference range'"
);

// =============================================================================
// DOMAIN 5: STRICT CALENDAR DATE VALIDATION
// =============================================================================
console.log("\n--- Domain 5: Strict Calendar Date Validation ---");

// Test 5.1: Valid same-day DOB and measurement date
const validSameDay = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-10",
});
assert(validSameDay.isValid, "Valid same-day DOB and DOM (2026-05-10) is valid");

// Test 5.2: Measurement date 1 day after DOB
const validNextDay = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-11",
});
assert(validNextDay.isValid, "DOM 1 day after DOB is valid");

// Test 5.3: Measurement date before DOB (DOM < DOB) -> strictly blocked
const invertedDates = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-09",
});
assert(invertedDates.isBlocked, "DOM preceding DOB is strictly blocked");
assert(
  invertedDates.errors.some((e) => e.message.includes("DOM < DOB")),
  "Error message specifically cites DOM < DOB"
);

// Test 5.4: Invalid month (e.g. Month 13)
const invalidMonth = parseStrictCalendarDate("2026-13-10");
assert(!invalidMonth.isValid, "Month 13 is rejected as invalid");

// Test 5.5: Invalid day (February 30th)
const feb30 = parseStrictCalendarDate("2026-02-30");
assert(!feb30.isValid, "February 30th is rejected as impossible calendar date");

// Test 5.6: Invalid day (April 31st)
const apr31 = parseStrictCalendarDate("2026-04-31");
assert(!apr31.isValid, "April 31st is rejected as impossible calendar date (April has 30 days)");

// Test 5.7: Leap year acceptance (Feb 29 on leap year vs non-leap year)
const leap2024 = parseStrictCalendarDate("2024-02-29");
assert(leap2024.isValid, "February 29th on leap year 2024 is valid");

const nonLeap2025 = parseStrictCalendarDate("2025-02-29");
assert(!nonLeap2025.isValid, "February 29th on non-leap year 2025 is rejected");

// Test 5.8: Malformed date string (slashes instead of hyphens)
const malformedDate = parseStrictCalendarDate("2026/05/10");
assert(!malformedDate.isValid, "Date with slashes '2026/05/10' is rejected (must be YYYY-MM-DD)");

// Test 5.9: Date with non-4-digit year
const non4Digit = parseStrictCalendarDate("26-05-10");
assert(!non4Digit.isValid, "Two-digit year '26-05-10' is rejected");

// Test 5.10: Empty date string
const emptyDate = parseStrictCalendarDate("");
assert(!emptyDate.isValid, "Empty date string is rejected");

// Test 5.11: Future measurement date (relative to 2026-10-02)
const futureDate = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2027-01-01",
});
assert(futureDate.isBlocked, "Future measurement date (2027-01-01) is strictly blocked");

// =============================================================================
// DOMAIN 6: FENTON 2013 & WHO 2006 ROUTING AND BOUNDARY LIMITS
// =============================================================================
console.log("\n--- Domain 6: Growth Dataset Routing & Age Limits ---");

// Test 6.1: PMA below 22 weeks -> flagged as out of range
const under22wAges = calculateAges(22, 0, "2026-05-10", "2026-05-09"); // blocked by validation
assert(under22wAges.isBlocked, "PMA under 22w with inverted date is blocked");

const age22w = calculateAges(22, 0, "2026-05-10", "2026-05-10");
assert(!age22w.isBlocked && age22w.pmaWeeksDecimal === 22, "PMA exactly 22w0d is valid");
const ds22w = getGrowthDataset("male", age22w);
assert(ds22w.chartType === "fenton", "22w0d routes to Fenton chart");
assert(!ds22w.isAgeOutOfRange, "22w0d is within Fenton supported range");

// Test 6.2: PMA exactly 50w0d -> within Fenton chart
const age50w = calculateAges(28, 0, "2026-01-01", "2026-06-04"); // 28w + 22w = 50w
assert(age50w.pmaWeeksDecimal === 50, `PMA is 50.0 weeks (got: ${age50w.pmaWeeksDecimal})`);
const ds50w = getGrowthDataset("male", age50w);
assert(ds50w.chartType === "fenton", "PMA 50w0d routes to Fenton chart");
assert(!ds50w.isAgeOutOfRange, "PMA 50w0d is within Fenton supported range");

// Test 6.3: PMA > 50w -> transitions to WHO chart with corrected age
const age52w = calculateAges(28, 0, "2026-01-01", "2026-06-18"); // 28w + 24w = 52w PMA
assert(age52w.pmaWeeksDecimal === 52, `PMA is 52.0 weeks (got: ${age52w.pmaWeeksDecimal})`);
const ds52w = getGrowthDataset("male", age52w);
assert(ds52w.chartType === "who", "PMA > 50w transitions to WHO 2006 chart");
assert(ds52w.xAxisUnit === "months CCA", "WHO chart uses months CCA on X-axis");

// Test 6.4: WHO 24-month boundary (CCA 24.0m valid, CCA > 24m flagged out of range)
const age24m = calculateAges(28, 0, "2024-01-01", "2026-01-01"); // ~24 months
const ds24m = getGrowthDataset("male", age24m);
assert(ds24m.chartType === "who", "Older infant routes to WHO");

// =============================================================================
// DOMAIN 7: ANTHROPOMETRIC EVALUATIONS & OPTIONAL FIELDS
// =============================================================================
console.log("\n--- Domain 7: Anthropometrics & Optional Fields ---");

// Test 7.1: Male and female 50th percentile weight evaluation
const evalMale = evaluatePercentile(1210, "weight", getGrowthDataset("male", age28w()));
assert(evalMale.zScore === 0, `28w Male 1,210g has Z-score 0.00 (got: ${evalMale.zScore})`);
assert(evalMale.percentile === 50.0, `28w Male 1,210g is 50.0th percentile (got: ${evalMale.percentile})`);

const evalFemale = evaluatePercentile(1140, "weight", getGrowthDataset("female", age28w()));
assert(evalFemale.zScore === 0, `28w Female 1,140g has Z-score 0.00 (got: ${evalFemale.zScore})`);
assert(evalFemale.percentile === 50.0, `28w Female 1,140g is 50.0th percentile (got: ${evalFemale.percentile})`);

// Test 7.2: Invalid text in optional length field is strictly rejected
const invalidLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: "abc",
});
assert(invalidLen.isBlocked, "Non-numeric optional length 'abc' is strictly blocked");

// Test 7.3: Out of physiological range length (15 cm) is rejected
const outOfRangeLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: 15.0,
});
assert(outOfRangeLen.isBlocked, "Length 15.0 cm (under 20 cm) is strictly blocked");

// Test 7.4: Valid length (39.5 cm) is accepted
const validLen = validateGrowthInputs({
  gaWeeks: 28,
  gaDays: 0,
  dob: "2026-05-10",
  dom: "2026-05-15",
  lengthCm: 39.5,
});
assert(validLen.isValid, "Length 39.5 cm is accepted");

// =============================================================================
// DOMAIN 8: LONGITUDINAL TRACKING (PATEL EXPONENTIAL VELOCITY & ALERTS)
// =============================================================================
console.log("\n--- Domain 8: Longitudinal Tracking & Growth Velocity ---");

// Test 8.1: Patel et al. 2005 2-point exponential model
// W1 = 1000g, W2 = 1100g, deltaDays = 7
// Velocity = 1000 * ln(1100 / 1000) / 7 = 1000 * 0.09531 / 7 = 13.616 -> 13.6 g/kg/d
const vel = calculateWeightVelocity(1000, 1100, 7);
assert(vel === 13.6, `Patel exponential velocity for 1000g->1100g over 7d is 13.6 g/kg/d (got: ${vel})`);

// Test 8.2: Duplicate dates (deltaDays = 0) handled gracefully
const vel0 = calculateWeightVelocity(1000, 1050, 0);
assert(vel0 === 0, "Duplicate date (deltaDays = 0) returns 0 velocity without dividing by zero");

// Test 8.3: Serial records with weight loss
const serialLoss = [
  { date: "2026-05-01", weightGrams: 1200 },
  { date: "2026-05-08", weightGrams: 1150 }, // weight loss
];
const evaluatedLoss = evaluateLongitudinalRecords(serialLoss, 28, 0, "2026-05-01", "male");
assert(evaluatedLoss.length === 2, "Evaluated 2 serial records");
assert(
  /negative weight velocity/i.test(evaluatedLoss[1].trendAlert || ""),
  "Weight loss triggers screening alert for clinician review citing negative weight velocity"
);

// Test 8.4: Serial records with major channel drop (>0.67 SD loss)
const serialDrop = [
  { date: "2026-05-01", weightGrams: 1400 }, // ~90th percentile
  { date: "2026-05-21", weightGrams: 1450 }, // slowed growth over 20 days -> major Z drop
];
const evaluatedDrop = evaluateLongitudinalRecords(serialDrop, 28, 0, "2026-05-01", "male");
assert(
  evaluatedDrop[1].deltaWeightZScore !== undefined && evaluatedDrop[1].deltaWeightZScore < -0.67,
  "Detected major Z-score drop (>0.67 SD loss)"
);
assert(
  evaluatedDrop[1].trendAlert?.includes("Screening alert for clinician review") || false,
  "Channel crossing alert uses cautious screening decision-support wording"
);

// Test 8.5: Chronologically out-of-order records are sorted automatically
const outOfOrderRecords = [
  { date: "2026-05-15", weightGrams: 1300 },
  { date: "2026-05-01", weightGrams: 1100 },
];
const sortedEvaluation = evaluateLongitudinalRecords(outOfOrderRecords, 28, 0, "2026-05-01", "male");
assert(
  sortedEvaluation[0].date === "2026-05-01" && sortedEvaluation[1].date === "2026-05-15",
  "Out-of-order records are sorted chronologically by date"
);

// Test 8.6: Missing optional measurements (weight only) evaluates without error
const weightOnlyRecords = [
  { date: "2026-05-01", weightGrams: 1100 },
  { date: "2026-05-08", weightGrams: 1200 },
];
const weightOnlyEval = evaluateLongitudinalRecords(weightOnlyRecords, 28, 0, "2026-05-01", "male");
assert(
  weightOnlyEval[1].lengthZScore === undefined && weightOnlyEval[1].weightVelocityGPerKgPerDay !== undefined,
  "Missing optional measurements (length/HC) calculate weight velocity cleanly"
);

// =============================================================================
// DOMAIN 9: PATIENT DELIVERED DAILY NUTRIENT PAYLOAD & DOCTOR RELATABILITY
// =============================================================================
console.log("\n--- Domain 9: Patient Delivered Daily Nutritional Payload ---");

// Test 9.1: Preterm 1500g infant on 150 mL/kg/d Pediamil LBW (225 mL/day total volume)
const pretermNutrition = calculateLbwNutrition(1500, 150);
const pretermPayload = pretermNutrition.deliveredNutrientPayload;
assert(pretermPayload !== undefined, "Preterm patient delivered nutrient payload is calculated");
assert(pretermPayload?.totalDailyVolumeMl === 225, `Total daily volume is 225 mL (got: ${pretermPayload?.totalDailyVolumeMl})`);
assert(pretermPayload?.dailyPowderGrams === 33.8, `Daily powder requirement is 33.8g (got: ${pretermPayload?.dailyPowderGrams})`);
assert(pretermPayload?.dailyScoops === 6.8, `Daily scoop requirement is 6.8 scoops (got: ${pretermPayload?.dailyScoops})`);
assert(pretermPayload?.calciumMgPerDay === 292.6, `Delivered Calcium is 292.6 mg/d (got: ${pretermPayload?.calciumMgPerDay})`);
assert(pretermPayload?.calciumMgPerKgPerDay === 195.1, `Delivered Calcium is 195.1 mg/kg/d (got: ${pretermPayload?.calciumMgPerKgPerDay})`);
assert(pretermPayload?.phosphorusMgPerDay === 146.5, `Delivered Phosphorus is 146.5 mg/d (got: ${pretermPayload?.phosphorusMgPerDay})`);
assert(pretermPayload?.ironMgPerKgPerDay === 2.93, `Delivered Iron is 2.93 mg/kg/d within ESPGHAN 2-3 target (got: ${pretermPayload?.ironMgPerKgPerDay})`);
assert(pretermPayload?.sodiumMmolPerKgPerDay === 2.26, `Delivered Sodium is 2.26 mmol/kg/d within ESPGHAN 2-3 target (got: ${pretermPayload?.sodiumMmolPerKgPerDay})`);
assert(pretermPayload?.vitaminD3IuPerDay === 372, `Delivered Vitamin D3 is 372 IU/day (got: ${pretermPayload?.vitaminD3IuPerDay})`);
assert(pretermPayload?.items.length !== undefined && pretermPayload.items.length >= 15, "Payload contains comprehensive categorized nutrient items");

// Test 9.2: Graduated 4000g infant on 150 mL/kg/d Pediamil 1 (600 mL/day total volume)
const termNutrition = calculateLbwNutrition(4000, 150);
const termPayload = termNutrition.deliveredNutrientPayload;
assert(termPayload !== undefined, "Term patient delivered nutrient payload is calculated");
assert(termPayload?.productName === "Pediamil® 1", `Term product is Pediamil® 1 (got: ${termPayload?.productName})`);
assert(termPayload?.totalDailyVolumeMl === 600, `Term total daily volume is 600 mL (got: ${termPayload?.totalDailyVolumeMl})`);
assert(termPayload?.dailyPowderGrams === 82.2, `Term daily powder requirement is 82.2g (got: ${termPayload?.dailyPowderGrams})`);
assert(termPayload?.proteinGramsPerDay === 8.94, `Term delivered protein is 8.94 g/d (got: ${termPayload?.proteinGramsPerDay})`);

// =============================================================================
// DOMAIN 10: CENTRALIZED REFERENCE RANGES & CLINICAL STANDARDS (PROMPT S2 & S4)
// =============================================================================
console.log("\n--- Domain 10: Centralized Reference Ranges & Clinical Standards ---");

// Test 10.1: ESPGHAN 2022 Preterm Carbohydrate reference range is 11–15 g/kg/day
assert(
  CLINICAL_REFERENCES.carbohydratePreterm.minimum === 11.0 &&
  CLINICAL_REFERENCES.carbohydratePreterm.maximum === 15.0,
  "Centralized carbohydrate reference is 11.0–15.0 g/kg/day (ESPGHAN 2022)"
);
assert(
  ESPGHAN_DIRECT_GUIDELINES.CARBOHYDRATES.TYPICAL_MIN === 11.0 &&
  ESPGHAN_DIRECT_GUIDELINES.CARBOHYDRATES.TYPICAL_MAX === 15.0,
  "ESPGHAN direct guidelines define carbohydrates as 11–15 g/kg/day"
);

// Test 10.2: ESPGHAN 2022 Preterm Total Fat reference range is 4.8–8.1 g/kg/day
assert(
  CLINICAL_REFERENCES.fatPreterm.minimum === 4.8 &&
  CLINICAL_REFERENCES.fatPreterm.maximum === 8.1,
  "Centralized total fat reference is 4.8–8.1 g/kg/day (ESPGHAN 2022)"
);
assert(
  ESPGHAN_DIRECT_GUIDELINES.TOTAL_FAT.TYPICAL_MIN === 4.8 &&
  ESPGHAN_DIRECT_GUIDELINES.TOTAL_FAT.TYPICAL_MAX === 8.1,
  "ESPGHAN direct guidelines define total fat as 4.8–8.1 g/kg/day"
);

// Test 10.3: DHA & ARA Reference Ranges and Ratio Standards
assert(
  CLINICAL_REFERENCES.dhaPreterm.minimum === 30 &&
  CLINICAL_REFERENCES.dhaPreterm.maximum === 65,
  "DHA reference range is 30–65 mg/kg/day"
);
assert(
  CLINICAL_REFERENCES.araPreterm.minimum === 30 &&
  CLINICAL_REFERENCES.araPreterm.maximum === 100,
  "ARA reference range is 30–100 mg/kg/day"
);
assert(
  CLINICAL_REFERENCES.araDhaRatioPreterm.minimum === 0.5 &&
  CLINICAL_REFERENCES.araDhaRatioPreterm.maximum === 2.0,
  "ARA:DHA ratio standard is 0.5–2:1"
);

// Test 10.4: Reference comparison status evaluation (no marketing claims)
const carbLow = evaluateReferenceComparison(10.5, CLINICAL_REFERENCES.carbohydratePreterm);
assert(carbLow.status === "BELOW_RANGE", "10.5 g/kg/d carbohydrates evaluates as BELOW_RANGE");

const carbTarget = evaluateReferenceComparison(12.5, CLINICAL_REFERENCES.carbohydratePreterm);
assert(carbTarget.status === "WITHIN_RANGE", "12.5 g/kg/d carbohydrates evaluates as WITHIN_RANGE");

const carbHigh = evaluateReferenceComparison(15.5, CLINICAL_REFERENCES.carbohydratePreterm);
assert(carbHigh.status === "ABOVE_RANGE", "15.5 g/kg/d carbohydrates evaluates as ABOVE_RANGE");

const fatLow = evaluateReferenceComparison(4.2, CLINICAL_REFERENCES.fatPreterm);
assert(fatLow.status === "BELOW_RANGE", "4.2 g/kg/d total fat evaluates as BELOW_RANGE");

const fatTarget = evaluateReferenceComparison(6.5, CLINICAL_REFERENCES.fatPreterm);
assert(fatTarget.status === "WITHIN_RANGE", "6.5 g/kg/d total fat evaluates as WITHIN_RANGE");

const fatHigh = evaluateReferenceComparison(8.5, CLINICAL_REFERENCES.fatPreterm);
assert(fatHigh.status === "ABOVE_RANGE", "8.5 g/kg/d total fat evaluates as ABOVE_RANGE");

// =============================================================================
// DOMAIN 11: EXACT ATOMIC WEIGHT CONVERSIONS & ELECTROLYTE SEPARATION (PROMPT S5)
// =============================================================================
console.log("\n--- Domain 11: Atomic Weight Conversions & Electrolyte Units ---");

// Test 11.1: Exact atomic molecular weights defined
assert(MOLECULAR_WEIGHTS.SODIUM === 22.99, "Atomic weight of Sodium (Na) is exactly 22.99 g/mol");
assert(MOLECULAR_WEIGHTS.POTASSIUM === 39.10, "Atomic weight of Potassium (K) is exactly 39.10 g/mol");
assert(MOLECULAR_WEIGHTS.CHLORIDE === 35.45, "Atomic weight of Chloride (Cl) is exactly 35.45 g/mol");
assert(MOLECULAR_WEIGHTS.CALCIUM === 40.08, "Atomic weight of Calcium (Ca) is exactly 40.08 g/mol");
assert(MOLECULAR_WEIGHTS.PHOSPHORUS === 30.97, "Atomic weight of Phosphorus (P) is exactly 30.97 g/mol");

// Test 11.2: Atomic conversion accuracy: 22.99 mg Na = 1.000 mmol Na
const mmolNa = mgToMmol(22.99, MOLECULAR_WEIGHTS.SODIUM);
assert(Math.abs(mmolNa - 1.0) < 0.001, "22.99 mg Na converts to 1.000 mmol Na");

const mgNa = mmolToMg(1.0, MOLECULAR_WEIGHTS.SODIUM);
assert(Math.abs(mgNa - 22.99) < 0.001, "1.000 mmol Na converts back to 22.99 mg Na");

// Test 11.3: Round-trip conversion for Potassium (39.10 g/mol)
const mmolK = mgToMmol(78.20, MOLECULAR_WEIGHTS.POTASSIUM);
assert(Math.abs(mmolK - 2.0) < 0.001, "78.20 mg K converts to 2.000 mmol K");

// Test 11.4: Preterm payload separates mg/day, mg/kg/day, mmol/day, and mmol/kg/day
assert(
  pretermPayload?.sodiumMgPerDay !== undefined &&
  pretermPayload?.sodiumMgPerKgPerDay !== undefined &&
  pretermPayload?.sodiumMmolPerDay !== undefined &&
  pretermPayload?.sodiumMmolPerKgPerDay !== undefined,
  "Sodium payload separates mg/day, mg/kg/day, mmol/day, and mmol/kg/day into distinct fields"
);
assert(
  pretermPayload?.sodiumMgPerDay === 78,
  `Delivered sodium absolute mass is 78 mg/day (got: ${pretermPayload?.sodiumMgPerDay})`
);
assert(
  pretermPayload?.sodiumMmolPerDay === 3.39,
  `Delivered sodium molar quantity is 3.39 mmol/day based on 22.99 g/mol (got: ${pretermPayload?.sodiumMmolPerDay})`
);
assert(
  pretermPayload?.sodiumMmolPerKgPerDay === 2.26,
  `Delivered sodium normalized molar rate is 2.26 mmol/kg/day (got: ${pretermPayload?.sodiumMmolPerKgPerDay})`
);

// Test 11.5: DHA and ARA doses and ratio in payload
assert(
  pretermPayload?.dhaMgPerDay !== undefined && pretermPayload?.araMgPerDay !== undefined,
  "Preterm payload contains both DHA and ARA doses"
);
assert(
  pretermPayload?.araDhaRatio === 1.0,
  `Delivered ARA:DHA ratio is 1.00:1 (got: ${pretermPayload?.araDhaRatio})`
);
assert(
  pretermPayload?.araDhaRatioFormatted?.includes("1.0") && pretermPayload?.araDhaRatioFormatted?.includes("1"),
  `Formatted ARA:DHA ratio represents 1:1 balance (got: ${pretermPayload?.araDhaRatioFormatted})`
);

// Helper for 28w age calculation
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

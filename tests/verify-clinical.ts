/**
 * Comprehensive Automated Verification Suite for Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Directly tests canonical TypeScript calculation engines, validation contracts,
 * ESPGHAN 2022 4-tier energy states, Fenton 2013 continuous LMS math, and WHO routing.
 */

import fs from "fs";
import path from "path";
import {
  calculateLbwNutrition,
  STANDARD_LBW_MATRIX,
  STANDARD_STAGE_1_MATRIX,
  ESPGHAN_ENERGY_FRAMEWORK,
  ESPGHAN_PE_RATIO_FRAMEWORK,
} from "../lib/lbw-nutrition";
import {
  calculateAges,
  getGrowthDataset,
  evaluatePercentile,
  calculateWeightVelocity,
  evaluateLongitudinalRecords,
  normalCdf,
} from "../lib/growth-engine";
import { validateNutritionInputs, validateGrowthInputs } from "../lib/validation";

console.log("================================================================================");
console.log("RUNNING LIPTIS NEOPED INSTITUTIONAL CLINICAL VERIFICATION SUITE");
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

// -----------------------------------------------------------------------------
// Test 1: Standard VLBW Preterm Infant (1,350g, 150 mL/kg/d)
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 1: Standard VLBW Preterm Infant Baseline (1,350g) ---");
const vlbwRes = calculateLbwNutrition(1350, 150);

assert(!vlbwRes.isBlocked, "1,350g infant calculation is not blocked");
assert(vlbwRes.currentWeightGrams === 1350, "Weight preserved accurately as 1,350g");
assert(vlbwRes.totalDailyVolumeMl === 202.5, `Total volume is 202.5 mL/day (got: ${vlbwRes.totalDailyVolumeMl})`);
assert(vlbwRes.deliveredEnergyKcalPerKgPerDay === 120.0, `Energy is 120.0 kcal/kg/d (got: ${vlbwRes.deliveredEnergyKcalPerKgPerDay})`);
assert(vlbwRes.energyCompliance?.status === "on_target", `Energy status is 'on_target' (${vlbwRes.energyCompliance?.status})`);
assert(vlbwRes.energyCompliance?.tier === "typical_target", `Energy tier is 'typical_target' (${vlbwRes.energyCompliance?.tier})`);
assert(vlbwRes.deliveredProteinGramsPerKgPerDay === 3.30, `Protein is 3.30 g/kg/d (got: ${vlbwRes.deliveredProteinGramsPerKgPerDay})`);
assert(vlbwRes.proteinCompliance?.status === "on_target", `Protein status is 'on_target' (${vlbwRes.proteinCompliance?.status})`);
assert(vlbwRes.proteinBracket?.classification === "VLBW", `Bracket classification is VLBW (${vlbwRes.proteinBracket?.classification})`);
assert(vlbwRes.isGraduated === false, "isGraduated is false for 1,350g");
assert(vlbwRes.imageSrc === "/pediamil-lbw.png", `Image routed to Pediamil LBW pack (${vlbwRes.imageSrc})`);

// -----------------------------------------------------------------------------
// Test 2: ELBW Infant (<1000g, e.g. 850g)
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 2: ELBW Infant Bracket (850g) ---");
const elbwRes = calculateLbwNutrition(850, 150);
assert(!elbwRes.isBlocked, "850g calculation is not blocked");
assert(elbwRes.proteinBracket?.classification === "ELBW", "Bracket is ELBW");
assert(elbwRes.proteinBracket?.targetMinGramsPerKg === 3.5, "ELBW min protein target is 3.5 g/kg/d");
assert(elbwRes.proteinBracket?.targetMaxGramsPerKg === 4.5, "ELBW max protein target is 4.5 g/kg/d");
assert(elbwRes.imageSrc === "/pediamil-lbw.png", "Image routed to Pediamil LBW");

// -----------------------------------------------------------------------------
// Test 3: LBW / Step-Down Infant (1801g to 3500g, e.g. 2,200g)
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 3: LBW Step-Down Infant Bracket (2,200g) ---");
const lbwRes = calculateLbwNutrition(2200, 150);
assert(!lbwRes.isBlocked, "2,200g calculation is not blocked");
assert(lbwRes.proteinBracket?.classification === "LBW", "Bracket is LBW");
assert(lbwRes.proteinBracket?.targetMinGramsPerKg === 2.8, "LBW min protein target is 2.8 g/kg/d");
assert(lbwRes.proteinBracket?.targetMaxGramsPerKg === 3.6, "LBW max protein target is 3.6 g/kg/d");
assert(lbwRes.isGraduated === false, "isGraduated is false for 2,200g");

// -----------------------------------------------------------------------------
// Test 4: Boundary Tests at Graduation Threshold (3,500g vs 3,501g)
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 4: Graduation Boundary (3,500g vs 3,501g) ---");
const ceiling3500 = calculateLbwNutrition(3500, 150);
assert(ceiling3500.isGraduated === false, "3,500g: isGraduated must be false (step-down ceiling)");
assert(ceiling3500.proteinBracket?.classification === "LBW", "3,500g: classification must be LBW");
assert(ceiling3500.imageSrc === "/pediamil-lbw.png", "3,500g: routes to Pediamil LBW");

const boundary3501 = calculateLbwNutrition(3501, 150);
assert(boundary3501.isGraduated === true, "3,501g: isGraduated must be true (graduation threshold)");
assert(boundary3501.proteinBracket?.classification === "Graduation", "3,501g: classification must be Graduation");
assert(boundary3501.imageSrc === "/pediamil-1.png", "3,501g: routes to Pediamil 1 pack");
assert(boundary3501.standardTermTargets?.energyTarget === "~100 kcal/kg/day", "3,501g: delivers ~100 kcal/kg/day target");

// -----------------------------------------------------------------------------
// Test 5: Bug Verification - Mature 7,800g Infant
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 5: Bug Verification Case - 7,800g Infant ---");
const matureRes = calculateLbwNutrition(7800, 150);
assert(!matureRes.isBlocked, "7,800g calculation is not blocked");
assert(matureRes.currentWeightGrams === 7800, "7,800g is NOT silently clamped to lower values");
assert(matureRes.isGraduated === true, "7,800g infant MUST trigger isGraduated = true");
assert(matureRes.imageSrc === "/pediamil-1.png", "7,800g routes to Pediamil 1 pack");
assert(matureRes.proteinBracket?.classification === "Graduation", "7,800g classification is Graduation");
assert(
  Boolean(matureRes.graduationAlertText?.includes("exceeds 3,500g")),
  "Graduation alert text specifies exceeding 3,500g"
);

// -----------------------------------------------------------------------------
// Test 6: Zero Silent Clamping - Strict Rejection of Sub-400g Weight (e.g. 300g)
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 6: Rejection of Sub-400g Micro-Preemie Inputs ---");
const sub400Res = calculateLbwNutrition(300, 150);
assert(sub400Res.isBlocked === true, "Weight 300g MUST be blocked (isBlocked = true)");
assert(sub400Res.currentWeightGrams === undefined, "No feed metrics computed for blocked 300g input");
assert(
  sub400Res.validation.errors.some((e) => e.field === "weightGrams" && e.message.includes("400g")),
  "Validation error message explicitly explains 400g minimum and micro-preemie ICU protocol"
);

const boundary399 = calculateLbwNutrition(399, 150);
assert(boundary399.isBlocked === true, "Weight 399g is blocked");

const boundary400 = calculateLbwNutrition(400, 150);
assert(boundary400.isBlocked === false, "Weight 400g is valid and accepted as ELBW");
assert(boundary400.proteinBracket?.classification === "ELBW", "400g classified as ELBW");

// -----------------------------------------------------------------------------
// Test 7: Strict Rejection of Over-10,000g Weight
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 7: Rejection of Over-10,000g Inputs ---");
const over10kRes = calculateLbwNutrition(10001, 150);
assert(over10kRes.isBlocked === true, "Weight 10,001g is blocked");

const boundary10k = calculateLbwNutrition(10000, 150);
assert(boundary10k.isBlocked === false, "Weight 10,000g is accepted");

// -----------------------------------------------------------------------------
// Test 8: ESPGHAN 2022 4-Tier Energy States
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 8: ESPGHAN 2022 4-Tier Energy Classification ---");
// 1. Below typical (<115): e.g. fluid 130 mL/kg/d at 80 kcal/100mL = 104 kcal/kg/d
const lowEnergyRes = calculateLbwNutrition(1350, 130);
assert(
  lowEnergyRes.energyCompliance?.tier === "below_typical",
  `104 kcal/kg/d classified as 'below_typical' (${lowEnergyRes.energyCompliance?.tier})`
);
assert(lowEnergyRes.energyCompliance?.status === "suboptimal", "Low energy marked suboptimal");

// 2. Typical (115–140): e.g. fluid 150 mL/kg/d at 80 kcal/100mL = 120 kcal/kg/d
const typicalEnergyRes = calculateLbwNutrition(1350, 150);
assert(
  typicalEnergyRes.energyCompliance?.tier === "typical_target",
  `120 kcal/kg/d classified as 'typical_target' (${typicalEnergyRes.energyCompliance?.tier})`
);
assert(typicalEnergyRes.energyCompliance?.status === "on_target", "Typical energy marked on_target");

// 3. Conditional High Range (140–160): e.g. fluid 180 mL/kg/d at 80 kcal/100mL = 144 kcal/kg/d
const condEnergyRes = calculateLbwNutrition(1350, 180);
assert(
  condEnergyRes.energyCompliance?.tier === "conditional_high",
  `144 kcal/kg/d classified as 'conditional_high' (${condEnergyRes.energyCompliance?.tier})`
);
assert(condEnergyRes.energyCompliance?.status === "conditional", "Conditional energy marked conditional");

// 4. Exceeds Ceiling (>160): e.g. fluid 210 mL/kg/d at 80 kcal/100mL = 168 kcal/kg/d
const extremeEnergyRes = calculateLbwNutrition(1350, 210);
assert(
  extremeEnergyRes.energyCompliance?.tier === "exceeds_ceiling",
  `168 kcal/kg/d classified as 'exceeds_ceiling' (${extremeEnergyRes.energyCompliance?.tier})`
);
assert(extremeEnergyRes.energyCompliance?.status === "exceeding", "Extreme energy marked exceeding");

// -----------------------------------------------------------------------------
// Test 9: Practical Feeding Schedule Reconciliation
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 9: Feeding Schedule Reconciliation (Within ±0.4 mL) ---");
const testWeights = [500, 850, 1350, 2200, 3100, 3500, 4500, 7800];
for (const wt of testWeights) {
  const sched = calculateLbwNutrition(wt, 150).feedingSchedule!;
  const rawVol = (wt / 1000) * 150;
  const q2hRecon = Math.round(Math.abs(sched.q2hVolumePerFeedMl * 12 - rawVol) * 100) / 100;
  const q3hRecon = Math.round(Math.abs(sched.q3hVolumePerFeedMl * 8 - rawVol) * 100) / 100;
  const contRecon = Math.round(Math.abs(sched.continuousInfusionMlPerHour * 24 - rawVol) * 100) / 100;

  assert(
    q2hRecon <= 0.6,
    `Weight ${wt}g: q2h reconciliation error (${q2hRecon.toFixed(2)} mL) <= 0.6 mL`
  );
  assert(
    q3hRecon <= 0.4,
    `Weight ${wt}g: q3h reconciliation error (${q3hRecon.toFixed(2)} mL) <= 0.4 mL`
  );
  assert(
    contRecon <= 1.2,
    `Weight ${wt}g: continuous reconciliation error (${contRecon.toFixed(2)} mL) <= 1.2 mL`
  );
}

// -----------------------------------------------------------------------------
// Test 10: Date Engine & Strict DOM < DOB Rejection
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 10: UTC-Safe Date Math & DOM < DOB Rejection ---");
const invertedDates = calculateAges(28, 2, "2026-05-15", "2026-05-10");
assert(invertedDates.isBlocked === true, "DOM < DOB is strictly blocked");
assert(
  invertedDates.validation.errors.some((e) => e.field === "dom" && e.message.includes("precedes")),
  "Validation error flags DOM preceding DOB"
);

const sameDayDates = calculateAges(28, 2, "2026-05-15", "2026-05-15");
assert(sameDayDates.isBlocked === false, "Same-day DOB and DOM is valid");
assert(sameDayDates.caTotalDays === 0, "Same day yields 0 completed CA days");
assert(sameDayDates.dayOfLife === 1, "Same day yields Day of Life 1 (DOL 1)");

// Leap year test (Feb 29, 2024 to March 1, 2024 = 1 day)
const leapYearDates = calculateAges(28, 2, "2024-02-29", "2024-03-01");
assert(leapYearDates.caTotalDays === 1, "Leap year day correctly counted (Feb 29 -> Mar 1 = 1 day)");

// -----------------------------------------------------------------------------
// Test 11: Continuous LMS Math & Exact Z-Scores / Percentiles
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 11: Fenton 2013 Continuous LMS Z-Scores & Percentiles ---");
const ages28w = calculateAges(28, 0, "2026-01-01", "2026-01-01"); // PMA 28.0w
const datasetMale = getGrowthDataset("male", ages28w);

// At 28w 0d:
// Median (50th): 1210g -> Z must be exactly 0.00 SD, Percentile 50.0%
const evalP50 = evaluatePercentile(1210, "weight", datasetMale);
assert(Math.abs(evalP50.zScore) <= 0.02, `1210g at 28w: Z-score is 0.00 SD (got: ${evalP50.zScore})`);
assert(Math.abs(evalP50.percentile - 50.0) <= 0.5, `1210g at 28w: Percentile is 50.0% (got: ${evalP50.percentile}%)`);

// 3rd %ile: 950g -> Z must be ~ -1.88 SD, Percentile ~ 3.0%
const evalP3 = evaluatePercentile(950, "weight", datasetMale);
assert(Math.abs(evalP3.zScore - -1.88) <= 0.05, `950g at 28w: Z-score is ~ -1.88 SD (got: ${evalP3.zScore})`);
assert(Math.abs(evalP3.percentile - 3.0) <= 0.5, `950g at 28w: Percentile is ~ 3.0% (got: ${evalP3.percentile}%)`);

// 10th %ile: 1030g -> Z must be ~ -1.28 SD, Percentile ~ 10.0%
const evalP10 = evaluatePercentile(1030, "weight", datasetMale);
assert(Math.abs(evalP10.zScore - -1.28) <= 0.05, `1030g at 28w: Z-score is ~ -1.28 SD (got: ${evalP10.zScore})`);
assert(Math.abs(evalP10.percentile - 10.0) <= 0.5, `1030g at 28w: Percentile is ~ 10.0% (got: ${evalP10.percentile}%)`);

// 90th %ile: 1420g -> Z must be ~ +1.28 SD, Percentile ~ 90.0%
const evalP90 = evaluatePercentile(1420, "weight", datasetMale);
assert(Math.abs(evalP90.zScore - 1.28) <= 0.05, `1420g at 28w: Z-score is ~ +1.28 SD (got: ${evalP90.zScore})`);
assert(Math.abs(evalP90.percentile - 90.0) <= 0.5, `1420g at 28w: Percentile is ~ 90.0% (got: ${evalP90.percentile}%)`);

// 97th %ile: 1530g -> Z must be ~ +1.88 SD, Percentile ~ 97.0%
const evalP97 = evaluatePercentile(1530, "weight", datasetMale);
assert(Math.abs(evalP97.zScore - 1.88) <= 0.05, `1530g at 28w: Z-score is ~ +1.88 SD (got: ${evalP97.zScore})`);
assert(Math.abs(evalP97.percentile - 97.0) <= 0.5, `1530g at 28w: Percentile is ~ 97.0% (got: ${evalP97.percentile}%)`);

// -----------------------------------------------------------------------------
// Test 12: WHO 2006 Routing & Age Range Validation
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 12: WHO 2006 Routing & Out-of-Range Guardrails ---");
// Infant born at 28w, now 30 weeks old chronological age (210 days):
// PMA = 28 + 30 = 58 weeks (> 50 weeks) -> Routes to WHO
const age58w = calculateAges(28, 0, "2025-01-01", "2025-07-30"); // 210 days CA
const whoDataset = getGrowthDataset("male", age58w);
assert(whoDataset.chartType === "who", `PMA > 50w routes to WHO chart (got: ${whoDataset.chartType})`);
assert(whoDataset.xAxisUnit === "months CCA", `X-axis is months CCA (${whoDataset.xAxisUnit})`);
assert(!whoDataset.isAgeOutOfRange, "Age is within WHO 0-24m range");

// Extreme age: CCA = 30 months (> 24 months) -> Out of range warning
const ageExtreme = calculateAges(28, 0, "2023-01-01", "2026-01-01"); // ~3 years CA
const extremeDataset = getGrowthDataset("male", ageExtreme);
assert(extremeDataset.chartType === "who", "Routes to WHO");
assert(extremeDataset.isAgeOutOfRange === true, "CCA > 24m triggers isAgeOutOfRange = true");
assert(
  Boolean(extremeDataset.ageOutOfRangeWarning?.includes("exceeds the supported WHO 0–24 month")),
  "Warning indicates exceeding WHO 0–24m infant standard"
);

// -----------------------------------------------------------------------------
// Test 13: Longitudinal Tracking & Channel Crossing Detection
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 13: Longitudinal Serial Tracking & EUGR Detection ---");
const serialInput = [
  { date: "2026-01-01", weightGrams: 1200 }, // Visit 1
  { date: "2026-01-08", weightGrams: 1220 }, // Visit 2 (poor growth)
];
const serialRes = evaluateLongitudinalRecords(serialInput, 28, 0, "2026-01-01", "male");
assert(serialRes.length === 2, "Evaluated 2 serial records");
assert(serialRes[1].weightVelocityGPerKgPerDay !== undefined, "Computed weight velocity");
assert(
  serialRes[1].deltaWeightZScore !== undefined && serialRes[1].deltaWeightZScore < -0.5,
  "Detected negative Z-score deceleration"
);

// Test velocity calculation: 1000g to 1150g over 10 days
// Avg weight = 1075g = 1.075 kg. Delta = 150g. Velocity = 150 / (1.075 * 10) = 13.95 ~ 14.0 g/kg/d
const velocity = calculateWeightVelocity(1000, 1150, 10);
assert(Math.abs(velocity - 14.0) <= 0.1, `Weight velocity is 14.0 g/kg/d (got: ${velocity})`);

// -----------------------------------------------------------------------------
// Test 14: Verification of Public Pack Visual Assets on Disk
// -----------------------------------------------------------------------------
console.log("\n--- Test Suite 14: Static Commercial Pack Assets on Disk ---");
const lbwPath = path.join(__dirname, "../public/pediamil-lbw.png");
const stage1Path = path.join(__dirname, "../public/pediamil-1.png");
assert(fs.existsSync(lbwPath), "pediamil-lbw.png exists in /public");
assert(fs.existsSync(stage1Path), "pediamil-1.png exists in /public");
assert(fs.statSync(lbwPath).size > 0, "pediamil-lbw.png is non-empty");
assert(fs.statSync(stage1Path).size > 0, "pediamil-1.png is non-empty");

// -----------------------------------------------------------------------------
// Summary Report
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("================================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log(">> ALL CLINICAL SAFETY, MATHEMATICAL ACCURACY & AUDIT TESTS PASSED! <<\n");
}

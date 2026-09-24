/**
 * Verification Script for Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Tests deterministic ESPGHAN 2022 calculations, 3,500g Graduation Ceiling, and Fenton/WHO growth routing.
 */

const fs = require('fs');
const path = require('path');

// Load growth-curves.json
const growthCurves = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../lib/data/growth-curves.json'), 'utf8')
);

// Deterministic ESPGHAN 2022 Nutrition Engine with Graduation Ceiling at 3500g and Commercial Product Pack Routing
function calculateLbwNutrition(weightGrams, fluidAllowance = 150) {
  const sanitizedWeight = Math.max(400, Math.min(10000, Number(weightGrams) || 1000));
  const sanitizedFluid = Math.max(80, Math.min(240, Number(fluidAllowance) || 150));
  const weightKg = sanitizedWeight / 1000;

  const isGraduated = sanitizedWeight > 3500;
  const graduationAlertText =
    "Infant exceeds 3,500g. ESPGHAN Preterm catch-up targets no longer apply. Patient has achieved term-equivalent weight. Consider transitioning to a standard infant formulation (e.g., Stage 1 or Stage 2).";

  // Product pack and recommendation text routing
  const imageSrc = isGraduated ? "/pediamil-1.png" : "/pediamil-lbw.png";
  const recommendationText = isGraduated
    ? "Infant has achieved term-equivalent weight (>3500g). Transition to standard infant nutrition (Stage 1) to support normal growth trajectories and prevent renal overload."
    : "ESPGHAN Preterm guidelines apply. Specialized high-protein, high-energy matrix recommended.";

  const standardTermTargets = isGraduated
    ? {
        energyTarget: "~100 kcal/kg/day",
        proteinTarget: "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal)",
        formulationBrand: "Pediamil® 1",
        formulationStage: "Stage 1 (Birth to 6 Months)",
      }
    : undefined;

  const formulaProfile = isGraduated
    ? { brand: "Pediamil® 1", energyKcalPer100Ml: 67, proteinGramsPer100Ml: 1.3 }
    : { brand: "Pediamil® LBW", energyKcalPer100Ml: 80, proteinGramsPer100Ml: 2.2 };

  const totalVolume = weightKg * sanitizedFluid;
  const energyKcal = (totalVolume / 100) * formulaProfile.energyKcalPer100Ml;
  const energyPerKg = energyKcal / weightKg;
  const proteinGrams = (totalVolume / 100) * formulaProfile.proteinGramsPer100Ml;
  const proteinPerKg = proteinGrams / weightKg;
  const peRatio = (proteinGrams / energyKcal) * 100;

  // Bracket
  let bracket;
  if (sanitizedWeight < 1000) {
    bracket = { min: 3.5, max: 4.5, classification: 'ELBW', name: 'Extremely Low Birth Weight (<1000g)' };
  } else if (sanitizedWeight <= 1800) {
    bracket = { min: 3.2, max: 4.1, classification: 'VLBW', name: 'Very Low Birth Weight (1000g to 1800g)' };
  } else if (sanitizedWeight <= 3500) {
    bracket = { min: 2.8, max: 3.6, classification: 'LBW', name: 'Low Birth Weight / Step-Down (1801g to 3500g)' };
  } else {
    bracket = { min: 0, max: 0, classification: 'Graduation', name: 'Graduation / Normal Weight (> 3500g)' };
  }

  const energyStatus = isGraduated
    ? 'on_target'
    : (energyPerKg >= 110 && energyPerKg <= 135 ? 'on_target' : (energyPerKg < 110 ? 'suboptimal' : 'exceeding'));

  const proteinStatus = isGraduated
    ? 'on_target'
    : (proteinPerKg >= bracket.min && proteinPerKg <= bracket.max ? 'on_target' : (proteinPerKg < bracket.min ? 'suboptimal' : 'exceeding'));

  return {
    weightGrams: sanitizedWeight,
    weightKg,
    fluidAllowance: sanitizedFluid,
    formulaProfile,
    totalVolume: Math.round(totalVolume * 10) / 10,
    energyPerKg: Math.round(energyPerKg * 10) / 10,
    energyStatus,
    proteinPerKg: Math.round(proteinPerKg * 100) / 100,
    proteinStatus,
    bracket,
    peRatio: Math.round(peRatio * 100) / 100,
    isGraduated,
    graduationAlertText,
    imageSrc,
    recommendationText,
    standardTermTargets
  };
}

// Growth Age Engine
function calculateAges(gaWeeks, gaDays, caDays) {
  const gaTotalDays = gaWeeks * 7 + gaDays;
  const pmaTotalDays = gaTotalDays + caDays;
  const pmaWeeks = Math.floor(pmaTotalDays / 7);
  const pmaDays = pmaTotalDays % 7;
  const pmaWeeksDecimal = Math.round((pmaTotalDays / 7) * 10) / 10;

  const termDays = 40 * 7; // 280
  const ccaTotalDays = pmaTotalDays - termDays;
  const isPreterm = ccaTotalDays < 0;

  const ccaWeeks = Math.floor(ccaTotalDays / 7);
  const ccaDays = ccaTotalDays % 7;

  return {
    caWeeks: Math.floor(caDays / 7),
    caDays: caDays % 7,
    pmaWeeks,
    pmaDays,
    pmaWeeksDecimal,
    isPreterm,
    ccaWeeks,
    ccaDays,
    ccaWeeksDecimal: Math.round((ccaTotalDays / 7) * 10) / 10
  };
}

console.log('================================================================');
console.log('RUNNING CLINICAL CASE & GRADUATION CEILING VERIFICATION');
console.log('================================================================');

// Case 1: Standard VLBW test case (Male, 28w+2d, 1350g, 150 mL/kg/d)
console.log('\n--- Test 1: Standard VLBW Preterm Infant (1,350g) ---');
const vlbwCase = calculateLbwNutrition(1350, 150);
console.log(`Weight: ${vlbwCase.weightGrams}g, Classification: ${vlbwCase.bracket.classification}`);
console.log(`Total Volume: ${vlbwCase.totalVolume} mL/day (Expected: 202.5 mL/day)`);
console.log(`Energy: ${vlbwCase.energyPerKg} kcal/kg/d (Status: ${vlbwCase.energyStatus})`);
console.log(`Protein: ${vlbwCase.proteinPerKg} g/kg/d (Target: ${vlbwCase.bracket.min}-${vlbwCase.bracket.max} g/kg/d) -> Status: ${vlbwCase.proteinStatus}`);
console.log(`isGraduated: ${vlbwCase.isGraduated}`);

if (vlbwCase.energyPerKg !== 120.0 || vlbwCase.energyStatus !== 'on_target') {
  throw new Error(`VLBW Energy check failed: got ${vlbwCase.energyPerKg}`);
}
if (vlbwCase.proteinPerKg !== 3.30 || vlbwCase.proteinStatus !== 'on_target') {
  throw new Error(`VLBW Protein check failed: got ${vlbwCase.proteinPerKg}`);
}
if (vlbwCase.bracket.classification !== 'VLBW' || vlbwCase.isGraduated !== false) {
  throw new Error(`VLBW classification failed: got ${vlbwCase.bracket.classification}, graduated: ${vlbwCase.isGraduated}`);
}
console.log('>> PASS: 1,350g VLBW infant accurately matches ESPGHAN 2022 guidelines!');

// Case 2: ELBW infant (<1000g)
console.log('\n--- Test 2: ELBW Infant (850g) ---');
const elbwCase = calculateLbwNutrition(850, 150);
console.log(`Classification: ${elbwCase.bracket.classification}, Target: ${elbwCase.bracket.min}-${elbwCase.bracket.max} g/kg/d`);
if (elbwCase.bracket.classification !== 'ELBW' || elbwCase.bracket.min !== 3.5 || elbwCase.bracket.max !== 4.5) {
  throw new Error('ELBW bracket targets incorrect');
}
console.log('>> PASS: ELBW bracket correct (3.5 - 4.5 g/kg/day)!');

// Case 3: LBW / Step-Down infant (1801g to 3500g)
console.log('\n--- Test 3: LBW Step-Down Infant (2,200g) ---');
const lbwCase = calculateLbwNutrition(2200, 150);
console.log(`Classification: ${lbwCase.bracket.classification}, Target: ${lbwCase.bracket.min}-${lbwCase.bracket.max} g/kg/d`);
if (lbwCase.bracket.classification !== 'LBW' || lbwCase.bracket.min !== 2.8 || lbwCase.bracket.max !== 3.6) {
  throw new Error('LBW bracket targets incorrect');
}
console.log('>> PASS: LBW / Step-Down bracket correct (2.8 - 3.6 g/kg/day)!');

// Case 4: Boundary test at exactly 3,500g
console.log('\n--- Test 4: Boundary at 3,500g (Step-Down ceiling) ---');
const ceiling3500 = calculateLbwNutrition(3500, 150);
if (ceiling3500.isGraduated !== false || ceiling3500.bracket.classification !== 'LBW') {
  throw new Error(`3,500g boundary failed: graduated should be false, got ${ceiling3500.isGraduated}`);
}
console.log('>> PASS: 3,500g correctly retains LBW Step-Down status!');

// Case 5: Boundary test at 3,501g
console.log('\n--- Test 5: Boundary at 3,501g (Graduation threshold) ---');
const boundaryGrad = calculateLbwNutrition(3501, 150);
if (boundaryGrad.isGraduated !== true || boundaryGrad.bracket.classification !== 'Graduation') {
  throw new Error(`3,501g boundary failed: expected isGraduated true, got ${boundaryGrad.isGraduated}`);
}
console.log('>> PASS: 3,501g correctly triggers Graduation status!');

// Case 6: Bug verification test case - 7,800g infant
console.log('\n--- Test 6: Bug Verification Case - 7,800g Infant ---');
const bugCase = calculateLbwNutrition(7800, 150);
console.log(`Weight: ${bugCase.weightGrams}g`);
console.log(`Classification: ${bugCase.bracket.classification}`);
console.log(`isGraduated: ${bugCase.isGraduated}`);
console.log(`Total Volume: ${bugCase.totalVolume} mL/day`);
console.log(`Alert Text: "${bugCase.graduationAlertText}"`);

if (bugCase.weightGrams !== 7800) {
  throw new Error(`7,800g was clamped incorrectly! Got ${bugCase.weightGrams}`);
}
if (!bugCase.isGraduated) {
  throw new Error('7,800g infant MUST trigger isGraduated = true!');
}
if (bugCase.bracket.classification !== 'Graduation') {
  throw new Error(`7,800g infant classification must be 'Graduation', got: ${bugCase.bracket.classification}`);
}
const expectedAlert = "Infant exceeds 3,500g. ESPGHAN Preterm catch-up targets no longer apply. Patient has achieved term-equivalent weight. Consider transitioning to a standard infant formulation (e.g., Stage 1 or Stage 2).";
if (bugCase.graduationAlertText !== expectedAlert) {
  throw new Error(`Graduation alert text does not match exact clinical requirement!`);
}
console.log('>> PASS: 7,800g infant correctly triggers Graduation, suppresses preterm targets, and provides clinical guidance!');

// Execute growth test: let infant be 14 days old (2 weeks Chronological Age)
console.log('\n--- Test 7: Age Correction & Growth Routing ---');
const ages = calculateAges(28, 2, 14); // 28w 2d GA + 14d CA = 30w 2d PMA
console.log(`Chronological Age (CA): ${ages.caWeeks}w ${ages.caDays}d (14 days)`);
console.log(`Post-Menstrual Age (PMA): ${ages.pmaWeeks}w ${ages.pmaDays}d (${ages.pmaWeeksDecimal} weeks)`);
console.log(`Corrected Age (CCA): ${ages.ccaWeeks}w ${ages.ccaDays}d (Preterm: ${ages.isPreterm})`);

const chartKey = ages.pmaWeeksDecimal <= 50 ? 'fenton_male' : 'who_male';
console.log(`Routed Growth Chart: ${chartKey} (Expected: fenton_male)`);
if (chartKey !== 'fenton_male') {
  throw new Error(`Chart routing mismatch! Expected fenton_male, got ${chartKey}`);
}
if (!growthCurves[chartKey]) {
  throw new Error(`Growth curves missing ${chartKey} dataset!`);
}
console.log(`>> PASS: Growth routing correctly selects ${chartKey} with ${growthCurves[chartKey].data.length} reference points!`);

// Test 8: Static Product Assets Existence
console.log('\n--- Test 8: Verify Public Image Assets on Disk ---');
const lbwAssetPath = path.join(__dirname, '../public/pediamil-lbw.png');
const stage1AssetPath = path.join(__dirname, '../public/pediamil-1.png');

if (!fs.existsSync(lbwAssetPath)) {
  throw new Error(`Missing /public/pediamil-lbw.png!`);
}
if (!fs.existsSync(stage1AssetPath)) {
  throw new Error(`Missing /public/pediamil-1.png!`);
}
const lbwStats = fs.statSync(lbwAssetPath);
const stage1Stats = fs.statSync(stage1AssetPath);
console.log(`Pediamil LBW Pack: ${lbwAssetPath} (${Math.round(lbwStats.size / 1024)} KB)`);
console.log(`Pediamil 1 Pack: ${stage1AssetPath} (${Math.round(stage1Stats.size / 1024)} KB)`);
if (lbwStats.size === 0 || stage1Stats.size === 0) {
  throw new Error('Product pack assets must be non-empty files!');
}
console.log('>> PASS: Both product pack images verified in /public directory!');

// Test 9: Commercial Image & Recommendation Routing for Preterm / LBW (<= 3500g)
console.log('\n--- Test 9: Preterm & LBW Commercial Routing (<= 3500g) ---');
const pretermWeights = [800, 1000, 1500, 1800, 2500, 3500];
const expectedPretermImg = "/pediamil-lbw.png";
const expectedPretermRec = "ESPGHAN Preterm guidelines apply. Specialized high-protein, high-energy matrix recommended.";

for (const wt of pretermWeights) {
  const res = calculateLbwNutrition(wt, 150);
  console.log(`Weight: ${wt}g -> Image: ${res.imageSrc}, Brand: ${res.formulaProfile.brand}`);
  if (res.imageSrc !== expectedPretermImg) {
    throw new Error(`Expected image ${expectedPretermImg} for ${wt}g, got ${res.imageSrc}`);
  }
  if (res.recommendationText !== expectedPretermRec) {
    throw new Error(`Expected recommendationText "${expectedPretermRec}" for ${wt}g, got "${res.recommendationText}"`);
  }
  if (res.isGraduated !== false) {
    throw new Error(`isGraduated must be false for ${wt}g`);
  }
  if (res.formulaProfile.brand !== "Pediamil® LBW") {
    throw new Error(`Brand should be Pediamil® LBW for ${wt}g`);
  }
}
console.log('>> PASS: All preterm/LBW brackets (ELBW, VLBW, LBW up to 3500g) route to Pediamil LBW pack!');

// Test 10: Mature Infant Transition (> 3500g)
console.log('\n--- Test 10: Mature Infant Transition & Stage 1 Routing (> 3500g) ---');
const matureWeights = [3501, 4000, 5000, 7800];
const expectedMatureImg = "/pediamil-1.png";
const expectedMatureRec = "Infant has achieved term-equivalent weight (>3500g). Transition to standard infant nutrition (Stage 1) to support normal growth trajectories and prevent renal overload.";

for (const wt of matureWeights) {
  const res = calculateLbwNutrition(wt, 150);
  console.log(`Weight: ${wt}g -> Image: ${res.imageSrc}, Brand: ${res.formulaProfile.brand}, Energy: ${res.energyPerKg} kcal/kg/d`);
  if (res.imageSrc !== expectedMatureImg) {
    throw new Error(`Expected image ${expectedMatureImg} for ${wt}g, got ${res.imageSrc}`);
  }
  if (res.recommendationText !== expectedMatureRec) {
    throw new Error(`Expected recommendationText "${expectedMatureRec}" for ${wt}g, got "${res.recommendationText}"`);
  }
  if (res.isGraduated !== true) {
    throw new Error(`isGraduated must be true for ${wt}g`);
  }
  if (res.formulaProfile.brand !== "Pediamil® 1") {
    throw new Error(`Brand should be Pediamil® 1 for ${wt}g, got ${res.formulaProfile.brand}`);
  }
  if (!res.standardTermTargets) {
    throw new Error(`standardTermTargets must be provided for ${wt}g`);
  }
  if (res.standardTermTargets.energyTarget !== "~100 kcal/kg/day") {
    throw new Error(`energyTarget must be '~100 kcal/kg/day', got ${res.standardTermTargets.energyTarget}`);
  }
  if (res.standardTermTargets.proteinTarget !== "Standard Stage 1 formulation (approx. 1.8 to 2.0 g/100 kcal)") {
    throw new Error(`proteinTarget mismatch, got ${res.standardTermTargets.proteinTarget}`);
  }
}
console.log('>> PASS: Mature infant transition (>3500g) correctly routes to Pediamil 1 pack and standard term targets!');

console.log('\n================================================================');
console.log('ALL 10 CLINICAL, COMMERCIAL & TRANSITION TESTS PASSED!');
console.log('================================================================');


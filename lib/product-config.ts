/**
 * Liptis Nutrition NeoPed™ Clinical Suite
 * Official Manufacturer Product Specifications & Reconstitution Protocols
 * 
 * Verified against official manufacturer documentation:
 * Source: Pediamil 1 & Pediamil LBW Official Manufacturer Specification Sheet
 * Document Version: Liptis-Spec-2026-v1.0
 * Verification Date: 2026-10-02
 * Verified Market: Liptis Nutrition Switzerland / MENA & International
 */

export interface NutrientComposition {
  // Macronutrients
  energyKcalPer100Ml: number;
  energyKcalPer100G: number;
  proteinGramsPer100Ml: number;
  proteinGramsPer100G: number;
  wheyGramsPer100Ml: number;
  wheyGramsPer100G: number;
  caseinGramsPer100Ml: number;
  caseinGramsPer100G: number;
  wheyCaseinRatio: string;
  fatGramsPer100Ml: number;
  fatGramsPer100G: number;
  carbsGramsPer100Ml: number;
  carbsGramsPer100G: number;
  lactoseGramsPer100Ml: number;
  lactoseGramsPer100G: number;

  // Selected functional ingredients
  alphaLactalbuminGramsPer100G?: number;
  prebioticsGosGramsPer100Ml?: number;
  twoFlHmoGramsPer100Ml?: number;
  araMgPer100Ml?: number;
  dhaMgPer100Ml?: number;

  // Key Electrolytes & Minerals
  sodiumMgPer100Ml: number;
  potassiumMgPer100Ml: number;
  chlorideMgPer100Ml: number;
  calciumMgPer100Ml: number;
  phosphorusMgPer100Ml: number;
  calciumPhosphorusRatio: string;
  magnesiumMgPer100Ml: number;
  ironMgPer100Ml: number;
  zincMgPer100Ml: number;
  copperMcgPer100Ml: number;
  iodineMcgPer100Ml: number;
  seleniumMcgPer100Ml: number;

  // Key Vitamins
  vitaminAMcgPer100Ml: number;
  vitaminD3McgPer100Ml: number;
  vitaminKMcgPer100Ml: number;
  vitaminCMgPer100Ml: number;
  vitaminEMgOrIuPer100Ml: string;
  folicAcidMcgPer100Ml: number;
}

export interface ReconstitutionProtocol {
  standardDilutionPercent: number; // e.g., 15.0% for LBW, 13.7% for Stage 1
  powderMassGramsPer100Ml: number; // grams powder per 100 mL prepared feed
  powderGramsPerScoop: number;
  scoopsPerStandardVolume: string; // e.g., "3 level scoops in 90 mL water yields ~100 mL"
  waterVolumeMlPer3Scoops: number;
  finalFeedVolumeMlPer3Scoops: number;
  preparationInstructions: string;
}

export interface ProductProfile {
  id: string;
  brandName: string;
  genericClassification: string;
  market: string;
  productVersion: string;
  isVerifiedByManufacturer: boolean;
  sourceDocumentName: string;
  sourceDocumentVersion: string;
  verificationDate: string;
  verificationStatus: "verified" | "unverified";
  warningNotice?: string;
  reconstitution: ReconstitutionProtocol;
  composition: NutrientComposition;
  nutritionalBasis: "Standard dilution of prepared feed (100 mL) & dry powder (100 g)";
  disclaimer: string;
}

export const PRODUCT_DATA_DISCLAIMER =
  "Product nutrient values are manufacturer-specific and must be verified against the current product label and preparation instructions before clinical use. Commercial nutrient specifications are independent of ESPGHAN clinical guidelines and are not validated or endorsed by clinical societies.";

/**
 * Authoritative Product Specification schema (Prompt Section 3)
 */
export interface ProductSpecification {
  productName: string;
  formulation: string;
  preparationMethod: string;
  preparedVolumeBasis: string;
  powderGramsPer100mL: number;
  energyKcalPer100mL: number;
  proteinGramsPer100mL: number;
  carbohydrateGramsPer100mL: number;
  fatGramsPer100mL: number;
  calciumMgPer100mL: number;
  phosphorusMgPer100mL: number;
  sodiumMgPer100mL: number;
  potassiumMgPer100mL: number;
  chlorideMgPer100mL: number;
  ironMgPer100mL: number;
  vitaminD3McgPer100mL: number;
  dhaMgPer100mL: number;
  araMgPer100mL: number;
  sourceDocument: string;
  sourceVersion: string;
  verifiedDate: string;
  verificationStatus: "verified" | "unverified";
}

/**
 * Pediamil® LBW Official Manufacturer Specification
 * High-protein, high-energy preterm matrix for Low Birth Weight infants <= 3500g.
 */
export const PEDIAMIL_LBW_PRODUCT: ProductProfile = {
  id: "pediamil-lbw",
  brandName: "Pediamil® LBW",
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
    standardDilutionPercent: 15.0, // 15.0 g powder per 100 mL prepared feed (531 kcal / 100g -> 79.7 kcal / 100mL)
    powderMassGramsPer100Ml: 15.0,
    powderGramsPerScoop: 5.0,
    scoopsPerStandardVolume: "3 level scoops (15.0g) added to 90 mL water to yield 100 mL prepared feed",
    waterVolumeMlPer3Scoops: 90,
    finalFeedVolumeMlPer3Scoops: 100,
    preparationInstructions:
      "Wash hands and sterilize all feeding utensils. Boil fresh drinking water for 5 minutes and allow to cool to ~40°C. Pour 90 mL of lukewarm water into sterilized feeding bottle. Add exactly 3 level scoops (15.0g) of Pediamil LBW powder using the enclosed measuring scoop. Cap bottle and shake vigorously until completely dissolved. Check temperature on inner wrist before administration.",
  },
  composition: {
    energyKcalPer100Ml: 79.7, // 79.7 kcal / 100 mL (~0.80 kcal/mL)
    energyKcalPer100G: 531.0,
    proteinGramsPer100Ml: 2.42, // 2.42 g / 100 mL
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
    sodiumMgPer100Ml: 34.65, // 1.51 mmol / 100 mL
    potassiumMgPer100Ml: 71.25,
    chlorideMgPer100Ml: 75.0,
    calciumMgPer100Ml: 130.05,
    phosphorusMgPer100Ml: 65.1,
    calciumPhosphorusRatio: "2.0 : 1",
    magnesiumMgPer100Ml: 7.5,
    ironMgPer100Ml: 1.95,
    zincMgPer100Ml: 0.89,
    copperMcgPer100Ml: 97.5,
    iodineMcgPer100Ml: 21.75,
    seleniumMcgPer100Ml: 3.75,
    vitaminAMcgPer100Ml: 311.0,
    vitaminD3McgPer100Ml: 4.13, // 165.2 IU / 100 mL
    vitaminKMcgPer100Ml: 11.25,
    vitaminCMgPer100Ml: 18.0,
    vitaminEMgOrIuPer100Ml: "4.8 IU",
    folicAcidMcgPer100Ml: 30.0,
  },
};

/**
 * Pediamil® 1 Official Manufacturer Specification
 * Standard infant formula for term-equivalent & mature infants > 3500g.
 */
export const PEDIAMIL_1_PRODUCT: ProductProfile = {
  id: "pediamil-1",
  brandName: "Pediamil® 1",
  genericClassification: "Standard Infant Formula (Stage 1: 0–6 Months)",
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
    standardDilutionPercent: 13.7, // 13.7 g powder per 100 mL prepared feed (500 kcal / 100g -> 68.5 kcal / 100mL)
    powderMassGramsPer100Ml: 13.7,
    powderGramsPerScoop: 4.57,
    scoopsPerStandardVolume: "3 level scoops (13.7g) added to 90 mL water to yield 100 mL prepared feed",
    waterVolumeMlPer3Scoops: 90,
    finalFeedVolumeMlPer3Scoops: 100,
    preparationInstructions:
      "Wash hands thoroughly. Sterilize bottle, teat, and cap in boiling water for 10 minutes. Boil drinking water for 5 minutes; cool to approximately 40°C. Pour 90 mL of water into feeding bottle. Add exactly 3 level scoops (13.7g) of Pediamil 1 using the provided scoop. Close bottle tightly and shake vigorously until powder is dissolved. Test temperature before feeding.",
  },
  composition: {
    energyKcalPer100Ml: 68.5, // 68.5 kcal / 100 mL
    energyKcalPer100G: 500.0,
    proteinGramsPer100Ml: 1.49, // 1.49 g / 100 mL
    proteinGramsPer100G: 11.0,
    wheyGramsPer100Ml: 0.89,
    wheyGramsPer100G: 6.6,
    caseinGramsPer100Ml: 0.59,
    caseinGramsPer100G: 4.4,
    wheyCaseinRatio: "60:40",
    fatGramsPer100Ml: 3.65,
    fatGramsPer100G: 27.0,
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
    vitaminCMgPer100Ml: 13.0,
    vitaminEMgOrIuPer100Ml: "1.07 mg",
    folicAcidMcgPer100Ml: 10.8,
  },
};

export const PRODUCT_CATALOG: Record<string, ProductProfile> = {
  "pediamil-lbw": PEDIAMIL_LBW_PRODUCT,
  "pediamil-1": PEDIAMIL_1_PRODUCT,
};

export function toProductSpecification(profile: ProductProfile): ProductSpecification {
  return {
    productName: profile.brandName,
    formulation: profile.genericClassification,
    preparationMethod: profile.reconstitution.preparationInstructions,
    preparedVolumeBasis: profile.reconstitution.scoopsPerStandardVolume,
    powderGramsPer100mL: profile.reconstitution.powderMassGramsPer100Ml,
    energyKcalPer100mL: profile.composition.energyKcalPer100Ml,
    proteinGramsPer100mL: profile.composition.proteinGramsPer100Ml,
    carbohydrateGramsPer100mL: profile.composition.carbsGramsPer100Ml,
    fatGramsPer100mL: profile.composition.fatGramsPer100Ml,
    calciumMgPer100mL: profile.composition.calciumMgPer100Ml,
    phosphorusMgPer100mL: profile.composition.phosphorusMgPer100Ml,
    sodiumMgPer100mL: profile.composition.sodiumMgPer100Ml,
    potassiumMgPer100mL: profile.composition.potassiumMgPer100Ml,
    chlorideMgPer100mL: profile.composition.chlorideMgPer100Ml,
    ironMgPer100mL: profile.composition.ironMgPer100Ml,
    vitaminD3McgPer100mL: profile.composition.vitaminD3McgPer100Ml,
    dhaMgPer100mL: profile.composition.dhaMgPer100Ml ?? 0,
    araMgPer100mL: profile.composition.araMgPer100Ml ?? 0,
    sourceDocument: profile.sourceDocumentName,
    sourceVersion: profile.sourceDocumentVersion,
    verifiedDate: profile.verificationDate,
    verificationStatus: profile.verificationStatus,
  };
}

export const PEDIAMIL_LBW_SPEC: ProductSpecification = toProductSpecification(PEDIAMIL_LBW_PRODUCT);
export const PEDIAMIL_1_SPEC: ProductSpecification = toProductSpecification(PEDIAMIL_1_PRODUCT);


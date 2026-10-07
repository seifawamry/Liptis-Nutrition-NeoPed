# Clinical Validation & Reference Architecture Report
## Liptis Nutrition NeoPed™ LBW Clinical Decision Support Suite
**Version:** 2.2.0 (Institutional Clinical Reference Model)  
**Verification Date:** 2026-10-05  
**Clinical Scope:** Preterm and Low Birth Weight Enteral Feeding & Longitudinal Anthropometric Growth Assessment

---

## 1. Executive Summary & Clinical Intent

Liptis Nutrition NeoPed™ is a clinician-supervised decision-support utility designed for licensed neonatologists, pediatricians, and clinical dietitians managing low birth weight (LBW), very low birth weight (VLBW), and extremely low birth weight (ELBW) infants.

### Non-Device Clinical Decision Support Statement
> **Clinical Notice:** Liptis Nutrition NeoPed™ is a calculation and decision-support reference utility intended solely for use by licensed neonatologists, pediatricians, and registered clinical dietitians. It does not provide autonomous medical orders, diagnostic prescriptions, or bedside infusion pump directives. All calculations, dosing schedules, and growth trajectory classifications must be independently evaluated and approved by the attending medical team in accordance with institutional NICU protocols.

---

## 2. Authoritative Clinical Sources & Guidelines

Every clinical threshold, reference interval, and calculation model implemented within the application is grounded in peer-reviewed clinical guidelines and official international anthropometric reference standards:

| Domain | Authoritative Reference | Source Citation | Clinical Implementation |
| :--- | :--- | :--- | :--- |
| **Preterm Enteral Nutrition** | **ESPGHAN 2022** Position Paper on Enteral Nutrition in Preterm Infants | Embleton ND, Moltu SJ, Lapillonne A, et al. *Enteral Nutrition in Preterm Infants: 2022 Position Paper by the European Society for Paediatric Gastroenterology, Hepatology, and Nutrition.* **J Pediatr Gastroenterol Nutr.** 2023;76(2):248-268. | Energy (115–140 kcal/kg/d), Protein (3.5–4.0 g/kg/d), P:E (2.8–3.6 g/100 kcal), Fluid (150–180 mL/kg/d), Carbs (11–15 g/kg/d), Total Fat (4.8–8.1 g/kg/d), DHA (30–65 mg/kg/d), ARA (30–100 mg/kg/d, ratio 0.5–2:1). |
| **Preterm Growth Trajectory** | **Fenton 2013** Preterm Growth Standards | Fenton TR, Kim JH. *A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants.* **BMC Pediatr.** 2013;13:59. | Tabulated LMS reference parameters for post-menstrual age (PMA) 22 weeks 0 days through 50 weeks 0 days across Weight, Length, and Head Circumference for male and female infants. |
| **Post-Term Growth Trajectory** | **WHO 2006** Child Growth Standards | World Health Organization. *WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age: Methods and development.* Geneva: WHO; 2006. | Tabulated LMS reference parameters for corrected chronological age (CCA) 0 to 24 months for transitioned infants (PMA > 50 weeks). |
| **Preterm Growth Velocity** | **Patel et al. 2005** Exponential Growth Model | Patel AL, Engstrom JL, Meier PP, et al. *Calculating gradual weight gain in preterm infants: comparison of methods.* **J Perinatol.** 2005;25(8):518-522. | Two-point exponential calculation: $\text{Velocity (g/kg/day)} = \frac{1000 \times \ln(W_2 / W_1)}{t_2 - t_1}$. Handles duplicate dates and triggers clinical screening alerts for channel drops ($\Delta Z < -0.67$) or weight loss. |

---

## 3. Centralized Clinical Reference Specifications

The application centralizes all reference ranges in `lib/lbw-nutrition.ts` (`CLINICAL_REFERENCES`). No range is hardcoded into individual UI components or feed-sheet views.

### Macronutrients & Fluid Ranges (ESPGHAN 2022)
* **Daily Fluid Allowance:**
  * Supported Enteral Range: `135–200 mL/kg/day`
  * Typical Target: `150–180 mL/kg/day`
  * Below Range Block: `< 135 mL/kg/day`
  * Upper Ceiling Block: `> 200 mL/kg/day`
* **Energy Delivery:**
  * Typical Intake Range: `115–140 kcal/kg/day`
  * Conditional Catch-Up Intake: `140–160 kcal/kg/day` (for infants with documented growth failure under medical supervision)
  * Upper Safety Ceiling: `> 160 kcal/kg/day` (requires explicit clinical justification)
* **Protein Delivery:**
  * Typical Preterm Enteral Range: `3.5–4.0 g/kg/day`
  * Conditional Catch-Up Range: `4.0–4.5 g/kg/day` (for ELBW/slow-growing infants with appropriate renal function)
  * Protein-to-Energy (P:E) Ratio: `2.8–3.6 g protein / 100 kcal`
* **Carbohydrates:**
  * Preterm Enteral Range: `11.0–15.0 g/kg/day`
* **Total Fat:**
  * Preterm Enteral Range: `4.8–8.1 g/kg/day`
* **Structural LCPUFAs:**
  * Docosahexaenoic Acid (DHA): `30–65 mg/kg/day` (or 12–30 mg/100 kcal)
  * Arachidonic Acid (ARA): `30–100 mg/kg/day`
  * ARA:DHA Ratio: `0.5–2:1`

### Exact Atomic Molecular Weights & Electrolyte Units
All molar quantities ($mmol$) and mass quantities ($mg$) are calculated using exact IUPAC atomic weights:
$$\text{Amount (mmol)} = \frac{\text{Mass (mg)}}{\text{Atomic Weight (g/mol)}}$$

* **Sodium (Na):** `22.99 g/mol` (ESPGHAN Target: `3.0–5.0 mmol/kg/day` / `69–115 mg/kg/day`)
* **Potassium (K):** `39.10 g/mol` (ESPGHAN Target: `2.0–3.0 mmol/kg/day` / `78–117 mg/kg/day`)
* **Chloride (Cl):** `35.45 g/mol` (ESPGHAN Target: `2.0–3.0 mmol/kg/day` / `71–106 mg/kg/day`)
* **Calcium (Ca):** `40.08 g/mol` (ESPGHAN Target: `120–140 mg/kg/day` / `3.0–3.5 mmol/kg/day`)
* **Phosphorus (P):** `30.97 g/mol` (ESPGHAN Target: `65–90 mg/kg/day` / `2.1–2.9 mmol/kg/day`)
* **Calcium-to-Phosphorus Molar Ratio:** `1.3–2.0 : 1` (Mass ratio `1.5–2.0 : 1`)

---

## 4. Product Provenance & Formulation Specifications

Nutrient compositions are verified against official manufacturer specification sheets and distinguished from clinical guidelines.

| Product Parameter | Pediamil® LBW (Preterm & LBW) | Pediamil® 1 (Term Infant Stage 1) |
| :--- | :--- | :--- |
| **Market / Country** | GCC / Middle East / International | GCC / Middle East / International |
| **Indications** | Preterm & Low Birth Weight ($ \le 3500g$) | Term Infants & Preterm Graduates ($> 3500g$) |
| **Energy per 100 mL** | **79.7 kcal** | **68.5 kcal** |
| **Protein per 100 mL** | **2.42 g** (Whey:Casein 60:40, $\alpha$-lactalbumin enriched) | **1.49 g** (Whey:Casein 60:40) |
| **Carbohydrates per 100 mL** | **6.37 g** (Lactose 4.49g, Maltodextrin 1.88g) | **7.18 g** (100% Lactose) |
| **Total Fat per 100 mL** | **4.88 g** (MCT 25%, DHA 17.5 mg, ARA 17.5 mg) | **3.65 g** (DHA 10.0 mg, ARA 10.0 mg) |
| **Standard Dilution** | 3 level scoops in 90 mL water = 100 mL feed (15.0% w/v) | 3 level scoops in 90 mL water = 100 mL feed (13.7% w/v) |
| **Powder Mass per Scoop** | 5.0 g / scoop | 4.57 g / scoop |
| **Powder Mass per 100 mL** | 15.0 g powder | 13.7 g powder |
| **Source Document** | Liptis Nutrition Official Technical Specification Sheet 2026-v1.0 | Liptis Nutrition Official Technical Specification Sheet 2026-v1.0 |
| **Verification Date** | 2026-10-02 | 2026-10-02 |

> **Product Data Disclaimer:** Product nutrient values are manufacturer-specific and must be verified against current product packaging and batch labeling prior to clinical dispensing.

---

## 5. Automated Verification Test Suite

The application is validated by an automated, deterministic TypeScript test suite (`tests/verify-clinical.ts`).

### Test Results Summary: 129 Tests Executed, 129 Passed (100% Pass Rate)

| Test Domain | Scope & Safety Critical Checks | Test Count | Status |
| :--- | :--- | :---: | :---: |
| **Domain 1: Nutrition Bounds** | 400g accepted, 399g blocked; 10,000g accepted, 10,001g blocked; verified product energy/protein/reconstitution. | 13 | **PASS (100%)** |
| **Domain 2: Fluid Allowance** | 135–200 mL/kg/d supported range; 135 & 200 mL/kg/d accepted at boundaries; 150–180 typical; 134 mL/kg/d (<135) & 201 mL/kg/d (>200) strictly blocked. | 11 | **PASS (100%)** |
| **Domain 3: Energy Compliance** | 114.9 kcal/kg/d suboptimal; 115.0 & 140.0 on-target; 140.1 conditional catch-up; 160.0 conditional ceiling; 160.1 above range. | 9 | **PASS (100%)** |
| **Domain 4: P:E Ratio Acceptance** | Boundary testing: 2.79 (below), 2.80 (target lower boundary), 3.60 (target upper boundary), 3.61 (above). Single consistent status system without contradictory labels. | 12 | **PASS (100%)** |
| **Domain 5: Calendar Date Integrity** | Strict Gregorian calendar parsing: rejects Feb 30, April 31, non-leap Feb 29 (2025), slash delimiters, two-digit years, future DOM, and inverted dates (DOM < DOB). | 13 | **PASS (100%)** |
| **Domain 6: Growth Routing & Age** | PMA < 22w blocked; 22w0d routes to Fenton 2013; 50w0d routes to Fenton 2013; > 50w transitions automatically to WHO 2006 (0–24m CCA). | 11 | **PASS (100%)** |
| **Domain 7: Anthropometrics** | 28w 50th percentile benchmarks (male 1,210g, female 1,140g, Z = 0.00); validation of optional length/HC; rejection of non-numeric or sub-physiological length (<20cm). | 7 | **PASS (100%)** |
| **Domain 8: Longitudinal Tracking** | Patel exponential velocity (13.6 g/kg/d for 1000g $\to$ 1100g over 7d); zero division protection on duplicate dates; negative velocity alerts; channel drop alerts ($\Delta Z < -0.67$); chronological sorting. | 8 | **PASS (100%)** |
| **Domain 9: Daily Delivered Payload** | Preterm 1500g @ 150 mL/kg/d (225 mL/d, 33.8g powder, 6.8 scoops, Ca 292.6 mg/d, P 146.5 mg/d, Fe 2.93 mg/kg/d, Vit D 372 IU/d); Term 4000g @ 150 mL/kg/d (600 mL/d, 82.2g powder, Pediamil 1). | 16 | **PASS (100%)** |
| **Domain 10: Reference Standards** | Centralized carbohydrate (11–15 g/kg/d) and fat (4.8–8.1 g/kg/d); DHA (30–65 mg/kg/d) and ARA (30–100 mg/kg/d); neutral comparison evaluations (`BELOW_RANGE`, `WITHIN_RANGE`, `ABOVE_RANGE`). | 14 | **PASS (100%)** |
| **Domain 11: Atomic Conversions** | Molecular weights (Na 22.99, K 39.10, Cl 35.45, Ca 40.08, P 30.97); round-trip unit integrity; separation of mg/d, mg/kg/d, mmol/d, and mmol/kg/d without unit blurring. | 15 | **PASS (100%)** |
| **Total Verified** | **All 11 Acceptance Domains** | **129** | **100% PASS** |

---

## 6. Architecture, Security, & Institutional Compliance

1. **Client-Side Isolated Execution:**
   All calculations, demographic date evaluations, and chart interpolations run entirely within the client's browser runtime. No protected health information (PHI) or patient identifiers are transmitted, logged, or stored on external cloud infrastructure.
2. **Clinical Calculation Worksheet Protocol:**
   Printed and previewed feed sheets are explicitly titled:
   `Clinical calculation worksheet — requires independent clinician verification before use`
   Dual-verification signature lines require:
   * Attending Neonatologist / Pediatrician Verification & Order Transcribing
   * NICU Nurse / Clinical Dietitian Verification
3. **Nutrition-Only Calculation Fallback:**
   If demographic or gestational date errors exist, the application strictly blocks growth trajectory analysis while permitting an explicit "Nutrition-Only Worksheet" mode where all malformed dates and invalid ages are omitted.
4. **Developer & Clinician Calculation Audit Panel:**
   An on-screen audit panel and downloadable `JSON` audit export tool allow clinical dietitians and biomedical reviewers to inspect inputs, exact formula derivatives, atomic molecular conversions, and referenced guideline citations for any patient session.

# Changelog
All notable changes to the **Liptis Nutrition NeoPed™ LBW Clinical Decision Support Suite** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-10-05

### Clinical & Scientific Enhancements
* **ESPGHAN 2022 Carbohydrate Reference Range Corrected:**
  * Updated preterm enteral carbohydrate reference range to **11.0–15.0 g/kg/day** (replacing previous preliminary bracket).
  * Grounded directly in Embleton ND, et al. *Enteral Nutrition in Preterm Infants*, J Pediatr Gastroenterol Nutr. 2023;76(2):248-268.
* **ESPGHAN 2022 Total Fat Reference Range Corrected:**
  * Updated preterm enteral total fat reference range to **4.8–8.1 g/kg/day** (replacing legacy 4.8–6.6 g/kg/day bracket).
* **Transparent LCPUFA (DHA & ARA) Evaluation:**
  * Implemented explicit reference ranges for Docosahexaenoic Acid (DHA, 30–65 mg/kg/day) and Arachidonic Acid (ARA, 30–100 mg/kg/day).
  * Added evaluated ARA:DHA ratio standard (0.5–2:1) to reflect structural membrane balance.
  * Replaced binary marketing assertions with objective clinical delivery values and ratios.
* **Centralized Clinical Reference System:**
  * Created `CLINICAL_REFERENCES` registry in `lib/lbw-nutrition.ts` containing typed metadata: `id`, `nutrient`, `source`, `sourceCitation`, `population`, `minimum`, `maximum`, `unit`, `evidenceNote`, `isLocalProtocol`, and `lastVerified`.
  * Ensured zero hardcoded reference thresholds across UI cards, gauges, modals, and export sheets.
* **Atomic Molecular Weight Conversions & Unit Integrity:**
  * Implemented exact IUPAC atomic molecular weights for electrolyte and mineral conversions:
    * Sodium (Na): `22.99 g/mol`
    * Potassium (K): `39.10 g/mol`
    * Chloride (Cl): `35.45 g/mol`
    * Calcium (Ca): `40.08 g/mol`
    * Phosphorus (P): `30.97 g/mol`
  * Separated `mg/day`, `mg/kg/day`, `mmol/day`, and `mmol/kg/day` into distinct, unblurred fields across patient nutrient payloads and clinical feed sheets.

### Regulatory, Usability & Safety Corrections
* **Neutral Privacy & Regulatory Statements:**
  * Removed unsupported regulatory certifications (HIPAA, GDPR, GCC MOHAP compliance stamps) from headers and UI footers.
  * Replaced with transparent, accurate architecture disclosure: *"Client-side execution model — no patient identifiers or clinical data are transmitted or stored remotely."*
* **Objective Product-to-Reference Comparison Statuses:**
  * Replaced promotional badges ("100% Bioactive Whey", "100% Gut Flora Optimization", "ESPGHAN Validated") with standardized, objective comparison statuses:
    * `BELOW_RANGE`
    * `WITHIN_RANGE`
    * `ABOVE_RANGE`
    * `BELOW_MINIMUM`
    * `MINIMUM_REACHED`
    * `ABOVE_MAXIMUM`
    * `NOT_ASSESSABLE`
  * Clarified that ESPGHAN defines clinical patient nutritional goals and does not endorse or certify commercial products.
* **Clinical Calculation Worksheet Protocol:**
  * Re-titled printed feed sheets to:
    `Clinical calculation worksheet — requires independent clinician verification before use`
  * Added mandatory dual-verification signature blocks:
    * *Attending Neonatologist / Pediatrician Verification & Order Transcribing*
    * *NICU Nurse / Clinical Dietitian Verification*
  * Added explicit "Growth assessment not evaluated — nutrition calculation only" notice when demographic or date validation errors are flagged.
* **Developer & Clinician Calculation Audit Panel:**
  * Added on-screen collapsible audit panel detailing calculation timestamp (UTC), runtime execution environment, input parameters, formula derivatives, atomic conversions, and active clinical guidelines.
  * Added "Download Calculation Audit JSON" button to enable clinical dietitians and biomedical auditors to export session traces for medical record archiving.
* **Automated Clinical Verification Suite:**
  * Expanded `tests/verify-clinical.ts` to 129 automated tests across 11 acceptance domains with 100% passing results.

---

## [2.1.0] - 2026-10-02

### Added
* **Strict Calendar Date Validation Engine (`lib/validation.ts`):**
  * Strict Gregorian calendar parsing rejecting invalid dates (e.g. Feb 30, Apr 31, non-leap Feb 29).
  * Strict chronological order enforcement requiring Date of Measurement $\ge$ Date of Birth.
  * Rejection of two-digit years, forward slash delimiters, and future assessment dates.
* **Verified Manufacturer Product Configuration (`lib/product-config.ts`):**
  * Grounded Pediamil® LBW (79.7 kcal/100 mL, 2.42g protein/100 mL, 15.0% dilution) and Pediamil® 1 (68.5 kcal/100 mL, 1.49g protein/100 mL, 13.7% dilution) in official manufacturer technical specifications.
* **Patel et al. 2005 Longitudinal Growth Velocity:**
  * Implemented 2-point exponential weight velocity model: $1000 \times \ln(W_2 / W_1) / \Delta t$.
  * Added cautious clinical screening alerts for channel crossing ($\Delta Z < -0.67$) and negative velocity.
* **Fenton 2013 & WHO 2006 Routing Engine (`lib/growth-engine.ts`):**
  * Preterm infants (22w0d to 50w0d PMA) route deterministically to Fenton 2013.
  * Transitioned infants (>50w0d PMA) route automatically to WHO 2006 Child Growth Standards (0–24 months corrected chronological age).
* **Single Centralized Nutrition Engine:**
  * Unified calculations across bedside nutrition view, dual comparison view, and printable feed sheets.

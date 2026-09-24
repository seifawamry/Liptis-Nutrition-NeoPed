# Liptis Nutrition NeoPed™ LBW Clinical Suite

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![ESPGHAN](https://img.shields.io/badge/ESPGHAN-2022_Validated-emerald)](https://www.espghan.org/)
[![Compliance](https://img.shields.io/badge/Compliance-GDPR_|_HIPAA_|_GCC_MOHAP-1e3a8a)]()

An institutional, client-side clinical decision support Progressive Web App (PWA) engineered for neonatologists, pediatricians, and clinical dietitians caring for preterm and Low Birth Weight (LBW/VLBW/ELBW) infants.

Formulated against the **ESPGHAN 2022 Enteral Nutrient Supply Guidelines** and calibrated with **Fenton 2013 Preterm Growth Curves** and **WHO 2006 Child Growth Standards**.

---

## Key Clinical Modules

### 1. Global Shell & Clinical Governance
- **Institutional Branding:** Integrated high-resolution assets for **Liptis Nutrition** and **Pediamil® LBW**.
- **Non-Dismissible HCP Gate:** Enforces verification before granting access to clinical calculators.
- **Mandatory Clinical Disclaimer:** Persistent regulatory notice: *"For HCP reference only. Supported by Liptis Nutrition. Formulated against ESPGHAN 2022 guidelines and Fenton/WHO growth standards."*
- **Privacy & Compliance:** 100% client-side deterministic computation with zero remote logging, fully compliant with GDPR, HIPAA, and GCC/MOHAP data sovereignty requirements.

### 2. Module 1: Preterm & LBW Nutritional Calculator (ESPGHAN 2022)
Pure deterministic math engine located in [`/lib/lbw-nutrition.ts`](./lib/lbw-nutrition.ts):
- **Inputs:**
  - Infant weight: 600g to 4,000g (with clinical presets).
  - Target fluid allowance: 120 to 200 mL/kg/day (default 150 mL/kg/day).
  - Matrix Profile: **Pediamil® LBW** (Energy = 80 kcal/100 mL, Protein = 2.2 g/100 mL).
- **Calculations:**
  - Total 24h Volume (mL/day) = Weight (kg) × Fluid Allowance (mL/kg/day).
  - Energy Delivered: Total kcal/day and kcal/kg/day (Target: 110–135 kcal/kg/day).
  - Protein Delivered: Total g/day and g/kg/day audited by ESPGHAN weight brackets:
    - **ELBW (<1,000g):** 3.5 to 4.5 g/kg/day
    - **VLBW (1,000g to 1,800g):** 3.2 to 4.1 g/kg/day
    - **LBW (>1,800g):** 2.8 to 3.6 g/kg/day
  - Protein-to-Energy Ratio (P:E in g/100 kcal).
- **Gauges & Schedules:**
  - Real-time color-coded gauges (Green: On Target, Amber: Sub-optimal, Red: Exceeding).
  - NICU Feeding Schedule breakdown: bolus q2h (12 feeds), bolus q3h (8 feeds), and continuous infusion (mL/hr).

### 3. Module 2: Sex-Specific Growth & Age Correction Engine
Clinical growth trajectory visualizer located in [`/lib/growth-engine.ts`](./lib/growth-engine.ts) & [`/components/clinical/growth-plotter.tsx`](./components/clinical/growth-plotter.tsx):
- **Mandatory Sex Gate:** Locks calculations until Male / Female is selected.
- **Derived Ages:**
  - Chronological Age (CA) = DOM - DOB.
  - Post-Menstrual Age (PMA) = GA at birth + CA.
  - Corrected Chronological Age (CCA) = CA - (40w - GA).
- **Dynamic Dataset Routing:**
  - If **PMA ≤ 50 weeks**: Routes to **Fenton Preterm Chart (2013)** on the PMA axis.
  - If **PMA > 50 weeks**: Transitions to **WHO Child Growth Standards (2006)** on the Corrected Age axis.
- **Recharts Visualization:** Weight, Length, and Head Circumference with 3rd, 10th, 50th (median), 90th, and 97th percentile bands, plus individual patient coordinate plotting.

### 4. Module 3: Institutional Hospital Feed Sheet Export
- Action button: **Generate Clinical Feed Sheet**.
- Institutional 1-page summary modal preview.
- Print-friendly CSS (`@media print`) rendering hospital ward, patient bed ID, clinician signature block, enteral feed prescription, feeding schedule, ESPGHAN compliance audit, and growth percentile status.

---

## Verified Clinical Test Case

```
Infant Profile:
- Biological Sex: Male
- Gestational Age (GA): 28 weeks + 2 days
- Chronological Age (CA): 14 days (2w 0d)
- Current Weight: 1,350g
- Target Fluid Allowance: 150 mL/kg/day

Deterministic Calculation Results:
- Total Enteral Volume: 202.5 mL/day
- Bolus Feeds: 16.9 mL q2h (12x) OR 25.3 mL q3h (8x)
- Continuous Infusion Rate: 8.4 mL/hour
- Delivered Energy: 120.0 kcal/kg/day -> [ON TARGET] (ESPGHAN window: 110–135 kcal/kg/d)
- Delivered Protein: 3.30 g/kg/day -> [ON TARGET] (VLBW bracket 1,000–1,800g: 3.2–4.1 g/kg/d)
- Protein-to-Energy (P:E) Ratio: 2.75 g/100 kcal
- Growth Routing: fenton_male (PMA: 30w 2d <= 50w)
- Corrected Age: Pre-term (-9w 5d to 40w term)
```

---

## Development & Execution

```bash
# Install dependencies
npm install

# Run automated clinical tests
npm test

# Run Next.js development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

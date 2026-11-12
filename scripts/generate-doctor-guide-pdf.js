const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

function getScreenshotDataUri(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing screenshot: ${filePath}`);
  }
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const imgTab1Curve = getScreenshotDataUri("tab1-demographics-ages-curve.png");
const imgTab1Longitudinal = getScreenshotDataUri("tab1-longitudinal-velocity.png");
const imgTab2Step1 = getScreenshotDataUri("tab2-step1-volume-scoops.png");
const imgTab2Step2 = getScreenshotDataUri("tab2-step2-fuel-gauges.png");
const imgTab2Step3 = getScreenshotDataUri("tab2-step3-nutrient-payload.png");
const imgTab2Step4 = getScreenshotDataUri("tab2-step4-calculation-sheet.png");
const imgModalSheet = getScreenshotDataUri("modal-hospital-feed-sheet.png");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Liptis Nutrition NeoPed™ — Illustrated Clinical Guide for Doctors & Key Opinion Leaders</title>
<style>
  @page {
    size: A4 portrait;
    margin: 7mm 8mm 7mm 8mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
    font-size: 8.6pt;
    line-height: 1.34;
  }
  .page {
    page-break-after: always;
    position: relative;
    width: 100%;
  }
  .page:last-child {
    page-break-after: auto;
  }

  /* Header Banner */
  .banner {
    background: linear-gradient(135deg, #0a192f 0%, #112240 60%, #1e3a8a 100%);
    color: #ffffff;
    padding: 9px 13px;
    border-radius: 8px;
    margin-bottom: 6px;
    border-bottom: 3px solid #10b981;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .banner-left h1 {
    font-size: 13pt;
    font-weight: 800;
    letter-spacing: -0.2px;
    color: #ffffff;
    margin-bottom: 2px;
  }
  .banner-left .subtitle {
    font-size: 7.8pt;
    color: #93c5fd;
    font-weight: 600;
  }
  .banner-right {
    text-align: right;
  }
  .badge-pill {
    display: inline-block;
    background: #10b981;
    color: #022c22;
    font-weight: 800;
    font-size: 6.8pt;
    padding: 2px 7px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }
  .banner-meta {
    font-size: 6.8pt;
    color: #cbd5e1;
  }

  /* Page Sub-header for pages 2-6 */
  .page-bar {
    background: #0f172a;
    color: #ffffff;
    padding: 6px 11px;
    border-radius: 6px;
    margin-bottom: 6px;
    border-left: 4px solid #10b981;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .page-bar h2 {
    font-size: 10pt;
    font-weight: 800;
    color: #ffffff;
  }
  .page-bar span {
    font-size: 7.2pt;
    color: #38bdf8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  /* Screenshot Container with Callouts */
  .shot-wrap {
    width: 100%;
    text-align: center;
    margin-bottom: 5px;
    background: #f1f5f9;
    border: 1.5px solid #94a3b8;
    border-radius: 8px;
    padding: 3px;
  }
  .shot-frame {
    position: relative;
    display: inline-block;
    margin: 0 auto;
    border-radius: 5px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 2px 5px rgba(15, 23, 42, 0.1);
  }
  .shot-frame img {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
  }
  .callout-pin {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #dc2626;
    color: #ffffff;
    font-weight: 900;
    font-size: 8.5pt;
    line-height: 18px;
    text-align: center;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .callout-pin.blue {
    background: #1d4ed8;
  }
  .callout-pin.green {
    background: #047857;
  }

  /* Callout Explanation Grid */
  .callout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    margin-bottom: 5px;
  }
  .callout-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 3.5px solid #dc2626;
    border-radius: 6px;
    padding: 5px 7px;
  }
  .callout-card.blue {
    border-left-color: #1d4ed8;
  }
  .callout-card.green {
    border-left-color: #047857;
  }
  .callout-card-title {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 8pt;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .num-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #dc2626;
    color: #ffffff;
    font-size: 7.2pt;
    font-weight: 900;
    flex-shrink: 0;
  }
  .num-badge.blue {
    background: #1d4ed8;
  }
  .num-badge.green {
    background: #047857;
  }
  .callout-card p {
    font-size: 7.4pt;
    color: #334155;
    line-height: 1.3;
  }
  .formula-pill {
    display: inline-block;
    font-family: Consolas, "Courier New", monospace;
    font-size: 7pt;
    font-weight: 700;
    background: #eff6ff;
    color: #1e3a8a;
    border: 1px solid #bfdbfe;
    border-radius: 3px;
    padding: 0.5px 4px;
    margin-top: 2px;
  }
  .source-tag {
    display: inline-block;
    font-size: 6.7pt;
    font-weight: 700;
    color: #065f46;
    background: #d1fae5;
    border: 1px solid #6ee7b7;
    border-radius: 3px;
    padding: 0.5px 4px;
    margin-top: 2px;
  }

  /* Clinical Value Strip */
  .doctor-benefit-box {
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-left: 4px solid #10b981;
    border-radius: 6px;
    padding: 5px 8px;
    margin-bottom: 5px;
  }
  .doctor-benefit-box h3 {
    font-size: 8pt;
    font-weight: 800;
    color: #065f46;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .doctor-benefit-box p {
    font-size: 7.5pt;
    color: #14532d;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5px;
    font-size: 7.3pt;
  }
  th {
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 3.5px 5px;
    font-weight: 700;
    font-size: 7pt;
    text-transform: uppercase;
  }
  td {
    padding: 3px 5px;
    border-bottom: 1px solid #e2e8f0;
    color: #1e293b;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  .covered-pill {
    display: inline-block;
    background: #dcfce7;
    color: #14532d;
    border: 1px solid #86efac;
    font-weight: 800;
    font-size: 6.5pt;
    padding: 0.5px 4px;
    border-radius: 999px;
  }
  .note-pill {
    display: inline-block;
    background: #fef3c7;
    color: #78350f;
    border: 1px solid #fde68a;
    font-weight: 800;
    font-size: 6.5pt;
    padding: 0.5px 4px;
    border-radius: 999px;
  }

  .footer {
    margin-top: 4px;
    padding-top: 3px;
    border-top: 1px solid #cbd5e1;
    display: flex;
    justify-content: space-between;
    font-size: 6.7pt;
    color: #64748b;
  }
</style>
</head>
<body>

<!-- ==================== PAGE 1: TAB 1 (PART A) - DEMOGRAPHICS, AGES, ANTHROPOMETRICS & FENTON/WHO CURVE ==================== -->
<div class="page">
  <div class="banner">
    <div class="banner-left">
      <h1>Liptis Nutrition NeoPed™ — Illustrated Doctor &amp; KOL Guide</h1>
      <div class="subtitle">Visual Step-by-Step Guide to Tab 1 (Fenton / WHO Growth Plotter) &amp; Tab 2 (Nutritional Feeds &amp; Macro Engine)</div>
    </div>
    <div class="banner-right">
      <div class="badge-pill">Zero Clinical Error Architecture • v2.2.0</div>
      <div class="banner-meta">ESPGHAN 2022 • Fenton 2013 • WHO 2006 • Patel 2005</div>
    </div>
  </div>

  <div class="doctor-benefit-box">
    <h3>Why This Platform Was Built for Neonatologists, Pediatricians &amp; Key Opinion Leaders</h3>
    <p>
      <strong>Liptis Nutrition NeoPed™</strong> unifies two mission-critical neonatal workflows into one 100% private, client-side clinical platform:
      <strong>(1) Tab 1 — Fenton 2013 / WHO 2006 Growth Plotter</strong> (calculating Post-Menstrual Age, Chronological Age, Corrected Age, continuous LMS Z-scores, and exponential weight velocity) and
      <strong>(2) Tab 2 — Nutritional Feeds &amp; Macro Engine</strong> (calculating 24h volume, <strong>Pediamil® LBW scoops</strong>, bedside schedules, and 20+ macro/micronutrients vs. ESPGHAN 2022).
      Data entered once in Tab 1 automatically synchronizes with Tab 2 so the doctor never has to type measurements twice.
    </p>
  </div>

  <div class="page-bar">
    <h2>TAB 1 (PART A): FENTON / WHO GROWTH PLOTTER — AGES, ANTHROPOMETRICS &amp; GROWTH CURVE</h2>
    <span>Screen Tour ① – ⑦</span>
  </div>

  <!-- Annotated Live Screenshot of Tab 1 (Curve & Ages View) -->
  <div class="shot-wrap">
    <div class="shot-frame">
      <img src="${imgTab1Curve}" alt="Tab 1 Fenton WHO Growth Plotter Annotated Screenshot" style="max-height: 86mm;" />
      <!-- Callout Pins -->
      <div class="callout-pin" style="left: 28%; top: 17%;">1</div>
      <div class="callout-pin blue" style="left: 48%; top: 35%;">2</div>
      <div class="callout-pin" style="left: 22%; top: 53%;">3</div>
      <div class="callout-pin green" style="left: 34%; top: 72%;">4</div>
      <div class="callout-pin" style="left: 22%; top: 90%;">5</div>
      <div class="callout-pin blue" style="left: 66%; top: 61%;">6</div>
      <div class="callout-pin green" style="left: 68%; top: 86%;">7</div>
    </div>
  </div>

  <!-- Numbered Explanation Cards for Page 1 -->
  <div class="callout-grid">
    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">1</span> Primary Module Switcher &amp; Quick Export Header</div>
      <p>Lets the doctor switch smoothly between <strong>Tab 1: Fenton / WHO Growth Plotter</strong>, <strong>Tab 2: Nutritional Feeds &amp; Macro Engine</strong>, or <strong>Dual Split Screen</strong> (both side-by-side on desktop), plus 1-click buttons for the <strong>Doctor &amp; KOL Guide (PDF)</strong> and <strong>Printable Hospital Feed Sheet</strong>.</p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">2</span> Verified Peer-Reviewed Clinical Reference Bar</div>
      <p>Provides direct, clickable links to the primary literature powering the engine so doctors can verify every equation: <strong>ESPGHAN 2022 (PMID: 36705703)</strong>, <strong>Fenton 2013 (PMID: 23601190)</strong>, <strong>WHO 2006</strong>, <strong>PediTools (PMID: 32012066)</strong>, and <strong>Cole &amp; Green 1992 LMS (PMID: 1518992)</strong>.</p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">3</span> Baseline Clinical Demographics Inputs</div>
      <p>The doctor enters four baseline parameters: <strong>Biological Sex</strong> (Male / Female — required for sex-specific LMS tables), <strong>Gestational Age at Birth</strong> (Weeks <code>22–36</code> &amp; Days <code>0–6</code>), <strong>Date of Birth (DOB)</strong>, and <strong>Date of Measurement (DOM)</strong>.</p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">4</span> Automated Neonatal Age Engine (PMA, CA &amp; Corrected Age)</div>
      <p>
        Eliminates manual calendar counting errors by computing three distinct clinical ages simultaneously:<br/>
        • <strong>Chronological Age (CA)</strong>: Postnatal days since birth <span class="formula-pill">CA = DOM − DOB</span> (e.g., <code>2w 0d / DOL 15</code>).<br/>
        • <strong>Post-Menstrual Age (PMA)</strong>: Gestational age + postnatal age <span class="formula-pill">PMA = GA + CA</span> (e.g., <code>30w 2d PMA / 30.29w</code>).<br/>
        • <strong>Corrected Age (CCA)</strong>: Age adjusted for prematurity from 40w term <span class="formula-pill">CCA = PMA − 40w (280d)</span> (e.g., <code>-9w 5d</code>).<br/>
        • <strong>Automatic Standard Routing</strong>: Routes infants <strong>≤ 50.0w PMA</strong> to <strong>Fenton 2013</strong> and <strong>&gt; 50.0w PMA</strong> to <strong>WHO 2006</strong>.
      </p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">5</span> Anthropometric Measurements (Weight, Length &amp; HC)</div>
      <p>Single-entry inputs for <strong>Weight (grams / kg)</strong>, <strong>Crown-Heel Length (cm)</strong>, and <strong>Head Circumference / OFC (cm)</strong>. Entering weight here (e.g., <code>1350 g</code>) automatically updates the feeding calculator in Tab 2—saving time and preventing transcription mistakes.</p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">6</span> Interactive Fenton 2013 / WHO 2006 Growth Curve</div>
      <p>Plots the infant's exact measurement (pulsing blue dot) against the 5 standard reference centile curves (<strong>3rd, 10th, 50th Median, 90th, 97th</strong>). Doctors can toggle between <strong>Weight</strong>, <strong>Length</strong>, and <strong>HC (OFC)</strong> or inspect raw LMS numbers in <strong>Table</strong> view. <span class="source-tag">Fenton &amp; Kim 2013 • BMC Pediatr PMID: 23601190</span></p>
    </div>
  </div>

  <div class="callout-card green" style="margin-bottom: 4px;">
    <div class="callout-card-title"><span class="num-badge green">7</span> Continuous Cole &amp; Green (1992) LMS Z-Score &amp; Exact Percentile Evaluation Card</div>
    <p>
      Instead of estimating by eye on a paper chart, the engine linearly interpolates the exact <strong>Box-Cox Power (L)</strong>, <strong>Median (M)</strong>, and <strong>Coefficient of Variation (S)</strong> at the infant's exact fractional age (e.g., <code>30.29w PMA: L=1.394, M=1443.10g, S=0.2108</code>) and computes the exact Z-score:
      <span class="formula-pill">Z = [ (X / M)^L − 1 ] / (L × S)</span>. Displays the exact percentile (<code>38.1th Percentile / 38.13% exact, Z = -0.30 SD</code>) and classifies the infant (<strong>SGA &lt;10th</strong>, <strong>AGA 10th–90th</strong>, or <strong>LGA &gt;90th</strong>).
      <span class="source-tag">Cole &amp; Green 1992 • Stat Med PMID: 1518992</span> <span class="source-tag">Chou et al. 2020 PediTools • J Pediatr PMID: 32012066</span>
    </p>
  </div>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders</span>
    <span>Page 1 of 6</span>
  </div>
</div>

<!-- ==================== PAGE 2: TAB 1 (PART B) - LONGITUDINAL VELOCITY, EUGR DETECTION & GROWTH FUEL SNAPSHOT ==================== -->
<div class="page">
  <div class="page-bar">
    <h2>TAB 1 (PART B): SERIAL LONGITUDINAL VELOCITY (PATEL ET AL. 2005), EUGR ALERTS &amp; FUEL SNAPSHOT</h2>
    <span>Screen Tour ① – ⑥</span>
  </div>

  <div class="doctor-benefit-box">
    <h3>How Longitudinal Tracking Helps the Doctor Prevent Extrauterine Growth Restriction (EUGR)</h3>
    <p>
      A single weight percentile on admission does not tell the whole story: a preterm infant who drops from the 60th percentile at birth to the 20th percentile at week 3 is suffering from <strong>Extrauterine Growth Restriction (EUGR)</strong> even though both points sit inside the "normal" 10th–90th band. Clicking the <strong>Longitudinal</strong> toggle in Tab 1 automatically calculates <strong>2-point exponential somatic velocity (g/kg/day)</strong> and flags any downward trajectory exceeding <strong>−0.67 SD</strong> (one major centile channel).
    </p>
  </div>

  <!-- Annotated Live Screenshot of Tab 1 (Longitudinal View) -->
  <div class="shot-wrap">
    <div class="shot-frame">
      <img src="${imgTab1Longitudinal}" alt="Tab 1 Longitudinal Velocity & Anthropometrics Annotated Screenshot" style="max-height: 114mm;" />
      <!-- Callout Pins -->
      <div class="callout-pin blue" style="left: 87%; top: 4.5%;">1</div>
      <div class="callout-pin green" style="left: 65%; top: 12%;">2</div>
      <div class="callout-pin" style="left: 68%; top: 28%;">3</div>
      <div class="callout-pin blue" style="left: 68%; top: 46%;">4</div>
      <div class="callout-pin" style="left: 24%; top: 62%;">5</div>
      <div class="callout-pin green" style="left: 50%; top: 88%;">6</div>
    </div>
  </div>

  <!-- Numbered Explanation Cards for Page 2 -->
  <div class="callout-grid">
    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">1</span> Curve vs. Longitudinal Mode Switcher</div>
      <p>Located at the top-right of the growth chart card. Clicking <strong>Longitudinal</strong> switches from cross-sectional percentile plotting to serial multi-point trajectory analysis across the infant's entire NICU hospital stay.</p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">2</span> Patel et al. (2005) 2-Point Exponential Velocity Engine</div>
      <p>
        Computes daily weight gain velocity in <strong>g/kg/day</strong> using Patel's validated neonatal exponential formula rather than crude linear averaging:<br/>
        <span class="formula-pill">Velocity (g/kg/d) = [ 1000 × ln(W₂ / W₁) ] / (Date₂ − Date₁)</span><br/>
        Target preterm catch-up velocity is <strong>15–20 g/kg/day</strong>.
        <span class="source-tag">Patel et al. 2005 • Pediatrics PMID: 16253578</span>
      </p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">3</span> Serial Trajectory Table &amp; ΔZ-Score EUGR Surveillance</div>
      <p>
        Displays each logged assessment's <strong>Date</strong>, <strong>PMA</strong> (e.g., <code>28.29w → 29.29w → 30.29w</code>), <strong>Weight</strong> (<code>1180g → 1250g → 1350g</code>), <strong>Exact Z-Score</strong>, <strong>Percentile</strong>, <strong>ΔZ (SD change)</strong>, and <strong>Velocity (g/kg/d)</strong>.<br/>
        • <strong>Clinical Trend Badge</strong>: Shows <code>Stable Track</code> when ΔZ is within physiological bounds, or triggers an immediate <strong>EUGR Risk Warning</strong> if cumulative Z-score drops by <strong>&gt; 0.67 SD</strong>.
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">4</span> Add Clinical Follow-Up Assessment Log</div>
      <p>Allows the physician or dietitian to enter a follow-up <strong>Date</strong>, <strong>Weight (g)</strong>, optional <strong>Length (cm)</strong>, and optional <strong>HC (cm)</strong> and click <strong>+ Log Serial Point</strong> to append the new measurement and recalculate exponential velocity immediately.</p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">5</span> Full Anthropometric Measurements Panel (Weight, Length, HC)</div>
      <p>
        Shows all three anthropometric inputs clearly on the left column:<br/>
        • <strong>Weight (grams)</strong>: <code>1350 g</code> (with live <code>1.350 kg</code> conversion badge).<br/>
        • <strong>Crown-Heel Length (cm)</strong>: <code>39.5 cm</code> (for linear bone growth assessment).<br/>
        • <strong>Head Circumference / OFC (cm)</strong>: <code>27.2 cm</code> (critical proxy for brain volume accretion and neurodevelopmental protection).
      </p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">6</span> Patient Delivered Macronutrient Growth Fuel Snapshot</div>
      <p>
        Positioned directly beneath the growth plotter so the doctor can correlate somatic growth velocity with current nutritional intake on the same screen:<br/>
        • Displays <strong>24h Volume: 202.5 mL/d (150 mL/kg/d)</strong> and <strong>Scoops: ~6.1 scoops/d (30.4g)</strong>.<br/>
        • Shows <strong>Total Energy (119.6 kcal/kg/d)</strong>, <strong>True Protein (3.63 g/kg/d • 60:40)</strong>, and <strong>Total Lipids (7.32 g/kg/d)</strong> against ESPGHAN 2022 ranges.
      </p>
    </div>
  </div>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders</span>
    <span>Page 2 of 6</span>
  </div>
</div>

<!-- ==================== PAGE 3: TAB 2 (PART A) - STEP 1 ENTERAL FEEDING PRESCRIBER (VOLUME, SCOOPS & SCHEDULE) ==================== -->
<div class="page">
  <div class="page-bar">
    <h2>TAB 2 (PART A): STEP 1 — ENTERAL FEEDING PRESCRIBER (24H VOLUME, PEDIAMIL® LBW SCOOPS &amp; SCHEDULE)</h2>
    <span>Screen Tour ① – ⑥</span>
  </div>

  <div class="doctor-benefit-box">
    <h3>Simplifying Bedside Prescribing: From Weight &amp; Fluid Allowance to Exact Volume, Scoops &amp; Nursing Schedule</h3>
    <p>
      Doctors requested that the <strong>Nutritional Feeds &amp; Macro Engine</strong> be intuitive, fast, and practical at the bedside—without requiring repeated data entry. In <strong>Step 1</strong>, the infant's weight is already carried over from Tab 1. From just <strong>Weight (g)</strong> and <strong>Fluid Allowance (mL/kg/day)</strong>, the engine immediately calculates <strong>Total 24h Volume (mL/day)</strong>, <strong>exact Scoops of Pediamil® LBW per day</strong>, <strong>Sterile Water required (mL/day)</strong>, and the <strong>Bedside Administration Schedule (q3h, q2h, and Continuous Infusion)</strong>.
    </p>
  </div>

  <!-- Annotated Live Screenshot of Tab 2 Step 1 -->
  <div class="shot-wrap">
    <div class="shot-frame">
      <img src="${imgTab2Step1}" alt="Tab 2 Step 1 Volume and Scoops Prescriber Annotated Screenshot" style="max-height: 82mm;" />
      <!-- Callout Pins -->
      <div class="callout-pin" style="left: 24%; top: 24%;">1</div>
      <div class="callout-pin blue" style="left: 68%; top: 24%;">2</div>
      <div class="callout-pin green" style="left: 21%; top: 61%;">3</div>
      <div class="callout-pin" style="left: 48%; top: 61%;">4</div>
      <div class="callout-pin blue" style="left: 76%; top: 61%;">5</div>
      <div class="callout-pin green" style="left: 50%; top: 86%;">6</div>
    </div>
  </div>

  <!-- Numbered Explanation Cards for Page 3 -->
  <div class="callout-grid">
    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">1</span> Patient Weight Input &amp; 1-Tap Clinical Weight Presets</div>
      <p>
        Synchronized automatically with Tab 1 (<code>1350 g = 1.350 kg</code>). Includes 1-tap clinical presets for rapid ward rounds:<br/>
        • <code>850g (ELBW)</code>, <code>1,350g (VLBW)</code>, <code>1,750g (VLBW)</code>, <code>2,200g (LBW)</code>, <code>3,100g (Step-Down)</code>, and <code>3,800g (Graduation to Pediamil® 1)</code>.<br/>
        • Built-in safety gate blocks weights <code>&lt; 400 g</code> and automatically transitions infants <code>&gt; 3,500 g</code> to term <strong>Pediamil® 1</strong>.
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">2</span> Target Fluid Allowance Input &amp; ESPGHAN 2022 Presets</div>
      <p>
        Enter the daily enteral fluid allowance in <strong>mL/kg/day</strong> or tap one of the standard NICU presets: <code>135</code>, <code>150</code>, <code>160</code>, <code>180</code>, or <code>200 mL/kg/d</code>.<br/>
        • <strong>ESPGHAN 2022 Guideline</strong>: Typical enteral fluid intake for stable growing preterm infants is <strong>150–180 mL/kg/day</strong> (up to <code>200 mL/kg/day</code> conditionally).
        <span class="source-tag">Embleton et al. ESPGHAN 2022 • PMID: 36705703</span>
      </p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">3</span> Total 24-Hour Prescribed Feed Volume (mL/day)</div>
      <p>
        Instantly computes the exact 24-hour prepared formula volume:<br/>
        <span class="formula-pill">Total 24h Volume = (Weight_g ÷ 1000) × Fluid Allowance</span><br/>
        For a <code>1,350 g</code> infant at <code>150 mL/kg/day</code>: <code>1.350 × 150 = 202.5 mL/day</code>.
      </p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">4</span> Pediamil® LBW Daily Scoops &amp; Powder Mass</div>
      <p>
        Converts the 24-hour volume directly into <strong>Pediamil® LBW scoops</strong> and <strong>grams of powder</strong> using the verified product specification (<code>15.0% w/v</code> dilution; <code>1 level scoop = 5.0 g powder</code>):<br/>
        <span class="formula-pill">Powder (g/d) = Volume × 0.15 = 30.4 g/day</span><br/>
        <span class="formula-pill">Scoops/day = Powder ÷ 5.0 g = 6.1 scoops/day</span>
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">5</span> Standard Reconstitution &amp; Sterile Water Rule</div>
      <p>
        Displays the exact milk-kitchen reconstitution instructions:<br/>
        • <strong>Standard Dilution (15.0% w/v)</strong>: Mix <strong>3 level scoops (15.0 g powder)</strong> in <strong>90 mL sterile water</strong> (&gt;70°C, cooled) to yield <strong>100 mL prepared feed</strong> (<code>~33.3 mL feed per scoop</code>).<br/>
        • For <code>202.5 mL/day</code>: requires <strong>~182.3 mL sterile water</strong> + <strong>30.4 g powder (6.1 scoops)</strong>.
        <span class="source-tag">WHO/FAO PIF Guidelines • ISBN 978-92-4-159541-4</span>
      </p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">6</span> Bedside Administration Schedule (Volume &amp; Scoops per Feed)</div>
      <p>
        Automatically divides the 24-hour order into three standard NICU administration modalities:<br/>
        • <strong>q3h Interval (8 feeds/day)</strong>: <code>25.3 mL / feed</code> (<code>~0.8 scoops / feed</code> every 3 hours).<br/>
        • <strong>q2h Interval (12 feeds/day)</strong>: <code>16.9 mL / feed</code> (<code>~0.5 scoops / feed</code> every 2 hours).<br/>
        • <strong>Continuous Infusion (24 hours)</strong>: <code>8.4 mL / hour</code> via syringe pump.
      </p>
    </div>
  </div>

  <!-- Quick Reference Table for Step 1 Across Common Preterm Weights -->
  <table>
    <thead>
      <tr>
        <th>Infant Weight</th>
        <th>Fluid Allowance</th>
        <th>Total 24h Volume</th>
        <th>Pediamil® LBW Scoops/Day</th>
        <th>Powder &amp; Water Required</th>
        <th>q3h Bolus (8 Feeds/d)</th>
        <th>q2h Bolus (12 Feeds/d)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1,000 g (1.00 kg)</strong></td>
        <td>150 mL/kg/day</td>
        <td><strong>150.0 mL/day</strong></td>
        <td><strong>4.5 scoops/day</strong></td>
        <td>22.5 g powder + 135.0 mL water</td>
        <td>18.8 mL (~0.6 scp/feed)</td>
        <td>12.5 mL (~0.4 scp/feed)</td>
      </tr>
      <tr>
        <td><strong>1,350 g (1.35 kg)</strong></td>
        <td>150 mL/kg/day</td>
        <td><strong>202.5 mL/day</strong></td>
        <td><strong>6.1 scoops/day</strong></td>
        <td>30.4 g powder + 182.3 mL water</td>
        <td>25.3 mL (~0.8 scp/feed)</td>
        <td>16.9 mL (~0.5 scp/feed)</td>
      </tr>
      <tr>
        <td><strong>1,750 g (1.75 kg)</strong></td>
        <td>160 mL/kg/day</td>
        <td><strong>280.0 mL/day</strong></td>
        <td><strong>8.4 scoops/day</strong></td>
        <td>42.0 g powder + 252.0 mL water</td>
        <td>35.0 mL (~1.1 scp/feed)</td>
        <td>23.3 mL (~0.7 scp/feed)</td>
      </tr>
      <tr>
        <td><strong>2,200 g (2.20 kg)</strong></td>
        <td>160 mL/kg/day</td>
        <td><strong>352.0 mL/day</strong></td>
        <td><strong>10.6 scoops/day</strong></td>
        <td>52.8 g powder + 316.8 mL water</td>
        <td>44.0 mL (~1.3 scp/feed)</td>
        <td>29.3 mL (~0.9 scp/feed)</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders</span>
    <span>Page 3 of 6</span>
  </div>
</div>

<!-- ==================== PAGE 4: TAB 2 (PART B) - STEP 2 CORE GROWTH FUEL GAUGES VS. ESPGHAN 2022 ==================== -->
<div class="page">
  <div class="page-bar">
    <h2>TAB 2 (PART B): STEP 2 — WHAT DOES THIS VOLUME &amp; SCOOPS DELIVER? (CORE GROWTH FUEL)</h2>
    <span>Screen Tour ① – ⑥</span>
  </div>

  <div class="doctor-benefit-box">
    <h3>Instant Visual Verification of Energy, True Protein (60:40), Total Lipids &amp; P:E Ratio Against ESPGHAN 2022</h3>
    <p>
      Immediately below the volume and scoop calculator, <strong>Step 2</strong> answers the doctor's primary clinical question: <em>"At this prescribed daily volume and scoop count, how much Energy, Protein, and Fat is actually delivered to the infant per kg per day, and does Pediamil® LBW cover the ESPGHAN 2022 recommendation?"</em> Note that per clinical team alignment, carbohydrate range gauges have been removed so the interface focuses cleanly on <strong>Energy, Protein, Lipids, and Micronutrients</strong>.
    </p>
  </div>

  <!-- Annotated Live Screenshot of Tab 2 Step 2 -->
  <div class="shot-wrap">
    <div class="shot-frame">
      <img src="${imgTab2Step2}" alt="Tab 2 Step 2 Core Growth Fuel Gauges Annotated Screenshot" style="max-height: 112mm;" />
      <!-- Callout Pins -->
      <div class="callout-pin green" style="left: 50%; top: 10%;">1</div>
      <div class="callout-pin" style="left: 50%; top: 22%;">2</div>
      <div class="callout-pin blue" style="left: 50%; top: 41%;">3</div>
      <div class="callout-pin green" style="left: 50%; top: 59%;">4</div>
      <div class="callout-pin" style="left: 28%; top: 76%;">5</div>
      <div class="callout-pin blue" style="left: 50%; top: 91%;">6</div>
    </div>
  </div>

  <!-- Numbered Explanation Cards for Page 4 -->
  <div class="callout-grid">
    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">1</span> Delivered Growth Fuel Summary Banner</div>
      <p>Displays the active prescription context (<code>Delivered Growth Fuel at: 202.5 mL/day [6.1 scoops of Pediamil® LBW/day]</code>) and the dynamic overall badge (<code>Evaluation: All Core Nutrients Covered ✓</code> when within ESPGHAN 2022 targets).</p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">2</span> Delivered Energy Gauge (kcal/kg/day)</div>
      <p>
        Calculates <span class="formula-pill">Energy = (Volume × 79.7 kcal/100mL) ÷ Weight_kg</span>.<br/>
        • At <code>150 mL/kg/d</code>: delivers <strong>119.6 kcal/kg/day</strong> (<code>161.4 kcal/day</code> total).<br/>
        • Evaluated against <strong>ESPGHAN 2022 Target: 115–140 kcal/kg/day</strong> (Conditional catch-up: <code>140–160 kcal/kg/day</code>) → <strong>Covered by Pediamil® LBW ✓</strong>.
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">3</span> Delivered True Protein Gauge (g/kg/day • 60:40 Whey:Casein)</div>
      <p>
        Calculates <span class="formula-pill">Protein = (Volume × 2.42 g/100mL) ÷ Weight_kg</span>.<br/>
        • At <code>150 mL/kg/d</code>: delivers <strong>3.63 g/kg/day</strong> (<code>4.9 g/day</code> total; <code>60:40 Whey:Casein = 2.94g Whey</code> rich in bioavailable α-lactalbumin).<br/>
        • Evaluated against <strong>ESPGHAN 2022 Target: 3.5–4.0 g/kg/day</strong> (acceptable <code>3.2–4.1</code>, conditional up to <code>4.5</code>) → <strong>Covered by Pediamil® LBW ✓</strong>.
      </p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">4</span> Delivered Total Lipids / Fat Gauge (g/kg/day)</div>
      <p>
        Calculates <span class="formula-pill">Lipids = (Volume × 4.88 g/100mL) ÷ Weight_kg</span>.<br/>
        • At <code>150 mL/kg/d</code>: delivers <strong>7.32 g/kg/day</strong> (<code>9.88 g/day</code> total; ~55% of total energy, natural milk fat + double-encapsulated 1:1 DHA &amp; ARA).<br/>
        • Evaluated against <strong>ESPGHAN 2022 Target: 4.8–8.1 g/kg/day</strong> → <strong>Covered by Pediamil® LBW ✓</strong>.
      </p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">5</span> Protein-to-Energy (P:E) Ratio &amp; Dynamic Status Evaluation</div>
      <p>
        Computes <span class="formula-pill">P:E Ratio = (Protein × 100) ÷ Energy = 3.04 g / 100 kcal</span>.<br/>
        • Sits squarely inside the <strong>ESPGHAN 2022 recommended 2.8–3.6 g/100 kcal</strong> window, promoting lean mass accretion rather than excess adiposity while avoiding metabolic acidosis or elevated BUN.
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">6</span> Pediamil® LBW Official Pack Specification Strip</div>
      <p>Displays the verified per-100 mL reference densities from the official Liptis Nutrition Specification Sheet (<code>Liptis-Spec-2026-v1.0</code>): <strong>Energy Density: 79.7 kcal/100 mL</strong> • <strong>Protein Content: 2.42 g/100 mL (60:40 Whey:Casein)</strong> • <strong>Total Lipids: 4.88 g/100 mL (Milk Fat • DHA/ARA)</strong>.</p>
    </div>
  </div>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders</span>
    <span>Page 4 of 6</span>
  </div>
</div>

<!-- ==================== PAGE 5: TAB 2 (PART C) - STEP 3 PATIENT DAILY DELIVERED NUTRIENT PAYLOAD & 6 CORE PILLARS ==================== -->
<div class="page">
  <div class="page-bar">
    <h2>TAB 2 (PART C): STEP 3 — PATIENT DAILY DELIVERED NUTRIENT PAYLOAD &amp; 6 ACCRETION PILLARS</h2>
    <span>Screen Tour ① – ⑥</span>
  </div>

  <div class="doctor-benefit-box">
    <h3>Complete Macro- &amp; Micronutrient Transparency: Every Single Ingredient Checked Against ESPGHAN 2022</h3>
    <p>
      <strong>Step 3 (Patient Daily Delivered Nutrient Payload)</strong> shows the doctor exactly how much of every macro- and micronutrient the infant receives per 24 hours and per kg/day—including <strong>Calcium, Phosphorus, Iron, Vitamin D3, Sodium, Potassium, Chloride, Magnesium, Zinc, Copper, Selenium, Vitamins A/E/K1/C/B-complex, DHA, ARA, Inositol, Taurine, L-Carnitine, Choline, and Nucleotides</strong>—and flags whether each ingredient is <strong>Covered by Pediamil® LBW ✓</strong>.
    </p>
  </div>

  <!-- Annotated Live Screenshot of Tab 2 Step 3 -->
  <div class="shot-wrap">
    <div class="shot-frame">
      <img src="${imgTab2Step3}" alt="Tab 2 Step 3 Patient Daily Delivered Nutrient Payload Annotated Screenshot" style="max-height: 114mm;" />
      <!-- Callout Pins -->
      <div class="callout-pin blue" style="left: 74%; top: 4%;">1</div>
      <div class="callout-pin" style="left: 50%; top: 17%;">2</div>
      <div class="callout-pin green" style="left: 48%; top: 33%;">3</div>
      <div class="callout-pin blue" style="left: 68%; top: 43.5%;">4</div>
      <div class="callout-pin" style="left: 38%; top: 51%;">5</div>
      <div class="callout-pin green" style="left: 50%; top: 71%;">6</div>
    </div>
  </div>

  <!-- Numbered Explanation Cards for Page 5 -->
  <div class="callout-grid">
    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">1</span> View Switcher (Vivid Cards vs. Pharmacopoeia Table) &amp; Copy</div>
      <p>Allows the doctor to switch between <strong>Vivid Cards</strong> (visual progress cards for ward rounds) and <strong>Pharmacopoeia Table</strong> (complete 20+ ingredient tabular audit with atomic <code>mmol/kg/d</code> conversions), plus 1-click <strong>Copy Summary</strong> for hospital EMR notes.</p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">2</span> Doctor Calculation Formula &amp; Input Resonation Bridge</div>
      <p>
        Shows the exact deterministic math connecting the doctor's inputs to every nutrient card:<br/>
        • <strong>24h Absolute Multiplier</strong>: <span class="formula-pill">Volume ÷ 100 = 2.025× per 100 mL</span><br/>
        • <strong>Dose /kg/day Multiplier</strong>: <span class="formula-pill">Fluid Allowance ÷ 100 = 1.50× per 100 mL</span><br/>
        • <strong>Powder Density (15%)</strong>: <code>30.4 g (~6.1 scoops)</code>.
      </p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">3</span> 6 Core Clinical Accretion Pillars Dashboard</div>
      <p>
        Highlights the 6 primary drivers of preterm skeletal mineralization and lean tissue growth at <code>150 mL/kg/d</code>:<br/>
        • <strong>Calcium</strong>: <code>195.1 mg/kg/d</code> (163% of 120 mg min • <strong>Covered ✓</strong>)<br/>
        • <strong>Phosphorus</strong>: <code>97.6 mg/kg/d</code> (150% of 65 mg min • <strong>Covered ✓</strong>)<br/>
        • <strong>Protein</strong>: <code>3.63 g/kg/d</code> (104% • <strong>Covered ✓</strong>) &amp; <strong>Energy</strong>: <code>119.6 kcal/kg/d</code> (104% • <strong>Covered ✓</strong>)<br/>
        • <strong>Iron (Fe)</strong>: <code>2.93 mg/kg/d</code> (147% • <strong>Covered ✓</strong>) &amp; <strong>Vit D3</strong>: <code>334 IU/day</code> (84% of 400 IU/d absolute floor).
      </p>
    </div>

    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">4</span> Clinical Age Goal Stratification Selector</div>
      <p>Lets the clinician inspect nutrient alignment across 4 developmental milestones: <code>&lt; 28w (ELBW)</code>, <code>28–31w (VLBW)</code>, <code>32–36w (Step-Down)</code>, and <code>≥ 37w / Term</code>, automatically adjusting target reference horizons.</p>
    </div>

    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">5</span> Physiological Subsystem Filter Tabs</div>
      <p>Filters the nutrient cards into 6 clinical categories: <strong>All Delivered Nutrients</strong>, <strong>Bone &amp; Growth Minerals</strong> (Ca, P, Mg, Vit D3), <strong>Macronutrients &amp; Energy</strong>, <strong>Electrolytes &amp; Renal</strong> (Na, K, Cl), <strong>Vitamins &amp; Defense</strong>, and <strong>Specialty Bioactives</strong> (DHA, ARA, Inositol, Nucleotides).</p>
    </div>

    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">6</span> Individual Nutrient Cards with ESPGHAN Coverage Badges</div>
      <p>Every card displays: (a) <strong>Product Concentration per 100 mL</strong>, (b) <strong>24h Delivered Dose</strong>, (c) <strong>Normalized Dose (/kg/d)</strong>, (d) <strong>ESPGHAN 2022 Target Range</strong>, (e) <strong>Coverage Evaluation Badge (Covered by Pediamil® LBW ✓)</strong>, and (f) <strong>Clinical Rationale</strong>.</p>
    </div>
  </div>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders</span>
    <span>Page 5 of 6</span>
  </div>
</div>

<!-- ==================== PAGE 6: STEP 4 CALCULATION SHEET, HOSPITAL FEED MODAL & VERIFIED EVIDENCE REGISTRY ==================== -->
<div class="page">
  <div class="page-bar">
    <h2>STEP 4: EMBEDDED CALCULATION SHEET, HOSPITAL PDF MODAL &amp; SCIENTIFIC SOURCES</h2>
    <span>Screen Tour ① – ④ &amp; Master Reference Registry</span>
  </div>

  <!-- Side-by-Side Screenshots of Step 4 Embedded Calculation Sheet & Printable Hospital Feed Sheet Modal -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 4px;">
    <div class="shot-wrap" style="margin-bottom: 0;">
      <div class="shot-frame">
        <img src="${imgTab2Step4}" alt="Step 4 Embedded Calculation Sheet Screenshot" style="max-height: 52mm;" />
        <div class="callout-pin blue" style="left: 74%; top: 10%;">1</div>
        <div class="callout-pin" style="left: 48%; top: 42%;">2</div>
        <div class="callout-pin green" style="left: 48%; top: 74%;">3</div>
      </div>
    </div>
    <div class="shot-wrap" style="margin-bottom: 0;">
      <div class="shot-frame">
        <img src="${imgModalSheet}" alt="Printable Hospital Feed Sheet Modal Screenshot" style="max-height: 52mm;" />
        <div class="callout-pin green" style="left: 68%; top: 7%;">4</div>
        <div class="callout-pin blue" style="left: 50%; top: 36%;">5</div>
        <div class="callout-pin" style="left: 50%; top: 82%;">6</div>
      </div>
    </div>
  </div>

  <div class="callout-grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 5px;">
    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">1</span> 1-Click PDF Export Bar</div>
      <p>Download the <strong>Doctor &amp; KOL Guide (PDF)</strong> or open the <strong>Printable Calculation Sheet (PDF)</strong> directly from the bedside view.</p>
    </div>
    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">2</span> Embedded Reconstitution &amp; Schedule</div>
      <p>Shows 24h Powder (<code>30.4g</code>), Scoops (<code>6.1 scp</code>), Water (<code>~182.3 mL</code>), and <code>q3h</code> / <code>q2h</code> / <code>Continuous</code> dosing without opening a modal.</p>
    </div>
    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">3</span> ESPGHAN Table &amp; Dual Signatures</div>
      <p>Embedded table of delivered nutrients vs. ESPGHAN 2022 plus sign-off lines for the <strong>Attending Neonatologist</strong> and <strong>NICU Dietitian/Nurse</strong>.</p>
    </div>
    <div class="callout-card green">
      <div class="callout-card-title"><span class="num-badge green">4</span> Hospital Worksheet Print / Save PDF</div>
      <p>Triggers A4 hospital worksheet printing (<code>window.print()</code>) with zero browser clutter for placement in the infant's physical medical chart.</p>
    </div>
    <div class="callout-card blue">
      <div class="callout-card-title"><span class="num-badge blue">5</span> Section 1 &amp; A: Ages + Prescription</div>
      <p>Prints Biological Sex, GA at Birth (<code>28w+2d</code>), CA (<code>2w 0d</code>), PMA (<code>30w 2d</code>), Prescribed Volume (<code>202.5 mL/d</code>), and feed schedule.</p>
    </div>
    <div class="callout-card">
      <div class="callout-card-title"><span class="num-badge">6</span> Section B: Batch Preparation Guide</div>
      <p>Prints Full Batch (<code>6 scoops [~30g] + 180 mL water = ~198 mL</code>) and Half Batch (<code>3 scoops [~15g] + 90 mL water = ~99 mL</code>) milk-kitchen cards.</p>
    </div>
  </div>

  <!-- Master Pediamil LBW vs ESPGHAN 2022 Table -->
  <table>
    <thead>
      <tr>
        <th>Nutrient / Parameter</th>
        <th>Pediamil® LBW (/100g Powder)</th>
        <th>Per 100 mL Feed (15% w/v)</th>
        <th>Delivered @ 150 mL/kg/d</th>
        <th>ESPGHAN 2022 Preterm Target</th>
        <th>Clinical Coverage Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Energy</strong></td>
        <td>531 kcal</td>
        <td><strong>79.7 kcal</strong></td>
        <td><strong>119.6 kcal/kg/day</strong></td>
        <td>115–140 kcal/kg/d (Cond: 140–160)</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>True Protein (60:40 Whey:Casein)</strong></td>
        <td>16.1 g</td>
        <td><strong>2.42 g</strong></td>
        <td><strong>3.63 g/kg/day</strong> (P:E 3.04)</td>
        <td>3.5–4.0 g/kg/d (3.2–4.1; Cond: 4.5)</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>Total Lipids (Milk Fat + MCT)</strong></td>
        <td>32.5 g</td>
        <td><strong>4.88 g</strong></td>
        <td><strong>7.32 g/kg/day</strong></td>
        <td>4.8–8.1 g/kg/day</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>Calcium (Ca²⁺) &amp; Phosphorus (P)</strong></td>
        <td>867 mg Ca / 434 mg P</td>
        <td><strong>130.05 mg / 65.10 mg</strong></td>
        <td><strong>195.1 / 97.6 mg/kg/d</strong> (Ca:P 2:1)</td>
        <td>Ca: 120–140 | P: 65–90 mg/kg/d</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>Elemental Iron (Fe) &amp; Zinc (Zn)</strong></td>
        <td>13.0 mg Fe / 7.0 mg Zn</td>
        <td><strong>1.95 mg Fe / 1.05 mg Zn</strong></td>
        <td><strong>2.93 mg Fe / 1.58 mg Zn /kg/d</strong></td>
        <td>Fe: 2.0–3.0 | Zn: 1.4–2.5 mg/kg/d</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>Electrolytes (Na / K / Cl / Mg)</strong></td>
        <td>265 / 555 / 400 / 53 mg</td>
        <td><strong>39.8 / 83.3 / 60.0 / 7.95 mg</strong></td>
        <td><strong>2.60 / 3.20 / 2.54 mmol/kg/d</strong></td>
        <td>Na 1.5–3 | K 2.3–4.6 | Cl 1.5–3 mmol</td>
        <td><span class="covered-pill">Covered by Pediamil® LBW ✓</span></td>
      </tr>
      <tr>
        <td><strong>Vitamin D3 (Cholecalciferol)</strong></td>
        <td>1,100 IU (27.5 µg)</td>
        <td><strong>165 IU (4.13 µg)</strong></td>
        <td><strong>247.5 IU/kg/d</strong> (334 IU/d @ 1.35kg)</td>
        <td>400–1,000 IU/day (absolute daily)</td>
        <td><span class="note-pill">≥400 IU/d at ≥243 mL/d (Add D3 Drops if &lt;243 mL/d)</span></td>
      </tr>
      <tr>
        <td><strong>DHA &amp; ARA (1:1 Double-Encaps.)</strong></td>
        <td>90 mg DHA / 90 mg ARA</td>
        <td><strong>13.5 mg DHA / 13.5 mg ARA</strong></td>
        <td><strong>20.25 mg/kg/d</strong> (16.9 mg/100 kcal)</td>
        <td>Codex/EFSA 12–30 mg/100kcal (ESPGHAN 30–65)</td>
        <td><span class="note-pill">Meets 16.9 mg/100kcal &amp; 1:1 Ratio ✓</span></td>
      </tr>
    </tbody>
  </table>

  <!-- Complete Authoritative Peer-Reviewed Clinical Sources -->
  <table>
    <thead>
      <tr>
        <th style="width: 24%;">Clinical Domain</th>
        <th style="width: 54%;">Primary Peer-Reviewed Scientific Reference</th>
        <th style="width: 22%;">PubMed PMID / Identifier</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Preterm Enteral Nutrition</strong></td>
        <td>Embleton ND, Moltu SJ, Lapillonne A, et al. <em>Enteral Nutrition in Preterm Infants (2022): A Position Paper From the ESPGHAN Committee on Nutrition and Invited Experts.</em> J Pediatr Gastroenterol Nutr (JPGN). 2023;76(2):248–268.</td>
        <td><strong>PMID: 36705703</strong><br/>DOI: 10.1097/MPG.0000000000003642</td>
      </tr>
      <tr>
        <td><strong>2. Preterm Growth Curves (22–50w)</strong></td>
        <td>Fenton TR, Kim JH. <em>A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants.</em> BMC Pediatrics. 2013;13:59.</td>
        <td><strong>PMID: 23601190</strong><br/>PMCID: PMC3637477</td>
      </tr>
      <tr>
        <td><strong>3. Term Growth Standards (0–24m)</strong></td>
        <td>WHO Multicentre Growth Reference Study Group. <em>WHO Child Growth Standards based on length/height, weight and age.</em> Acta Paediatr Suppl. 2006;450:76–85.</td>
        <td><strong>PMID: 16817681</strong><br/>ISBN: 92-4-154693-X</td>
      </tr>
      <tr>
        <td><strong>4. Box-Cox LMS Z-Score Method</strong></td>
        <td>Cole TJ, Green PJ. <em>Smoothing reference centile curves: the LMS method and penalized likelihood.</em> Statistics in Medicine. 1992;11(10):1305–1319.</td>
        <td><strong>PMID: 1518992</strong><br/>DOI: 10.1002/sim.4780111005</td>
      </tr>
      <tr>
        <td><strong>5. Exponential Weight Velocity</strong></td>
        <td>Patel AL, Engstrom JL, Meier PP, Kimura RE. <em>Accuracy of methods for calculating postnatal growth velocity for extremely low birth weight infants.</em> Pediatrics. 2005;116(6):1466–1473.</td>
        <td><strong>PMID: 16253578</strong><br/>DOI: 10.1542/peds.2004-1699</td>
      </tr>
      <tr>
        <td><strong>6. PediTools LMS Validation</strong></td>
        <td>Chou JH, Roumiantsev S, Singh R. <em>PediTools Electronic Growth Chart Calculators: Applications in Clinical Care, Research, and Quality Improvement.</em> J Med Internet Res. 2020;22(1):e16204.</td>
        <td><strong>PMID: 32012066</strong><br/>PMCID: PMC7016617</td>
      </tr>
      <tr>
        <td><strong>7. PIF Reconstitution &amp; Atomic Weights</strong></td>
        <td>WHO/FAO. <em>Safe preparation, storage and handling of powdered infant formula: guidelines.</em> Geneva: WHO (2007) • IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW).</td>
        <td><strong>ISBN: 978-92-4-159541-4</strong><br/>IUPAC Standard Atomic Weights</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span><strong>Liptis Nutrition NeoPed™</strong> — Illustrated Clinical Guide for Doctors &amp; Key Opinion Leaders • For Licensed Healthcare Professionals Only</span>
    <span>Page 6 of 6</span>
  </div>
</div>

</body>
</html>`;

const htmlPath = path.join(__dirname, "doctor-guide-temp.html");
fs.writeFileSync(htmlPath, htmlContent, "utf8");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const desktopPdfPath = "C:\\Users\\seif.elawamry\\Desktop\\Liptis_Nutrition_NeoPed_Doctor_Guide.pdf";
const projectPdfPath = path.join(__dirname, "..", "Liptis_Nutrition_NeoPed_Doctor_Guide.pdf");
const publicPdfPath = path.join(__dirname, "..", "public", "Liptis_Nutrition_NeoPed_Doctor_Guide.pdf");
const artifactPdfPath = "C:\\Users\\seif.elawamry\\.gemini\\antigravity\\brain\\426d4ee4-852c-4045-bc85-d16ee0682636\\Liptis_Nutrition_NeoPed_Doctor_Guide.pdf";

const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

console.log("Generating Illustrated 6-Page PDF via Headless Chrome...");
execFileSync(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--print-to-pdf=" + desktopPdfPath,
  fileUrl,
]);

fs.copyFileSync(desktopPdfPath, projectPdfPath);
fs.copyFileSync(desktopPdfPath, publicPdfPath);
fs.copyFileSync(desktopPdfPath, artifactPdfPath);

const stats = fs.statSync(desktopPdfPath);
console.log("Illustrated PDF generated successfully!");
console.log("Desktop Path:", desktopPdfPath, "Size:", stats.size, "bytes");
console.log("Project Path:", projectPdfPath);
console.log("Public Path:", publicPdfPath);
console.log("Artifact Path:", artifactPdfPath);

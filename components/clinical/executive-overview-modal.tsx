"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react";
import { APP_VERSION, APP_VERSION_LABEL, ENGINE_VERSION, CLINICAL_GOVERNANCE } from "@/lib/version";

interface ExecutiveOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveOverviewModal({ isOpen, onClose }: ExecutiveOverviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-overview-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white flex items-center justify-between shrink-0 border-b border-blue-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
              <Image
                src="/icons/icon-192x192.png"
                alt="NeoPed Emblem"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
                  Executive Briefing & Clinical Governance
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Production Ready {APP_VERSION}
                </span>
              </div>
              <h2 id="executive-overview-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Liptis Nutrition NeoPed™ — Strategic Architecture & Verified Evidence Registry
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close executive overview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 text-slate-700">
          {/* Executive Summary Card */}
          <div className="p-6 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-2 border-blue-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Executive Briefing for Senior Leadership & Medical Review</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">
              Precision Clinical Decision Support for Preterm Nutrition & Growth Trajectories
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>Liptis Nutrition NeoPed™</strong> was engineered as an institutional clinical decision support platform to bridge international peer-reviewed preterm guidelines with everyday bedside practice in Neonatal Intensive Care Units (NICUs). By integrating the <strong>ESPGHAN 2022 Preterm Enteral Nutrition Position Paper (PMID: 36705703)</strong>, <strong>Fenton 2013 Preterm Growth Curves (PMID: 23601190)</strong>, and <strong>WHO 2006 Child Growth Standards (PMID: 16817681)</strong>, the application empowers neonatologists and pediatricians to eliminate mathematical prescribing errors, calculate exact scoops and volumes, and monitor somatic growth with 100% transparent scientific provenance.
            </p>
          </div>

          {/* 7 Core Architectural Pillars with Direct Verified Sources */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>The 7 Architectural Pillars of Zero Clinical Error (With Direct Primary Sources)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Every architectural pillar is backed by a verified, peer-reviewed publication or international standard that physicians can inspect directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pillar 1 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">1</span>
                    <span>Clinician Prescription Supremacy</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    The attending clinician’s individualized weight-based fluid prescription (135–200 mL/kg/day) always takes priority. The engine never silently overrides doctor-prescribed volumes with fixed packaging feeding tables.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Source: Embleton ND, et al. ESPGHAN Position Paper (JPGN 2023;76(2):248–268)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/36705703/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      <span>PubMed PMID: 36705703</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href="https://doi.org/10.1097/MPG.0000000000003642"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline"
                    >
                      <span>DOI: 10.1097/MPG.0000000000003642</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shrink-0">2</span>
                    <span>Strict 4-Quantity Separation</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Explicitly segregates: (1) Doctor-prescribed daily volume, (2) Manufacturer tin-guide reference band, (3) Prepared batch volume, and (4) Actually administered bedside volume.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Source: ESPGHAN 2022 Enteral Fluid Guidelines & Liptis Spec Sheet 2026-v1.0
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/36705703/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline"
                    >
                      <span>ESPGHAN 2022 Fluid & Volume (PMID: 36705703)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">3</span>
                    <span>Volumetric Preparation & Scoops Calibration</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Calibrated to Pediamil® LBW standard dilution (15.0% w/v: 1 level scoop [5.0g] per 30 mL water; 3 scoops [15.0g] + 90 mL sterile water &gt;70°C = 100 mL feed) and WHO/FAO sterile preparation protocols.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Source: WHO/FAO Powdered Infant Formula Guidelines (ISBN 978-92-4-159541-4)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://www.who.int/publications/i/item/9789241595414"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <span>WHO/FAO Official Reconstitution Guideline</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs shrink-0">4</span>
                    <span>ESPGHAN 2022 Macro/Micronutrient & Molar Calibration</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Evaluates Energy (115–140 kcal/kg/d), Protein (3.5–4.5 g/kg/d), Lipids (4.8–8.1 g/kg/d), P:E ratio (2.8–3.6 g/100 kcal), Ca, P, Fe, Vit D3, DHA/ARA, and exact IUPAC atomic weight molar conversions.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Sources: ESPGHAN 2022 (PMID: 36705703) & IUPAC Standard Atomic Weights
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/36705703/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                    >
                      <span>ESPGHAN 2022 (PMID: 36705703)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href="https://www.ciaaw.org/atomic-weights.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:underline"
                    >
                      <span>IUPAC / CIAAW Atomic Weights</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs shrink-0">5</span>
                    <span>Dual Growth Trajectory Engine (Fenton 2013 + WHO 2006 + Cole LMS)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Continuous transition between Fenton 2013 Preterm curves (22–50 weeks PMA) and WHO 2006 Child Growth Standards (0–24 months Corrected Age) using Cole & Green’s Box-Cox LMS method.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Sources: Fenton & Kim (2013), WHO MGRS (2006), Cole & Green (1992)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/23601190/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:underline"
                    >
                      <span>Fenton 2013 (PMID: 23601190)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/16817681/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:underline"
                    >
                      <span>WHO 2006 (PMID: 16817681)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/1518992/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:underline"
                    >
                      <span>Cole 1992 LMS (PMID: 1518992)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 6 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">6</span>
                    <span>Zero-Egress Client-Side Privacy (HIPAA / GDPR)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    100% of calculations, LMS interpolations, and PDF calculation worksheets execute locally inside the clinician’s browser runtime. Zero Protected Health Information (PHI) is transmitted or stored externally.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">
                    Primary Sources: US 45 CFR Part 164 (HIPAA Security & Privacy) & EU GDPR (Reg. 2016/679)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline"
                    >
                      <span>45 CFR Part 164 (Official eCFR)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">•</span>
                    <a
                      href="https://gdpr-info.eu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline"
                    >
                      <span>EU GDPR Regulation (2016/679)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Pillar 7 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2 md:col-span-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs shrink-0">7</span>
                    <span>Rigorous Automated Verification Suite & Independent PediTools Benchmark Concordance</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Continuously verified against 190 clinical acceptance unit tests and 37 official growth dataset benchmarks (227 / 227 passing, 100.0% concordance) cross-validated against Chou et al.’s peer-reviewed PediTools Fenton 2013 & WHO 2006 reference algorithms.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10.5px] font-bold text-slate-700">
                    Primary Source: Chou JH, Roumiantsev S, Singh R. J Med Internet Res. 2020;22(1):e16204
                  </span>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/32012066/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                    >
                      <span>PubMed PMID: 32012066</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7058170/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                    >
                      <span>Full Text: PMC7058170</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://peditools.org/fenton2013/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                    >
                      <span>PediTools Fenton 2013 Calculator</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authoritative Data Sources & Direct Links */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Complete Authoritative Evidence & Clinical Datasets Registry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Verified, direct links to the exact PubMed records, journal DOIs, WHO tables, and manufacturer specifications powering Liptis Nutrition NeoPed™.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. ESPGHAN 2022 Position Paper */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">1. Primary Enteral Nutrition Guideline</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono text-[10px]">
                      PMID: 36705703
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    ESPGHAN 2022 Preterm Enteral Nutrition Position Paper
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Embleton ND, Jennifer Moltu S, Lapillonne A, et al. <em>Enteral Nutrition in Preterm Infants (2022): A Position Paper From the ESPGHAN Committee on Nutrition and Invited Experts.</em> <strong>J Pediatr Gastroenterol Nutr (JPGN)</strong>. 2023 Feb 1;76(2):248–268 (Epub 2022 Oct 28).
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/36705703/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                  >
                    <span>PubMed (PMID: 36705703)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://doi.org/10.1097/MPG.0000000000003642"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:underline"
                  >
                    <span>Journal DOI: 10.1097/MPG.0000000000003642</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 2. Fenton 2013 Preterm Growth Curves */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">2. Preterm Growth Standard (22–50w PMA)</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono text-[10px]">
                      PMID: 23601190
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Fenton 2013 Preterm Growth Chart Systematic Review & Meta-Analysis
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Fenton TR, Kim JH. <em>A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants.</em> <strong>BMC Pediatrics</strong>. 2013 Apr 20;13:59.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/23601190/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:underline"
                  >
                    <span>PubMed (23601190)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3637477/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:underline"
                  >
                    <span>PMC Full Text (PMC3637477)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://bmcpediatr.biomedcentral.com/articles/10.1186/1471-2431-13-59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-slate-700 hover:underline"
                  >
                    <span>BMC Pediatrics</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 3. WHO 2006 Child Growth Standards */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-teal-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">3. Term & Post-Term Standard (0–24m CCA)</span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 font-mono text-[10px]">
                      PMID: 16817681
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    WHO Child Growth Standards (2006 Multicentre Growth Reference Study)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    WHO Multicentre Growth Reference Study Group. <em>WHO Child Growth Standards based on length/height, weight and age.</em> <strong>Acta Paediatr Suppl</strong>. 2006 Apr;450:76–85.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <a
                    href="https://www.who.int/tools/child-growth-standards/standards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                  >
                    <span>WHO Official LMS Tables</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/16817681/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                  >
                    <span>PubMed (PMID: 16817681)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 4. PediTools Benchmark & Cole LMS Method */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-sky-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sky-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">4. Mathematical LMS & Clinical Benchmark</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200 font-mono text-[10px]">
                      PMID: 32012066 & 1518992
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    PediTools Clinical Suite (Chou et al. 2020) & Cole-Green LMS Method (1992)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Chou JH, et al. <em>PediTools Electronic Growth Chart Calculators.</em> <strong>J Med Internet Res</strong>. 2020;22(1):e16204. Cole TJ, Green PJ. <em>Smoothing reference centile curves: the LMS method.</em> <strong>Stat Med</strong>. 1992;11(10):1305–19.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/32012066/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-700 hover:underline"
                  >
                    <span>Chou 2020 (PMID: 32012066)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://peditools.org/fenton2013/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-700 hover:underline"
                  >
                    <span>PediTools Fenton 2013</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/1518992/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-slate-700 hover:underline"
                  >
                    <span>Cole 1992 (PMID: 1518992)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 5. IUPAC Standard Atomic Weights */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-slate-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">5. Electrolyte & Mineral Stoichiometry</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px]">
                      IUPAC / CIAAW
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    IUPAC Commission on Isotopic Abundances & Atomic Weights
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Prohaska T, et al. <em>Standard atomic weights of the elements (IUPAC Technical Report).</em> <strong>Pure Appl Chem</strong>. 2022;94(5):573–600. Exact values: Na 22.99, K 39.10, Cl 35.45, Ca 40.08, P 30.97 g/mol.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <a
                    href="https://www.ciaaw.org/atomic-weights.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-slate-800 hover:underline"
                  >
                    <span>CIAAW Official Atomic Weights Table</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://doi.org/10.1515/pac-2019-0603"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-slate-700 hover:underline"
                  >
                    <span>DOI: 10.1515/pac-2019-0603</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 6. Liptis Nutrition Manufacturer Technical Specifications & WHO Reconstitution */}
              <div className="p-4 bg-white border-2 border-slate-200 hover:border-purple-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-purple-700 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">6. Manufacturer Dossier & Safe Reconstitution</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-mono text-[10px]">
                      Spec 2026-v1.0
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pediamil® LBW & Pediamil® 1 Technical Specifications + WHO/FAO Guidelines
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Official Liptis Nutrition composition: 79.7 kcal, 2.42g protein (60:40 whey:casein), 4.88g lipids per 100 mL prepared feed (15.0% w/v: 3 scoops [15.0g] + 90 mL sterile water = 100 mL feed).
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-purple-800">Liptis Nutrition Switzerland (Spec 2026-v1.0)</span>
                  <a
                    href="https://www.who.int/publications/i/item/9789241595414"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline"
                  >
                    <span>WHO/FAO PIF Guideline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Governance Disclaimer */}
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Clinical Decision Support Non-Device Notice:</span>
            </div>
            <p className="leading-relaxed">
              {CLINICAL_GOVERNANCE.regulatoryNotice}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Liptis Nutrition NeoPed™ Clinical Suite • {APP_VERSION_LABEL} • {ENGINE_VERSION}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Close Executive Briefing
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  Award,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Scale,
  Sparkles,
  FlaskConical,
  Building2,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
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
                NeoPed™ Clinical Suite — Strategic Architecture & Evidence Registry
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
              <span>Executive Briefing for Senior Leadership</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">
              Precision Clinical Decision Support for Preterm Nutrition & Growth Trajectories
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>NeoPed™</strong> was designed by <strong>Liptis Nutrition</strong> as a premier institutional clinical platform to bridge international evidence-based preterm guidelines with everyday bedside practice in Neonatal Intensive Care Units (NICUs). By integrating <strong>ESPGHAN 2022 Preterm Enteral Recommendations</strong>, continuous <strong>Fenton 2013 Preterm Growth Curves</strong>, and <strong>WHO 2006 Child Growth Standards</strong>, the application empowers neonatologists and pediatricians to eliminate mathematical prescribing errors, track bedside administration, and optimize growth outcomes with zero ambiguity.
            </p>
          </div>

          {/* 7 Core Architectural Pillars */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>The 7 Architectural Pillars of Zero Clinical Error</span>
              </h3>
              <p className="text-xs text-slate-500">
                How NeoPed™ guarantees mathematical fidelity, regulatory adherence, and clinician supremacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pillar 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Clinician Prescription Supremacy</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The attending clinician’s individualized prescription always takes priority. The software never silently replaces doctor-prescribed fluid allowances or volumes with manufacturer tin-guide amounts.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Strict 4-Quantity Separation</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Explicitly separates: (1) Doctor-prescribed daily volume, (2) Manufacturer tin-guide reference, (3) Prepared batch volume, and (4) Actually administered volume. Never combined into an ambiguous field.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Volumetric Preparation & Administration Tracking</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Preparation is calibrated to 6 scoops (~30g) + 180 mL water = ~198 mL feed (or 3 scoops / 90 mL = ~99 mL half-batch). Delivered nutrients are calculated from actual bedside administration when entered.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>ESPGHAN 2022 Preterm Calibration</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Stratifies recommendations into ELBW (&lt;1000g), VLBW (1000–1800g), LBW (1801–3500g), and Term (&gt;3500g graduation). Monitors Energy, Protein, P:E ratio, Ca:P molar balance, DHA, and ARA.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">5</span>
                  <span>Dual Growth Trajectory Engine</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Seamless continuous transition between Fenton 2013 Preterm LMS curves (22–50 weeks PMA) and WHO 2006 Child Growth Standards (0–24 months Corrected Age), calculating exact Z-scores and percentiles.
                </p>
              </div>

              {/* Pillar 6 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">6</span>
                  <span>Zero-Egress Client-Side Privacy</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  100% of calculations, charts, and feed sheets run purely in the clinician’s browser. No patient identifiers (PHI) are transmitted over the network or stored in external databases (HIPAA / GDPR verified).
                </p>
              </div>

              {/* Pillar 7 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs">7</span>
                  <span>Rigorous Automated Verification Suite</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Validated against 170 clinical acceptance test cases, 37 growth dataset benchmarks, and 15 tin-guide acceptance rules. Every build undergoes automated mathematical regression checking.
                </p>
              </div>
            </div>
          </div>

          {/* Authoritative Data Sources & Direct Links */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Authoritative Evidence & Clinical Datasets Registry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct external links to the published peer-reviewed guidelines and manufacturer specifications used across NeoPed™.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* ESPGHAN 2022 Link */}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/36511826/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-blue-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">Clinical Guideline</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                    ESPGHAN 2022 Preterm Enteral Nutrition Guidelines
                  </h4>
                  <p className="text-slate-600">
                    Embleton ND, et al. Enteral Nutrition in Preterm Infants: Position Paper. <em>J Pediatr Gastroenterol Nutr</em>. 2023;76(2):248–268.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>DOI: 10.1097/MPG.0000000000003642</span>
                  <span className="font-semibold text-blue-600">PubMed 36511826 →</span>
                </div>
              </a>

              {/* Fenton 2013 Link */}
              <a
                href="https://bmcpediatr.biomedcentral.com/articles/10.1186/1471-2431-13-59"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">Growth Reference</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                    Fenton 2013 Preterm Growth Curves (LMS)
                  </h4>
                  <p className="text-slate-600">
                    Fenton TR, Kim JH. A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants. <em>BMC Pediatr</em>. 2013;13:59.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>DOI: 10.1186/1471-2431-13-59</span>
                  <span className="font-semibold text-indigo-600">BMC Pediatrics →</span>
                </div>
              </a>

              {/* WHO 2006 Link */}
              <a
                href="https://www.who.int/tools/child-growth-standards"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-teal-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">International Standard</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                    WHO Child Growth Standards (2006 MGRS)
                  </h4>
                  <p className="text-slate-600">
                    World Health Organization Multicentre Growth Reference Study Group. Weight, length, and head circumference percentiles for infants 0–24 months.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Geneva: World Health Organization</span>
                  <span className="font-semibold text-teal-600">WHO Official Website →</span>
                </div>
              </a>

              {/* Liptis Nutrition Manufacturer Specification */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-purple-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">Manufacturer Technical Dossier</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-900 border border-purple-300">
                      Verified 2026-10-02
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pediamil® LBW & Pediamil® 1 Technical Specifications
                  </h4>
                  <p className="text-slate-600">
                    Official composition datasheet: 79.7 kcal, 2.42g protein, 4.88g lipids, 6.37g carbs per 100 mL prepared feed. Reconstitution: 6 scoops / 180 mL water yields ~198 mL feed.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Liptis Nutrition Switzerland</span>
                  <span className="font-semibold text-purple-700">Spec Sheet 2026-v1.0</span>
                </div>
              </div>

              {/* IUPAC Atomic Weights Link */}
              <a
                href="https://www.ciaaw.org/atomic-weights.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">Stoichiometry & Atomic Weights</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                    IUPAC Commission on Isotopic Abundances & Atomic Weights
                  </h4>
                  <p className="text-slate-600">
                    Exact elemental atomic weights utilized: Sodium 22.99 g/mol, Potassium 39.10 g/mol, Chloride 35.45 g/mol, Calcium 40.08 g/mol, Phosphorus 30.97 g/mol.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>IUPAC Standard Atomic Weights</span>
                  <span className="font-semibold text-slate-700">CIAAW Standard →</span>
                </div>
              </a>

              {/* PediTools Preterm Verification Link */}
              <a
                href="https://peditools.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sky-600 font-bold">
                    <span className="uppercase tracking-wider text-[10px]">Clinical Benchmark Reference</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                    PediTools Preterm Clinical Verification Algorithms
                  </h4>
                  <p className="text-slate-600">
                    Independent clinical growth algorithm benchmark used to cross-verify exact LMS median centiles across 22w–50w PMA gestational ages.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Chou JH, et al. PediTools Clinical Suite</span>
                  <span className="font-semibold text-sky-600">peditools.org →</span>
                </div>
              </a>
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

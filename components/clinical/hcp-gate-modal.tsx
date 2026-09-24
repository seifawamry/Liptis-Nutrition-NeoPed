"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ShieldCheck, AlertOctagon, Lock, FileText, CheckCircle } from "lucide-react";

interface HcpGateModalProps {
  onVerified: () => void;
}

export function HcpGateModal({ onVerified }: HcpGateModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [declined, setDeclined] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check ephemeral session storage
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("liptis_hcp_verified");
      if (verified === "true") {
        setIsOpen(false);
        onVerified();
        return;
      }
    }
    // Auto-focus the primary confirmation button when modal opens
    confirmBtnRef.current?.focus();
  }, [onVerified]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalRef.current) return;

      if (e.key === "Tab") {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("liptis_hcp_verified", "true");
    }
    setIsOpen(false);
    onVerified();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hcp-gate-title"
      aria-describedby="hcp-gate-desc"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-clinical-navy-950 via-clinical-navy-900 to-clinical-navy-800 p-6 text-white border-b border-clinical-navy-700">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <h1
                  id="hcp-gate-title"
                  className="text-lg font-bold tracking-tight text-white flex items-center gap-2"
                >
                  Liptis Nutrition NeoPed™
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Clinical Gate
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Low Birth Weight & Preterm Decision Support Architecture
                </p>
              </div>
            </div>
            <div className="relative w-28 h-8 hidden sm:block">
              <Image
                src="/logos/liptis-nutrition.png"
                alt="Liptis Nutrition Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {!declined ? (
            <>
              <div
                id="hcp-gate-desc"
                className="rounded-xl bg-blue-50/70 border border-blue-200/80 p-4 text-xs leading-relaxed text-blue-950 space-y-2"
              >
                <div className="flex items-center gap-2 font-semibold text-blue-900 text-sm">
                  <Lock className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                  Restricted Clinical Gate Verification
                </div>
                <p>
                  This decision support system provides deterministic enteral feed
                  and growth calculations strictly intended for licensed medical
                  personnel managing preterm and Low Birth Weight (LBW/VLBW/ELBW)
                  infants in Neonatal Intensive Care Units (NICU) and pediatric
                  wards.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-900 text-center">
                  Are you a licensed Healthcare Professional (Neonatologist /
                  Pediatrician / Clinical Dietitian)?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>ESPGHAN 2022 Enteral Standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Fenton 2013 & WHO Growth Standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>100% Client-Side Computation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Zero Remote Data Logging (HIPAA/GDPR)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-clinical-navy-900 hover:bg-clinical-navy-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-clinical-navy-700 focus-visible:outline-none"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Yes, I am a Licensed HCP
                </button>
                <button
                  type="button"
                  onClick={() => setDeclined(true)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  No, I am a Parent / Patient
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Patient & Caregiver Notice
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                The Liptis Nutrition NeoPed™ Suite contains high-density clinical
                formulae and parenteral/enteral calculators designed exclusively for
                physicians and NICU specialists. For medical advice or questions
                regarding your baby's nutrition or Pediamil® products, please
                consult your attending pediatrician or neonatologist.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeclined(false)}
                  className="py-2.5 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium"
                >
                  Back to HCP Verification
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer legal text */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Clinical Decision Support Matrix. Supported by Liptis Nutrition. Not for
          unsupervised lay use.
        </div>
      </div>
    </div>
  );
}

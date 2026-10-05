"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ClinicalCard({
  children,
  className,
  title,
  subtitle,
  action,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden transition-all",
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-clinical-navy-800">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-clinical-navy-950 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: "suboptimal" | "on_target" | "conditional" | "exceeding" | "neutral";
  label: string;
  className?: string;
}) {
  const styles = {
    on_target:
      "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20",
    conditional:
      "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-500/20",
    suboptimal:
      "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20",
    exceeding:
      "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/20",
    neutral:
      "bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-500/10",
  };

  const dotColors = {
    on_target: "bg-emerald-500",
    conditional: "bg-blue-500",
    suboptimal: "bg-amber-500",
    exceeding: "bg-rose-500",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        styles[status],
        className
      )}
    >
      <span
        className={cn("w-2 h-2 rounded-full", dotColors[status])}
      />
      {label}
    </span>
  );
}

export function RangeGauge({
  currentValue,
  minTarget,
  maxTarget,
  conditionalMaxTarget,
  minScale,
  maxScale,
  unit,
  metricName,
  status,
}: {
  currentValue: number;
  minTarget: number;
  maxTarget: number;
  conditionalMaxTarget?: number;
  minScale: number;
  maxScale: number;
  unit: string;
  metricName: string;
  status: "suboptimal" | "on_target" | "conditional" | "exceeding";
}) {
  const scaleRange = maxScale - minScale;
  const currentClamped = Math.max(minScale, Math.min(maxScale, currentValue));
  const currentPercent = ((currentClamped - minScale) / scaleRange) * 100;
  const targetMinPercent = ((minTarget - minScale) / scaleRange) * 100;
  const targetWidthPercent = ((maxTarget - minTarget) / scaleRange) * 100;

  // Optional conditional zone (e.g. 140 to 160 kcal/kg/d)
  const conditionalWidthPercent = conditionalMaxTarget
    ? ((conditionalMaxTarget - maxTarget) / scaleRange) * 100
    : 0;

  const needleColor =
    status === "on_target"
      ? "bg-emerald-600 border-emerald-800"
      : status === "conditional"
      ? "bg-blue-600 border-blue-800"
      : status === "suboptimal"
      ? "bg-amber-500 border-amber-700"
      : "bg-rose-600 border-rose-800";

  const accessibleText = `${metricName}: ${currentValue.toFixed(currentValue >= 10 ? 1 : 2)} ${unit}. Target range is ${minTarget} to ${maxTarget} ${unit}${conditionalMaxTarget ? ` (conditional up to ${conditionalMaxTarget} ${unit})` : ""}. Evaluation status is ${status}.`;

  const badgeLabels = {
    on_target: "Within Target",
    conditional: "Conditional Upper",
    suboptimal: "Below Target",
    exceeding: "Exceeds Ceiling",
  };

  return (
    <div
      className="w-full space-y-2"
      role="meter"
      aria-label={metricName}
      aria-valuenow={currentValue}
      aria-valuemin={minScale}
      aria-valuemax={maxScale}
      aria-valuetext={accessibleText}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <span className="text-xs font-bold text-slate-800 leading-snug">{metricName}</span>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-base font-extrabold text-slate-950 font-mono tracking-tight">
            {currentValue.toFixed(currentValue >= 10 ? 1 : 2)}{" "}
            <span className="text-xs font-medium text-slate-600">{unit}</span>
          </span>
          <StatusBadge
            status={status}
            label={badgeLabels[status] || "Evaluated"}
          />
        </div>
      </div>

      {/* Visual Bar with Target and Conditional Zones */}
      <div
        aria-hidden="true"
        className="relative h-6 bg-slate-100 rounded-lg p-0.5 border border-slate-200 overflow-hidden flex items-center"
      >
        {/* Typical Target Window */}
        <div
          className="absolute h-full bg-emerald-100/70 border-x border-emerald-400 flex items-center justify-center"
          style={{
            left: `${targetMinPercent}%`,
            width: `${targetWidthPercent}%`,
          }}
        >
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider opacity-80 select-none">
            Typical
          </span>
        </div>

        {/* Conditional High Intake Window */}
        {conditionalMaxTarget && (
          <div
            className="absolute h-full bg-blue-100/70 border-r border-blue-400 flex items-center justify-center"
            style={{
              left: `${targetMinPercent + targetWidthPercent}%`,
              width: `${conditionalWidthPercent}%`,
            }}
          >
            <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider opacity-80 select-none">
              Conditional
            </span>
          </div>
        )}

        {/* Current Position Marker Indicator */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center justify-center transition-all duration-300"
          style={{ left: `calc(${currentPercent}% - 6px)` }}
        >
          <div
            className={cn(
              "w-3 h-5 rounded-sm shadow-md border-2",
              needleColor
            )}
          />
        </div>
      </div>

      {/* Axis Scale & Target Range Labels (Non-overlapping layout) */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono gap-1.5 pt-0.5 px-0.5">
        <span className="text-slate-500 font-semibold">{minScale}</span>
        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Target Range: {minTarget}–{maxTarget} {unit}
          </span>
          {conditionalMaxTarget && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Cond. Max: ≤{conditionalMaxTarget} {unit}
            </span>
          )}
        </div>
        <span className="text-slate-500 font-semibold">{maxScale}</span>
      </div>
    </div>
  );
}

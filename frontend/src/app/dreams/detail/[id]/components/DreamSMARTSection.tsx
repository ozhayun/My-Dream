"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { SMARTGoal } from "@/types/dream";

interface DreamSMARTSectionProps {
  smartData?: SMARTGoal;
  isPolishing: boolean;
}

/** Render a SMART field value safely; backend may return objects instead of strings. */
function formatSmartValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    // Flatten object to readable text (e.g. { technical_skills, musical_expression } -> "technical_skills: ..., musical_expression: ...")
    const parts = Object.entries(value).map(
      ([k, v]) => `${k}: ${typeof v === "object" && v !== null ? JSON.stringify(v) : v}`
    );
    return parts.join(" • ");
  }
  return String(value);
}

export function DreamSMARTSection({
  smartData,
  isPolishing,
}: DreamSMARTSectionProps) {
  if (!smartData && !isPolishing) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
      {isPolishing && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-medium text-primary animate-pulse">
              Strategizing your success...
            </span>
          </div>
        </div>
      )}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" /> SMART Framework
      </h3>
      <div className="space-y-6">
        {[
          { label: "Specific", value: smartData?.specific },
          { label: "Measurable", value: smartData?.measurable },
          { label: "Achievable", value: smartData?.achievable },
          { label: "Relevant", value: smartData?.relevant },
          { label: "Time-bound", value: smartData?.time_bound },
        ].map((item) => {
          const text = formatSmartValue(item.value);
          return (
            <div key={item.label} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                {item.label}
              </span>
              <p className="text-sm leading-relaxed text-foreground/70 min-h-[1.5em]">
                {text || (isPolishing ? "Generating..." : "Not yet defined")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


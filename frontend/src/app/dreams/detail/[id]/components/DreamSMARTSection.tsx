"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { SMARTGoal } from "@/types/dream";

interface DreamSMARTSectionProps {
  smartData?: SMARTGoal;
  isPolishing: boolean;
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
        ].map((item) => (
          <div key={item.label} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
              {item.label}
            </span>
            <p className="text-sm leading-relaxed text-foreground/70 min-h-[1.5em]">
              {item.value ||
                (isPolishing ? "Generating..." : "Not yet defined")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


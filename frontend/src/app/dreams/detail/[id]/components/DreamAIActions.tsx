"use client";

import { Sparkles, Map as MapIcon, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { DreamEntry } from "@/types/dream";

interface DreamAIActionsProps {
  dream: DreamEntry;
  isPolishing: boolean;
  isGeneratingRoadmap: boolean;
  onPolish: () => void;
  onGenerateRoadmap: () => void;
}

export function DreamAIActions({
  dream,
  isPolishing,
  isGeneratingRoadmap,
  onPolish,
  onGenerateRoadmap,
}: DreamAIActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        onClick={onPolish}
        disabled={isPolishing || isGeneratingRoadmap}
        className={clsx(
          "flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-xl disabled:opacity-50 text-sm sm:text-base",
          dream.is_polished
            ? "bg-white/5 border border-white/10 text-foreground hover:bg-white/10"
            : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
        )}
      >
        {isPolishing ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        <span className="hidden sm:inline">
          {dream.is_polished ? "Re-polish with AI" : "Polish with AI"}
        </span>
        <span className="sm:hidden">
          {dream.is_polished ? "Re-polish" : "Polish"}
        </span>
      </button>
      <button
        onClick={onGenerateRoadmap}
        disabled={isPolishing || isGeneratingRoadmap}
        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-all shadow-xl disabled:opacity-50 text-sm sm:text-base"
      >
        {isGeneratingRoadmap ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        ) : (
          <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        <span className="hidden sm:inline">
          {dream.milestones?.length
            ? "Refresh Roadmap"
            : "Generate Roadmap"}
        </span>
        <span className="sm:hidden">
          {dream.milestones?.length ? "Refresh" : "Roadmap"}
        </span>
      </button>
    </div>
  );
}


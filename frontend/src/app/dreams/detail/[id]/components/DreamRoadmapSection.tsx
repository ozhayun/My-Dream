"use client";

import { Map as MapIcon, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { Milestone } from "@/types/dream";

interface DreamRoadmapSectionProps {
  milestones: Milestone[];
  onToggleMilestone: (milestoneId: string) => void;
}

export function DreamRoadmapSection({
  milestones,
  onToggleMilestone,
}: DreamRoadmapSectionProps) {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary/10 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MapIcon className="w-5 h-5 text-blue-400" /> Success Roadmap
      </h3>
      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            onClick={() => onToggleMilestone(m.id)}
            className="flex gap-6 relative group cursor-pointer"
          >
            <div
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300",
                m.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-white/10 text-foreground/70 group-hover:border-primary/50"
              )}
            >
              {m.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                idx + 1
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1 gap-x-4">
                <h4
                  className={clsx(
                    "font-semibold transition-all group-hover:text-primary",
                    m.completed &&
                      "line-through opacity-50 text-foreground/70"
                  )}
                >
                  {m.title}
                </h4>
                <span className="text-sm font-bold text-primary">
                  {m.target_year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


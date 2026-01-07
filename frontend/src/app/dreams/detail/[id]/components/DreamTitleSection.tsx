"use client";

import { useState, useEffect, useRef } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { Tag, Calendar, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { clsx } from "clsx";

const CATEGORIES: DreamCategory[] = [
  "Career & Business",
  "Finance & Wealth",
  "Health & Wellness",
  "Relationships & Family",
  "Travel & Adventure",
  "Skills & Knowledge",
  "Lifestyle & Hobbies",
  "Other",
];

interface DreamTitleSectionProps {
  dream: DreamEntry;
  initialTitle: string;
  onTitleChange: (title: string) => void;
  onTitleBlur?: (title: string) => void;
  onCategoryChange: (category: DreamCategory) => void;
  onYearChange: (year: number) => void;
  onCompletedToggle: () => void;
}

export function DreamTitleSection({
  dream,
  initialTitle,
  onTitleChange,
  onTitleBlur,
  onCategoryChange,
  onYearChange,
  onCompletedToggle,
}: DreamTitleSectionProps) {
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize title textarea on mount and when title changes
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${Math.min(
        titleTextareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [dream.title]);

  return (
    <div className="bg-secondary/20 border border-white/5 rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Mobile: Button at top, Desktop: Absolute positioned */}
      <div className="flex justify-end mb-4 sm:mb-0 sm:absolute sm:top-0 sm:right-0 sm:p-8">
        <button
          onClick={onCompletedToggle}
          className={clsx(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-medium transition-all shadow-lg text-sm sm:text-base",
            dream.completed
              ? "bg-green-500/20 text-green-400 border border-green-500/20"
              : "bg-white/5 text-foreground/70 border border-white/5 hover:bg-white/10"
          )}
        >
          {dream.completed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {dream.completed ? "Achieved" : "Mark as Achieved"}
          </span>
          <span className="sm:hidden">
            {dream.completed ? "Done" : "Mark Done"}
          </span>
        </button>
      </div>

      <div className="max-w-2xl space-y-6 pr-0 sm:pr-32">
        <textarea
          ref={titleTextareaRef}
          value={dream.title}
          onChange={(e) => {
            onTitleChange(e.target.value);
            // Auto-resize textarea
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(
              e.target.scrollHeight,
              200
            )}px`;
          }}
          onBlur={(e) => {
            // Only update in database when field loses focus
            if (e.target.value !== initialTitle && onTitleBlur) {
              onTitleBlur(e.target.value);
            }
          }}
          className="w-full bg-transparent border-none text-2xl sm:text-4xl font-bold focus:ring-0 p-0 placeholder:opacity-20 resize-none overflow-hidden min-h-12 leading-tight"
          placeholder="Dream Title"
          rows={1}
        />

        <div className="flex flex-wrap gap-2 sm:gap-4 pt-2">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
            <select
              value={dream.category}
              onChange={(e) =>
                onCategoryChange(e.target.value as DreamCategory)
              }
              className="bg-transparent border-none text-xs sm:text-sm focus:ring-0 p-0 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-background text-foreground"
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
            <input
              type="number"
              value={dream.suggested_target_year}
              onChange={(e) =>
                onYearChange(parseInt(e.target.value) || 2025)
              }
              className="bg-transparent border-none text-xs sm:text-sm focus:ring-0 p-0 w-12 sm:w-16"
            />
          </div>
          {dream.is_polished && (
            <span className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-primary/20 text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-primary/20">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{" "}
              <span className="hidden sm:inline">SMART Polished</span>
              <span className="sm:hidden">SMART</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


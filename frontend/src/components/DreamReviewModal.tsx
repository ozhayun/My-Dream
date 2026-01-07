"use client";

import { useState, useEffect, useCallback } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { Check, Trash2, Calendar, Tag, Type, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface DreamReviewModalProps {
  dreams: DreamEntry[];
  onSave: (dreams: DreamEntry[]) => void;
  onCancel: () => void;
}

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

export function DreamReviewModal({
  dreams,
  onSave,
  onCancel,
}: DreamReviewModalProps) {
  const [editableDreams, setEditableDreams] = useState<DreamEntry[]>(dreams);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleUpdate = (
    id: string,
    field: keyof DreamEntry,
    value: string | number | DreamCategory | boolean | null
  ) => {
    setIsDirty(true);
    setEditableDreams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleDelete = (id: string) => {
    setIsDirty(true);
    setEditableDreams((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCancelAttempt = useCallback(() => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirmClose) {
          setShowConfirmClose(false);
        } else {
          handleCancelAttempt();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCancelAttempt, showConfirmClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
          <div className="text-start">
            <h2 className="text-2xl font-bold">Review Your Dreams</h2>
            <p className="text-foreground/70 text-sm text-pretty">
              Here is what I found. Verify and edit before we save them.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {editableDreams.length === 0 ? (
            <div className="text-center py-10 text-foreground/70">
              No dreams left to save.
            </div>
          ) : (
            editableDreams.map((dream) => (
              <div
                key={dream.id}
                className="grid grid-cols-12 gap-3 p-3 rounded-lg border border-border/50 bg-secondary/10 items-center hover:bg-secondary/20 transition-colors"
              >
                {/* Title Input */}
                <div className="col-span-12 md:col-span-5 relative">
                  <Type className="w-4 h-4 absolute top-3 left-3 text-foreground/70" />
                  <input
                    type="text"
                    value={dream.title}
                    onChange={(e) =>
                      handleUpdate(dream.id, "title", e.target.value)
                    }
                    className="w-full bg-background/50 border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Dream Title"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="col-span-6 md:col-span-3 relative">
                  <Tag className="w-4 h-4 absolute top-3 left-3 text-foreground/70" />
                  <select
                    value={dream.category}
                    onChange={(e) =>
                      handleUpdate(
                        dream.id,
                        "category",
                        e.target.value as DreamCategory
                      )
                    }
                    className={clsx(
                      "w-full bg-background/50 border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
                    )}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Input */}
                <div className="col-span-5 md:col-span-2 relative">
                  <Calendar className="w-4 h-4 absolute top-3 left-3 text-foreground/70" />
                  <input
                    type="number"
                    value={dream.suggested_target_year}
                    onChange={(e) =>
                      handleUpdate(
                        dream.id,
                        "suggested_target_year",
                        parseInt(e.target.value) || new Date().getFullYear()
                      )
                    }
                    className="w-full bg-background/50 border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Year"
                  />
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-1">
                  <button
                    onClick={() => handleDelete(dream.id)}
                    className="p-2 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Delete Dream"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-secondary/10 flex justify-end gap-3">
          <button
            onClick={handleCancelAttempt}
            className="px-4 py-2 rounded-lg text-foreground/70 hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editableDreams)}
            disabled={editableDreams.length === 0}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Save to My List
          </button>
        </div>

        {/* Confirmation Modal Overlay */}
        <AnimatePresence>
          {showConfirmClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-110 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-sm w-full text-center"
              >
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-start">
                  Discard changes?
                </h3>
                <p className="text-foreground/70 text-sm mb-6 text-start text-pretty">
                  You have unsaved changes. Are you sure you want to discard
                  them?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirmClose(false)}
                    className="px-4 py-2 rounded-lg text-foreground/70 hover:bg-secondary/50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium shadow-lg shadow-red-500/20"
                  >
                    Discard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

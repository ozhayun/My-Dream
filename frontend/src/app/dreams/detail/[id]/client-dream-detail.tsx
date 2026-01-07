"use client";

import { useState, useEffect, useRef } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  ArrowLeft,
  Sparkles,
  Map as MapIcon,
  Calendar,
  Tag,
  CheckCircle2,
  Circle,
  Save,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  polishDreamAction,
  updateDreamAction,
  deleteDreamAction,
  generateRoadmapAction,
} from "@/app/actions";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

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

export function ClientDreamDetail({
  initialDream,
}: {
  initialDream: DreamEntry;
}) {
  const [dream, setDream] = useState<DreamEntry>(initialDream);
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Journal State
  const [newEntry, setNewEntry] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Custom Modal State
  const [isDeleteDreamModalOpen, setIsDeleteDreamModalOpen] = useState(false);
  const [deleteLogEntryId, setDeleteLogEntryId] = useState<string | null>(null);

  const router = useRouter();
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

  const handleUpdate = async (updates: Partial<DreamEntry>) => {
    setDream((prev) => ({ ...prev, ...updates }));
    setIsSaving(true);
    try {
      // Use the dream ID from initialDream or the initial state since it never changes
      await updateDreamAction(initialDream.id, updates);
    } catch (error) {
      console.error("Failed to update dream", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePolish = async () => {
    setIsPolishing(true);
    try {
      // polishDreamAction already saves to Supabase, just update local state
      const smartData = await polishDreamAction(dream.id);
      setDream((prev) => ({
        ...prev,
        is_polished: true,
        smart_data: smartData,
        title: smartData.polished_title,
      }));
      router.refresh();
    } catch (error) {
      console.error("Failed to polish dream", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!dream.milestones) return;
    const milestone = dream.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const isNowCompleted = !milestone.completed;
    const updatedMilestones = dream.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: isNowCompleted } : m
    );

    let updatedEntries = dream.journal_entries || [];
    if (isNowCompleted) {
      const entry = {
        id: Math.random().toString(36).substr(2, 9),
        content: `🚩 Milestone Achieved: ${milestone.title}`,
        created_at: new Date().toISOString(),
      };
      updatedEntries = [entry, ...updatedEntries];
    }

    await handleUpdate({
      milestones: updatedMilestones,
      journal_entries: updatedEntries,
    });
  };

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);

    try {
      // generateRoadmapAction already saves to Supabase, just update local state
      const milestones = await generateRoadmapAction(dream.id);

      // Update local state with the saved milestones (preserve other fields)
      setDream((prev) => ({ ...prev, milestones }));
      router.refresh();
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleAddJournalEntry = async () => {
    if (!newEntry.trim()) return;
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      content: newEntry,
      created_at: new Date().toISOString(),
    };
    const updatedEntries = [entry, ...(dream.journal_entries || [])];
    await handleUpdate({ journal_entries: updatedEntries });
    setNewEntry("");
  };

  const handleEditJournalEntry = async (id: string, content: string) => {
    const updatedEntries = (dream.journal_entries || []).map((e) =>
      e.id === id ? { ...e, content, updated_at: new Date().toISOString() } : e
    );
    await handleUpdate({ journal_entries: updatedEntries });
    setEditingEntryId(null);
  };

  const handleDeleteJournalEntry = async (id: string) => {
    const updatedEntries = (dream.journal_entries || []).filter(
      (e) => e.id !== id
    );
    await handleUpdate({ journal_entries: updatedEntries });
    setDeleteLogEntryId(null);
  };

  const handleDelete = async () => {
    try {
      await deleteDreamAction(dream.id);
      router.push("/dreams");
    } catch (error) {
      console.error("Failed to delete dream", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[10px] text-foreground/70 animate-pulse">
              Saving changes...
            </span>
          )}
          <button
            onClick={() => setIsDeleteDreamModalOpen(true)}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Stats */}
      <div className="bg-secondary/20 border border-white/5 rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Mobile: Button at top, Desktop: Absolute positioned */}
        <div className="flex justify-end mb-4 sm:mb-0 sm:absolute sm:top-0 sm:right-0 sm:p-8">
          <button
            onClick={() => handleUpdate({ completed: !dream.completed })}
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
              setDream((prev) => ({ ...prev, title: e.target.value }));
              // Auto-resize textarea
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(
                e.target.scrollHeight,
                200
              )}px`;
            }}
            onBlur={(e) => {
              // Only update in database when field loses focus
              if (e.target.value !== initialDream.title) {
                handleUpdate({ title: e.target.value });
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
                  handleUpdate({ category: e.target.value as DreamCategory })
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
                  handleUpdate({
                    suggested_target_year: parseInt(e.target.value) || 2025,
                  })
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* AI Data & Roadmap */}
        <div className="space-y-8">
          {/* AI Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handlePolish}
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
              onClick={handleGenerateRoadmap}
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

          {/* ROADMAP & SMART GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Roadmap Section */}
            {dream.milestones && dream.milestones.length > 0 && (
              <div className="bg-secondary/10 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-400" /> Success Roadmap
                </h3>
                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                  {dream.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(m.id)}
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
            )}

            {/* SMART Goal Details */}
            {(dream.smart_data || isPolishing) && (
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
                    { label: "Specific", value: dream.smart_data?.specific },
                    {
                      label: "Measurable",
                      value: dream.smart_data?.measurable,
                    },
                    {
                      label: "Achievable",
                      value: dream.smart_data?.achievable,
                    },
                    { label: "Relevant", value: dream.smart_data?.relevant },
                    {
                      label: "Time-bound",
                      value: dream.smart_data?.time_bound,
                    },
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
            )}
          </div>
        </div>

        {/* Discovery Logs (Journal) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-400" /> Discovery
              Logs
            </h3>
            <span className="text-xs text-foreground/70 font-mono">
              {(dream.journal_entries || []).length} Entries
            </span>
          </div>

          {/* New Post Input */}
          <div className="bg-secondary/10 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Share a milestone, a thought, or a breakthrough..."
              className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary/50 outline-none resize-none min-h-[100px] transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddJournalEntry}
                disabled={!newEntry.trim() || isSaving}
                className="px-6 py-2 rounded-xl bg-purple-500 text-white font-semibold flex items-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Post Entry
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            <AnimatePresence>
              {(dream.journal_entries || []).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-white/5 rounded-2xl p-8 shadow-xl hover:border-white/10 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-foreground/70">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleDateString()} at{" "}
                      {new Date(entry.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {entry.updated_at && (
                        <span className="text-primary">(Edited)</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      {editingEntryId === entry.id ? (
                        <>
                          <button
                            onClick={() =>
                              handleEditJournalEntry(entry.id, editContent)
                            }
                            className="text-green-400 hover:text-green-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingEntryId(null)}
                            className="text-foreground/70"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingEntryId(entry.id);
                              setEditContent(entry.content);
                            }}
                            className="hover:text-primary transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteLogEntryId(entry.id)}
                            className="hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingEntryId === entry.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none min-h-[100px]"
                    />
                  ) : (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {(dream.journal_entries || []).length === 0 && (
              <div className="text-center py-20 bg-secondary/5 border border-dashed border-white/10 rounded-3xl">
                <p className="text-foreground/70 italic">
                  No entries yet. Start your journey by writing your first post!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Delete Confirm Modals */}
      <DeleteConfirmModal
        isOpen={isDeleteDreamModalOpen}
        title="Delete Dream"
        description="This will permanently delete this dream and all its progress. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDreamModalOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={!!deleteLogEntryId}
        title="Delete Log Entry"
        description="Are you sure you want to delete this discovery log? This action cannot be undone."
        onConfirm={() =>
          deleteLogEntryId && handleDeleteJournalEntry(deleteLogEntryId)
        }
        onCancel={() => setDeleteLogEntryId(null)}
      />
    </div>
  );
}

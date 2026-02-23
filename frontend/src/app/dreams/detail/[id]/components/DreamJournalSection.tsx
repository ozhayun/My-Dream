"use client";

import { useState } from "react";
import { MessageSquare, Save, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry } from "@/types/dream";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

interface DreamJournalSectionProps {
  journalEntries: JournalEntry[];
  onAddEntry: (content: string) => void;
  onEditEntry: (id: string, content: string) => void;
  onDeleteEntry: (id: string) => void;
  isSaving: boolean;
}

export function DreamJournalSection({
  journalEntries,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  isSaving,
}: DreamJournalSectionProps) {
  const [newEntry, setNewEntry] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteLogEntryId, setDeleteLogEntryId] = useState<string | null>(null);

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    onAddEntry(newEntry);
    setNewEntry("");
  };

  const handleEditEntry = (id: string) => {
    onEditEntry(id, editContent);
    setEditingEntryId(null);
  };

  const handleConfirmDeleteEntry = () => {
    if (deleteLogEntryId) {
      onDeleteEntry(deleteLogEntryId);
      setDeleteLogEntryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-400" /> Discovery Logs
        </h3>
        <span className="text-xs text-foreground/70 font-mono">
          {journalEntries.length} Entries
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
            onClick={handleAddEntry}
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
          {journalEntries.map((entry) => (
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
                        onClick={() => handleEditEntry(entry.id)}
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

        {journalEntries.length === 0 && (
          <div className="text-center py-20 bg-secondary/5 border border-dashed border-white/10 rounded-3xl">
            <p className="text-foreground/70 italic">
              No entries yet. Start your journey by writing your first post!
            </p>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteLogEntryId !== null}
        title="Delete Log Entry"
        description="Are you sure you want to delete this discovery log? This action cannot be undone."
        onConfirm={handleConfirmDeleteEntry}
        onCancel={() => setDeleteLogEntryId(null)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { useRouter } from "next/navigation";
import {
  polishDreamAction,
  updateDreamAction,
  deleteDreamAction,
  generateRoadmapAction,
} from "@/app/actions";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  DreamHeader,
  DreamTitleSection,
  DreamAIActions,
  DreamRoadmapSection,
  DreamSMARTSection,
  DreamJournalSection,
} from "./components";
import { generateId } from "@/lib/id";

export function ClientDreamDetail({
  initialDream,
}: {
  initialDream: DreamEntry;
}) {
  const [dream, setDream] = useState<DreamEntry>(initialDream);
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteDreamModalOpen, setIsDeleteDreamModalOpen] = useState(false);

  const router = useRouter();

  const handleUpdate = async (updates: Partial<DreamEntry>) => {
    setDream((prev) => ({ ...prev, ...updates }));
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateDreamAction(initialDream.id, updates);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save changes.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setDream((prev) => ({ ...prev, title }));
  };

  const handleTitleBlur = (title: string) => {
    handleUpdate({ title });
  };

  const handleCategoryChange = (category: DreamCategory) => {
    handleUpdate({ category });
  };

  const handleYearChange = (year: number) => {
    handleUpdate({ suggested_target_year: year });
  };

  const handleCompletedToggle = () => {
    handleUpdate({ completed: !dream.completed });
  };

  const handlePolish = async () => {
    setIsPolishing(true);
    setErrorMessage(null);
    try {
      const smartData = await polishDreamAction(dream.id);
      setDream((prev) => ({
        ...prev,
        is_polished: true,
        smart_data: smartData,
        title: smartData.polished_title,
      }));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to polish dream.";
      setErrorMessage(message);
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
        id: generateId(),
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
    setErrorMessage(null);
    try {
      const milestones = await generateRoadmapAction(dream.id);
      setDream((prev) => ({ ...prev, milestones }));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate roadmap.";
      setErrorMessage(message);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleAddJournalEntry = async (content: string) => {
    const entry = {
      id: generateId(),
      content,
      created_at: new Date().toISOString(),
    };
    const updatedEntries = [entry, ...(dream.journal_entries || [])];
    await handleUpdate({ journal_entries: updatedEntries });
  };

  const handleEditJournalEntry = async (id: string, content: string) => {
    const updatedEntries = (dream.journal_entries || []).map((e) =>
      e.id === id ? { ...e, content, updated_at: new Date().toISOString() } : e
    );
    await handleUpdate({ journal_entries: updatedEntries });
  };

  const handleDeleteJournalEntry = async (id: string) => {
    const updatedEntries = (dream.journal_entries || []).filter(
      (e) => e.id !== id
    );
    await handleUpdate({ journal_entries: updatedEntries });
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteDreamAction(dream.id);
      window.location.href = "/dreams";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete dream.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {errorMessage && (
        <div
          className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3"
          role="alert"
        >
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="shrink-0 px-2 py-1 rounded-lg hover:bg-destructive/20 transition-colors"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}
      <DreamHeader
        isSaving={isSaving}
        onDeleteClick={() => setIsDeleteDreamModalOpen(true)}
      />

      <DreamTitleSection
        dream={dream}
        initialTitle={initialDream.title}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        onCategoryChange={handleCategoryChange}
        onYearChange={handleYearChange}
        onCompletedToggle={handleCompletedToggle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* AI Data & Roadmap */}
        <div className="space-y-8">
          <DreamAIActions
            dream={dream}
            isPolishing={isPolishing}
            isGeneratingRoadmap={isGeneratingRoadmap}
            onPolish={handlePolish}
            onGenerateRoadmap={handleGenerateRoadmap}
          />

          {/* ROADMAP & SMART GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DreamRoadmapSection
              milestones={dream.milestones || []}
              onToggleMilestone={toggleMilestone}
            />

            <DreamSMARTSection
              smartData={dream.smart_data}
              isPolishing={isPolishing}
            />
          </div>
        </div>

        {/* Discovery Logs (Journal) */}
        <DreamJournalSection
          journalEntries={dream.journal_entries || []}
          onAddEntry={handleAddJournalEntry}
          onEditEntry={handleEditJournalEntry}
          onDeleteEntry={handleDeleteJournalEntry}
          isSaving={isSaving}
        />
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteDreamModalOpen}
        title="Delete Dream"
        description="This will permanently delete this dream and all its progress. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDreamModalOpen(false)}
      />
    </div>
  );
}

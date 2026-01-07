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

export function ClientDreamDetail({
  initialDream,
}: {
  initialDream: DreamEntry;
}) {
  const [dream, setDream] = useState<DreamEntry>(initialDream);
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Custom Modal State
  const [isDeleteDreamModalOpen, setIsDeleteDreamModalOpen] = useState(false);

  const router = useRouter();

  const handleUpdate = async (updates: Partial<DreamEntry>) => {
    setDream((prev) => ({ ...prev, ...updates }));
    setIsSaving(true);
    try {
      await updateDreamAction(initialDream.id, updates);
    } catch (error) {
      console.error("Failed to update dream", error);
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
      const milestones = await generateRoadmapAction(dream.id);
      setDream((prev) => ({ ...prev, milestones }));
      router.refresh();
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleAddJournalEntry = async (content: string) => {
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
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
    try {
      await deleteDreamAction(dream.id);
      window.location.href = "/dreams";
    } catch (error) {
      console.error("Failed to delete dream", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

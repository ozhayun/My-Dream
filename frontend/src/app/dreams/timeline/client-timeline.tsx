"use client";

import { DreamEntry } from "@/types/dream";
import { DreamTimeline } from "@/components/DreamTimeline";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";

export function ClientTimelineWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const [editingDream, setEditingDream] = useState<DreamEntry | null>(null);
    const router = useRouter();

    const handleSave = async (id: string, updates: Partial<DreamEntry>) => {
        setLocalDreams(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        try {
            await fetch(`/api/dreams/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            router.refresh();
        } catch (error) {
            console.error("Failed to save edit", error);
        }
    };

    return (
        <>
            <DreamTimeline 
                dreams={localDreams} 
                onDreamClick={(dream) => setEditingDream(dream)}
            />

            {editingDream && (
                <EditDreamModal 
                    dream={editingDream} 
                    open={!!editingDream} 
                    onOpenChange={(open) => !open && setEditingDream(null)}
                    onSave={handleSave}
                />
            )}
        </>
    );
}

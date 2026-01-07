"use client";

import { DreamEntry, DreamCategory } from "@/types/dream";
import { DreamKanban } from "@/components/DreamKanban";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClientKanbanWrapper({ initialDreams }: { initialDreams: DreamEntry[] }) {
    const [dreams, setDreams] = useState(initialDreams);
    const router = useRouter();

    const handleCategoryUpdate = async (dreamId: string, newCategory: DreamCategory) => {
        // Optimistic UI update
        const previousDreams = [...dreams];
        setDreams(prev => prev.map(d => d.id === dreamId ? { ...d, category: newCategory } : d));

        try {
            const res = await fetch(`/api/dreams/${dreamId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: newCategory })
            });
            
            if (!res.ok) throw new Error("Failed to update");
            
            router.refresh(); // Refresh server data in background
        } catch {
            setDreams(previousDreams); // Revert on error
        }
    };

    return <DreamKanban dreams={dreams} onUpdateCategory={handleCategoryUpdate} />;
}

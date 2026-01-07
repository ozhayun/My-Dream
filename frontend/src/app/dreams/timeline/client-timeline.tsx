"use client";

import { useState } from "react";

import { DreamEntry } from "@/types/dream";
import { DreamTimeline } from "@/components/DreamTimeline";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export function ClientTimelineWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const router = useRouter();

    const handleToggleStatus = async (id: string, completed: boolean) => {
        setLocalDreams(prev => prev.map(d => d.id === id ? { ...d, completed } : d));
        try {
            await api.dreams.update(id, { completed });
            router.refresh();
        } catch {
        }
    };

    return (
        <DreamTimeline 
            dreams={localDreams} 
            onDreamClick={(dream) => router.push(`/dreams/detail/${dream.id}`)}
            onToggleStatus={handleToggleStatus}
        />
    );
}

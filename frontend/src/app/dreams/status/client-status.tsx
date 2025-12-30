"use client";

import { DreamEntry } from "@/types/dream";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { api } from "@/services/api";

export function ClientStatusWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const router = useRouter();

    const sortedDreams = [...localDreams].sort((a, b) => a.suggested_target_year - b.suggested_target_year);
    const achieved = sortedDreams.filter(d => d.completed);
    const active = sortedDreams.filter(d => !d.completed);

    const handleToggle = async (e: React.MouseEvent, dream: DreamEntry) => {
        e.stopPropagation();
        const newStatus = !dream.completed;
        setLocalDreams(prev => prev.map(d => d.id === dream.id ? { ...d, completed: newStatus } : d));
        try {
            await api.dreams.update(dream.id, { completed: newStatus });
            router.refresh();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🚀 Active ({active.length})
                </h3>
                <div className="space-y-3">
                    {active.map(d => (
                        <div 
                            key={d.id} 
                            onClick={() => router.push(`/dreams/detail/${d.id}`)} 
                            className="p-4 bg-secondary/10 border border-border rounded-xl cursor-pointer hover:bg-secondary/20 transition-all group"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="font-medium flex-1 group-hover:text-primary transition-colors">{d.title}</div>
                                <button 
                                    onClick={(e) => handleToggle(e, d)}
                                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Circle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                                <span className="bg-white/5 px-2 py-0.5 rounded-full">{d.category}</span>
                                <span className="font-mono">{d.suggested_target_year}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-500">
                    🏆 Achieved ({achieved.length})
                </h3>
                <div className="space-y-3">
                    {achieved.map(d => (
                        <div 
                            key={d.id} 
                            onClick={() => router.push(`/dreams/detail/${d.id}`)} 
                            className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl cursor-pointer hover:bg-green-500/10 transition-all group"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="font-medium line-through decoration-green-500/50 flex-1 opacity-60 group-hover:opacity-100 transition-opacity">{d.title}</div>
                                <button 
                                    onClick={(e) => handleToggle(e, d)}
                                    className="p-1 text-green-500"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{d.category}</span>
                                <span className="font-mono">{d.suggested_target_year}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Removing unused EditDreamModal and old handlers

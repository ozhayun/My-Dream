"use client";

import { DreamEntry } from "@/types/dream";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "@/services/api";

export function ClientStatusWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const [editingDream, setEditingDream] = useState<DreamEntry | null>(null);
    const router = useRouter();

    const achieved = [...localDreams].filter(d => d.completed).sort((a, b) => b.suggested_target_year - a.suggested_target_year);
    const active = [...localDreams].filter(d => !d.completed).sort((a, b) => b.suggested_target_year - a.suggested_target_year);

    const handleSave = async (id: string, updates: Partial<DreamEntry>) => {
        setLocalDreams(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        try {
            await api.dreams.update(id, updates);
            router.refresh();
        } catch (error) {
            console.error("Failed to save edit", error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this dream?")) return;
        
        setLocalDreams(prev => prev.filter(d => d.id !== id));
        try {
            await api.dreams.delete(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete dream", error);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🚀 Active ({active.length})
                    </h3>
                    <div className="space-y-3">
                        {active.map(d => (
                            <div key={d.id} onClick={() => setEditingDream(d)} className="p-3 bg-secondary/10 border border-border rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-medium flex-1">{d.title}</div>
                                    <button 
                                        onClick={(e) => handleDelete(e, d.id)}
                                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                    <span>{d.category}</span>
                                    <span>{d.suggested_target_year}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-500">
                            🏆 Achieved ({achieved.length})
                        </h3>
                        <div className="space-y-3 opacity-80">
                        {achieved.map(d => (
                            <div key={d.id} onClick={() => setEditingDream(d)} className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/10 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-medium line-through decoration-green-500/50 flex-1">{d.title}</div>
                                    <button 
                                        onClick={(e) => handleDelete(e, d.id)}
                                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{d.category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

"use client";

import { DreamEntry } from "@/types/dream";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Trash2 } from "lucide-react";
import { api } from "@/services/api";

export function ClientCategoryDetailWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const [editingDream, setEditingDream] = useState<DreamEntry | null>(null);
    const router = useRouter();

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
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localDreams.map(d => (
                  <div key={d.id} className={clsx(
                      "p-4 bg-card border rounded-xl hover:border-primary/50 transition-colors cursor-pointer",
                      d.completed && "opacity-60"
                  )} onClick={() => setEditingDream(d)}>
                      <h3 className={clsx("font-semibold", d.completed && "line-through text-muted-foreground")}>{d.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">Target: {d.suggested_target_year}</p>
                   </div>
              ))}
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

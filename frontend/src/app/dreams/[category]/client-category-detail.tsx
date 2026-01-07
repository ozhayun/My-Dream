"use client";

import { DreamEntry } from "@/types/dream";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Trash2, Sparkles, Map as MapIcon, Loader2 } from "lucide-react";
import { polishDreamAction, updateDreamAction, deleteDreamAction } from "@/app/actions";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export function ClientCategoryDetailWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const [deleteDreamId, setDeleteDreamId] = useState<string | null>(null);
    const router = useRouter();

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteDreamId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDreamId) return;
        
        setLocalDreams(prev => prev.filter(d => d.id !== deleteDreamId));
        try {
            await deleteDreamAction(deleteDreamId);
        } catch {
        } finally {
            setDeleteDreamId(null);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...localDreams].sort((a, b) => a.suggested_target_year - b.suggested_target_year).map(d => (
                    <div 
                        key={d.id} 
                        className={clsx(
                            "p-6 bg-secondary/20 border border-white/5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group relative backdrop-blur-xl shadow-xl",
                            d.completed && "opacity-60"
                        )} 
                        onClick={() => router.push(`/dreams/detail/${d.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                        <h3 className={clsx("font-semibold text-lg", d.completed && "line-through text-foreground/70")}>
                            {d.title}
                        </h3>
                        {d.is_polished && (
                            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Polished
                            </span>
                        )}
                        </div>
                        
                        <p className="text-sm text-foreground/70">Target: {d.suggested_target_year}</p>
                        
                        <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                            >
                                View Details
                            </button>
                            <button 
                                onClick={(e) => handleDeleteClick(e, d.id)}
                                className="ml-auto p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={!!deleteDreamId}
                title="Delete Dream"
                description="This will permanently delete this dream and all its progress. This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDreamId(null)}
            />
        </>
    );
}

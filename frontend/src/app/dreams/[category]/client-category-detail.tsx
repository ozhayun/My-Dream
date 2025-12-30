"use client";

import { DreamEntry } from "@/types/dream";
import { useState } from "react";
import { EditDreamModal } from "@/components/EditDreamModal";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Trash2, Sparkles, Map as MapIcon, Loader2 } from "lucide-react";
import { polishDreamAction, updateDreamAction, deleteDreamAction } from "@/app/actions";

export function ClientCategoryDetailWrapper({ dreams }: { dreams: DreamEntry[] }) {
    const [localDreams, setLocalDreams] = useState(dreams);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this dream?")) return;
        
        setLocalDreams(prev => prev.filter(d => d.id !== id));
        try {
            await deleteDreamAction(id);
        } catch (error) {
            console.error("Failed to delete dream", error);
        }
    };

    return (
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
                    <h3 className={clsx("font-semibold text-lg", d.completed && "line-through text-muted-foreground")}>
                        {d.title}
                    </h3>
                    {d.is_polished && (
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Polished
                        </span>
                    )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">Target: {d.suggested_target_year}</p>
                    
                    <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                        >
                            View Details
                        </button>
                        <button 
                            onClick={(e) => handleDelete(e, d.id)}
                            className="ml-auto p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

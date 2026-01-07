"use client";

import { DreamEntry } from "@/types/dream";
import { CATEGORY_COLORS } from "@/lib/constants";
import { clsx } from "clsx";
import { CheckCircle2, Circle } from "lucide-react";

interface DreamTimelineProps {
    dreams: DreamEntry[];
    onToggleStatus?: (id: string, completed: boolean) => void;
    onDreamClick?: (dream: DreamEntry) => void;
}

export function DreamTimeline({ dreams, onDreamClick, onToggleStatus }: DreamTimelineProps) {
    // Group dreams by year
    const groupedDreams = dreams.reduce((acc, dream) => {
        const year = dream.suggested_target_year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(dream);
        return acc;
    }, {} as Record<number, DreamEntry[]>);

    const years = Object.keys(groupedDreams).map(Number).sort((a, b) => a - b);

    return (
        <div className="relative border-l border-border/50 ml-6 space-y-12 py-8">
            {years.map(year => (
                <div key={year} className="relative pl-6">
                    {/* Year Marker */}
                    <div className="absolute -left-[33px] flex items-center justify-center w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                    
                    <h3 className="text-2xl font-bold mb-6 text-foreground/80">{year}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedDreams[year].sort((a, b) => a.title.localeCompare(b.title)).map(dream => (
                             <div 
                                key={dream.id} 
                                className={clsx(
                                    "p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/30 cursor-pointer hover:bg-white/5 group relative",
                                    dream.completed && "opacity-60 grayscale-[0.5]"
                                )}
                                onClick={() => onDreamClick?.(dream)}
                             >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={clsx(
                                        "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border",
                                        CATEGORY_COLORS[dream.category] ? CATEGORY_COLORS[dream.category].replace("bg-", "bg-opacity-20 bg-") : "bg-secondary text-foreground/70"
                                    )}>
                                        {dream.category}
                                    </span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleStatus?.(dream.id, !dream.completed);
                                        }}
                                        className="p-1 hover:text-primary transition-colors"
                                    >
                                        {dream.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-foreground/70" />}
                                    </button>
                                </div>
                                <h4 className={clsx("font-medium transition-all group-hover:text-primary", dream.completed && "line-through")}>
                                    {dream.title}
                                </h4>
                             </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

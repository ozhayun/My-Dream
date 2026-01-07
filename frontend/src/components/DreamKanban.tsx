"use client";

import { useMemo, useState, useEffect } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { createPortal } from "react-dom";
import { CATEGORY_COLORS } from "@/lib/constants";

const CATEGORIES: DreamCategory[] = [
    "Career & Business",
    "Finance & Wealth",
    "Health & Wellness",
    "Relationships & Family",
    "Travel & Adventure",
    "Skills & Knowledge",
    "Lifestyle & Hobbies",
    "Other"
];

interface DreamKanbanProps {
    dreams: DreamEntry[];
    onUpdateCategory: (dreamId: string, newCategory: DreamCategory) => void;
}

export function DreamKanban({ dreams, onUpdateCategory }: DreamKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
             // over.id should be the category
             onUpdateCategory(active.id as string, over.id as DreamCategory);
        }
    };

    // Filter active items to pass to overlay
    const activeDream = useMemo(() => dreams.find(d => d.id === activeId), [dreams, activeId]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
             <div className="flex flex-wrap justify-center gap-4 pb-4 items-start">
                  {CATEGORIES.map(cat => (
                      <KanbanColumn 
                        key={cat} 
                        category={cat} 
                        dreams={dreams
                            .filter(d => d.category === cat)
                            .sort((a, b) => a.suggested_target_year - b.suggested_target_year)
                        } 
                      />
                  ))}
             </div>

            {createPortal(
                <DragOverlay>
                    {activeDream ? <KanbanCard dream={activeDream} isOverlay /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

function KanbanColumn({ category, dreams }: { category: string, dreams: DreamEntry[] }) {
    const { setNodeRef, isOver } = useDroppable({
        id: category,
    });

    const colorClasses = CATEGORY_COLORS[category] || "bg-secondary/20";

    return (
        <div 
            ref={setNodeRef}
            className={clsx(
                "min-w-[300px] w-[300px] rounded-xl p-3 flex flex-col gap-3 h-full max-h-[calc(100vh-250px)] border transition-colors overflow-hidden",
                colorClasses,
                isOver && "ring-2 ring-primary/50" 
            )}
        >
            <div className="flex items-center justify-between mb-1 px-1">
                <h3 className="font-semibold text-sm truncate opacity-90" title={category}>{category}</h3>
                <span className="text-xs bg-background/40 px-2 py-0.5 rounded-full opacity-70 font-mono">{dreams.length}</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar pr-1">
                {dreams.map(dream => (
                    <KanbanCard key={dream.id} dream={dream} />
                ))}
            </div>
        </div>
    );
}

function KanbanCard({ dream, isOverlay }: { dream: DreamEntry, isOverlay?: boolean }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: dream.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
         <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => !isDragging && router.push(`/dreams/detail/${dream.id}`)}
            className={clsx(
                "p-3 rounded-lg bg-card border border-border/50 shadow-sm text-sm cursor-grab active:cursor-grabbing hover:border-primary/30 group",
                isDragging && "opacity-30",
                isOverlay && "scale-105 shadow-xl rotate-2 ring-2 ring-primary z-50 opacity-100 bg-card"
            )}
         >
            <h4 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-3 text-sm leading-tight">{dream.title}</h4>
            <span className="text-xs text-foreground/70">{dream.suggested_target_year}</span>
         </div>
    );
}

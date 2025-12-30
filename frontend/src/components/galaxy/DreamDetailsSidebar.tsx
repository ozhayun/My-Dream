"use client";

import { DreamEntry } from "@/types/dream";
import { X, Calendar, Target, CheckCircle2, MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface DreamDetailsSidebarProps {
    dream: DreamEntry | null;
    onClose: () => void;
}

export function DreamDetailsSidebar({ dream, onClose }: DreamDetailsSidebarProps) {
    if (!dream) return null;

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background/60 backdrop-blur-2xl border-l border-white/5 z-[100] p-8 shadow-2xl overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                    {dream.category}
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">{dream.title}</h2>
            
            <div className="flex items-center gap-4 mb-8 text-muted-foreground text-sm">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Target: {dream.suggested_target_year}
                </div>
                <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    Status: {dream.completed ? "Achieved" : "In Progress"}
                </div>
            </div>

            {dream.smart_data && (
                <div className="space-y-6 mb-12">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Strategy</h3>
                     <div className="grid gap-4">
                        {Object.entries(dream.smart_data).map(([key, val]) => {
                            if (key === 'polished_title') return null;
                            return (
                                <div key={key} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{key.replace('_', ' ')}</div>
                                    <div className="text-sm text-foreground/90">{val as string}</div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}

            {dream.milestones && dream.milestones.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400/80 flex items-center gap-2">
                        <MapIcon className="w-4 h-4" /> Roadmap
                    </h3>
                    <div className="space-y-4">
                        {dream.milestones.map((m, idx) => (
                            <div key={m.id} className="flex gap-4 items-start">
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold",
                                    m.completed ? "bg-primary border-primary text-primary-foreground" : "bg-white/5 border-white/10 text-muted-foreground"
                                )}>
                                    {m.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{m.title}</div>
                                    <div className="text-[10px] text-muted-foreground">{m.target_year}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

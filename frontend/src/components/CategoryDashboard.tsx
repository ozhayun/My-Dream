"use client";

import { DreamEntry, DreamCategory } from "@/types/dream";
import { clsx } from "clsx";
import { Briefcase, Plane, Heart, Home, DollarSign, PenTool, Layout, Box } from "lucide-react";

interface CategoryDashboardProps {
    dreams: DreamEntry[];
    onSelectCategory: (category: DreamCategory) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    "Career & Business": Briefcase,
    "Finance & Wealth": DollarSign,
    "Health & Wellness": Heart,
    "Relationships & Family": Home,
    "Travel & Adventure": Plane,
    "Skills & Knowledge": PenTool,
    "Lifestyle & Hobbies": Layout,
    "Other": Box
};

import { CATEGORY_COLORS } from "@/lib/constants";

export function CategoryDashboard({ dreams, onSelectCategory }: CategoryDashboardProps) {
    // Count dreams per category
    const counts = dreams.reduce((acc, dream) => {
        acc[dream.category] = (acc[dream.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate progress (completed / total)
    const progress = dreams.reduce((acc, dream) => {
        if (!acc[dream.category]) acc[dream.category] = { total: 0, completed: 0 };
        acc[dream.category].total += 1;
        if (dream.completed) acc[dream.category].completed += 1;
        return acc;
    }, {} as Record<string, { total: number, completed: number }>);

    const categories = Object.keys(CATEGORY_ICONS) as DreamCategory[];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
                const Icon = CATEGORY_ICONS[cat];
                const count = counts[cat] || 0;
                const { total, completed } = progress[cat] || { total: 0, completed: 0 };
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        className={clsx(
                            "group p-6 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-xl text-left flex flex-col justify-between h-[180px]",
                            CATEGORY_COLORS[cat], // Contains bg, text, and border
                        )}
                    >
                         <div className="flex justify-between w-full">
                            <div className={clsx("p-3 rounded-full bg-background/50", CATEGORY_COLORS[cat].split(" ")[1])}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold opacity-80">{count}</span>
                         </div>
                         
                         <div className="space-y-2">
                             <h3 className="font-semibold text-lg leading-tight opacity-90">{cat}</h3>
                             <div className="w-full bg-background/30 h-1.5 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-current opacity-70" 
                                    style={{ width: `${percentage}%` }}
                                 />
                             </div>
                             <p className="text-xs opacity-60">{completed}/{total} Achieved</p>
                         </div>
                    </button>
                );
            })}
        </div>
    );
}

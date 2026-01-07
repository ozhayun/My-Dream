"use client";

import { DreamEntry } from "@/types/dream";
import { CategoryDashboard } from "@/components/CategoryDashboard";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

export function ClientCategoryDashboard({ dreams, isSearch }: { dreams: DreamEntry[], isSearch?: boolean }) {
    const router = useRouter();

    if (isSearch) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    🔍 Search Results ({dreams.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...dreams].sort((a, b) => a.suggested_target_year - b.suggested_target_year).map(d => (
                        <div 
                            key={d.id} 
                            className="p-6 bg-secondary/20 border border-white/5 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group backdrop-blur-xl shadow-xl"
                            onClick={() => router.push(`/dreams/detail/${d.id}`)}
                        >
                            <h3 className="font-semibold text-lg mb-2">{d.title}</h3>
                            <div className="flex justify-between text-xs text-foreground/70">
                                <span>{d.category}</span>
                                <span>{d.suggested_target_year}</span>
                            </div>
                        </div>
                    ))}
                    {dreams.length === 0 && (
                        <div className="col-span-full py-20 text-center text-foreground/70">
                            No dreams found matching your search.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <CategoryDashboard 
            dreams={dreams} 
            onSelectCategory={(category) => {
                router.push(`/dreams/${slugify(category)}`);
            }} 
        />
    );
}

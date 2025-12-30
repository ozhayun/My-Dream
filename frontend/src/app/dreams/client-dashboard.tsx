"use client";

import { DreamEntry } from "@/types/dream";
import { CategoryDashboard } from "@/components/CategoryDashboard";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

export function ClientCategoryDashboard({ dreams }: { dreams: DreamEntry[] }) {
    const router = useRouter();

    return (
        <CategoryDashboard 
            dreams={dreams} 
            onSelectCategory={(category) => {
                router.push(`/dreams/${slugify(category)}`);
            }} 
        />
    );
}

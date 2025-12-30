import { api } from "@/services/api";
import { DreamNavBar } from "@/components/DreamNavBar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getCategoryFromSlug } from "@/lib/utils";
import { ClientCategoryDetailWrapper } from "./client-category-detail";

const CATEGORIES = [
    "Career & Business",
    "Finance & Wealth",
    "Health & Wellness",
    "Relationships & Family",
    "Travel & Adventure",
    "Skills & Knowledge",
    "Lifestyle & Hobbies",
    "Other"
];

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const dreams = await api.dreams.list();
  const { category } = await params;
  
  const categoryName = getCategoryFromSlug(category, CATEGORIES) || decodeURIComponent(category);
  
  const categoryDreams = dreams.filter(d => d.category === categoryName);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
       <DreamNavBar />
       
       <div className="min-h-[500px]">

           <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>

          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
              <ClientCategoryDetailWrapper dreams={categoryDreams} />
          </Suspense>
       </div>
    </div>
  );
}

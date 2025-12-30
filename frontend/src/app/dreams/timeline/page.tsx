import { api } from "@/services/api";
import { DreamNavBar } from "@/components/DreamNavBar";
import { ClientTimelineWrapper } from "./client-timeline"; // Fixed import path
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const dreams = await api.dreams.list();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
       <DreamNavBar />
       
       <div className="min-h-[500px]">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
              <ClientTimelineWrapper dreams={dreams} />
          </Suspense>
       </div>
    </div>
  );
}

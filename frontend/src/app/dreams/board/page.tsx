import { api } from "@/services/api";
import { DreamNavBar } from "@/components/DreamNavBar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import {ClientKanbanWrapper} from "./client-kanban";
export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const dreams = await api.dreams.list();

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-7xl">
       <DreamNavBar />
       
       <div className="min-h-[500px]">
          <div className="md:hidden flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="bg-secondary/20 p-6 rounded-2xl">
                  <p className="text-muted-foreground">The Board view is optimized for desktop screens.</p>
                  <p className="text-sm mt-2">Please rotate your device or use a larger screen.</p>
              </div>
          </div>
          <div className="hidden md:block">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                <ClientKanbanWrapper initialDreams={dreams} />
            </Suspense>
          </div>
       </div>
    </div>
  );
}

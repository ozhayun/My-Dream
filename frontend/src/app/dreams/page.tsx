import { searchDreamsAction } from "../actions";
import { api } from "@/services/api";
import { DreamNavBar } from "@/components/DreamNavBar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ClientCategoryDashboard } from "./client-dashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let dreams;
  
  if (q) {
    const searchResults = await searchDreamsAction(q);
    dreams = searchResults.map((r: any) => r.dream);
  } else {
    dreams = await api.dreams.list();
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
       <DreamNavBar />
       
       <div className="min-h-[500px]">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
              <ClientCategoryDashboard dreams={dreams} isSearch={!!q} />
          </Suspense>
       </div>
    </div>      
  );
}

// We need a wrapper because CategoryDashboard takes a callback currently.
// I'll inline a simple wrapper or update CategoryDashboard in next step to be smarter.
// For now, let's assume we update CategoryDashboard to handle navigation naturally.
// Actually, let's keep it simple: Pass a client component that wraps simple `CategoryDashboard`.


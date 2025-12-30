import { api } from "@/services/api";
import { DreamNavBar } from "@/components/DreamNavBar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ClientStatusWrapper } from "./client-status";

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const dreams = await api.dreams.list();

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-7xl">
       <DreamNavBar />
       
       <div className="min-h-[500px]">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
              <ClientStatusWrapper dreams={dreams} />
          </Suspense>
       </div>
    </div>
  );
}

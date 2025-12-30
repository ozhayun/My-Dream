import { api } from "@/services/api";
import { notFound } from "next/navigation";
import { ClientDreamDetail } from "./client-dream-detail";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DreamDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  try {
    const dream = await api.dreams.get(id);
    
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen max-w-5xl">
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
            <ClientDreamDetail initialDream={dream} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch dream:", error);
    return notFound();
  }
}

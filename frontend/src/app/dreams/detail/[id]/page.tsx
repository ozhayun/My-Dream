import { api } from "@/services/api";
import { notFound } from "next/navigation";
import { ClientDreamDetail } from "./client-dream-detail";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let dream;
  try {
    dream = await api.dreams.get(id);
  } catch (error) {
    // Silently handle "Dream not found" errors - likely deleted
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Dream not found")) {
      return notFound();
    }
    console.error("Failed to fetch dream:", error);
    return notFound();
  }

  // If dream doesn't exist, redirect to dreams list
  if (!dream) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen max-w-5xl">
      <Suspense
        fallback={
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <ClientDreamDetail initialDream={dream} />
      </Suspense>
    </div>
  );
}

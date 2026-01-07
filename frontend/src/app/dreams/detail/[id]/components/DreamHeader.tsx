"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DreamHeaderProps {
  isSaving: boolean;
  onDeleteClick: () => void;
}

export function DreamHeader({ isSaving, onDeleteClick }: DreamHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-2">
        {isSaving && (
          <span className="text-[10px] text-foreground/70 animate-pulse">
            Saving changes...
          </span>
        )}
        <button
          onClick={onDeleteClick}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


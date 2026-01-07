"use client";

import { useEffect, useState } from "react";
import { DreamEntry } from "@/types/dream";
import { getDreams } from "@/app/actions";
import { Loader2 } from "lucide-react";
import { DreamForm } from "./DreamForm";

export function DreamDashboard() {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDreams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDreams();
      setDreams(data);
    } catch (err) {
      console.error("Error fetching dreams:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dreams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  const handleDreamSaved = () => {
    fetchDreams();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Add New Dream</h2>
        <div className="bg-secondary/30 border border-white/10 rounded-lg p-6 backdrop-blur-xl">
          <DreamForm onSuccess={handleDreamSaved} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">My Dreams</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {dreams.length === 0 ? (
          <div className="bg-secondary/30 border border-white/10 rounded-lg p-8 text-center">
            <p className="text-foreground/70">
              No dreams yet. Add your first dream above!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dreams.map((dream) => (
              <div
                key={dream.id}
                className="bg-secondary/30 border border-white/10 rounded-lg p-6 backdrop-blur-xl hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{dream.title}</h3>
                  {dream.completed && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/70 mb-2">
                  {dream.category}
                </p>
                <p className="text-xs text-foreground/70">
                  Target: {dream.suggested_target_year}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


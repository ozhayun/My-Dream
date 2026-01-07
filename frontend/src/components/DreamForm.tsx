"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DreamCategory } from "@/types/dream";
import { saveDream } from "@/app/actions";
import { Loader2 } from "lucide-react";

const DREAM_CATEGORIES: DreamCategory[] = [
  "Career & Business",
  "Finance & Wealth",
  "Health & Wellness",
  "Relationships & Family",
  "Travel & Adventure",
  "Skills & Knowledge",
  "Lifestyle & Hobbies",
  "Other",
];

interface DreamFormProps {
  onSuccess?: () => void;
}

export function DreamForm({ onSuccess }: DreamFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DreamCategory | null>(null);
  const [targetYear, setTargetYear] = useState<number>(
    new Date().getFullYear() + 1
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Please enter a dream title");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saveDream(title.trim(), category, targetYear);
      setTitle("");
      setCategory(null);
      setTargetYear(new Date().getFullYear() + 1);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error saving dream:", err);
      setError(err instanceof Error ? err.message : "Failed to save dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Dream Title</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Learn to play the piano"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-muted-foreground text-xs">(optional - AI will suggest if empty)</span>
        </Label>
        <select
          id="category"
          value={category || ""}
          onChange={(e) => setCategory(e.target.value ? (e.target.value as DreamCategory) : null)}
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Let AI suggest...</option>
          {DREAM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetYear">Target Year</Label>
        <Input
          id="targetYear"
          type="number"
          value={targetYear}
          onChange={(e) => setTargetYear(parseInt(e.target.value) || new Date().getFullYear() + 1)}
          min={new Date().getFullYear()}
          max={2100}
          disabled={isSubmitting}
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Dream"
        )}
      </Button>
    </form>
  );
}


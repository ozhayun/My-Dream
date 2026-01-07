"use client";

import { useState } from "react";
import { DreamEntry, DreamCategory } from "@/types/dream";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Map as MapIcon } from "lucide-react";

interface EditDreamModalProps {
  dream: DreamEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<DreamEntry>) => Promise<void>;
}

const CATEGORIES: DreamCategory[] = [
    "Career & Business",
    "Finance & Wealth",
    "Health & Wellness",
    "Relationships & Family",
    "Travel & Adventure",
    "Skills & Knowledge",
    "Lifestyle & Hobbies",
    "Other"
];

export function EditDreamModal({ dream, open, onOpenChange, onSave }: EditDreamModalProps) {
  const [title, setTitle] = useState(dream.title);
  const [category, setCategory] = useState<DreamCategory>(dream.category);
  const [targetYear, setTargetYear] = useState(dream.suggested_target_year.toString());
  const [isCompleted, setIsCompleted] = useState(dream.completed || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(dream.id, {
        title,
        category,
        suggested_target_year: parseInt(targetYear) || 2030,
        completed: isCompleted
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save dream:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Dream</DialogTitle>
          <DialogDescription>
            Update the details of your dream.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter dream title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DreamCategory)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                    ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Target Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  placeholder="2030"
                />
              </div>
          </div>
          
          {dream.is_polished && dream.smart_data && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> SMART Goal Analysis
              </h4>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                 <p><span className="font-semibold text-primary">Specific:</span> {dream.smart_data.specific}</p>
                 <p><span className="font-semibold text-primary">Measurable:</span> {dream.smart_data.measurable}</p>
                 <p><span className="font-semibold text-primary">Achievable:</span> {dream.smart_data.achievable}</p>
                 <p><span className="font-semibold text-primary">Relevant:</span> {dream.smart_data.relevant}</p>
                 <p><span className="font-semibold text-primary">Time-bound:</span> {dream.smart_data.time_bound}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
             <input 
                type="checkbox" 
                id="completed" 
                checked={isCompleted} 
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
             />
             <Label htmlFor="completed" className="cursor-pointer">Mark as Achieved 🏆</Label>
          </div>
        </div>

        {/* Milestone Section could go here or in a separate tab/view */}
        {dream.milestones && dream.milestones.length > 0 && (
          <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapIcon className="w-4 h-4" /> Roadmap
            </h4>
            <div className="space-y-2">
              {dream.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="flex-1">{m.title}</span>
                  <span className="text-foreground/70 font-medium">{m.target_year}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

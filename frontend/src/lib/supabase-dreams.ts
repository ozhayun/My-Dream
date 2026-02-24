import {
  DreamEntry,
  DreamCategory,
  SMARTGoal,
  Milestone,
  JournalEntry,
} from "@/types/dream";

/** Supabase table name for dreams. Single source of truth for all dreams queries. */
export const SUPABASE_DREAMS_TABLE = "dreams" as const;

/** Raw row shape from Supabase dreams table (select *). Optional fields for partial responses. */
export interface SupabaseDreamRow {
  id: string;
  title: string;
  category: string;
  suggested_target_year: number;
  completed?: boolean;
  is_polished?: boolean;
  smart_data?: SMARTGoal;
  milestones?: Milestone[];
  journal_entries?: JournalEntry[];
  notes?: string;
  user_id?: string;
  created_at?: string;
  embedding?: unknown;
}

/**
 * Map a Supabase dreams row to DreamEntry. Handles partial rows (e.g. from search).
 */
export function mapSupabaseRowToDreamEntry(row: SupabaseDreamRow): DreamEntry {
  return {
    id: row.id,
    title: row.title,
    category: row.category as DreamCategory,
    suggested_target_year: row.suggested_target_year,
    completed: row.completed ?? false,
    is_polished: row.is_polished ?? false,
    smart_data: row.smart_data ?? undefined,
    milestones: row.milestones ?? undefined,
    journal_entries: row.journal_entries ?? undefined,
    notes: row.notes ?? undefined,
  };
}

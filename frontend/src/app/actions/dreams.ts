"use server";

import {
  DreamEntry,
  DreamCategory,
  SMARTGoal,
  Milestone,
  JournalEntry,
} from "@/types/dream";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { ensureUserExists } from "./helpers";

/**
 * Get all dreams for the current user
 */
export async function getDreams() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch dreams: ${error.message}`);
    }

    // Transform Supabase data to match DreamEntry interface
    const dreams: DreamEntry[] = (data || []).map(
      (dream: {
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
      }) => ({
        id: dream.id,
        title: dream.title,
        category: dream.category as DreamCategory,
        suggested_target_year: dream.suggested_target_year,
        completed: dream.completed || false,
        is_polished: dream.is_polished || false,
        smart_data: dream.smart_data || undefined,
        milestones: dream.milestones || undefined,
        journal_entries: dream.journal_entries || undefined,
        notes: dream.notes || undefined,
      })
    );

    return dreams;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch dreams");
  }
}

/**
 * Save multiple dreams in batch
 */
export async function saveDreamsBatchAction(dreams: DreamEntry[]) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Ensure user exists in Supabase (fallback if webhook didn't fire)
    await ensureUserExists(userId);

    // Save each dream individually to Supabase
    const savedDreams = [];
    for (const dream of dreams) {
      const { data, error } = await supabase
        .from("dreams")
        .insert({
          user_id: userId,
          title: dream.title,
          category: dream.category,
          suggested_target_year: dream.suggested_target_year,
          completed: dream.completed || false,
          embedding: null, // Placeholder for future embedding
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save dream: ${error.message}`);
      }

      savedDreams.push({
        id: data.id,
        title: data.title,
        category: data.category,
        suggested_target_year: data.suggested_target_year,
        completed: data.completed || false,
      });
    }

    revalidatePath("/dreams");
    return savedDreams;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save dreams");
  }
}

/**
 * Update a dream
 */
export async function updateDreamAction(
  dreamId: string,
  updates: Partial<DreamEntry>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Build update object with only defined values (exclude undefined)
    // This ensures partial updates don't overwrite existing data
    const updateData: Record<string, unknown> = Object.entries(updates).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    // If no fields to update, return current dream
    if (Object.keys(updateData).length === 0) {
      const { data: currentDream } = await supabase
        .from("dreams")
        .select("*")
        .eq("id", dreamId)
        .eq("user_id", userId)
        .single();

      if (!currentDream) {
        throw new Error("Dream not found");
      }

      return {
        id: currentDream.id,
        title: currentDream.title,
        category: currentDream.category,
        suggested_target_year: currentDream.suggested_target_year,
        completed: currentDream.completed || false,
        is_polished: currentDream.is_polished || false,
        smart_data: currentDream.smart_data || undefined,
        milestones: currentDream.milestones || undefined,
        journal_entries: currentDream.journal_entries || undefined,
        notes: currentDream.notes || undefined,
      };
    }

    const { data, error } = await supabase
      .from("dreams")
      .update(updateData)
      .eq("id", dreamId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update dream: ${error.message}`);
    }

    if (!data) {
      throw new Error("Dream not found or no changes made");
    }

    revalidatePath("/dreams");
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      suggested_target_year: data.suggested_target_year,
      completed: data.completed || false,
      is_polished: data.is_polished || false,
      smart_data: data.smart_data || undefined,
      milestones: data.milestones || undefined,
      journal_entries: data.journal_entries || undefined,
      notes: data.notes || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update dream");
  }
}

/**
 * Delete a dream
 */
export async function deleteDreamAction(dreamId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("dreams")
      .delete()
      .eq("id", dreamId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete dream: ${error.message}`);
    }

    revalidatePath("/dreams");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete dream");
  }
}

/**
 * Search dreams by query string
 */
export async function searchDreamsAction(query: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Simple text search in Supabase (can be enhanced with vector search later)
    const { data, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .ilike("title", `%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    const dreams: DreamEntry[] = (data || []).map(
      (dream: {
        id: string;
        title: string;
        category: string;
        suggested_target_year: number;
        completed?: boolean;
      }) => ({
        id: dream.id,
        title: dream.title,
        category: dream.category as DreamCategory,
        suggested_target_year: dream.suggested_target_year,
        completed: dream.completed || false,
      })
    );

    return dreams;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Search failed");
  }
}


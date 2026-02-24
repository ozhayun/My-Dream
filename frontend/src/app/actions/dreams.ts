"use server";

import { DreamEntry } from "@/types/dream";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { ensureUserExists } from "./helpers";
import {
  SUPABASE_DREAMS_TABLE,
  mapSupabaseRowToDreamEntry,
} from "@/lib/supabase-dreams";

/** Turn Supabase/network errors into a message the user can act on. */
function normalizeSupabaseError(message: string, context: "fetch" | "save"): string {
  const isNetworkError =
    message.includes("fetch failed") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("network");
  if (isNetworkError) {
    return `Cannot reach Supabase. Check that your Supabase project is resumed (Dashboard → your project → Resume) and your network allows outbound HTTPS. ${context === "fetch" ? "Failed to load dreams." : "Failed to save dreams."}`;
  }
  return message;
}

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
      .from(SUPABASE_DREAMS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        normalizeSupabaseError(error.message, "fetch") || "Failed to fetch dreams"
      );
    }

    const dreams: DreamEntry[] = (data || []).map(mapSupabaseRowToDreamEntry);
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
        .from(SUPABASE_DREAMS_TABLE)
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
        throw new Error(
          normalizeSupabaseError(error.message, "save") || "Failed to save dream"
        );
      }

      savedDreams.push(mapSupabaseRowToDreamEntry(data));
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
        .from(SUPABASE_DREAMS_TABLE)
        .select("*")
        .eq("id", dreamId)
        .eq("user_id", userId)
        .single();

      if (!currentDream) {
        throw new Error("Dream not found");
      }

      return mapSupabaseRowToDreamEntry(currentDream);
    }

    const { data, error } = await supabase
      .from(SUPABASE_DREAMS_TABLE)
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
    revalidatePath(`/dreams/detail/${dreamId}`);
    return mapSupabaseRowToDreamEntry(data);
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
      .from(SUPABASE_DREAMS_TABLE)
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
      .from(SUPABASE_DREAMS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .ilike("title", `%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    const dreams: DreamEntry[] = (data || []).map(mapSupabaseRowToDreamEntry);
    return dreams;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Search failed");
  }
}


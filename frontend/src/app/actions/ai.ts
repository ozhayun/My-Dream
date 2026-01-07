"use server";

import { DreamEntry, SMARTGoal, DreamCategory } from "@/types/dream";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";
import { ensureUserExists } from "./helpers";
import {
  DREAM_EXTRACTION_SYSTEM_MESSAGE,
  getDreamExtractionPrompt,
  SMART_GOAL_SYSTEM_MESSAGE,
  getSmartGoalPrompt,
  DREAM_ANALYSIS_SYSTEM_MESSAGE,
  getDreamAnalysisPromptWithCategory,
  getDreamAnalysisPromptWithoutCategory,
} from "./prompts";

/**
 * Analyze text and extract multiple dreams using AI
 */
export async function createDreamsAction(text: string) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const prompt = getDreamExtractionPrompt(text);

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: DREAM_EXTRACTION_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to get analysis from Groq");
    }

    let parsedData: {
      dreams?: Array<{
        title?: string;
        category?: string;
        suggested_target_year?: number;
      }>;
    };
    try {
      parsedData = JSON.parse(content);
    } catch {
      console.error("Failed to parse Groq response:", content);
      throw new Error(
        "Failed to parse AI response. Please try rephrasing your input."
      );
    }

    const dreams = parsedData.dreams || [];

    // Transform to DreamEntry format
    const dreamEntries: DreamEntry[] = dreams.map((dream) => ({
      id: crypto.randomUUID(),
      title: dream.title || "",
      category: (dream.category || "Other") as DreamCategory,
      suggested_target_year:
        dream.suggested_target_year || new Date().getFullYear() + 1,
      completed: false,
    }));

    return dreamEntries;
  } catch (error: unknown) {
    console.error("Error analyzing dreams:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to analyze your dreams. Please try rephrasing your input.");
  }
}

/**
 * Transform a dream into a SMART goal format using AI
 */
export async function polishDreamAction(dreamId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the dream from Supabase
    const { data: dream, error: fetchError } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", dreamId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !dream) {
      throw new Error("Dream not found");
    }

    // Use Groq to polish the dream
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const prompt = getSmartGoalPrompt(dream.title);

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SMART_GOAL_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to get polished goal from Groq");
    }

    const smartData = JSON.parse(content) as SMARTGoal;

    // Update the dream in Supabase with full SMART data
    const { error: updateError } = await supabase
      .from("dreams")
      .update({
        title: smartData.polished_title,
        smart_data: smartData,
        is_polished: true,
      })
      .eq("id", dreamId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating dream:", updateError);
      throw new Error(`Failed to save SMART data: ${updateError.message}`);
    }

    revalidatePath("/dreams");
    return smartData;
  } catch (error) {
    console.error("Error in polishDreamAction:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to polish dream");
  }
}

/**
 * Save a single dream with AI analysis (summary and category suggestion)
 */
export async function saveDream(
  title: string,
  category: DreamCategory | null,
  target_year: number
) {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Ensure user exists in Supabase (fallback if webhook didn't fire)
    await ensureUserExists(userId);

    // Initialize Groq client
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    // Use Groq to analyze the dream and generate summary + suggest category
    // Note: We are currently in 2026, so target_year suggestions should be realistic
    const analysisPrompt = category
      ? getDreamAnalysisPromptWithCategory(title, category)
      : getDreamAnalysisPromptWithoutCategory(title);

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: DREAM_ANALYSIS_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const analysisContent = groqResponse.choices[0]?.message?.content;
    if (!analysisContent) {
      throw new Error("Failed to get analysis from Groq");
    }

    let analysisData: { summary: string; category: string };
    try {
      analysisData = JSON.parse(analysisContent);
    } catch {
      console.error("Failed to parse Groq response:", analysisContent);
      // Fallback: use original title and category
      analysisData = {
        summary: title,
        category: category || "Other",
      };
    }

    // Use AI-suggested category or fallback to provided category
    const finalCategory = (analysisData.category ||
      category ||
      "Other") as DreamCategory;

    // TODO: Generate embeddings using text-embedding-3-large or similar
    // For now, we'll leave embedding as null - it can be generated later

    // Insert dream into Supabase
    const { data, error } = await supabase
      .from("dreams")
      .insert({
        user_id: userId,
        title: title,
        category: finalCategory,
        suggested_target_year: target_year,
        embedding: null, // Placeholder - will be populated with embedding model later
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to save dream: ${error.message}`);
    }

    revalidatePath("/dreams");
    return {
      success: true,
      data: {
        ...data,
        summary: analysisData.summary,
      },
    };
  } catch (error) {
    console.error("Error in saveDream:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save dream");
  }
}


"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";
import { Milestone } from "@/types/dream";
import {
  ROADMAP_SYSTEM_MESSAGE,
  getRoadmapPrompt,
} from "./prompts/roadmap";

/**
 * Generate and save roadmap for a dream
 */
export async function generateRoadmapAction(dreamId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get dream from Supabase
    const { data: dream, error: fetchError } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", dreamId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !dream) {
      throw new Error("Dream not found");
    }

    // Generate roadmap using Groq
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const prompt = getRoadmapPrompt(
      dream.title,
      dream.category || "General",
      dream.suggested_target_year || 2027
    );

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: ROADMAP_SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to generate roadmap from Groq");
    }

    const roadmapData = JSON.parse(content) as {
      roadmap?: {
        title?: string;
        milestones?: Array<{
          title: string;
          target_date: string;
        }>;
      };
    };

    // Extract milestones from response
    const roadmapMilestones = roadmapData.roadmap?.milestones || [];
    
    // Transform to Milestone format expected by the app
    const milestones: Milestone[] = roadmapMilestones.map((m) => {
      // Parse target_date to extract year
      const dateMatch = m.target_date.match(/^(\d{4})/);
      const targetYear = dateMatch ? parseInt(dateMatch[1]) : dream.suggested_target_year;

      return {
        id: crypto.randomUUID(),
        title: m.title,
        target_year: targetYear,
        completed: false,
      };
    });

    // Save milestones to Supabase
    const { error: updateError } = await supabase
      .from("dreams")
      .update({
        milestones: milestones,
      })
      .eq("id", dreamId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to save roadmap: ${updateError.message}`);
    }

    revalidatePath("/dreams");
    return milestones;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate roadmap");
  }
}


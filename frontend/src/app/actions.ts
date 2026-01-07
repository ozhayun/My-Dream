"use server";

import { DreamEntry, SMARTGoal, DreamCategory } from "@/types/dream";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

// Helper: Ensure user exists in Supabase (fallback if webhook didn't fire)
async function ensureUserExists(userId: string) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingUser) {
    // Get user info from Clerk
    const user = await currentUser();
    if (user) {
      await supabase.from("users").insert({
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        avatar_url: user.imageUrl || null,
      });
    }
  }
}

export async function createDreamsAction(text: string) {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const groq = new Groq({
            apiKey: groqApiKey,
        });

        const prompt = `You are analyzing a user's dreams and goals. IMPORTANT: We are currently in the year 2026.

Analyze the following text and extract ALL dreams/goals mentioned. When suggesting target years:
- Consider that we are in 2026
- If multiple travel destinations or major goals are mentioned, spread them across different years (you can't visit Australia and Japan in the same year, or start a business and get a PhD in the same year)
- Be realistic about timeframes - some goals take longer than others
- Consider logical sequencing (e.g., learn a skill before teaching it, save money before buying a house)

For each dream, provide:
1. A clear, concise title
2. The most appropriate category from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other
3. A suggested target year (must be 2026 or later, and spread multiple dreams across different years logically)

Text: "${text}"

Respond with a JSON object containing a "dreams" array:
{
  "dreams": [
    {
      "title": "dream title",
      "category": "category name",
      "suggested_target_year": 2027
    }
  ]
}`;

        const groqResponse = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that extracts and structures personal goals and dreams from text. When multiple dreams are mentioned, consider them together and spread them across different years logically. Always respond with valid JSON only - a JSON object with a 'dreams' array.",
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
            throw new Error("Failed to get analysis from Groq");
        }

        let parsedData: { dreams?: Array<{ title?: string; category?: string; suggested_target_year?: number }> };
        try {
            parsedData = JSON.parse(content);
        } catch {
            console.error("Failed to parse Groq response:", content);
            throw new Error("Failed to parse AI response. Please try rephrasing your input.");
        }

        const dreams = parsedData.dreams || [];
        
        // Transform to DreamEntry format
        const dreamEntries: DreamEntry[] = dreams.map((dream) => ({
            id: crypto.randomUUID(),
            title: dream.title || "",
            category: (dream.category || "Other") as DreamCategory,
            suggested_target_year: dream.suggested_target_year || new Date().getFullYear() + 1,
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
                console.error("Error saving dream:", error);
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
        console.error("Error in saveDreamsBatchAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to save dreams");
    }
}

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

        const prompt = `Transform this dream/goal into a SMART goal format. Provide:
1. Specific: What exactly do you want to achieve?
2. Measurable: How will you measure progress?
3. Achievable: Is this realistic?
4. Relevant: Why is this important?
5. Time-bound: What's the deadline?
6. A polished, inspiring title

Dream: "${dream.title}"

Respond in JSON:
{
  "specific": "...",
  "measurable": "...",
  "achievable": "...",
  "relevant": "...",
  "time_bound": "...",
  "polished_title": "..."
}`;

        const groqResponse = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that transforms goals into SMART format. Always respond with valid JSON only.",
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

        // Update the dream in Supabase
        const { error: updateError } = await supabase
            .from("dreams")
            .update({
                title: smartData.polished_title,
            })
            .eq("id", dreamId)
            .eq("user_id", userId);

        if (updateError) {
            console.error("Error updating dream:", updateError);
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

export async function updateDreamAction(dreamId: string, updates: Partial<DreamEntry>) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
            .from("dreams")
            .update({
                title: updates.title,
                category: updates.category,
                suggested_target_year: updates.suggested_target_year,
                completed: updates.completed,
            })
            .eq("id", dreamId)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            throw new Error(`Failed to update dream: ${error.message}`);
        }

        revalidatePath("/dreams");
        return {
            id: data.id,
            title: data.title,
            category: data.category,
            suggested_target_year: data.suggested_target_year,
            completed: data.completed || false,
        };
    } catch (error) {
        console.error("Error in updateDreamAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update dream");
    }
}

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
            console.error("Supabase error:", error);
            throw new Error(`Failed to delete dream: ${error.message}`);
        }

        revalidatePath("/dreams");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteDreamAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to delete dream");
    }
}

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
            console.error("Supabase error:", error);
            throw new Error(`Search failed: ${error.message}`);
        }

        const dreams: DreamEntry[] = (data || []).map((dream: { id: string; title: string; category: string; suggested_target_year: number; completed?: boolean }) => ({
            id: dream.id,
            title: dream.title,
            category: dream.category as DreamCategory,
            suggested_target_year: dream.suggested_target_year,
            completed: dream.completed || false,
        }));

        return dreams;
    } catch (error) {
        console.error("Error in searchDreamsAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Search failed");
    }
}

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
      ? `You are analyzing a dream/goal. IMPORTANT: We are currently in the year 2026.

Analyze this dream/goal and provide:
1. A one-sentence summary (concise and inspiring)
2. Confirm the category "${category}" is appropriate, or suggest a better one from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other

Dream: "${title}"

Respond in JSON format:
{
  "summary": "one sentence summary here",
  "category": "suggested category name"
}`
      : `You are analyzing a dream/goal. IMPORTANT: We are currently in the year 2026.

Analyze this dream/goal and provide:
1. A one-sentence summary (concise and inspiring)
2. Suggest the best category from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other

Dream: "${title}"

Respond in JSON format:
{
  "summary": "one sentence summary here",
  "category": "suggested category name"
}`;

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes personal goals and dreams. Always respond with valid JSON only.",
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
    const finalCategory = (analysisData.category || category || "Other") as DreamCategory;

    // TODO: Generate embeddings using text-embedding-3-large or similar
    // For now, we'll leave embedding as null - it can be generated later
    // Example future implementation:
    // const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     model: "text-embedding-3-large",
    //     input: title,
    //   }),
    // });
    // const embeddingData = await embeddingResponse.json();
    // const embedding = embeddingData.data[0].embedding;

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
      }
    };
  } catch (error) {
    console.error("Error in saveDream:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save dream");
  }
}

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
      console.error("Supabase error:", error);
      throw new Error(`Failed to fetch dreams: ${error.message}`);
    }

    // Transform Supabase data to match DreamEntry interface
    const dreams: DreamEntry[] = (data || []).map((dream: { id: string; title: string; category: string; suggested_target_year: number; completed?: boolean }) => ({
      id: dream.id,
      title: dream.title,
      category: dream.category as DreamCategory,
      suggested_target_year: dream.suggested_target_year,
      completed: dream.completed || false,
    }));

    return dreams;
  } catch (error) {
    console.error("Error in getDreams:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch dreams");
  }
}

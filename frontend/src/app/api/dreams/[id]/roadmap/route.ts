import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get dream from Supabase
        const { data: dream, error } = await supabase
            .from("dreams")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !dream) {
            return NextResponse.json({ error: "Dream not found" }, { status: 404 });
        }

        // Generate roadmap using Groq
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
        }

        const groq = new Groq({ apiKey: groqApiKey });

        const prompt = `Create a detailed roadmap for achieving this dream/goal. IMPORTANT: We are currently in 2026.

Dream: "${dream.title}"
Category: ${dream.category || "General"}
Target Year: ${dream.suggested_target_year || 2027}

Provide a step-by-step roadmap with milestones. Each milestone should have:
- A clear title
- Target completion date
- Brief description of what needs to be done

Respond in JSON format:
{
  "roadmap": {
    "title": "Roadmap for [dream]",
    "milestones": [
      {
        "title": "milestone title",
        "target_date": "2026-06",
        "description": "what to do"
      }
    ]
  }
}`;

        const groqResponse = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that creates actionable roadmaps for personal goals. Always respond with valid JSON only.",
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
            return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
        }

        const roadmapData = JSON.parse(content);
        return NextResponse.json(roadmapData);
    } catch {
        return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
    }
}

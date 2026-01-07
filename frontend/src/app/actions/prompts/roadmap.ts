/**
 * Roadmap generation prompts
 */

export const ROADMAP_SYSTEM_MESSAGE =
  "You are a helpful assistant that creates actionable roadmaps for personal goals. Always respond with valid JSON only.";

/**
 * Generate prompt for creating a roadmap
 */
export function getRoadmapPrompt(
  title: string,
  category: string,
  targetYear: number
): string {
  return `Create a detailed roadmap for achieving this dream/goal. IMPORTANT: We are currently in 2026.

Dream: "${title}"
Category: ${category || "General"}
Target Year: ${targetYear || 2027}

Provide a step-by-step roadmap with milestones. Each milestone should have:
- A clear title
- Target completion date (format: YYYY-MM or YYYY-Q1/Q2/Q3/Q4)

Respond in JSON format:
{
  "roadmap": {
    "title": "Roadmap for [dream]",
    "milestones": [
      {
        "title": "milestone title",
        "target_date": "2026-06"
      }
    ]
  }
}`;
}


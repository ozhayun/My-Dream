import { DreamCategory } from "@/types/dream";

// Re-export roadmap prompts
export {
  ROADMAP_SYSTEM_MESSAGE,
  getRoadmapPrompt,
} from "./roadmap";

/**
 * System message for dream extraction
 */
export const DREAM_EXTRACTION_SYSTEM_MESSAGE =
  "You are a helpful assistant that extracts and structures personal goals and dreams from text. When multiple dreams are mentioned, consider them together and spread them across different years logically. Always respond with valid JSON only - a JSON object with a 'dreams' array.";

/**
 * Generate prompt for extracting multiple dreams from text
 */
export function getDreamExtractionPrompt(text: string): string {
  return `You are analyzing a user's dreams and goals. IMPORTANT: We are currently in the year 2026.

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
}

/**
 * System message for SMART goal transformation
 */
export const SMART_GOAL_SYSTEM_MESSAGE =
  "You are a helpful assistant that transforms goals into SMART format. Always respond with valid JSON only.";

/**
 * Generate prompt for transforming a dream into SMART goal format
 */
export function getSmartGoalPrompt(dreamTitle: string): string {
  return `Transform this dream/goal into a SMART goal format. Provide:
1. Specific: What exactly do you want to achieve?
2. Measurable: How will you measure progress?
3. Achievable: Is this realistic?
4. Relevant: Why is this important?
5. Time-bound: What's the deadline?
6. A polished, inspiring title

Dream: "${dreamTitle}"

Respond in JSON:
{
  "specific": "...",
  "measurable": "...",
  "achievable": "...",
  "relevant": "...",
  "time_bound": "...",
  "polished_title": "..."
}`;
}

/**
 * System message for dream analysis
 */
export const DREAM_ANALYSIS_SYSTEM_MESSAGE =
  "You are a helpful assistant that analyzes personal goals and dreams. Always respond with valid JSON only.";

/**
 * Generate prompt for analyzing a single dream (with category)
 */
export function getDreamAnalysisPromptWithCategory(
  title: string,
  category: DreamCategory
): string {
  return `You are analyzing a dream/goal. IMPORTANT: We are currently in the year 2026.

Analyze this dream/goal and provide:
1. A one-sentence summary (concise and inspiring)
2. Confirm the category "${category}" is appropriate, or suggest a better one from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other

Dream: "${title}"

Respond in JSON format:
{
  "summary": "one sentence summary here",
  "category": "suggested category name"
}`;
}

/**
 * Generate prompt for analyzing a single dream (without category)
 */
export function getDreamAnalysisPromptWithoutCategory(title: string): string {
  return `You are analyzing a dream/goal. IMPORTANT: We are currently in the year 2026.

Analyze this dream/goal and provide:
1. A one-sentence summary (concise and inspiring)
2. Suggest the best category from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other

Dream: "${title}"

Respond in JSON format:
{
  "summary": "one sentence summary here",
  "category": "suggested category name"
}`;
}


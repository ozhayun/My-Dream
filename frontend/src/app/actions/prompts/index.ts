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
  "You are a helpful assistant that extracts and structures personal goals and dreams from text. Extract ALL specific, measurable goals mentioned - break down compound statements into individual actionable items. Look for specific numbers, metrics, frequencies, activities, and habits. Always respond with valid JSON only - a JSON object with a 'dreams' array.";

/**
 * Generate prompt for extracting multiple dreams from text
 */
export function getDreamExtractionPrompt(text: string): string {
  return `You are analyzing a user's dreams and goals. IMPORTANT: We are currently in the year 2026.

Analyze the following text and extract ALL specific dreams/goals mentioned. Be THOROUGH and GRANULAR:

EXTRACTION GUIDELINES:
1. Break down compound statements into individual goals:
   - If text mentions "earning X amount AND saving Y amount" → extract as TWO separate financial goals
   - If text mentions "exercising X times per week AND sleeping Y hours" → extract as TWO separate health goals
   - If text mentions "taking a course AND reading regularly" → extract as TWO separate learning goals
   - Look for conjunctions (and, also, plus, as well as) that indicate multiple distinct goals

2. Extract specific metrics and numbers:
   - Income amounts, savings targets, investment goals (any monetary values with timeframes)
   - Exercise frequency (e.g., "X workouts per week", "daily exercise", "3 times weekly")
   - Sleep duration (e.g., "X hours of sleep", "sleeping X hours nightly")
   - Learning frequency (e.g., "read X books per month", "one course per quarter", "weekly lessons")
   - Relationship frequency (e.g., "weekly family time", "monthly date nights", "daily calls")
   - Travel frequency (e.g., "quarterly trips", "annual vacation", "X trips per year")

3. Extract specific activities and habits:
   - Specific courses, skills, or certifications mentioned
   - Specific destinations or travel types
   - Specific relationship activities or commitments
   - Specific lifestyle changes or routines

4. Extract specific achievements or milestones:
   - Home ownership, car purchase, business launch
   - Career milestones, promotions, role changes
   - Health milestones, fitness achievements
   - Relationship milestones, family goals

5. When suggesting target years:
- Consider that we are in 2026
   - Spread multiple goals across different years logically
   - Be realistic about timeframes (some goals take longer)
   - Consider logical sequencing (e.g., save money before buying a house)
   - Short-term habits (daily/weekly) can start in 2026
   - Major milestones may need 2027-2028+

For each dream, provide:
1. A clear, specific title that includes the metric/frequency when mentioned (e.g., "Earn [amount] Monthly", "[X] Weekly Workouts", "Read [X] Books Per Month")
2. The most appropriate category from: Career & Business, Finance & Wealth, Health & Wellness, Relationships & Family, Travel & Adventure, Skills & Knowledge, Lifestyle & Hobbies, Other
3. A suggested target year (must be 2026 or later, spread multiple dreams across different years logically)

IMPORTANT: Extract as many specific goals as possible. Don't group related goals together - each specific metric, activity, or habit should be its own dream entry.

Text: "${text}"

Respond with a JSON object containing a "dreams" array:
{
  "dreams": [
    {
      "title": "dream title with specific details",
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


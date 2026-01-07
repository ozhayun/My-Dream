/**
 * Server Actions Index
 * 
 * This file re-exports all server actions for easy importing.
 * Actions are organized into:
 * - helpers.ts: Utility functions
 * - ai.ts: AI-powered actions (Groq integration)
 * - dreams.ts: CRUD operations for dreams
 * - roadmap.ts: Roadmap generation and saving
 */

// AI Actions
export {
  createDreamsAction,
  polishDreamAction,
  saveDream,
} from "./ai";

// Dream CRUD Actions
export {
  getDreams,
  saveDreamsBatchAction,
  updateDreamAction,
  deleteDreamAction,
  searchDreamsAction,
} from "./dreams";

// Roadmap Actions
export { generateRoadmapAction } from "./roadmap";

// Helpers
export { ensureUserExists } from "./helpers";


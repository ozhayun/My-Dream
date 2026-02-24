/**
 * Generate a unique ID suitable for entities (journal entries, etc.).
 * Uses crypto.randomUUID() when available for robustness and persistence.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

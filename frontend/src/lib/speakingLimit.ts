/**
 * Daily speaking time limit management
 * Limits users to 1 minute (60 seconds) of transcription per day
 */

const SPEAKING_LIMIT_SECONDS = 60; // 1 minute
const COOKIE_NAME = "ux_pref_v2"; // Obscure cookie name to prevent easy manipulation

interface SpeakingTimeData {
  date: string; // YYYY-MM-DD format
  secondsUsed: number;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Set cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * Get current speaking time data
 */
export function getSpeakingTimeData(): SpeakingTimeData {
  const cookieValue = getCookie(COOKIE_NAME);
  const today = getToday();
  
  if (cookieValue) {
    try {
      const data: SpeakingTimeData = JSON.parse(cookieValue);
      // If it's a new day, reset
      if (data.date === today) {
        return data;
      }
    } catch {
      // Invalid cookie, reset
    }
  }
  
  // Return fresh data for today
  return {
    date: today,
    secondsUsed: 0,
  };
}

/**
 * Save speaking time data to cookie
 */
export function saveSpeakingTimeData(data: SpeakingTimeData): void {
  // Cookie expires in 2 days to ensure we have room for the daily reset
  setCookie(COOKIE_NAME, JSON.stringify(data), 2);
}

/**
 * Add seconds to today's speaking time
 */
export function addSpeakingTime(seconds: number): void {
  const data = getSpeakingTimeData();
  data.secondsUsed = Math.min(data.secondsUsed + seconds, SPEAKING_LIMIT_SECONDS);
  saveSpeakingTimeData(data);
}

/**
 * Get remaining speaking time in seconds
 */
export function getRemainingTime(): number {
  const data = getSpeakingTimeData();
  return Math.max(0, SPEAKING_LIMIT_SECONDS - data.secondsUsed);
}

/**
 * Check if user has reached the daily limit
 */
export function hasReachedLimit(): boolean {
  return getRemainingTime() <= 0;
}

/**
 * Check if user can speak (has time remaining)
 */
export function canSpeak(): boolean {
  return !hasReachedLimit();
}

/**
 * Get today's usage in seconds
 */
export function getUsageToday(): number {
  return getSpeakingTimeData().secondsUsed;
}

/**
 * Get the limit in seconds
 */
export function getLimit(): number {
  return SPEAKING_LIMIT_SECONDS;
}


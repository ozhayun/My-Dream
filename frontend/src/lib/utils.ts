import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ & /g, '_')   // Replace " & " with "_"
    .replace(/ /g, '_')     // Replace remaining spaces with "_"
    .replace(/[^a-z0-9_]/g, ''); // Remove non-alphanumeric chars
}

export function getCategoryFromSlug(slug: string, categories: string[]): string | undefined {
  return categories.find(cat => slugify(cat) === slug);
}

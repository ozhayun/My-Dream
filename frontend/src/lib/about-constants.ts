import { Brain, Sparkles, Target, Rocket } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const INSPIRATIONAL_QUOTES = [
  "The future belongs to those who believe in the beauty of their dreams.",
  "Dreams don't work unless you do.",
  "All our dreams can come true, if we have the courage to pursue them.",
  "The only way to do great work is to love what you do.",
  "Your limitation—it's only your imagination.",
];

export interface TechStackItem {
  name: string;
  description: string;
}

export const TECH_STACK: TechStackItem[] = [
  { name: "Next.js 15", description: "React framework" },
  { name: "Clerk", description: "Authentication" },
  { name: "Supabase", description: "Database" },
  { name: "Groq", description: "AI platform" },
  { name: "TypeScript", description: "Type safety" },
  { name: "Tailwind CSS", description: "Styling" },
  { name: "Framer Motion", description: "Animations" },
  { name: "Netlify", description: "Hosting" },
];

export interface HowItWorksStep {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Brain,
    title: "Share Your Dreams",
    description:
      "Write or speak about your dreams. No structure needed.",
    color: "text-purple-400",
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    description:
      "AI extracts dreams, suggests categories, and generates summaries.",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    title: "Smart Planning",
    description:
      "Get realistic timelines with intelligent year distribution.",
    color: "text-blue-400",
  },
  {
    icon: Rocket,
    title: "Track Progress",
    description:
      "Visualize with kanban boards, timelines, and category views.",
    color: "text-pink-400",
  },
];


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
  { name: "Next.js", description: "React framework for the frontend" },
  { name: "FastAPI", description: "Python backend API" },
  { name: "LangChain", description: "AI orchestration framework" },
  { name: "Ollama", description: "Local LLM runtime" },
  {
    name: "Sentence Transformers",
    description: "Semantic search engine",
  },
  { name: "TypeScript", description: "Type-safe development" },
  { name: "Tailwind CSS", description: "Utility-first styling" },
  { name: "Framer Motion", description: "Smooth animations" },
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
      "Write freely about your aspirations, goals, and wishes. No structure needed—just pour your heart out.",
    color: "text-purple-400",
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    description:
      "Our local AI model analyzes your text, extracts distinct dreams, and categorizes them intelligently.",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    title: "Smart Planning",
    description:
      "Get realistic target years, SMART goals, and actionable milestones for each dream.",
    color: "text-blue-400",
  },
  {
    icon: Rocket,
    title: "Track Progress",
    description:
      "Use kanban boards, timelines, and journal entries to stay on track and celebrate wins.",
    color: "text-pink-400",
  },
];


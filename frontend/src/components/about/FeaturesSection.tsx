"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description:
      "Our local LLM analyzes your text to extract distinct dreams, categorize them intelligently, and suggest realistic timelines.",
    bullets: [
      "Automatic dream extraction",
      "Smart categorization",
      "Target year suggestions",
    ],
    iconColor: "text-yellow-400",
  },
  {
    icon: Target,
    title: "SMART Goals & Milestones",
    description:
      "Transform vague dreams into Specific, Measurable, Achievable, Relevant, and Time-bound goals with actionable milestones.",
    bullets: [
      "SMART goal generation",
      "Customizable milestones",
      "Progress tracking",
    ],
    iconColor: "text-blue-400",
  },
  {
    icon: Zap,
    title: "Multiple Views",
    description:
      "Visualize your dreams through kanban boards, timelines, category dashboards, and detailed views.",
    bullets: ["Kanban board", "Timeline view", "Category breakdown"],
    iconColor: "text-purple-400",
  },
];

export function FeaturesSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm"
            >
              <Icon className={`w-8 h-8 ${feature.iconColor} mb-4`} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {feature.bullets.map((bullet, i) => (
                  <li key={i}>• {bullet}</li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}


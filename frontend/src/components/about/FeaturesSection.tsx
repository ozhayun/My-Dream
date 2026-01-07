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
      "Lightning-fast AI extracts dreams, categorizes them, and suggests realistic timelines.",
    bullets: ["Instant extraction", "Smart categorization", "Year planning"],
    iconColor: "text-yellow-400",
  },
  {
    icon: Target,
    title: "SMART Goals",
    description: "Transform dreams into actionable goals with milestones.",
    bullets: ["SMART goals", "Milestones", "Progress tracking"],
    iconColor: "text-blue-400",
  },
  {
    icon: Zap,
    title: "Multiple Views",
    description:
      "Visualize dreams through kanban boards, timelines, and categories.",
    bullets: ["Kanban", "Timeline", "Categories"],
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
              <p className="text-foreground/70 mb-4">{feature.description}</p>
              <ul className="text-sm text-foreground/70 space-y-1">
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

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/about-constants";

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

export function HowItWorksSection() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {HOW_IT_WORKS_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-${
                    step.color.split("-")[1]
                  }-500/10`}
                >
                  <Icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Step {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

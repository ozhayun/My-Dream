"use client";

import { motion } from "framer-motion";
import { TECH_STACK } from "@/lib/about-constants";

export function TechStackSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-center">Built With</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TECH_STACK.map((tech, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="p-4 rounded-xl bg-secondary/20 border border-white/5 backdrop-blur-sm text-center hover:bg-secondary/30 transition-colors"
          >
            <div className="font-semibold mb-1">{tech.name}</div>
            <div className="text-xs text-muted-foreground">
              {tech.description}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


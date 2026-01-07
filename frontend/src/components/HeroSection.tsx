"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-white/5 text-sm text-foreground/70 mb-4">
             <Sparkles className="w-3 h-3 text-yellow-400" />
             <span>AI-Powered Dream Weaver</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            What do you dream about?
          </h1>
          <p className="text-foreground/70 text-lg sm:text-xl max-w-lg mx-auto">
            Tell me everything. I'll organize your aspirations and create a plan.
          </p>
        </motion.div>
    );
}

export default HeroSection;
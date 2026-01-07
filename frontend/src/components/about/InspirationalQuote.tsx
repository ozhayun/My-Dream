"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { INSPIRATIONAL_QUOTES } from "@/lib/about-constants";
import { useEffect, useState } from "react";

export function InspirationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-2xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm min-h-[120px] flex items-center justify-center gap-4"
    >
      <Quote className="w-8 h-8 text-purple-400 opacity-50 shrink-0" />
      <div className="relative overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-lg sm:text-xl font-medium italic text-center text-foreground"
          >
            {INSPIRATIONAL_QUOTES[currentQuote]}
          </motion.p>
        </AnimatePresence>
      </div>
      <Quote className="w-8 h-8 text-purple-400 opacity-50 shrink-0 rotate-180" />
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
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
      key={currentQuote}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm"
    >
      <Quote className="w-8 h-8 text-purple-400 mb-4 opacity-50" />
      <p className="text-lg sm:text-xl font-medium italic text-center">
        &ldquo;{INSPIRATIONAL_QUOTES[currentQuote]}&rdquo;
      </p>
    </motion.div>
  );
}


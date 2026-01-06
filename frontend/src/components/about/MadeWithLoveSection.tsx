"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function MadeWithLoveSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="text-center p-8 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm"
    >
      <Heart className="w-8 h-8 text-pink-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
      <p className="text-muted-foreground">
        Built to inspire and help you track your life&apos;s most meaningful
        goals. Your dreams matter, and we&apos;re here to help you achieve
        them.
      </p>
    </motion.div>
  );
}


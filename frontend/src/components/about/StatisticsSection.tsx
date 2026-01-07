"use client";

import { motion } from "framer-motion";
import { DreamEntry } from "@/types/dream";

interface StatisticsSectionProps {
  dreams: DreamEntry[];
  loading: boolean;
}

export function StatisticsSection({ dreams, loading }: StatisticsSectionProps) {
  const stats = {
    total: dreams.length,
    completed: dreams.filter((d) => d.completed).length,
  };

  if (loading || stats.total === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm text-center">
        <div className="text-4xl font-bold text-blue-400 mb-2">
          {stats.total}
        </div>
        <div className="text-foreground/70">Total Dreams</div>
      </div>
      <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm text-center">
        <div className="text-4xl font-bold text-emerald-400 mb-2">
          {stats.completed}
        </div>
        <div className="text-foreground/70">Completed</div>
      </div>
      <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm text-center">
        <div className="text-4xl font-bold text-purple-400 mb-2">
          {stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0}
          %
        </div>
        <div className="text-foreground/70">Completion Rate</div>
      </div>
    </motion.div>
  );
}


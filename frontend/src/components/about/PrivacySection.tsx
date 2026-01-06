"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Database, Code } from "lucide-react";

const privacyFeatures = [
  { icon: Database, text: "Local JSON storage" },
  { icon: Code, text: "Local LLM via Ollama" },
  { icon: Shield, text: "No external API calls" },
  { icon: Lock, text: "100% private & secure" },
];

export function PrivacySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Privacy First
          </h3>
          <p className="text-muted-foreground mb-4">
            Your dreams are yours alone. Everything runs locally on your
            machine—no cloud, no tracking, no data collection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {privacyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


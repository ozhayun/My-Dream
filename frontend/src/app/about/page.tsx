"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/services/api";
import { DreamEntry } from "@/types/dream";
import { AboutHeader } from "@/components/about/AboutHeader";
import { InspirationalQuote } from "@/components/about/InspirationalQuote";
import { StatisticsSection } from "@/components/about/StatisticsSection";
import { HowItWorksSection } from "@/components/about/HowItWorksSection";
import { FeaturesSection } from "@/components/about/FeaturesSection";
import { PrivacySection } from "@/components/about/PrivacySection";
import { TechStackSection } from "@/components/about/TechStackSection";
import { MadeWithLoveSection } from "@/components/about/MadeWithLoveSection";

export default function AboutPage() {
  const { isSignedIn } = useAuth();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDreams = async () => {
      // Only fetch dreams if user is authenticated
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.dreams.list();
        setDreams(data);
      } catch {
        // Silently fail - stats section will handle empty state
      } finally {
        setLoading(false);
      }
    };
    loadDreams();
  }, [isSignedIn]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-16"
      >
        <AboutHeader />
        <InspirationalQuote />
        <StatisticsSection dreams={dreams} loading={loading} />
        <HowItWorksSection />
        <FeaturesSection />
        <PrivacySection />
        <TechStackSection />
        <MadeWithLoveSection />
      </motion.div>
    </div>
  );
}

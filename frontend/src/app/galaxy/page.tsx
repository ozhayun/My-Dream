"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Header";

// Dynamically import the 3D component to avoid SSR issues with Three.js
const DreamGalaxy = dynamic(
  () => import("@/components/galaxy/DreamGalaxy"),
  { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-screen bg-black gap-4 text-primary">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest font-bold">Loading Engine...</span>
        </div>
    )
  }
);

export default function GalaxyPage() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            <Header />
            <DreamGalaxy />
        </main>
    );
}

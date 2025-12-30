import { DreamInputSection } from "@/components/DreamInputSection";
import { HeroSection } from "@/components/HeroSection";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center relative overflow-hidden">
      <div className="max-w-3xl w-full space-y-8 z-10">
        <HeroSection />
        <DreamInputSection />
      </div>
    </main>
  );
}

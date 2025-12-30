import { Sparkles, Heart, Code } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] max-w-4xl relative overflow-hidden">
      <div className="space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            About MyDreams
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A safe haven for your aspirations. We use AI to turn your wildest dreams into actionable milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">
              We analyze your text to extract distinct dreams and suggest realistic target years.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm">
             <Code className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Private & Local</h3>
            <p className="text-muted-foreground">
              Your dreams are stored locally on your machine. Currently powered by local LLMs via Ollama.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm">
            <Heart className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
            <p className="text-muted-foreground">
              Built to inspire and help you track your life's most meaningful goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

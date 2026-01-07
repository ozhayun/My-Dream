"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Loader2, Send, Mic, MicOff, Clock } from "lucide-react";
import { DreamEntry } from "@/types/dream";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { DreamReviewModal } from "@/components/DreamReviewModal";
import { DREAM_SUGGESTIONS } from "@/lib/suggestions";
import { createDreamsAction, saveDreamsBatchAction } from "@/app/actions";
import { useWhisperRecording } from "@/hooks/useWhisperRecording";
import { hasReachedLimit } from "@/lib/speakingLimit";

export function DreamInputSection() {
  const { isSignedIn } = useAuth();
  const [dreamText, setDreamText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analyzedDreams, setAnalyzedDreams] = useState<DreamEntry[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [clientLimitReached, setClientLimitReached] = useState(false);

  const {
    isRecording,
    isTranscribing,
    interimTranscript,
    error: recordingError,
    limitReached,
    startRecording,
    stopRecording,
  } = useWhisperRecording();

  // Check limit on client side only (after hydration)
  useEffect(() => {
    setClientLimitReached(hasReachedLimit());
  }, [limitReached]);

  useEffect(() => {
    const shuffled = [...DREAM_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
    }
  }, [recordingError]);

  // Preserve transcript when recording stops (including when limit is reached)
  useEffect(() => {
    if (!isRecording && !isTranscribing && interimTranscript.trim()) {
      // When recording stops, copy interimTranscript to dreamText to preserve it
      setDreamText((prev) => {
        // If interimTranscript contains more text, use it
        if (!prev || interimTranscript.length > prev.length) {
          return interimTranscript;
        }
        // Otherwise merge intelligently (avoid duplication)
        if (prev.includes(interimTranscript)) {
          return prev; // Old contains new, keep old
        } else if (interimTranscript.includes(prev)) {
          return interimTranscript; // New contains old, use new
        } else {
          // Merge if different
          return `${prev} ${interimTranscript}`.trim();
        }
      });
    }
  }, [isRecording, isTranscribing, interimTranscript]);

  // Close banner when clicking outside
  useEffect(() => {
    if (!showLimitBanner) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside the banner and button
      if (
        !target.closest("[data-limit-banner]") &&
        !target.closest("[data-mic-button]")
      ) {
        setShowLimitBanner(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showLimitBanner]);

  const handleToggleRecording = async () => {
    // Check if limit is reached - show banner instead of recording
    if (limitReached || clientLimitReached) {
      setShowLimitBanner(true);
      // Hide banner after 4 seconds
      setTimeout(() => {
        setShowLimitBanner(false);
      }, 4000);
      return;
    }

    if (isRecording) {
      try {
        const finalTranscript = await stopRecording();
        if (finalTranscript.trim()) {
          setDreamText(finalTranscript);
        }
      } catch {
        setError("Failed to transcribe audio. Please try again.");
      }
    } else {
      setDreamText(""); // Clear previous text
      await startRecording();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamText.trim()) return;

    if (!isSignedIn) {
      router.push("/connect");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const dreams = await createDreamsAction(dreamText);

      if (dreams && dreams.length > 0) {
        setAnalyzedDreams(dreams);
        setShowReviewModal(true);
      } else {
        setError(
          "I couldn't identify any specific dreams. Try being more descriptive."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing your dreams. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDreams = async (dreamsToSave: DreamEntry[]) => {
    try {
      await saveDreamsBatchAction(dreamsToSave);
      router.push("/dreams");
    } catch (err) {
      console.error("Error saving dreams:", err);
      setError("Failed to save your dreams. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDreamText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
  };

  const isProcessing = isAnalyzing || isTranscribing;

  return (
    <div className="w-full relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full relative"
      >
        <div className="relative bg-secondary/30 border border-white/10 rounded-3xl pl-4 py-4 shadow-2xl backdrop-blur-xl focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={
                isRecording || isTranscribing
                  ? interimTranscript || dreamText
                  : dreamText || interimTranscript
              }
              dir="auto"
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              readOnly={isRecording || isTranscribing}
              placeholder={
                isRecording
                  ? "Listening... (text will appear as you speak)"
                  : isTranscribing
                  ? "Transcribing..."
                  : "I want to learn piano, travel to Mars, and build a robot..."
              }
              className={clsx(
                "w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-foreground/40 resize-none min-h-[80px] max-h-[300px] outline-none pr-28 custom-scrollbar transition-opacity",
                isRecording && "opacity-90"
              )}
            />

            <div className="absolute bottom-0 right-4 flex flex-col items-end gap-2">
              {/* Limit Reached Banner - Only shows on click when limit is reached */}
              {showLimitBanner && (limitReached || clientLimitReached) && (
                <>
                  {/* Backdrop blur overlay for mobile readability */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-background/40 backdrop-blur-sm md:backdrop-blur-md -z-10 md:hidden"
                    onClick={() => setShowLimitBanner(false)}
                  />

                  {/* Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    data-limit-banner
                    className="relative bg-secondary/30 md:bg-secondary/20 border border-white/20 md:border-white/10 rounded-2xl px-5 py-3 md:px-4 md:py-2.5 shadow-2xl backdrop-blur-xl overflow-hidden pointer-events-auto mb-1 z-50"
                  >
                    {/* Glass Grain Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-7 h-7 md:w-6 md:h-6 rounded-lg bg-orange-500/30 md:bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm  font-semibold text-foreground leading-tight">
                          Daily limit reached
                        </span>
                        <span className="text-xs text-foreground/70 md:text-foreground/60 leading-tight">
                          Resets tomorrow
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={isProcessing}
                  data-mic-button
                  className={clsx(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-secondary/50 text-foreground/70 hover:bg-secondary/80"
                  )}
                  title={
                    isRecording
                      ? "Stop Recording"
                      : isTranscribing
                      ? "Transcribing..."
                      : "Speak your dream"
                  }
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : isTranscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !dreamText.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mt-4"
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Suggestion Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mt-8 min-h-[40px]"
      >
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setDreamText(s)}
            className="px-4 py-2 rounded-full bg-secondary/30 border border-white/5 text-sm hover:bg-secondary/60 hover:border-white/10 transition-colors animate-in fade-in zoom-in duration-300"
          >
            {s}
          </button>
        ))}
      </motion.div>

      {showReviewModal && (
        <DreamReviewModal
          dreams={analyzedDreams}
          onSave={handleSaveDreams}
          onCancel={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}

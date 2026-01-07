"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Loader2, Send, Mic, MicOff } from "lucide-react";
import { DreamEntry } from "@/types/dream";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { DreamReviewModal } from "@/components/DreamReviewModal";
import { DREAM_SUGGESTIONS } from "@/lib/suggestions";
import { createDreamsAction, saveDreamsBatchAction } from "@/app/actions";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  WindowWithSpeechRecognition,
} from "@/types/speech-recognition";

export function DreamInputSection() {
  const { isSignedIn } = useAuth();
  const [dreamText, setDreamText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analyzedDreams, setAnalyzedDreams] = useState<DreamEntry[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...DREAM_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const windowWithSR = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition =
      windowWithSR.webkitSpeechRecognition || windowWithSR.speechRecognition;

    if (!SpeechRecognition) return;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || "";

        if (result.isFinal) {
          finalTranscript += transcript + " ";
        } else {
          currentInterim += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setDreamText((prev) => {
          return (prev.trim() + " " + finalTranscript.trim()).trim();
        });
        setInterimTranscript("");
      } else if (currentInterim) {
        setInterimTranscript(currentInterim);
      }
    };

    recognizer.onend = () => {
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
          setInterimTranscript("");
        }
      } else {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
      setInterimTranscript("");
      let errorMessage = "";
      let shouldStop = true;

      switch (event.error) {
        case "not-allowed":
          errorMessage =
            "Microphone access denied. Please allow microphone permissions in your browser settings.";
          break;
        case "no-speech":
          shouldStop = false;
          break;
        case "network":
          errorMessage =
            "Network error connecting to speech service. Please check your internet connection and try again.";
          break;
        case "aborted":
          shouldStop = false;
          break;
        case "audio-capture":
          errorMessage =
            "No microphone found. Please connect a microphone and try again.";
          break;
        case "service-not-allowed":
          errorMessage =
            "Speech recognition service is not available. This might be blocked in your network or region. Please try again later or use typing.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again or use typing.`;
      }

      if (shouldStop) {
        isListeningRef.current = false;
        setIsListening(false);
      }

      if (errorMessage) {
        setError(errorMessage);
        setTimeout(() => setError(""), 7000);
      }
    };

    recognitionRef.current = recognizer;
  }, []);

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setError(
          "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
        );
        return;
      }

      try {
        setError("");
        recognitionRef.current.start();
      } catch (err) {
        isListeningRef.current = false;
        setIsListening(false);
        setError(
          `Failed to start voice input: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please check microphone permissions and try again.`
        );
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamText.trim()) return;

    // Check if user is authenticated - redirect to connect if not
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
    } catch {
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
                dreamText +
                (interimTranscript
                  ? (dreamText ? " " : "") + interimTranscript
                  : "")
              }
              dir="auto"
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              readOnly={isListening}
              placeholder={
                isListening
                  ? "Listening..."
                  : "I want to learn piano, travel to Mars, and build a robot..."
              }
              className={clsx(
                "w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-foreground/70/40 resize-none min-h-[80px] max-h-[300px] outline-none pr-28 custom-scrollbar transition-opacity",
                isListening && "opacity-70"
              )}
            />

            <div className="absolute bottom-0 right-4 flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={clsx(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg",
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-secondary/50 text-foreground/70 hover:bg-secondary/80"
                )}
                title={isListening ? "Stop Recording" : "Speak your dream"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                type="submit"
                disabled={isAnalyzing || !dreamText.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
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

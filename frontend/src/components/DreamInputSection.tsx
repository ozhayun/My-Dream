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
  const lastSpeechResultAtRef = useRef<number | null>(null);
  const noResultTimeoutIdRef = useRef<number | null>(null);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...DREAM_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext =
      window.isSecureContext ||
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if ("webkitSpeechRecognition" in window || "speechRecognition" in window) {
      const windowWithSR = window as unknown as WindowWithSpeechRecognition;
      const SpeechRecognition =
        windowWithSR.webkitSpeechRecognition || windowWithSR.speechRecognition;

      if (!SpeechRecognition) return;

      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      // Prefer the user's browser language (e.g. "he-IL") to avoid "no results" when speaking non-English.
      recognizer.lang = window.navigator.language || "en-US";

      recognizer.onstart = () => {
        console.log("Speech recognition started");
        isListeningRef.current = true;
        lastSpeechResultAtRef.current = null;
        setIsListening(true);

        // If we don't receive any results shortly after starting, surface a clear hint.
        if (noResultTimeoutIdRef.current) {
          window.clearTimeout(noResultTimeoutIdRef.current);
        }
        noResultTimeoutIdRef.current = window.setTimeout(() => {
          // Only show if we're still listening and nothing arrived.
          if (
            isListeningRef.current &&
            lastSpeechResultAtRef.current === null
          ) {
            setError(
              "Voice input started but no speech was recognized. If you're on iPhone/iPad or Firefox, Web Speech may not be supported. Try Chrome/Edge on desktop, or use typing."
            );
            setTimeout(() => setError(""), 7000);
          }
        }, 4000);
      };

      recognizer.onresult = (event: SpeechRecognitionEvent) => {
        lastSpeechResultAtRef.current = Date.now();
        console.log("onresult fired!", {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          results: event.results,
        });

        let finalTranscript = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";
          console.log(`Result ${i}:`, {
            transcript,
            isFinal: result.isFinal,
          });

          if (result.isFinal) {
            finalTranscript += transcript + " ";
          } else {
            currentInterim += transcript;
          }
        }

        if (finalTranscript.trim()) {
          setDreamText((prev) => {
            const newText = (prev.trim() + " " + finalTranscript.trim()).trim();
            console.log(
              "Final transcript:",
              finalTranscript.trim(),
              "New text:",
              newText
            );
            return newText;
          });
          setInterimTranscript("");
        } else if (currentInterim) {
          console.log("Interim transcript:", currentInterim);
          setInterimTranscript(currentInterim);
        } else {
          console.log("No transcript found in results");
        }
      };

      recognizer.onend = () => {
        console.log(
          "Speech recognition ended, isListening:",
          isListeningRef.current
        );
        if (noResultTimeoutIdRef.current) {
          window.clearTimeout(noResultTimeoutIdRef.current);
          noResultTimeoutIdRef.current = null;
        }
        // If we're still supposed to be listening, restart (continuous mode)
        if (isListeningRef.current && recognitionRef.current) {
          console.log("Restarting speech recognition...");
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error("Error restarting recognition:", err);
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
        console.error(
          "Speech recognition error:",
          event.error,
          "Full event:",
          event
        );
        setInterimTranscript("");
        if (noResultTimeoutIdRef.current) {
          window.clearTimeout(noResultTimeoutIdRef.current);
          noResultTimeoutIdRef.current = null;
        }

        // Provide user-friendly error messages
        let errorMessage = "";
        let shouldStop = true;

        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone permissions in your browser settings.";
            break;
          case "no-speech":
            // Don't stop on no-speech, just keep listening
            console.log("No speech detected, continuing to listen...");
            shouldStop = false;
            break;
          case "network":
            errorMessage =
              "Network error. Please check your internet connection.";
            break;
          case "aborted":
            // User stopped, don't show error
            shouldStop = false;
            break;
          case "audio-capture":
            errorMessage =
              "No microphone found. Please connect a microphone and try again.";
            break;
          case "service-not-allowed":
            errorMessage =
              "Speech recognition service is not available. Please try again later.";
            break;
          default:
            if (!isSecureContext) {
              errorMessage =
                "Speech recognition requires HTTPS. Please access this site over a secure connection.";
            } else {
              errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
            }
        }

        if (shouldStop) {
          isListeningRef.current = false;
          setIsListening(false);
        }

        if (errorMessage) {
          setError(errorMessage);
          // Clear error after 5 seconds
          setTimeout(() => setError(""), 5000);
        }
      };

      recognitionRef.current = recognizer;
    } else if (!isSecureContext) {
      // Speech recognition not available and not in secure context
      console.warn(
        "Speech recognition requires HTTPS in production environments."
      );
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      lastSpeechResultAtRef.current = null;
      if (noResultTimeoutIdRef.current) {
        window.clearTimeout(noResultTimeoutIdRef.current);
        noResultTimeoutIdRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsListening(false);
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
        // Note: setIsListening will be set by onstart handler
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsListening(false);
        setError(
          "Failed to start voice input. Please check microphone permissions and try again."
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
      // Log full error to console for debugging
      console.error("Error in handleSubmit:", err);
      // Show user-friendly error message
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

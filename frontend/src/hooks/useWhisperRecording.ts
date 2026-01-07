import { useState, useRef, useCallback, useEffect } from "react";
import { hasReachedLimit, addSpeakingTime, getRemainingTime } from "@/lib/speakingLimit";

const CHUNK_DURATION = 3000; // 3 seconds for better audio quality and accuracy

export function useWhisperRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onTranscriptUpdateRef = useRef<((text: string) => void) | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const currentChunkRef = useRef<Blob[]>([]);
  const processedChunksRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number | null>(null);
  const timeCheckIntervalRef = useRef<number | null>(null);
  
  // Check limit on mount and when recording state changes
  useEffect(() => {
    setLimitReached(hasReachedLimit());
  }, []);

  // Get user's language from browser
  const getUserLanguage = useCallback((): string => {
    const lang = navigator.language || navigator.languages?.[0] || "en";
    // Map common language codes to Whisper-supported codes
    const langMap: Record<string, string> = {
      "he": "he", // Hebrew
      "he-IL": "he",
      "en": "en",
      "en-US": "en",
      "en-GB": "en",
      "es": "es",
      "fr": "fr",
      "de": "de",
      "it": "it",
      "pt": "pt",
      "ru": "ru",
      "ja": "ja",
      "ko": "ko",
      "zh": "zh",
    };
    // Extract base language code (e.g., "he-IL" -> "he")
    const baseLang = lang.split("-")[0];
    return langMap[lang] || langMap[baseLang] || "en";
  }, []);

  const transcribeChunk = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("language", getUserLanguage());

      const response = await fetch("/api/whisper/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transcription failed";
      setError(errorMessage);
      return "";
    }
  }, [getUserLanguage]);

  const startRecording = useCallback(async (onTranscriptUpdate?: (text: string) => void) => {
    try {
      setError("");
      setInterimTranscript("");
      
      // Check if user has reached daily limit
      if (hasReachedLimit()) {
        setLimitReached(true);
        return;
      }
      
      if (onTranscriptUpdate) {
        onTranscriptUpdateRef.current = onTranscriptUpdate;
      }
      
      // Record start time for tracking
      recordingStartTimeRef.current = Date.now();
      
      // Request high-quality audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;
      
      // Use best available codec
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // Higher bitrate for better quality
      });
      mediaRecorderRef.current = mediaRecorder;
      currentChunkRef.current = [];
      isRecordingRef.current = true;
      processedChunksRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentChunkRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // If we have data and still recording, process it
        if (currentChunkRef.current.length > 0 && isRecordingRef.current) {
          // Create a complete audio file from the chunks
          const chunkBlob = new Blob(currentChunkRef.current, { type: mimeType });
          currentChunkRef.current = [];
          processedChunksRef.current += 1;
          
          // Calculate time used and check limit
          if (recordingStartTimeRef.current) {
            const timeUsed = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
            addSpeakingTime(timeUsed);
            recordingStartTimeRef.current = Date.now(); // Reset for next chunk
            
            // Check if limit reached - but still process current chunk before stopping
            if (hasReachedLimit()) {
              setLimitReached(true);
              isRecordingRef.current = false;
              setIsRecording(false);
              // Don't return - let current chunk process, then stop stream after
            }
          }
          
          // Process chunk asynchronously (don't await - let it run in background)
          setIsTranscribing(true);
          
          transcribeChunk(chunkBlob)
            .then((transcript) => {
              if (transcript) {
                setInterimTranscript((prev) => {
                  const newText = prev ? `${prev} ${transcript}` : transcript;
                  return newText;
                });
              }
            })
            .catch(() => {
              // Silently handle errors
            })
            .finally(() => {
              setIsTranscribing(false);
            });
          
          // Restart recording for next chunk if still supposed to be recording
          if (isRecordingRef.current && streamRef.current && streamRef.current.active && !hasReachedLimit()) {
            try {
              mediaRecorderRef.current?.start();
              // Schedule next stop after CHUNK_DURATION
              setTimeout(() => {
                if (isRecordingRef.current && mediaRecorderRef.current?.state === "recording") {
                  mediaRecorderRef.current.stop();
                }
              }, CHUNK_DURATION);
            } catch {
              // If restart fails, stop everything
              isRecordingRef.current = false;
              setIsRecording(false);
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
              }
            }
          } else if (hasReachedLimit()) {
            // Stop stream if limit reached
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
          }
        } else if (!isRecordingRef.current) {
          // Final stop - user manually stopped
          setIsRecording(false);
        }
      };
      
      // Check time limit periodically during recording
      timeCheckIntervalRef.current = window.setInterval(() => {
        if (isRecordingRef.current && recordingStartTimeRef.current) {
          const timeUsed = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
          const remaining = getRemainingTime();
          
          if (timeUsed >= remaining) {
            // Stop recording when limit reached
            setLimitReached(true);
            isRecordingRef.current = false;
            setIsRecording(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timeCheckIntervalRef.current) {
              clearInterval(timeCheckIntervalRef.current);
              timeCheckIntervalRef.current = null;
            }
            // Add final time used
            if (recordingStartTimeRef.current) {
              addSpeakingTime(Math.min(timeUsed, remaining));
            }
          }
        }
      }, 1000); // Check every second

      // Start recording and schedule first stop
      mediaRecorder.start();
      setIsRecording(true);
      
      // Schedule automatic stop/restart cycle for streaming
      setTimeout(() => {
        if (isRecordingRef.current && mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, CHUNK_DURATION);
    } catch {
      setError("Microphone access denied. Please allow permissions.");
      isRecordingRef.current = false;
      setIsRecording(false);
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current);
        timeCheckIntervalRef.current = null;
      }
    }
  }, [transcribeChunk]);

  const stopRecording = useCallback(async (): Promise<string> => {
    // Clear time check interval
    if (timeCheckIntervalRef.current) {
      clearInterval(timeCheckIntervalRef.current);
      timeCheckIntervalRef.current = null;
    }
    
    // Calculate and add final time used
    if (recordingStartTimeRef.current) {
      const timeUsed = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
      addSpeakingTime(timeUsed);
      recordingStartTimeRef.current = null;
      
      // Check if limit reached after stopping
      if (hasReachedLimit()) {
        setLimitReached(true);
      }
    }
    
    // Set flag to stop recording
    isRecordingRef.current = false;
    setIsRecording(false);
    
    // Stop the recorder - this will trigger one final ondataavailable with remaining audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Clean up
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Wait a moment for final chunk to be processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalText = interimTranscript.trim();
    
    mediaRecorderRef.current = null;
    currentChunkRef.current = [];
    processedChunksRef.current = 0;
    onTranscriptUpdateRef.current = null;
    
    return finalText;
  }, [interimTranscript]);

  return {
    isRecording,
    isTranscribing,
    interimTranscript,
    error,
    limitReached,
    startRecording,
    stopRecording,
  };
}

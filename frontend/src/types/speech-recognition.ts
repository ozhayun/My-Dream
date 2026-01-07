// Speech Recognition API TypeScript types
// These types are not available in standard TypeScript definitions

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: {
    new (): SpeechRecognition;
  };
  speechRecognition?: {
    new (): SpeechRecognition;
  };
}


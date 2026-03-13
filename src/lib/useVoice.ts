import { useState, useRef, useCallback, useEffect } from "react";

// Extend Window for SpeechRecognition browser prefixes
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
  continuous?: boolean;
}

export function useVoice({ onTranscript, continuous = false }: UseVoiceOptions) {
  const [voiceMode, setVoiceMode] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const voiceModeRef = useRef(false);

  // Keep ref in sync with state so callbacks see latest value
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;  // Single utterance per session
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) setInterimText(interim);

      if (final) {
        setInterimText("");
        setStatus("processing");
        onTranscript(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        setStatus("idle");
        setInterimText("");
      }
    };

    recognition.onend = () => {
      // Only reset to idle if we're not in processing/speaking state
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // If AI is speaking, interrupt it
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
    }

    setStatus("listening");
    setInterimText("");

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started — ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setStatus("idle");
    setInterimText("");
  }, []);

  const toggleListening = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !voiceModeRef.current) {
        setStatus("idle");
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Try to use a natural sounding voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => {
        setStatus("idle");
        // In voice mode, auto-listen after AI finishes speaking
        if (voiceModeRef.current) {
          setTimeout(() => startListening(), 400);
        }
      };
      utterance.onerror = () => setStatus("idle");

      synthRef.current.speak(utterance);
    },
    [startListening]
  );

  const setProcessing = useCallback(() => {
    setStatus("processing");
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode((prev) => {
      const newVal = !prev;
      if (!newVal) {
        // Turning off — stop everything
        recognitionRef.current?.stop();
        synthRef.current?.cancel();
        setStatus("idle");
        setInterimText("");
      }
      return newVal;
    });
  }, []);

  const interrupt = useCallback(() => {
    synthRef.current?.cancel();
    startListening();
  }, [startListening]);

  return {
    voiceMode,
    status,
    interimText,
    isListening: status === "listening",
    isSpeaking: status === "speaking",
    isProcessing: status === "processing",
    toggleListening,
    startListening,
    stopListening,
    speak,
    setProcessing,
    toggleVoiceMode,
    interrupt,
    isSupported: !!recognitionRef.current,
  };
}

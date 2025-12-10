import { useState, useEffect, useRef } from "react";

interface UseTextToSpeechProps {
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech({ onEnd, onError }: UseTextToSpeechProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Check if browser supports speech synthesis
    if ("speechSynthesis" in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        voicesRef.current = speechSynthesis.getVoices();
      };
      
      loadVoices();
      speechSynthesis.addEventListener("voiceschanged", loadVoices);
      
      return () => {
        speechSynthesis.cancel();
        speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  const speak = (text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
    if (!isSupported) {
      if (onError) onError("Text-to-speech not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    // Set options
    utteranceRef.current.rate = options.rate ?? 1;
    utteranceRef.current.pitch = options.pitch ?? 1;
    utteranceRef.current.volume = options.volume ?? 1;
    
    // Select a natural sounding voice
    const englishVoices = voicesRef.current.filter(voice => 
      voice.lang.startsWith("en") && voice.localService
    );
    
    if (englishVoices.length > 0) {
      utteranceRef.current.voice = englishVoices[0];
    }

    // Event handlers
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utteranceRef.current.onerror = (event) => {
      setIsSpeaking(false);
      console.error("Text-to-speech error", event);
      if (onError) onError("Failed to speak text");
    };

    // Speak the text
    speechSynthesis.speak(utteranceRef.current);
  };

  const stop = () => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported && !isSpeaking) {
      speechSynthesis.resume();
    }
  };

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    voices: voicesRef.current,
  };
}
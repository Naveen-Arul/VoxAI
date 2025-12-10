import { useState, useEffect, useRef } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onEnd: () => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  onResult,
  onEnd,
  onError,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [silenceThreshold] = useState(1500); // 1.5 seconds of silence

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Reset silence timer when speech is detected
        if (finalTranscript || interimTranscript) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Set new silence timer
          silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
              stopListening();
            }
          }, silenceThreshold);
        }

        // Call onResult with interim or final transcript
        if (finalTranscript) {
          onResult(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (onError) {
          onError(event.error);
        }
        stopListening();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Automatically restart if still listening
          recognitionRef.current.start();
        } else {
          onEnd();
        }
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [onResult, onEnd, onError, isListening, silenceThreshold]);

  const startListening = () => {
    if (isSupported && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        
        // Set initial silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, silenceThreshold);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        if (onError) {
          onError("Failed to start speech recognition");
        }
      }
    }
  };

  const stopListening = () => {
    if (isSupported && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
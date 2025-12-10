import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface VoiceControlProps {
  isListening: boolean;
  onToggle: () => void;
  isContinuous?: boolean;
}

export function VoiceControl({ isListening, onToggle, isContinuous = true }: VoiceControlProps) {
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 25, 30, 25, 20]);

  // Animate wave heights when listening
  useEffect(() => {
    if (!isListening) return;
    
    const interval = setInterval(() => {
      setWaveHeights(prev => [
        20 + Math.random() * 32,
        20 + Math.random() * 32,
        20 + Math.random() * 32,
        20 + Math.random() * 32,
        20 + Math.random() * 32,
      ]);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="flex flex-col items-center gap-4">
      {isListening && (
        <div className="flex gap-1 items-center h-12">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${height}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
        <Button
          size="lg"
          onClick={onToggle}
          className={`relative w-16 h-16 rounded-full transition-smooth ${
            isListening
              ? "bg-destructive hover:bg-destructive/90 animate-voice-pulse glow-accent"
              : "gradient-primary hover:opacity-90 glow-button"
          }`}
        >
          {isListening ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isListening 
          ? isContinuous
            ? "Listening continuously... (auto-detects silence & resumes)"
            : "Listening... (auto-stops on silence)" 
          : "Tap to start voice conversation"}
      </p>
      
      {/* Floating voice bubble animation */}
      {isListening && (
        <>
          <div className="absolute -top-20 -right-10 w-16 h-16 rounded-full gradient-primary opacity-20 animate-bounce blur-sm pointer-events-none"></div>
          <div className="absolute -top-16 -right-6 w-12 h-12 rounded-full gradient-primary opacity-30 animate-bounce blur-sm pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-12 -right-2 w-8 h-8 rounded-full gradient-primary opacity-40 animate-bounce blur-sm pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
        </>
      )}
    </div>
  );
}


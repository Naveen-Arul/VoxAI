import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MessageSquare, Globe, FileText, X, Play } from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

interface OnboardingModalProps {
  onComplete: () => void;
  onClose: () => void;
}

export function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to VoxAI",
      description: "Your intelligent voice assistant powered by advanced AI technologies.",
      icon: <MessageSquare className="w-8 h-8" />,
    },
    {
      id: 2,
      title: "Voice Assistant Mode",
      description: "Experience natural conversations with continuous voice recognition.",
      icon: <Mic className="w-8 h-8" />,
      highlight: "voice"
    },
    {
      id: 3,
      title: "Web Search Assistant",
      description: "Get real-time answers backed by live internet search.",
      icon: <Globe className="w-8 h-8" />,
      highlight: "web"
    },
    {
      id: 4,
      title: "PDF Knowledge Mode",
      description: "Analyze documents and ask questions about their content.",
      icon: <FileText className="w-8 h-8" />,
      highlight: "pdf"
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlayDemo = () => {
    setIsPlaying(true);
    // Simulate demo playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  // Auto-advance through steps for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps.length]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 glow-primary">
              {currentStepData.icon}
            </div>
            
            <h2 className="text-2xl font-bold mb-3">{currentStepData.title}</h2>
            <p className="text-muted-foreground mb-6">{currentStepData.description}</p>
            
            {currentStepData.highlight === "voice" && (
              <div className="relative mb-6">
                <Button
                  variant="outline"
                  size="lg"
                  className={`rounded-full w-16 h-16 transition-all ${
                    isPlaying 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "gradient-primary hover:opacity-90"
                  }`}
                  onClick={handlePlayDemo}
                >
                  {isPlaying ? (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary-foreground rounded-full animate-pulse"
                          style={{
                            height: `${10 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Play className="w-6 h-6 text-primary-foreground" />
                  )}
                </Button>
                
                {isPlaying && (
                  <div className="absolute -inset-4 rounded-full bg-primary/20 animate-ping"></div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-smooth ${
                    index === currentStep 
                      ? "w-6 gradient-primary" 
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
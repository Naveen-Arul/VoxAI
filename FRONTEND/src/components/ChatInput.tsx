import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip, MessageSquare, Globe, FileText } from "lucide-react";
import type { ChatMode } from "./ChatModeSelector";

interface ChatInputProps {
  mode: ChatMode;
  onSendMessage: (message: string) => void;
  onVoiceToggle: () => void;
  onFileUpload: () => void;
  isVoiceActive: boolean;
  onModeChange: (mode: ChatMode) => void;
  isModeLocked: boolean;
}

export function ChatInput({
  mode,
  onSendMessage,
  onVoiceToggle,
  onFileUpload,
  isVoiceActive,
  onModeChange,
  isModeLocked,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholders = {
    smart: "Message VoxAI...",
    voice: "Or use voice mode above...",
    web: "Ask me to search the web...",
    pdf: "Ask questions about your document...",
  };

  const modeButtons = [
    { id: "smart" as ChatMode, label: "Smart Chat", icon: MessageSquare },
    { id: "voice" as ChatMode, label: "Voice", icon: Mic },
    { id: "web" as ChatMode, label: "Web Search", icon: Globe },
    { id: "pdf" as ChatMode, label: "PDF", icon: FileText },
  ];

  return (
    <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-3">
      {/* Mode Selection Buttons - Only show if mode is not locked */}
      {!isModeLocked && (
        <div className="max-w-4xl mx-auto flex justify-center gap-2">
          {modeButtons.map((btn) => (
            <Button
              key={btn.id}
              variant={mode === btn.id ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(btn.id)}
              className={mode === btn.id ? "gradient-primary" : ""}
            >
              <btn.icon className="w-4 h-4 mr-2" />
              {btn.label}
            </Button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="max-w-4xl mx-auto flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onFileUpload}
          className="flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[mode]}
            className="min-h-[56px] max-h-32 resize-none pr-12 bg-background/50"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onVoiceToggle}
          className={`flex-shrink-0 ${
            isVoiceActive ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex-shrink-0 gradient-primary hover:opacity-90 transition-smooth"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

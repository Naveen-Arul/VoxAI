import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Mic, Globe, FileText } from "lucide-react";

export type ChatMode = "smart" | "voice" | "web" | "pdf";

interface ChatModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ChatModeSelector({ mode, onModeChange }: ChatModeSelectorProps) {
  const modes = [
    {
      value: "smart" as ChatMode,
      label: "Smart Chat",
      description: "General conversation",
      icon: MessageSquare,
    },
    {
      value: "voice" as ChatMode,
      label: "Voice Assistant",
      description: "Real-time voice chat",
      icon: Mic,
    },
    {
      value: "web" as ChatMode,
      label: "Web Search",
      description: "Internet-grounded answers",
      icon: Globe,
    },
    {
      value: "pdf" as ChatMode,
      label: "PDF Knowledge",
      description: "Document Q&A",
      icon: FileText,
    },
  ];

  const currentMode = modes.find((m) => m.value === mode);

  return (
    <Select value={mode} onValueChange={(value) => onModeChange(value as ChatMode)}>
      <SelectTrigger className="w-full md:w-64 bg-card border-border/50">
        <SelectValue>
          <div className="flex items-center gap-2">
            {currentMode && <currentMode.icon className="w-4 h-4" />}
            <span className="font-medium">{currentMode?.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {modes.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            <div className="flex items-center gap-3 py-1">
              <m.icon className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

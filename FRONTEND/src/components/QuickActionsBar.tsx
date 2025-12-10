import { MessageSquare, Mic, FileText, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsBarProps {
  onAction: (action: string) => void;
}

export function QuickActionsBar({ onAction }: QuickActionsBarProps) {
  const actions = [
    { icon: Sparkles, label: "New Chat", action: "new-chat" },
    { icon: Mic, label: "Voice", action: "voice" },
    { icon: Globe, label: "Web Search", action: "web" },
    { icon: FileText, label: "PDF", action: "pdf" },
    { icon: MessageSquare, label: "Smart Chat", action: "smart" },
  ];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 animate-fade-in-up">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg">
        {actions.map((action, index) => (
          <Button
            key={action.action}
            variant="ghost"
            size="sm"
            onClick={() => onAction(action.action)}
            className="rounded-full hover:gradient-hover transition-smooth group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <action.icon className="w-4 h-4 mr-2 group-hover:text-primary transition-smooth" />
            <span className="text-sm group-hover:text-primary transition-smooth">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

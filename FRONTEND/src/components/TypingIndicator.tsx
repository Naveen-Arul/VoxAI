import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>
      
      <div className="rounded-2xl px-4 py-3 bg-card border border-border/50">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

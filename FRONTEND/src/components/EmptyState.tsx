import { MessageSquare, Mic, FileText, Globe } from "lucide-react";

interface EmptyStateProps {
  mode: string;
}

export function EmptyState({ mode }: EmptyStateProps) {
  const suggestions = {
    smart: [
      "Explain quantum computing in simple terms",
      "Write a creative story about space exploration",
      "Help me brainstorm ideas for a startup",
    ],
    voice: [
      "Start a voice conversation",
      "Ask me anything with your voice",
      "Practice language learning",
    ],
    web: [
      "Search for the latest AI news",
      "What's trending in technology?",
      "Find information about climate change",
    ],
    pdf: [
      "Upload a PDF to analyze",
      "Ask questions about your document",
      "Extract key insights from papers",
    ],
  };

  const icons = {
    smart: MessageSquare,
    voice: Mic,
    web: Globe,
    pdf: FileText,
  };

  const Icon = icons[mode as keyof typeof icons] || MessageSquare;
  const modeSuggestions = suggestions[mode as keyof typeof suggestions] || suggestions.smart;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 glow-primary animate-bounce-subtle">
        <Icon className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3 text-center">Start a Conversation</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Choose a suggestion below or type your own message to begin
      </p>

      <div className="grid gap-3 w-full max-w-2xl">
        {modeSuggestions.map((suggestion, index) => (
          <button
            key={index}
            className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-smooth text-left group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-sm group-hover:text-primary transition-smooth">{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

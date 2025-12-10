import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
}

export function MessageActions({ content, onRegenerate }: MessageActionsProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
      
      {onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRegenerate}
          className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

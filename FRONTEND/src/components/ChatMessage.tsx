import { User, Bot } from "lucide-react";
import { MessageActions } from "./MessageActions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { memo } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  onRegenerate?: () => void;
}

function ChatMessageComponent({ role, content, timestamp, onRegenerate }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div 
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} group mb-4`}
      style={{ minHeight: '50px' }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 glow-primary">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-card border border-border/50 hover:border-border"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between px-2">
          {timestamp && (
            <p className="text-xs text-muted-foreground">
              {timestamp}
            </p>
          )}
          
          {!isUser && (
            <MessageActions content={content} onRegenerate={onRegenerate} />
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);

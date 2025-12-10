import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsProps {
  onNewChat: () => void;
}

export function KeyboardShortcuts({ onNewChat }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    { keys: ["Cmd", "K"], description: "New chat" },
    { keys: ["Cmd", "/"], description: "Show keyboard shortcuts" },
    { keys: ["Cmd", "B"], description: "Toggle sidebar" },
    { keys: ["Esc"], description: "Close dialogs" },
    { keys: ["Cmd", "Enter"], description: "Send message" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K - New chat
      if (modKey && e.key === "k") {
        e.preventDefault();
        onNewChat();
      }

      // Cmd/Ctrl + / - Show help
      if (modKey && e.key === "/") {
        e.preventDefault();
        setShowHelp(true);
      }

      // Esc - Close help
      if (e.key === "Escape") {
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewChat]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-primary bg-background rounded border border-border/50"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

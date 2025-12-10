import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchConversationsProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchConversations({ value, onChange }: SearchConversationsProps) {
  return (
    <div className="relative px-4 py-2">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-sidebar-accent border-sidebar-border focus:border-primary/50 transition-smooth"
      />
    </div>
  );
}

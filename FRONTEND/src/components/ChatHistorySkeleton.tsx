import { Skeleton } from "@/components/ui/skeleton";

export function ChatHistorySkeleton() {
  return (
    <div className="space-y-2 px-2 animate-fade-in">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-lg space-y-2"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <Skeleton className="h-4 w-3/4 bg-muted/30" />
          <Skeleton className="h-3 w-1/2 bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

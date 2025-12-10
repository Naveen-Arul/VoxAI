import { Card } from "@/components/ui/card";
import { Globe, ExternalLink } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface WebSearchResultsProps {
  results: SearchResult[];
  query: string;
  isSearching: boolean;
}

export function WebSearchResults({ results, query, isSearching }: WebSearchResultsProps) {
  if (isSearching) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Searching the web for "{query}"</h3>
        </div>
        
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Web Search Results</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {results.length} results
        </span>
      </div>
      
      <div className="space-y-3">
        {results.map((result) => (
          <Card 
            key={result.id} 
            className="p-4 hover:border-primary/50 transition-colors group"
          >
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-4 h-4 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3 h-3 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {result.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {result.url}
                  </p>
                  
                  <p className="text-sm mt-2 text-muted-foreground">
                    {result.snippet}
                  </p>
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>
      
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Powered by Live Search
        </p>
      </div>
    </div>
  );
}
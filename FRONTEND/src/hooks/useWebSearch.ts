import { useState, useCallback } from "react";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

interface UseWebSearchProps {
  onSearchStart?: () => void;
  onSearchComplete?: (results: SearchResult[]) => void;
  onSearchError?: (error: string) => void;
}

export function useWebSearch({ 
  onSearchStart, 
  onSearchComplete, 
  onSearchError 
}: UseWebSearchProps = {}) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  // Simulate web search API call
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setIsSearching(true);
    
    if (onSearchStart) {
      onSearchStart();
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Introduction to Artificial Intelligence",
          url: "https://example.com/ai-intro",
          snippet: "Artificial intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. Learn about machine learning, neural networks, and AI applications.",
        },
        {
          id: "2",
          title: "Machine Learning Algorithms Overview",
          url: "https://example.com/ml-algorithms",
          snippet: "Explore the most popular machine learning algorithms used today, including supervised learning, unsupervised learning, and reinforcement learning techniques with practical examples.",
        },
        {
          id: "3",
          title: "Natural Language Processing Guide",
          url: "https://example.com/nlp-guide",
          snippet: "Natural language processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret and manipulate human language. Discover NLP techniques and applications.",
        },
        {
          id: "4",
          title: "Deep Learning Neural Networks",
          url: "https://example.com/deep-learning",
          snippet: "Deep learning is a subset of machine learning where artificial neural networks, algorithms inspired by the human brain, learn from large amounts of data. Understand architectures and frameworks.",
        }
      ];

      setResults(mockResults);
      setIsSearching(false);
      
      if (onSearchComplete) {
        onSearchComplete(mockResults);
      }
      
      return mockResults;
    } catch (error) {
      setIsSearching(false);
      const errorMessage = "Failed to perform web search. Please try again.";
      
      if (onSearchError) {
        onSearchError(errorMessage);
      }
      
      return [];
    }
  }, [onSearchStart, onSearchComplete, onSearchError]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery("");
  }, []);

  return {
    isSearching,
    results,
    query,
    search,
    clearResults,
  };
}
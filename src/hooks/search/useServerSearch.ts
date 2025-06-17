
import { useState, useCallback } from 'react';
import { globalSearchService, SearchResponse, SearchOptions, ServerSearchResult } from '@/services/search/GlobalSearchService';

interface UseServerSearchResult {
  results: ServerSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, options?: SearchOptions) => Promise<void>;
  searchWithOperators: (query: string, options?: SearchOptions) => Promise<void>;
  total: number;
  suggestions?: string[];
  clearResults: () => void;
}

export const useServerSearch = (): UseServerSearchResult => {
  const [results, setResults] = useState<ServerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>();

  const search = useCallback(async (query: string, options: SearchOptions = {}) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setSuggestions(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: SearchResponse = await globalSearchService.search(query.trim(), options);
      
      setResults(response.results);
      setTotal(response.total);
      setSuggestions(response.suggestions);
      
      console.log('Server search completed:', {
        query,
        resultCount: response.results.length,
        searchTime: response.performance.searchTime
      });
      
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed');
      setResults([]);
      setTotal(0);
      setSuggestions(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchWithOperators = useCallback(async (query: string, options: SearchOptions = {}) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setSuggestions(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: SearchResponse = await globalSearchService.searchWithOperators(query.trim(), options);
      
      setResults(response.results);
      setTotal(response.total);
      setSuggestions(response.suggestions);
      
      console.log('Server search with operators completed:', {
        query,
        resultCount: response.results.length
      });
      
    } catch (err: any) {
      console.error('Search with operators failed:', err);
      setError(err.message || 'Search failed');
      setResults([]);
      setTotal(0);
      setSuggestions(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setSuggestions(undefined);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    searchWithOperators,
    total,
    suggestions,
    clearResults
  };
};

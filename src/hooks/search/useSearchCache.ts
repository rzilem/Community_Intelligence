
import { useState, useCallback, useRef } from 'react';
import { SearchResult } from './useOptimizedGlobalSearch';

interface CachedSearch {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

const CACHE_SIZE = 50;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useSearchCache = () => {
  const cacheRef = useRef<Map<string, CachedSearch>>(new Map());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const getCachedResults = useCallback((query: string): SearchResult[] | null => {
    const cached = cacheRef.current.get(query.toLowerCase());
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      cacheRef.current.delete(query.toLowerCase());
      return null;
    }
    
    return cached.results;
  }, []);

  const setCachedResults = useCallback((query: string, results: SearchResult[]) => {
    const cache = cacheRef.current;
    
    // Clean up old entries if cache is too large
    if (cache.size >= CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    cache.set(query.toLowerCase(), {
      query,
      results,
      timestamp: Date.now()
    });
  }, []);

  const addToRecentSearches = useCallback((query: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search !== query);
      return [query, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setRecentSearches([]);
  }, []);

  return {
    getCachedResults,
    setCachedResults,
    recentSearches,
    addToRecentSearches,
    clearCache
  };
};

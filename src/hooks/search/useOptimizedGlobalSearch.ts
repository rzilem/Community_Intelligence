
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyGlobalSearch } from './useLazyGlobalSearch';
import { useProgressiveSearch } from './useProgressiveSearch';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'association' | 'owner' | 'lead' | 'invoice' | 'request' | 'property';
  path: string;
  matchedField?: string;
}

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export const useOptimizedGlobalSearch = (query: string) => {
  const navigate = useNavigate();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    if (query !== debouncedQuery) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  // Determine if we should start loading data
  const shouldLoadData = debouncedQuery.length >= MIN_SEARCH_LENGTH;
  
  // Use lazy loading hook
  const {
    searchData,
    loadingStates,
    loadedStates,
    isInitializing,
    hasAnyData,
    isAnyLoading,
    loadingProgress
  } = useLazyGlobalSearch(shouldLoadData);

  // Use progressive search hook
  const { results: progressiveResults, categoryStatus } = useProgressiveSearch(
    debouncedQuery,
    searchData,
    loadedStates
  );

  const handleResultSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
  }, [navigate]);

  // Determine overall loading state
  const isLoading = isSearching || isInitializing || (shouldLoadData && isAnyLoading);

  return {
    results: progressiveResults,
    isLoading,
    handleResultSelect,
    isDebouncing: query !== debouncedQuery,
    hasMinLength: debouncedQuery.length >= MIN_SEARCH_LENGTH,
    loadingStates,
    loadedStates,
    categoryStatus,
    loadingProgress,
    hasAnyData
  };
};

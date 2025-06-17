
import { useState, useEffect, useCallback } from 'react';
import { searchDataManager, SearchDataState } from '@/services/search/SearchDataManager';

export const useLazyGlobalSearch = (shouldLoad: boolean) => {
  const [searchData, setSearchData] = useState<SearchDataState>(searchDataManager.getState());
  const [isInitializing, setIsInitializing] = useState(false);

  // Subscribe to data manager state changes
  useEffect(() => {
    const unsubscribe = searchDataManager.subscribe(() => {
      setSearchData(searchDataManager.getState());
    });
    return unsubscribe;
  }, []);

  // Initialize data loading when needed
  const initializeSearch = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    try {
      await searchDataManager.loadProgressively();
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  // Start loading when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && !isInitializing) {
      initializeSearch();
    }
  }, [shouldLoad, initializeSearch, isInitializing]);

  // Start background refresh on mount
  useEffect(() => {
    searchDataManager.startBackgroundRefresh();
    
    // Preload critical data in the background
    const timer = setTimeout(() => {
      searchDataManager.preloadCriticalData();
    }, 1000);

    return () => {
      clearTimeout(timer);
      searchDataManager.cleanup();
    };
  }, []);

  const getLoadedData = useCallback(() => {
    return {
      associations: searchData.associations.data || [],
      homeownerRequests: searchData.homeownerRequests.data || [],
      leads: searchData.leads.data || [],
      invoices: searchData.invoices.data || [],
    };
  }, [searchData]);

  const getLoadingStates = useCallback(() => {
    return {
      associations: searchData.associations.isLoading,
      homeownerRequests: searchData.homeownerRequests.isLoading,
      leads: searchData.leads.isLoading,
      invoices: searchData.invoices.isLoading,
    };
  }, [searchData]);

  const getLoadedStates = useCallback(() => {
    return {
      associations: searchData.associations.isLoaded,
      homeownerRequests: searchData.homeownerRequests.isLoaded,
      leads: searchData.leads.isLoaded,
      invoices: searchData.invoices.isLoaded,
    };
  }, [searchData]);

  const hasAnyData = Object.values(searchData).some(source => source.isLoaded && source.data?.length);
  const isAnyLoading = Object.values(searchData).some(source => source.isLoading);
  const loadingProgress = Object.values(searchData).filter(source => source.isLoaded).length / 4;

  return {
    searchData: getLoadedData(),
    loadingStates: getLoadingStates(),
    loadedStates: getLoadedStates(),
    isInitializing,
    hasAnyData,
    isAnyLoading,
    loadingProgress,
    initializeSearch,
  };
};

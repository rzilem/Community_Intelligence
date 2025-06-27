
import { useState, useEffect, useCallback } from 'react';
import { storageUrlService, StorageUrlStrategy } from '@/services/storage';

export interface UseStorageStrategiesResult {
  strategies: StorageUrlStrategy[];
  currentStrategy: StorageUrlStrategy | null;
  isLoading: boolean;
  error: string | null;
  retryStrategy: () => void;
  nextStrategy: () => void;
}

export const useStorageStrategies = (pdfUrl?: string): UseStorageStrategiesResult => {
  const [strategies, setStrategies] = useState<StorageUrlStrategy[]>([]);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStrategies = useCallback(async () => {
    if (!pdfUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await storageUrlService.generateUrlStrategies(pdfUrl);
      
      if (result.success && result.data) {
        setStrategies(result.data);
        setCurrentStrategyIndex(0);
      } else {
        setError(result.error || 'Failed to generate PDF URLs');
        setStrategies([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF URLs');
      setStrategies([]);
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const retryStrategy = useCallback(() => {
    // Clear cache and reload
    storageUrlService.clearExpiredCache();
    loadStrategies();
  }, [loadStrategies]);

  const nextStrategy = useCallback(() => {
    if (currentStrategyIndex < strategies.length - 1) {
      setCurrentStrategyIndex(prev => prev + 1);
    }
  }, [currentStrategyIndex, strategies.length]);

  const currentStrategy = strategies[currentStrategyIndex] || null;

  return {
    strategies,
    currentStrategy,
    isLoading,
    error,
    retryStrategy,
    nextStrategy
  };
};

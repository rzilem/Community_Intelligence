
import { useState, useEffect, useCallback } from 'react';
import { generatePdfUrls, type StorageUrlResult } from '@/utils/supabase-storage-utils';

export interface UseStorageStrategiesResult {
  strategies: StorageUrlResult[];
  currentStrategy: StorageUrlResult | null;
  isLoading: boolean;
  error: string | null;
  retryStrategy: () => void;
  nextStrategy: () => void;
}

export const useStorageStrategies = (pdfUrl?: string): UseStorageStrategiesResult => {
  const [strategies, setStrategies] = useState<StorageUrlResult[]>([]);
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
      const urlStrategies = await generatePdfUrls(pdfUrl);
      setStrategies(urlStrategies);
      setCurrentStrategyIndex(0);
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

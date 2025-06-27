
import { useState, useCallback } from 'react';

export interface PdfLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export interface PdfLoadingActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleLoadSuccess: () => void;
  handleLoadError: (error?: string) => void;
  retry: () => void;
}

export const usePdfLoadingState = (): PdfLoadingState & PdfLoadingActions => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setHasError(false);
      setErrorMessage(null);
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    setErrorMessage(error);
    setHasError(!!error);
    setIsLoading(false);
  }, []);

  const handleLoadSuccess = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setErrorMessage(null);
  }, []);

  const handleLoadError = useCallback((error?: string) => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error || 'Failed to load PDF');
  }, []);

  const retry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
  }, []);

  return {
    isLoading,
    hasError,
    errorMessage,
    setLoading,
    setError,
    handleLoadSuccess,
    handleLoadError,
    retry
  };
};

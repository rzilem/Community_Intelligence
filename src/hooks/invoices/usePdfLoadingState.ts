
import { useState, useCallback } from 'react';

export interface PdfLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export const usePdfLoadingState = () => {
  const [state, setState] = useState<PdfLoadingState>({
    isLoading: true,
    hasError: false,
    errorMessage: null
  });

  const handleLoadSuccess = useCallback(() => {
    setState({
      isLoading: false,
      hasError: false,
      errorMessage: null
    });
  }, []);

  const handleLoadError = useCallback((error?: string) => {
    setState({
      isLoading: false,
      hasError: true,
      errorMessage: error || 'Failed to load PDF'
    });
  }, []);

  const retry = useCallback(() => {
    setState({
      isLoading: true,
      hasError: false,
      errorMessage: null
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: true,
      hasError: false,
      errorMessage: null
    });
  }, []);

  return {
    ...state,
    handleLoadSuccess,
    handleLoadError,
    retry,
    reset
  };
};


import { useRef, useCallback } from 'react';

export const useSearchCancellation = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelPreviousSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    cancelPreviousSearch,
    cleanup
  };
};

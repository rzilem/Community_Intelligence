
import { useState, useEffect, useCallback, useRef } from 'react';
import { detectBrowser, getChromeSpecificConfig } from '@/utils/browser-utils';
import { chromeStorageService } from '@/services/storage/ChromeStorageService';

export interface ChromePdfLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  loadAttempt: number;
  browserOptimized: boolean;
  chromeSpecific: boolean;
}

export const useChromePdfLoading = (pdfUrl?: string) => {
  const [state, setState] = useState<ChromePdfLoadingState>({
    isLoading: true,
    hasError: false,
    errorMessage: null,
    loadAttempt: 0,
    browserOptimized: false,
    chromeSpecific: false
  });

  const browser = detectBrowser();
  const chromeConfig = getChromeSpecificConfig();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadAttemptRef = useRef(0);
  const isRetryingRef = useRef(false);
  const maxRetries = 3;

  useEffect(() => {
    setState(prev => ({
      ...prev,
      chromeSpecific: browser.isChrome,
      browserOptimized: browser.isChrome && !!chromeConfig
    }));
  }, [browser.isChrome, chromeConfig]);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('🔄 Chrome PDF loading started');
    
    // Prevent multiple simultaneous load starts
    if (isRetryingRef.current) {
      console.log('🔄 Already retrying, skipping load start');
      return;
    }

    clearTimeouts();
    loadAttemptRef.current += 1;
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      loadAttempt: loadAttemptRef.current
    }));

    // Set Chrome-specific timeout
    if (browser.isChrome && chromeConfig) {
      timeoutRef.current = setTimeout(() => {
        console.warn('⏰ Chrome PDF load timeout');
        handleLoadError('PDF loading timed out in Chrome. This may be due to browser security restrictions.');
      }, chromeConfig.loadTimeout);
    }
  }, [browser.isChrome, chromeConfig]);

  const handleLoadSuccess = useCallback(() => {
    console.log('✅ Chrome PDF loaded successfully');
    clearTimeouts();
    isRetryingRef.current = false;

    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      errorMessage: null
    }));
  }, [clearTimeouts]);

  const handleLoadError = useCallback((error?: string) => {
    console.error('❌ Chrome PDF load error:', error);
    clearTimeouts();

    const chromeSpecificError = browser.isChrome 
      ? `Chrome PDF Error: ${error || 'Unable to display PDF in Chrome browser. This may be due to CORS restrictions or security policies.'}`
      : error || 'PDF loading failed';

    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      errorMessage: chromeSpecificError
    }));

    // Auto-retry logic with proper guards
    if (browser.isChrome && 
        chromeConfig && 
        loadAttemptRef.current < maxRetries && 
        !isRetryingRef.current) {
      
      console.log(`🔄 Chrome auto-retry attempt ${loadAttemptRef.current}/${maxRetries}`);
      isRetryingRef.current = true;
      
      // Use setTimeout to break the execution cycle and prevent infinite loops
      setTimeout(() => {
        if (loadAttemptRef.current < maxRetries) {
          handleLoadStart();
        }
        isRetryingRef.current = false;
      }, 2000 * loadAttemptRef.current); // Exponential backoff
    }
  }, [browser.isChrome, chromeConfig, clearTimeouts, handleLoadStart, maxRetries]);

  const retry = useCallback(async () => {
    console.log('🔄 Manual Chrome PDF retry');
    
    // Reset attempt counter for manual retry
    loadAttemptRef.current = 0;
    isRetryingRef.current = false;
    
    if (pdfUrl && browser.isChrome) {
      // Test accessibility before retrying
      try {
        const isAccessible = await chromeStorageService.testChromeAccessibility(pdfUrl);
        if (!isAccessible) {
          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: 'PDF is not accessible in Chrome. Please try opening in a new tab or use Edge browser.'
          }));
          return;
        }
      } catch (error) {
        console.warn('Accessibility test failed, proceeding with retry');
      }
    }

    handleLoadStart();
  }, [pdfUrl, browser.isChrome, handleLoadStart]);

  const reset = useCallback(() => {
    clearTimeouts();
    loadAttemptRef.current = 0;
    isRetryingRef.current = false;

    setState({
      isLoading: true,
      hasError: false,
      errorMessage: null,
      loadAttempt: 0,
      browserOptimized: browser.isChrome && !!chromeConfig,
      chromeSpecific: browser.isChrome
    });
  }, [browser.isChrome, chromeConfig, clearTimeouts]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      isRetryingRef.current = false;
    };
  }, [clearTimeouts]);

  return {
    ...state,
    handleLoadStart,
    handleLoadSuccess,
    handleLoadError,
    retry,
    reset,
    browser,
    chromeConfig
  };
};

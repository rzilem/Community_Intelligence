
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
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setState(prev => ({
      ...prev,
      chromeSpecific: browser.isChrome,
      browserOptimized: browser.isChrome && !!chromeConfig
    }));
  }, [browser.isChrome, chromeConfig]);

  const handleLoadStart = useCallback(() => {
    console.log('🔄 Chrome PDF loading started');
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      loadAttempt: prev.loadAttempt + 1
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      errorMessage: null
    }));
  }, []);

  const handleLoadError = useCallback((error?: string) => {
    console.error('❌ Chrome PDF load error:', error);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const chromeSpecificError = browser.isChrome 
      ? `Chrome PDF Error: ${error || 'Unable to display PDF in Chrome browser. This may be due to CORS restrictions or security policies.'}`
      : error || 'PDF loading failed';

    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      errorMessage: chromeSpecificError
    }));

    // Auto-retry logic for Chrome
    if (browser.isChrome && chromeConfig && state.loadAttempt < chromeConfig.retryAttempts) {
      console.log(`🔄 Chrome auto-retry attempt ${state.loadAttempt + 1}/${chromeConfig.retryAttempts}`);
      retryTimeoutRef.current = setTimeout(() => {
        handleLoadStart();
      }, 2000 * state.loadAttempt); // Exponential backoff
    }
  }, [browser.isChrome, chromeConfig, state.loadAttempt]);

  const retry = useCallback(async () => {
    console.log('🔄 Manual Chrome PDF retry');
    
    if (pdfUrl && browser.isChrome) {
      // Test accessibility before retrying
      const isAccessible = await chromeStorageService.testChromeAccessibility(pdfUrl);
      if (!isAccessible) {
        setState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: 'PDF is not accessible in Chrome. Please try opening in a new tab or use Edge browser.'
        }));
        return;
      }
    }

    handleLoadStart();
  }, [pdfUrl, browser.isChrome, handleLoadStart]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState({
      isLoading: true,
      hasError: false,
      errorMessage: null,
      loadAttempt: 0,
      browserOptimized: browser.isChrome && !!chromeConfig,
      chromeSpecific: browser.isChrome
    });
  }, [browser.isChrome, chromeConfig]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

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

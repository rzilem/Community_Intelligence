
import React, { useEffect, useRef, useState } from 'react';
import { useChromePdfLoading } from '@/hooks/invoices/useChromePdfLoading';
import { chromeStorageService } from '@/services/storage/ChromeStorageService';
import { PdfLoader } from './PdfLoader';
import { PdfError } from './PdfError';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Monitor, ExternalLink } from 'lucide-react';

interface ChromeOptimizedPdfViewerProps {
  pdfUrl: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const ChromeOptimizedPdfViewer: React.FC<ChromeOptimizedPdfViewerProps> = ({
  pdfUrl,
  onExternalOpen,
  onFallbackToHtml
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [optimizedUrls, setOptimizedUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [showChromeWarning, setShowChromeWarning] = useState(false);

  const {
    isLoading,
    hasError,
    errorMessage,
    loadAttempt,
    chromeSpecific,
    browserOptimized,
    handleLoadStart,
    handleLoadSuccess,
    handleLoadError,
    retry,
    browser,
    chromeConfig
  } = useChromePdfLoading(pdfUrl);

  // Generate Chrome-optimized URLs on mount
  useEffect(() => {
    const generateOptimizedUrls = async () => {
      if (chromeSpecific) {
        console.log('🔧 Generating Chrome-optimized URLs');
        const result = await chromeStorageService.generateChromeOptimizedStrategies(pdfUrl);
        
        if (result.success && result.data) {
          const urls = result.data.map(strategy => strategy.url);
          setOptimizedUrls(urls);
          console.log('✅ Chrome URLs generated:', urls.length);
        } else {
          console.warn('⚠️ Chrome URL generation failed, using original');
          setOptimizedUrls([pdfUrl]);
        }
      } else {
        setOptimizedUrls([pdfUrl]);
      }
    };

    generateOptimizedUrls();
  }, [pdfUrl, chromeSpecific]);

  // Get current URL to display
  const currentUrl = optimizedUrls[currentUrlIndex] || pdfUrl;

  // Handle iframe load events
  const handleIframeLoad = () => {
    console.log('📄 Chrome PDF iframe loaded');
    handleLoadSuccess();
  };

  const handleIframeError = () => {
    console.error('❌ Chrome PDF iframe error');
    
    // Try next URL if available
    if (currentUrlIndex < optimizedUrls.length - 1) {
      console.log(`🔄 Trying next Chrome URL (${currentUrlIndex + 1}/${optimizedUrls.length})`);
      setCurrentUrlIndex(prev => prev + 1);
      handleLoadStart();
    } else {
      // Show Chrome-specific warning after all attempts
      if (chromeSpecific && loadAttempt >= (chromeConfig?.retryAttempts || 3)) {
        setShowChromeWarning(true);
      }
      handleLoadError(`PDF display failed. Chrome may be blocking the content due to security restrictions.`);
    }
  };

  // Start loading when URL changes
  useEffect(() => {
    if (currentUrl && currentUrl !== pdfUrl) {
      handleLoadStart();
    }
  }, [currentUrl, pdfUrl, handleLoadStart]);

  // Chrome-specific warning banner
  const ChromeWarningBanner = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-1">Chrome PDF Display Issue</h4>
          <p className="text-sm text-amber-700 mb-3">
            Chrome's security policies may prevent PDF display. This document works better in Edge or Firefox.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onExternalOpen}
              className="text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in New Tab
            </Button>
            {onFallbackToHtml && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onFallbackToHtml}
                className="text-amber-800 border-amber-300 hover:bg-amber-100"
              >
                View Processed Content
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Debug info for Chrome
  const renderDebugInfo = () => {
    if (!chromeSpecific || process.env.NODE_ENV === 'production') {
      return null;
    }

    return (
      <div className="text-xs text-gray-500 p-2 bg-gray-50 border-t">
        <div className="flex items-center gap-4">
          <span>🔍 Debug: Chrome {browser.version}</span>
          <span>URLs: {optimizedUrls.length}</span>
          <span>Current: {currentUrlIndex + 1}</span>
          <span>Attempts: {loadAttempt}</span>
          {browserOptimized && <span className="text-green-600">✅ Optimized</span>}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full relative">
        <PdfLoader onExternalOpen={onExternalOpen} />
        {renderDebugInfo()}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full">
        {showChromeWarning && <ChromeWarningBanner />}
        <PdfError
          message={errorMessage || 'PDF loading failed'}
          onExternalOpen={onExternalOpen}
          onFallbackToHtml={onFallbackToHtml}
          onRetry={retry}
        />
        {renderDebugInfo()}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {showChromeWarning && <ChromeWarningBanner />}
      
      <iframe
        ref={iframeRef}
        src={currentUrl}
        width="100%"
        height="100%"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="border-0"
        title="PDF Document"
        sandbox={chromeSpecific ? chromeConfig?.sandboxAttributes : undefined}
      />
      
      {renderDebugInfo()}
    </div>
  );
};

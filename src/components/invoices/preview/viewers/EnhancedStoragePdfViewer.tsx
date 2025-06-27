
import React, { useEffect } from 'react';
import { useStorageStrategies } from '@/hooks/invoices/useStorageStrategies';
import { usePdfLoadingState } from '@/hooks/invoices/usePdfLoadingState';
import { ChromeOptimizedPdfViewer } from './ChromeOptimizedPdfViewer';
import { PdfLoader } from './PdfLoader';
import { PdfError } from './PdfError';
import { PdfViewer } from './PdfViewer';
import { detectBrowser, logBrowserDiagnostics } from '@/utils/browser-utils';

interface EnhancedStoragePdfViewerProps {
  pdfUrl?: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const EnhancedStoragePdfViewer: React.FC<EnhancedStoragePdfViewerProps> = ({
  pdfUrl,
  onExternalOpen,
  onFallbackToHtml
}) => {
  const { currentStrategy, isLoading: strategiesLoading, nextStrategy } = useStorageStrategies(pdfUrl);
  const { isLoading, hasError, errorMessage, handleLoadSuccess, handleLoadError, retry } = usePdfLoadingState();
  const browser = detectBrowser();

  // Log browser diagnostics on mount
  useEffect(() => {
    logBrowserDiagnostics();
    console.log('EnhancedStoragePdfViewer: Browser detected:', browser.name);
    console.log('EnhancedStoragePdfViewer: Current strategy:', currentStrategy);
  }, [browser.name, currentStrategy]);

  // Handle PDF load failure by trying next strategy
  const handlePdfError = () => {
    console.error('PDF load failed, trying next strategy');
    nextStrategy();
    handleLoadError('PDF display failed. Trying alternative access method...');
  };

  // Show loading state while strategies are being generated
  if (strategiesLoading || !currentStrategy) {
    return <PdfLoader onExternalOpen={onExternalOpen} />;
  }

  // Show error state if all strategies failed
  if (hasError && !isLoading) {
    return (
      <PdfError
        message={errorMessage || 'PDF could not be loaded'}
        onExternalOpen={onExternalOpen}
        onFallbackToHtml={onFallbackToHtml}
        onRetry={retry}
      />
    );
  }

  // Use Chrome-optimized viewer for Chrome browser
  if (browser.isChrome) {
    return (
      <ChromeOptimizedPdfViewer
        pdfUrl={currentStrategy.url}
        onExternalOpen={onExternalOpen}
        onFallbackToHtml={onFallbackToHtml}
      />
    );
  }

  // Use standard PDF viewer for other browsers
  return (
    <PdfViewer
      pdfUrl={currentStrategy.url}
      isLoading={isLoading}
      onLoadSuccess={handleLoadSuccess}
      onLoadError={handlePdfError}
      onExternalOpen={onExternalOpen}
    />
  );
};


import React, { useEffect } from 'react';
import { useStorageStrategies } from '@/hooks/invoices/useStorageStrategies';
import { usePdfLoadingState } from '@/hooks/invoices/usePdfLoadingState';
import { PdfLoader } from './PdfLoader';
import { PdfError } from './PdfError';
import { PdfViewer } from './PdfViewer';

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

  console.log('EnhancedStoragePdfViewer: Current strategy:', currentStrategy);

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

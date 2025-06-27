
import React from 'react';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';
import { useInvoicePreviewState } from '@/hooks/invoices/useInvoicePreviewState';
import { ConsolidatedPreviewToolbar } from './preview/ConsolidatedPreviewToolbar';
import { InvoicePreviewContent } from './preview/InvoicePreviewContent';
import { InvoicePreviewModals } from './preview/InvoicePreviewModals';
import { NoPreviewState } from './preview/NoPreviewState';

interface InvoicePreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = React.memo(({
  pdfUrl,
  htmlContent,
  emailContent
}) => {
  const { preferences } = useUserPreferences();
  
  // Determine available views
  const hasPdf = !!pdfUrl && pdfUrl.trim().length > 0;
  const hasHtml = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmail = !!emailContent && emailContent.trim().length > 0;

  const {
    showSettings,
    showValidation,
    showStorageDebug,
    isFullscreen,
    currentView,
    setShowSettings,
    handleViewChange,
    handleToggleFullscreen,
    handleValidate,
    handleShowStorageDebug,
  } = useInvoicePreviewState({ hasPdf, hasHtml, hasEmail });

  console.log('InvoicePreview: Smart content selection:', {
    hasHtml,
    hasPdf,
    hasEmail,
    currentView
  });

  const handleExternalOpen = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleFallbackToHtml = hasHtml ? () => handleViewChange('html') : undefined;

  if (!hasPdf && !hasHtml && !hasEmail) {
    return <NoPreviewState message="No document content available for preview" />;
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <ConsolidatedPreviewToolbar
        currentView={currentView}
        onViewChange={handleViewChange}
        hasEmail={hasEmail}
        hasPdf={hasPdf}
        hasHtml={hasHtml}
        onExternalOpen={hasPdf ? handleExternalOpen : undefined}
        onToggleFullscreen={handleToggleFullscreen}
        onShowSettings={() => setShowSettings(true)}
        onValidate={handleValidate}
        onShowStorageDebug={handleShowStorageDebug}
      />
      
      <div className="flex-1 overflow-hidden">
        <InvoicePreviewContent
          currentView={currentView}
          pdfUrl={pdfUrl}
          htmlContent={htmlContent}
          emailContent={emailContent}
          hasPdf={hasPdf}
          hasHtml={hasHtml}
          hasEmail={hasEmail}
          onExternalOpen={handleExternalOpen}
          onFallbackToHtml={handleFallbackToHtml}
        />
      </div>

      <InvoicePreviewModals
        showSettings={showSettings}
        showValidation={showValidation}
        showStorageDebug={showStorageDebug}
        onCloseSettings={() => setShowSettings(false)}
        pdfUrl={pdfUrl}
        htmlContent={htmlContent}
        hasPdf={hasPdf}
      />
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

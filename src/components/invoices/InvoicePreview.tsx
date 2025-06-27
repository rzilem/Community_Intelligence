
import React, { useState } from 'react';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';
import { ConsolidatedPreviewToolbar } from './preview/ConsolidatedPreviewToolbar';
import { PreferenceSettings } from './preview/PreferenceSettings';
import { AIValidationTools } from './preview/validators/AIValidationTools';
import { EnhancedPdfProcessor } from './preview/enhanced/EnhancedPdfProcessor';
import { EnhancedPdfViewer } from './preview/viewers/EnhancedPdfViewer';
import { EmailPreview } from './preview/EmailPreview';
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
  const [showSettings, setShowSettings] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState<'pdf' | 'html' | 'email'>('pdf');
  const [pdfError, setPdfError] = useState(false);

  // Determine available views
  const hasPdf = !!pdfUrl && pdfUrl.trim().length > 0;
  const hasHtml = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmail = !!emailContent && emailContent.trim().length > 0;

  console.log('InvoicePreview: Content availability:', {
    hasPdf,
    hasHtml,
    hasEmail,
    pdfUrl: pdfUrl || 'none'
  });

  // Auto-set current view based on available content and errors
  React.useEffect(() => {
    if (hasPdf && !pdfError && currentView !== 'pdf') {
      setCurrentView('pdf');
    } else if ((!hasPdf || pdfError) && hasHtml && currentView === 'pdf') {
      setCurrentView('html');
    } else if (!hasPdf && !hasHtml && hasEmail && currentView !== 'email') {
      setCurrentView('email');
    }
  }, [hasPdf, hasHtml, hasEmail, currentView, pdfError]);

  const handleViewChange = (view: 'pdf' | 'html' | 'email') => {
    setCurrentView(view);
    // Reset PDF error when switching back to PDF view
    if (view === 'pdf') {
      setPdfError(false);
    }
  };

  const handleExternalOpen = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleValidate = () => {
    setShowValidation(!showValidation);
  };

  const handlePdfError = () => {
    console.log('InvoicePreview: PDF error detected, setting error state');
    setPdfError(true);
    // Auto-switch to HTML if available
    if (hasHtml) {
      setCurrentView('html');
    }
  };

  const renderContent = () => {
    console.log('InvoicePreview: Rendering content for view:', currentView, 'PDF Error:', pdfError);

    // Show content based on current view
    switch (currentView) {
      case 'pdf':
        return hasPdf ? (
          <EnhancedPdfViewer 
            pdfUrl={pdfUrl}
            onExternalOpen={handleExternalOpen}
            onError={handlePdfError}
          />
        ) : (
          <NoPreviewState message="PDF not available" />
        );
      
      case 'html':
        return hasHtml ? (
          <div className="p-4 overflow-auto h-full bg-white">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <NoPreviewState message="Processed content not available" />
        );
      
      case 'email':
        return hasEmail ? (
          <EmailPreview emailContent={emailContent} />
        ) : (
          <NoPreviewState message="Original email not available" />
        );
      
      default:
        return <NoPreviewState message="No content available" />;
    }
  };

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
        onRetry={() => setPdfError(false)}
        canRetry={pdfError && hasPdf}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Enhanced Tools - Show in sidebar when enabled */}
      {showValidation && (
        <div className="border-t p-4 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AIValidationTools 
              pdfUrl={pdfUrl}
              htmlContent={htmlContent}
            />
            {hasPdf && (
              <EnhancedPdfProcessor 
                pdfUrl={pdfUrl}
              />
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <PreferenceSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

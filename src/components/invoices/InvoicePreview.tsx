
import React, { useState } from 'react';
import { useEnhancedPdfPreview } from '@/hooks/invoices/useEnhancedPdfPreview';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';
import { ConsolidatedPreviewToolbar } from './preview/ConsolidatedPreviewToolbar';
import { PreferenceSettings } from './preview/PreferenceSettings';
import { AIValidationTools } from './preview/validators/AIValidationTools';
import { EnhancedPdfProcessor } from './preview/enhanced/EnhancedPdfProcessor';
import { DocumentViewer } from './preview/DocumentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { PreviewErrorState } from './preview/PreviewErrorState';
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

  const {
    contentType,
    isLoading,
    error,
    pdfUrl: normalizedPdfUrl,
    retryPdfLoad,
    checkPdfAccessibility
  } = useEnhancedPdfPreview({
    pdfUrl,
    htmlContent,
    emailContent,
    userPreferences: preferences
  });

  // Determine available views
  const hasPdf = !!normalizedPdfUrl;
  const hasHtml = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmail = !!emailContent && emailContent.trim().length > 0;

  // Auto-set current view based on content type
  React.useEffect(() => {
    if (contentType === 'pdf' && hasPdf) setCurrentView('pdf');
    else if (contentType === 'html' && hasHtml) setCurrentView('html');
    else if (contentType === 'email' && hasEmail) setCurrentView('email');
  }, [contentType, hasPdf, hasHtml, hasEmail]);

  const handleViewChange = (view: 'pdf' | 'html' | 'email') => {
    setCurrentView(view);
  };

  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleValidate = () => {
    setShowValidation(!showValidation);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <PreviewErrorState 
          error={error}
          onRetry={retryPdfLoad}
          onSwitchToHtml={hasHtml ? () => setCurrentView('html') : undefined}
        />
      );
    }

    // Show content based on current view
    switch (currentView) {
      case 'pdf':
        return hasPdf ? (
          <DocumentViewer pdfUrl={normalizedPdfUrl} />
        ) : (
          <NoPreviewState message="PDF not available" />
        );
      
      case 'html':
        return hasHtml ? (
          <div className="p-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <NoPreviewState message="Processed content not available" />
        );
      
      case 'email':
        return hasEmail ? (
          <EmailPreview content={emailContent} />
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
        onRetry={retryPdfLoad}
        canRetry={!!error}
      />
      
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Enhanced Tools - Show in sidebar when enabled */}
      {showValidation && (
        <div className="border-t p-4 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AIValidationTools 
              pdfUrl={normalizedPdfUrl}
              htmlContent={htmlContent}
            />
            {hasPdf && (
              <EnhancedPdfProcessor 
                pdfUrl={normalizedPdfUrl}
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


import React, { useState } from 'react';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';
import { ConsolidatedPreviewToolbar } from './preview/ConsolidatedPreviewToolbar';
import { PreferenceSettings } from './preview/PreferenceSettings';
import { AIValidationTools } from './preview/validators/AIValidationTools';
import { EnhancedPdfProcessor } from './preview/enhanced/EnhancedPdfProcessor';
import { PdfAccessScreen } from './preview/viewers/PdfAccessScreen';
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
  
  // Determine available views
  const hasPdf = !!pdfUrl && pdfUrl.trim().length > 0;
  const hasHtml = !!htmlContent && htmlContent.trim().length > 0;
  const hasEmail = !!emailContent && emailContent.trim().length > 0;

  // Smart default view selection - prioritize HTML over PDF for reliability
  const getDefaultView = (): 'pdf' | 'html' | 'email' => {
    if (hasHtml) return 'html'; // HTML is most reliable
    if (hasPdf) return 'pdf';   // PDF as secondary option
    if (hasEmail) return 'email'; // Email as fallback
    return 'html'; // Default fallback
  };

  const [currentView, setCurrentView] = useState<'pdf' | 'html' | 'email'>(getDefaultView());

  console.log('InvoicePreview: Smart content selection:', {
    hasHtml,
    hasPdf,
    hasEmail,
    defaultView: getDefaultView(),
    currentView
  });

  const handleViewChange = (view: 'pdf' | 'html' | 'email') => {
    setCurrentView(view);
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

  const renderContent = () => {
    console.log('InvoicePreview: Rendering content for view:', currentView);

    switch (currentView) {
      case 'html':
        return hasHtml ? (
          <div className="p-6 overflow-auto h-full bg-white">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <NoPreviewState message="Processed content not available" />
        );
      
      case 'pdf':
        return hasPdf ? (
          <PdfAccessScreen 
            pdfUrl={pdfUrl}
            onExternalOpen={handleExternalOpen}
            onFallbackToHtml={hasHtml ? () => setCurrentView('html') : undefined}
          />
        ) : (
          <NoPreviewState message="PDF not available" />
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
      />
      
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Enhanced Tools */}
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

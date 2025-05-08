
import React from 'react';
import { Card } from '@/components/ui/card';
import { useInvoicePreview } from '@/hooks/invoices/useInvoicePreview';
import { PreviewHeader } from './preview/PreviewHeader';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';
import { DocumentViewer } from './preview/DocumentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { Tabs, TabsContent } from '@/components/ui/tabs';

interface InvoicePreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  pdfUrl,
  htmlContent,
  emailContent
}) => {
  const {
    activeTab,
    isPdf,
    isWordDocument,
    previewError,
    contentType,
    isFullscreen,
    hasEmailContent,
    handleTabChange,
    handlePreviewError,
    handlePreviewLoad,
    handleExternalOpen,
    toggleFullscreen,
    handleRetry,
  } = useInvoicePreview({ pdfUrl, htmlContent, emailContent });

  const fullscreenClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-background p-4'
    : 'h-[600px]';

  return (
    <div className={`flex flex-col border rounded-lg overflow-hidden ${fullscreenClass}`} style={{ position: 'relative' }}>
      <PreviewHeader
        isPdf={isPdf}
        isWordDocument={isWordDocument}
        pdfUrl={pdfUrl}
        onExternalOpen={handleExternalOpen}
        onToggleFullscreen={toggleFullscreen}
        showActions={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasEmail={hasEmailContent}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
        <TabsContent value="document" className="h-full">
          {previewError ? (
            <PreviewErrorState
              error={previewError}
              pdfUrl={pdfUrl}
              onExternalOpen={handleExternalOpen}
              onRetry={handleRetry}
            />
          ) : contentType === 'none' ? (
            <NoPreviewState />
          ) : (
            <DocumentViewer
              pdfUrl={pdfUrl}
              htmlContent={htmlContent}
              isPdf={contentType === 'pdf'}
              isWordDocument={isWordDocument}
              onIframeError={handlePreviewError}
              onIframeLoad={handlePreviewLoad}
              onExternalOpen={handleExternalOpen}
            />
          )}
        </TabsContent>
        
        <TabsContent value="email" className="h-full">
          <EmailPreview 
            emailContent={emailContent} 
            htmlContent={htmlContent} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { useEnhancedPdfPreview } from '@/hooks/invoices/useEnhancedPdfPreview';
import { PreviewHeader } from './preview/PreviewHeader';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';
import { EnhancedPdfViewer } from './preview/viewers/EnhancedPdfViewer';
import { HtmlContentViewer } from './preview/viewers/HtmlContentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Mail } from 'lucide-react';

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
    contentType,
    isLoading,
    error,
    pdfUrl: normalizedPdfUrl,
    hasHtmlContent,
    hasEmailContent,
    retryPdfLoad,
    switchToHtml,
    switchToPdf
  } = useEnhancedPdfPreview({ pdfUrl, htmlContent, emailContent });

  const [activeTab, setActiveTab] = React.useState('document');
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Auto-switch content type when switching tabs
    if (value === 'document' && contentType !== 'pdf' && normalizedPdfUrl) {
      switchToPdf();
    }
  };

  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-background p-4'
    : 'h-[600px]';

  return (
    <div className={`flex flex-col border rounded-lg overflow-hidden ${fullscreenClass}`}>
      <PreviewHeader
        isPdf={contentType === 'pdf'}
        isWordDocument={false}
        pdfUrl={normalizedPdfUrl}
        onExternalOpen={handleExternalOpen}
        onToggleFullscreen={toggleFullscreen}
        showActions={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasEmail={hasEmailContent}
      />
      
      {/* Content type switcher */}
      {(hasHtmlContent || normalizedPdfUrl) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b">
          <span className="text-sm text-muted-foreground">View:</span>
          {normalizedPdfUrl && (
            <Button
              size="sm"
              variant={contentType === 'pdf' ? 'default' : 'outline'}
              onClick={switchToPdf}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              PDF
            </Button>
          )}
          {hasHtmlContent && (
            <Button
              size="sm"
              variant={contentType === 'html' ? 'default' : 'outline'}
              onClick={switchToHtml}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              Processed
            </Button>
          )}
          {hasEmailContent && (
            <Button
              size="sm"
              variant={activeTab === 'email' ? 'default' : 'outline'}
              onClick={() => setActiveTab('email')}
              className="flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Email
            </Button>
          )}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
        <TabsContent value="document" className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <PreviewErrorState
              error={error}
              pdfUrl={normalizedPdfUrl}
              onExternalOpen={handleExternalOpen}
              onRetry={retryPdfLoad}
            />
          ) : contentType === 'none' ? (
            <NoPreviewState />
          ) : contentType === 'pdf' ? (
            <EnhancedPdfViewer
              pdfUrl={normalizedPdfUrl}
              onError={() => {
                if (hasHtmlContent) {
                  switchToHtml();
                }
              }}
              onLoad={() => console.log('PDF loaded successfully')}
              onFallbackToHtml={hasHtmlContent ? switchToHtml : undefined}
              hasHtmlFallback={hasHtmlContent}
            />
          ) : contentType === 'html' ? (
            <HtmlContentViewer
              htmlContent={htmlContent}
              onError={() => console.error('HTML content error')}
              onLoad={() => console.log('HTML content loaded')}
            />
          ) : null}
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

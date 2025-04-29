
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentViewer } from './preview/hooks/useDocumentViewer';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { PdfPreview } from './preview/PdfPreview';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  htmlContent = '',
  pdfUrl = '',
  emailContent = ''
}) => {
  const [activeTab, setActiveTab] = useState('document');
  const { 
    pdfUrl: resolvedPdfUrl, 
    loading, 
    error, 
    iframeError, 
    originalUrl,
    handleIframeError, 
    handleRetry 
  } = useDocumentViewer(pdfUrl);
  
  const hasError = error || iframeError;
  const isLoading = loading;
  const hasHtml = htmlContent && htmlContent.trim().length > 0;
  const hasEmailContent = emailContent && emailContent.trim().length > 0;
  const hasPdf = !!resolvedPdfUrl;

  const openInNewTab = () => {
    if (resolvedPdfUrl) {
      window.open(resolvedPdfUrl, '_blank');
    }
  };
  
  return (
    <div className="invoice-preview h-full flex flex-col">
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="mb-2">
          <TabsTrigger value="document">
            Document
          </TabsTrigger>
          {hasHtml && (
            <TabsTrigger value="html">
              HTML
            </TabsTrigger>
          )}
          {hasEmailContent && (
            <TabsTrigger value="email">
              Email
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="document" className="h-full flex-grow overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading document preview...</p>
              </div>
            </div>
          )}
          
          {hasError && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h3 className="text-lg font-semibold">Failed to load document</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {error || "The document couldn't be loaded. This could be due to an invalid URL or missing file."}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  {pdfUrl && (
                    <Button variant="outline" onClick={openInNewTab} className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                  )}
                </div>
                {originalUrl && (
                  <div className="mt-4 text-xs text-muted-foreground break-all max-w-full">
                    <p>Original URL: {originalUrl.substring(0, 100)}{originalUrl.length > 100 ? '...' : ''}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {hasPdf && !isLoading && !hasError && (
            <div className="h-full w-full">
              <PdfPreview
                url={resolvedPdfUrl}
                onError={handleIframeError}
              />
            </div>
          )}
          
          {!hasPdf && !isLoading && !hasError && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No Document Available</h3>
                <p className="text-sm text-muted-foreground">
                  This invoice doesn't have an attached document.
                  {hasHtml && " Try viewing the HTML content instead."}
                  {hasEmailContent && " Try viewing the email content instead."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {hasHtml && (
          <TabsContent value="html" className="h-full flex-grow overflow-auto">
            <div 
              className="p-4 bg-white rounded-md shadow-sm border" 
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </TabsContent>
        )}

        {hasEmailContent && (
          <TabsContent value="email" className="h-full flex-grow overflow-auto">
            <div className="p-4 bg-white rounded-md shadow-sm border">
              <pre className="whitespace-pre-wrap">{emailContent}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

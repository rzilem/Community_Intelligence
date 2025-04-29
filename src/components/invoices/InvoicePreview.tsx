
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import { validateUrl } from '@/utils/security-utils';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  htmlContent,
  pdfUrl,
  emailContent = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>(pdfUrl ? 'pdf' : 'html');
  const [pdfError, setPdfError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate and sanitize HTML content
  const sanitizedHtml = htmlContent ? DOMPurify.sanitize(htmlContent, {
    FORBID_TAGS: ['script', 'iframe', 'form', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'eval', 'javascript:']
  }) : '';

  // Sanitize email content
  const sanitizedEmail = emailContent ? DOMPurify.sanitize(emailContent, {
    FORBID_TAGS: ['script', 'iframe', 'form', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'eval', 'javascript:']
  }) : '';

  // Validate PDF URL
  const validatedPdfUrl = React.useMemo(() => {
    return validateUrl(pdfUrl || '');
  }, [pdfUrl]);
  
  // Reset errors when URL changes
  useEffect(() => {
    if (validatedPdfUrl) {
      setPdfError(false);
      setIsLoading(true);
    }
  }, [validatedPdfUrl]);
  
  // Handlers for PDF loading
  const handlePdfLoad = () => {
    setIsLoading(false);
  };
  
  const handlePdfError = () => {
    setPdfError(true);
    setIsLoading(false);
  };
  
  const openPdfInNewTab = () => {
    if (validatedPdfUrl) {
      window.open(validatedPdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <Tabs 
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        <div className="border-b px-4 pt-2">
          <TabsList>
            {validatedPdfUrl && (
              <TabsTrigger value="pdf">PDF Document</TabsTrigger>
            )}
            {sanitizedHtml && (
              <TabsTrigger value="html">HTML Content</TabsTrigger>
            )}
            {sanitizedEmail && (
              <TabsTrigger value="email">Email Content</TabsTrigger>
            )}
            {(!validatedPdfUrl && !sanitizedHtml && !sanitizedEmail) && (
              <TabsTrigger value="none">No Preview</TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto">
          {validatedPdfUrl && (
            <TabsContent value="pdf" className="h-full m-0 p-0 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              )}
              
              {pdfError ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load PDF</h3>
                  <p className="text-muted-foreground mb-4">The PDF document could not be loaded. It may be encrypted or in an unsupported format.</p>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={openPdfInNewTab}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe 
                  src={validatedPdfUrl}
                  className="w-full h-full border-0"
                  onLoad={handlePdfLoad}
                  onError={handlePdfError}
                  sandbox="allow-scripts allow-same-origin"
                  title="Invoice PDF Preview"
                />
              )}
            </TabsContent>
          )}
          
          {sanitizedHtml && (
            <TabsContent value="html" className="h-full m-0 p-6 overflow-auto">
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
              />
            </TabsContent>
          )}
          
          {sanitizedEmail && (
            <TabsContent value="email" className="h-full m-0 p-6 overflow-auto">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{sanitizedEmail}</pre>
              </div>
            </TabsContent>
          )}
          
          {(!validatedPdfUrl && !sanitizedHtml && !sanitizedEmail) && (
            <TabsContent value="none" className="h-full m-0 flex items-center justify-center">
              <div className="text-center p-6">
                <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No preview available</h3>
                <p className="text-muted-foreground">There is no content available to preview for this invoice.</p>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </Card>
  );
};

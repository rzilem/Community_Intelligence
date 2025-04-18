
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, ExternalLink, FileText, File, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Debug logs to see what data we're receiving
  useEffect(() => {
    console.log("InvoicePreview props:", { 
      htmlContent: !!htmlContent, 
      htmlContentLength: htmlContent?.length || 0,
      pdfUrl: pdfUrl || 'none' 
    });
  }, [htmlContent, pdfUrl]);

  const isWordDocument = pdfUrl?.toLowerCase().endsWith('.doc') || pdfUrl?.toLowerCase().endsWith('.docx');
  const isPdf = pdfUrl?.toLowerCase().endsWith('.pdf');

  const handleIframeError = () => {
    console.error("Error loading iframe content");
    setPreviewError(true);
  };

  const openExternalLink = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const createHtmlContent = () => {
    if (!htmlContent) return '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.5;
              color: #333;
              margin: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  return (
    <Card className="h-full">
      <div className="bg-gray-50 px-4 py-3 border-b font-medium flex items-center justify-between">
        <div className="flex items-center">
          {isPdf ? (
            <FileText className="h-4 w-4 mr-2 text-red-500" />
          ) : isWordDocument ? (
            <File className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Invoice Preview
        </div>
        {(htmlContent || pdfUrl) && (
          <div className="flex gap-2">
            {pdfUrl && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8"
                onClick={openExternalLink}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => setFullscreenPreview(!fullscreenPreview)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-0 h-[calc(100%-48px)] overflow-auto">
        {previewError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
            <p className="text-center">Failed to load document preview.</p>
            {pdfUrl && (
              <Button 
                variant="link" 
                onClick={openExternalLink} 
                className="mt-4"
              >
                Open document in new tab <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        ) : pdfUrl ? (
          <div className="w-full h-full relative">
            {isPdf ? (
              <iframe 
                src={pdfUrl}
                title="Invoice PDF"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
                onError={handleIframeError}
              />
            ) : isWordDocument ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <File className="h-16 w-16 mb-4 text-blue-500" />
                <p className="text-center mb-2">Microsoft Word Document</p>
                <p className="text-center text-sm mb-6">Word documents cannot be previewed directly in the browser.</p>
                <Button 
                  variant="outline" 
                  onClick={openExternalLink}
                  className="flex items-center"
                >
                  Download Document <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-center">Unknown document type.</p>
                <Button 
                  variant="link" 
                  onClick={openExternalLink} 
                  className="mt-4"
                >
                  Open file <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ) : htmlContent ? (
          <div className="h-full">
            <iframe
              srcDoc={createHtmlContent()}
              title="Invoice HTML Content"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
              onError={handleIframeError}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-center">No preview available for this invoice.</p>
            <p className="text-center text-sm mt-2">Try uploading a PDF or check if the email HTML content is available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

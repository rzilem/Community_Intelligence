
import React, { useEffect } from 'react';
import { ExternalLink, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  pdfUrl?: string;
  htmlContent?: string;
  isPdf: boolean;
  isWordDocument: boolean;
  onIframeError: () => void;
  onIframeLoad: () => void;
  onExternalOpen: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pdfUrl,
  htmlContent,
  isPdf,
  isWordDocument,
  onIframeError,
  onIframeLoad,
  onExternalOpen,
}) => {
  // Log component props on mount and when they change
  useEffect(() => {
    console.group('DocumentViewer Props');
    console.log('pdfUrl:', pdfUrl || 'none');
    console.log('htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'none');
    console.log('isPdf:', isPdf);
    console.log('isWordDocument:', isWordDocument);
    console.groupEnd();
  }, [pdfUrl, htmlContent, isPdf, isWordDocument]);

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
              padding: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1rem;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            div {
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  // Prioritize HTML content if PDF URL is missing
  if (htmlContent && !pdfUrl) {
    console.log('Displaying HTML content (no PDF URL available)');
    return (
      <div className="h-full">
        <iframe
          srcDoc={createHtmlContent()}
          title="Invoice HTML Content"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          onError={(e) => {
            console.error('HTML iframe error:', e);
            onIframeError();
          }}
          onLoad={() => {
            console.log('HTML iframe loaded successfully');
            onIframeLoad();
          }}
        />
      </div>
    );
  }

  if (pdfUrl) {
    if (isPdf) {
      console.log('Displaying PDF content from URL:', pdfUrl);
      return (
        <div className="w-full h-full relative">
          <iframe 
            src={pdfUrl}
            title="Invoice PDF"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            onError={(e) => {
              console.error('PDF iframe error:', e);
              onIframeError();
            }}
            onLoad={() => {
              console.log('PDF iframe loaded successfully');
              onIframeLoad();
            }}
          />
        </div>
      );
    }

    if (isWordDocument) {
      console.log('Displaying Word document placeholder');
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
          <File className="h-16 w-16 mb-4 text-blue-500" />
          <p className="text-center mb-2">Microsoft Word Document</p>
          <p className="text-center text-sm mb-6">Word documents cannot be previewed directly in the browser.</p>
          <Button 
            variant="outline" 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Download Document <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      );
    }

    console.log('Displaying unknown document type placeholder');
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p className="text-center">Unknown document type.</p>
        <Button 
          variant="link" 
          onClick={onExternalOpen} 
          className="mt-4"
        >
          Open file <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  // If we have HTML content, we'll render it
  if (htmlContent) {
    console.log('Displaying HTML content');
    return (
      <div className="h-full">
        <iframe
          srcDoc={createHtmlContent()}
          title="Invoice HTML Content"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          onError={(e) => {
            console.error('HTML iframe error:', e);
            onIframeError();
          }}
          onLoad={() => {
            console.log('HTML iframe loaded successfully');
            onIframeLoad();
          }}
        />
      </div>
    );
  }

  // No content available
  console.log('No content to display');
  return null;
};

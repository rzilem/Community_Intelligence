
import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, File, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [pdfLoadAttempts, setPdfLoadAttempts] = useState(0);
  
  // Log component props on mount and when they change
  useEffect(() => {
    console.group('DocumentViewer Props');
    console.log('pdfUrl:', pdfUrl || 'none');
    console.log('htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'none');
    console.log('isPdf:', isPdf);
    console.log('isWordDocument:', isWordDocument);
    console.groupEnd();
  }, [pdfUrl, htmlContent, isPdf, isWordDocument]);

  // Handle PDF load failure and retry
  useEffect(() => {
    if (pdfLoadFailed && pdfLoadAttempts < 2) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying PDF load, attempt ${pdfLoadAttempts + 1}`);
        setPdfLoadFailed(false);
        setPdfLoadAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [pdfLoadFailed, pdfLoadAttempts]);

  const createHtmlContent = () => {
    if (!htmlContent) return '';
    
    // Improve the styling of the HTML content for better readability
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
            h1, h2, h3 {
              color: #1a56db;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
              margin-bottom: 2rem;
            }
            .invoice-total {
              text-align: right;
              font-weight: bold;
              margin-top: 1rem;
              font-size: 1.2rem;
            }
            font[color="#6fa8dc"] {
              color: #6fa8dc;
              font-size: 24px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  // Improved PDF embed function with better fallback
  const createPdfEmbed = () => {
    if (!pdfUrl || pdfLoadFailed && pdfLoadAttempts >= 2) {
      // Show error if we've failed multiple times
      return (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">PDF Preview Failed</h3>
          <p className="text-center mb-4 text-muted-foreground">
            The PDF could not be loaded directly in the browser.
          </p>
          <Button 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Open PDF in New Tab <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col">
        {/* Use embed for better browser compatibility */}
        <embed 
          src={pdfUrl} 
          type="application/pdf" 
          width="100%" 
          height="100%"
          className="w-full h-full border-0"
          onError={() => {
            console.error('PDF embed error occurred');
            setPdfLoadFailed(true);
            onIframeError();
          }}
          onLoad={() => {
            console.log('PDF embed loaded successfully');
            onIframeLoad();
          }}
        />
        {/* Fallback content only shown if embed fails */}
        <noembed>
          <div className="flex flex-col items-center justify-center h-full p-6">
            <p className="text-center mb-4">Your browser cannot display the PDF directly.</p>
            <Button 
              onClick={onExternalOpen}
              className="flex items-center"
            >
              Open PDF <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </noembed>
      </div>
    );
  };

  // Prioritize PDF viewing when available
  if (pdfUrl && isPdf) {
    console.log('Displaying PDF content from URL:', pdfUrl);
    return createPdfEmbed();
  }

  // Handle Word documents
  if (pdfUrl && isWordDocument) {
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

  // Handle other document types with URL but not PDF or Word
  if (pdfUrl && !isPdf && !isWordDocument) {
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

  // If we have HTML content, render it
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


import React, { useEffect, useState } from 'react';
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
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [viewerType, setViewerType] = useState<'object' | 'iframe' | 'fallback'>('object');
  
  // Log component props on mount and when they change
  useEffect(() => {
    console.log('DocumentViewer Props');
    console.log('pdfUrl:', pdfUrl || 'none');
    console.log('htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'none');
    console.log('isPdf:', isPdf);
    console.log('isWordDocument:', isWordDocument);
  }, [pdfUrl, htmlContent, isPdf, isWordDocument]);

  // Try different viewing methods if initial one fails
  useEffect(() => {
    if (loadAttempts === 1 && isPdf && pdfUrl) {
      console.log('First PDF load attempt failed, trying iframe method');
      setViewerType('iframe');
    } else if (loadAttempts >= 2 && isPdf && pdfUrl) {
      console.log('Both PDF load attempts failed, showing fallback view');
      setViewerType('fallback');
      onIframeError();
    }
  }, [loadAttempts, isPdf, pdfUrl, onIframeError]);

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
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  };

  // Function to attempt PDF viewing with an object tag
  const renderPdfWithObject = () => {
    if (!pdfUrl) return null;
    
    const embedKey = `pdf-embed-object-${loadAttempts}`;
    
    return (
      <object
        key={embedKey}
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full border-0"
        onError={() => {
          console.error("PDF object tag load error");
          setLoadAttempts(prev => prev + 1);
        }}
        onLoad={() => {
          console.log("PDF object loaded successfully");
          onIframeLoad();
        }}
      >
        <div className="flex flex-col items-center justify-center p-6">
          <p className="mb-4">Unable to display PDF directly.</p>
          <Button 
            variant="outline" 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Open PDF <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </object>
    );
  };

  // Function to attempt PDF viewing with an iframe
  const renderPdfWithIframe = () => {
    if (!pdfUrl) return null;
    
    const embedKey = `pdf-embed-iframe-${loadAttempts}`;
    
    return (
      <iframe
        key={embedKey}
        src={pdfUrl}
        className="w-full h-full border-0"
        onError={() => {
          console.error("PDF iframe loading error");
          setLoadAttempts(prev => prev + 1);
        }}
        onLoad={() => {
          console.log("PDF iframe loaded successfully");
          onIframeLoad();
        }}
        title="PDF Document"
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
        referrerPolicy="no-referrer"
        loading="lazy"
        allow="fullscreen"
      />
    );
  };

  // Function to display fallback view when all PDF rendering attempts fail
  const renderPdfFallbackView = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <FileText className="h-16 w-16 mb-4 text-red-500/50" />
      <p className="text-center mb-4 font-medium">Failed to load PDF document</p>
      <p className="text-center text-sm text-muted-foreground mb-6">
        The PDF could not be displayed in the browser.
      </p>
      <Button 
        variant="default" 
        onClick={onExternalOpen}
        className="flex items-center"
      >
        Open in New Tab <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  // Prioritize PDF viewing when available
  if (pdfUrl && isPdf) {
    console.log('Displaying PDF content from URL:', pdfUrl, 'with viewer type:', viewerType);
    if (viewerType === 'object') {
      return renderPdfWithObject();
    } else if (viewerType === 'iframe') {
      return renderPdfWithIframe();
    } else {
      return renderPdfFallbackView();
    }
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
          sandbox="allow-same-origin allow-scripts"
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

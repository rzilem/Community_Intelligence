
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { PDFViewer } from './PDFViewer';

interface PreviewContentProps {
  pdfUrl?: string;
  htmlContent?: string;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({
  pdfUrl,
  htmlContent
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(Date.now()); // Used to force re-render

  // Log for debugging
  useEffect(() => {
    if (pdfUrl) {
      console.log('PreviewContent attempting to render PDF:', pdfUrl);
    } else if (htmlContent) {
      console.log('PreviewContent attempting to render HTML content');
    } else {
      console.log('PreviewContent has no content to render');
    }
  }, [pdfUrl, htmlContent]);

  // Helper to check if URL is valid
  const isValidUrl = (url?: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      console.error("Invalid URL format:", url);
      return false;
    }
  };

  const handlePdfLoad = () => {
    console.log("PDF loaded successfully in PreviewContent");
    setLoading(false);
    setError(false);
  };

  const handlePdfError = () => {
    console.log("PDF failed to load in PreviewContent");
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    console.log("Retrying PDF load");
    setLoading(true);
    setError(false);
    setKey(Date.now()); // Force PDFViewer to remount
  };

  // Ensure pdfUrl is valid before attempting to render
  const validPdfUrl = isValidUrl(pdfUrl) ? pdfUrl : undefined;

  if (validPdfUrl) {
    return (
      <div className="w-full h-full bg-white">
        <PDFViewer 
          key={key}
          url={validPdfUrl} 
          onLoad={handlePdfLoad}
          onError={handlePdfError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (htmlContent) {
    return (
      <div className="w-[600px] h-[400px] overflow-auto p-4 bg-white">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }

  return (
    <div className="w-[600px] h-[400px] flex items-center justify-center text-muted-foreground bg-white">
      <FileText className="h-12 w-12 text-muted-foreground/50" />
      <span className="ml-2">No preview available</span>
    </div>
  );
};

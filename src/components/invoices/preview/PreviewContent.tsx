
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
      // Try to create a URL object to validate
      new URL(url);
      return true;
    } catch (e) {
      // For relative URLs, they're valid but need a base URL
      if (url.startsWith('/')) {
        console.log("Relative URL detected:", url);
        return true;
      }
      console.error("Invalid URL format:", url);
      return false;
    }
  };

  // Helper to normalize URL if needed
  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    
    // Handle relative URLs - you may need to adjust the base URL
    if (url.startsWith('/')) {
      // Get base URL from current window location
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${url}`;
      console.log("Normalized relative URL:", fullUrl);
      return fullUrl;
    }
    
    try {
      // If it's already a valid URL, return it as-is
      new URL(url);
      return url;
    } catch (e) {
      // If not a valid URL, try to add https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      console.error("Invalid URL format even after normalization:", url);
      return undefined;
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

  // Ensure pdfUrl is valid and normalized before attempting to render
  const validPdfUrl = pdfUrl ? normalizeUrl(pdfUrl) : undefined;

  if (validPdfUrl) {
    console.log("Using normalized PDF URL:", validPdfUrl);
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

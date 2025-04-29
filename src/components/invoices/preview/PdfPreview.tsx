
import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  url: string;
  onError?: () => void;
}

export function PdfPreview({ url, onError }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRetry, setShouldRetry] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Function to handle successful loading of PDF
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  // Function to handle PDF loading error
  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF:', err);
    setError(err.message);
    setLoading(false);
    if (onError) onError();
    
    // Auto-retry once if it fails
    if (retryCount < 2) {
      console.log(`Auto-retry attempt ${retryCount + 1} for PDF: ${url}`);
      setShouldRetry(true);
    }
  };

  // Function to manually retry loading PDF
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prevCount => prevCount + 1);
    setShouldRetry(true);
  };

  // Effect to handle automatic retry
  useEffect(() => {
    if (shouldRetry) {
      const timer = setTimeout(() => {
        console.log('Retrying PDF load...');
        setShouldRetry(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRetry]);

  // Next and previous page navigation
  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));
  };

  if (!url) {
    return <div className="flex justify-center items-center h-full">No PDF URL provided</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-2">Loading PDF...</span>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <p className="text-red-500 mb-4">Failed to load PDF: {error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            The document might be corrupt or the URL might be invalid.
          </p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry Loading PDF
          </Button>
        </div>
      )}
      
      <div className="pdf-container flex-1 overflow-auto">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          }
          error={null} // We're handling errors manually above
          key={`${url}-${retryCount}`} // Force reload on retry
        >
          {numPages && numPages > 0 && (
            <Page 
              pageNumber={pageNumber} 
              scale={1.0}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mx-auto"
            />
          )}
        </Document>
      </div>
      
      {numPages && numPages > 0 && (
        <div className="flex justify-between items-center p-2 border-t">
          <Button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          <Button 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

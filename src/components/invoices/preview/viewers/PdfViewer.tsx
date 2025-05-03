
import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  pdfUrl: string;
  onError: () => void;
  onLoad: () => void;
  onExternalOpen: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  onError,
  onLoad,
  onExternalOpen,
}) => {
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [pdfLoadAttempts, setPdfLoadAttempts] = useState(0);

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

  if (!pdfUrl || (pdfLoadFailed && pdfLoadAttempts >= 2)) {
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
          onError();
        }}
        onLoad={() => {
          console.log('PDF embed loaded successfully');
          onLoad();
        }}
      />
      {/* Fallback content only visible if embed fails */}
      {pdfLoadFailed && (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <p className="text-center mb-4">Your browser cannot display the PDF directly.</p>
          <Button 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Open PDF <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

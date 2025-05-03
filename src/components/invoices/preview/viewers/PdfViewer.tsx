
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  const embedRef = useRef<HTMLEmbedElement>(null);
  
  // Log the URL we're trying to load
  useEffect(() => {
    console.log('Attempting to load PDF from URL:', pdfUrl);
    
    // Reset error state when URL changes
    setPdfLoadFailed(false);
    setPdfLoadAttempts(0);
  }, [pdfUrl]);

  // Handle PDF load failure and retry
  useEffect(() => {
    if (pdfLoadFailed && pdfLoadAttempts < 2) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying PDF load, attempt ${pdfLoadAttempts + 1}`);
        setPdfLoadFailed(false);
        setPdfLoadAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(retryTimer);
    } else if (pdfLoadFailed && pdfLoadAttempts >= 2) {
      console.error('PDF load attempts exhausted');
      onError();
      toast.error("Failed to load PDF document");
    }
  }, [pdfLoadFailed, pdfLoadAttempts, onError]);

  // Try to detect if the PDF loads successfully through the embed element
  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;

    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-loaded') {
          console.log('PDF embed successfully loaded');
          onLoad();
        }
      }
    });

    observer.observe(embed, { attributes: true });
    
    return () => observer.disconnect();
  }, [onLoad]);

  const handleLoadError = () => {
    console.error('PDF embed error occurred');
    setPdfLoadFailed(true);
    onError();
  };
  
  const handleLoadSuccess = () => {
    console.log('PDF embed loaded successfully');
    if (embedRef.current) {
      embedRef.current.setAttribute('data-loaded', 'true');
    }
    onLoad();
  };

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">No PDF Available</h3>
        <p className="text-center text-muted-foreground">
          No PDF URL was provided for this invoice.
        </p>
      </div>
    );
  }

  if (pdfLoadFailed && pdfLoadAttempts >= 2) {
    // Show error if we've failed multiple times
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Preview Failed</h3>
        <p className="text-center mb-4 text-muted-foreground">
          The PDF could not be loaded directly in the browser.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Open PDF in New Tab <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              window.open(pdfUrl, '_blank');
            }}
            className="flex items-center"
          >
            Download PDF <Download className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Use object for better browser compatibility */}
      <object
        ref={embedRef}
        data={pdfUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        onError={handleLoadError}
        onLoad={handleLoadSuccess}
      >
        <div className="flex flex-col items-center justify-center h-full p-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-center mb-4">Your browser cannot display the PDF directly.</p>
          <Button 
            onClick={onExternalOpen}
            className="flex items-center"
          >
            Open PDF <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </object>
      
      {/* Loading state shown while PDF is being loaded */}
      {!pdfLoadFailed && pdfLoadAttempts < 2 && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-32 rounded bg-primary/20"></div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { createCacheBustedUrl } from '../utils/pdfUtils';
import { showToast } from '@/utils/toast-utils';

interface EnhancedPdfViewerProps {
  pdfUrl: string;
  onError: () => void;
  onLoad: () => void;
  onFallbackToHtml?: () => void;
  hasHtmlFallback?: boolean;
}

export const EnhancedPdfViewer: React.FC<EnhancedPdfViewerProps> = ({
  pdfUrl,
  onError,
  onLoad,
  onFallbackToHtml,
  hasHtmlFallback = false
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const objectRef = useRef<HTMLObjectElement>(null);
  const maxRetries = 3;

  useEffect(() => {
    setLoadState('loading');
    setRetryAttempts(0);
  }, [pdfUrl]);

  const handleLoadSuccess = () => {
    console.log('PDF loaded successfully:', pdfUrl);
    setLoadState('loaded');
    onLoad();
  };

  const handleLoadError = () => {
    console.error('PDF load error:', { pdfUrl, attempt: retryAttempts + 1 });
    
    if (retryAttempts < maxRetries) {
      // Auto-retry with cache busting
      const newAttempt = retryAttempts + 1;
      setRetryAttempts(newAttempt);
      
      setTimeout(() => {
        const cacheBustedUrl = createCacheBustedUrl(pdfUrl);
        if (objectRef.current) {
          objectRef.current.data = cacheBustedUrl;
        }
        console.log(`Retrying PDF load (attempt ${newAttempt}):`, cacheBustedUrl);
      }, 1000 * newAttempt); // Exponential backoff
    } else {
      setLoadState('error');
      onError();
    }
  };

  const handleManualRetry = () => {
    setRetryAttempts(0);
    setLoadState('loading');
    const cacheBustedUrl = createCacheBustedUrl(pdfUrl);
    
    if (objectRef.current) {
      objectRef.current.data = cacheBustedUrl;
    }
    
    showToast('Reloading PDF', {
      description: 'Attempting to reload with fresh cache...'
    });
  };

  const handleExternalOpen = () => {
    const cacheBustedUrl = createCacheBustedUrl(pdfUrl);
    window.open(cacheBustedUrl, '_blank');
    showToast('Opening PDF externally', {
      description: 'PDF is opening in a new tab'
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `invoice-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Downloading PDF', {
      description: 'Download should start shortly'
    });
  };

  if (loadState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/10">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Preview Failed</h3>
        <p className="text-center text-muted-foreground mb-4">
          Unable to display the PDF after {maxRetries} attempts.
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <Button onClick={handleExternalOpen} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
          
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          
          <Button variant="secondary" onClick={handleManualRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>

        {hasHtmlFallback && onFallbackToHtml && (
          <Button 
            variant="outline" 
            onClick={onFallbackToHtml}
            className="w-full max-w-xs"
          >
            View Processed Content Instead
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading PDF... {retryAttempts > 0 && `(Attempt ${retryAttempts + 1})`}
            </p>
          </div>
        </div>
      )}
      
      <object
        ref={objectRef}
        data={pdfUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
      >
        <div className="flex flex-col items-center justify-center h-full p-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-center mb-4">Your browser cannot display PDFs directly.</p>
          <Button onClick={handleExternalOpen} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Open PDF
          </Button>
        </div>
      </object>
    </div>
  );
};

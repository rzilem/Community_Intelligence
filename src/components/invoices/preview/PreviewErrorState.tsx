
import React from 'react';
import { AlertCircle, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PreviewErrorStateProps {
  error: string;
  pdfUrl?: string;
  onExternalOpen?: () => void; 
  onRetry?: () => void;
}

export const PreviewErrorState: React.FC<PreviewErrorStateProps> = ({
  error,
  pdfUrl,
  onExternalOpen,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      toast.info("Retrying PDF load...");
      onRetry();
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      toast.info("Downloading PDF...");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
      <h3 className="text-lg font-medium mb-2 text-center">PDF Preview Failed</h3>
      <p className="text-center mb-6">{error}</p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {pdfUrl && onExternalOpen && (
          <Button 
            variant="default" 
            onClick={onExternalOpen} 
            className="flex items-center"
          >
            Open in new tab <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {pdfUrl && (
          <Button 
            variant="outline" 
            onClick={handleDownload} 
            className="flex items-center"
          >
            Download PDF <Download className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {onRetry && (
          <Button 
            variant="secondary" 
            onClick={handleRetry} 
            className="flex items-center"
          >
            Try Again <RefreshCw className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="mt-6 max-w-md text-sm opacity-70">
        <p className="text-center">
          The PDF may be protected, unavailable, or there might be CORS restrictions preventing it from loading in the browser.
        </p>
      </div>
    </div>
  );
};

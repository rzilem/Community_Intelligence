
import React from 'react';
import { AlertCircle, ExternalLink, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
      <p className="text-center mb-4">{error}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry} 
            className="flex items-center"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        )}
        
        {pdfUrl && onExternalOpen && (
          <Button 
            variant="link" 
            onClick={onExternalOpen} 
            className="flex items-center"
          >
            Open document in new tab <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

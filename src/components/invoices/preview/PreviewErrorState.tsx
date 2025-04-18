
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewErrorStateProps {
  error: string;
  pdfUrl?: string;
  onExternalOpen?: () => void; // Made optional since it's not always used
}

export const PreviewErrorState: React.FC<PreviewErrorStateProps> = ({
  error,
  pdfUrl,
  onExternalOpen
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
      <p className="text-center">{error}</p>
      {pdfUrl && onExternalOpen && (
        <Button 
          variant="link" 
          onClick={onExternalOpen} 
          className="mt-4"
        >
          Open document in new tab <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

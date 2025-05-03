
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnknownFileViewerProps {
  onExternalOpen: () => void;
}

export const UnknownFileViewer: React.FC<UnknownFileViewerProps> = ({ onExternalOpen }) => {
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
};

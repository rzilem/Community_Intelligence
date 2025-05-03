
import React from 'react';
import { File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordDocViewerProps {
  onExternalOpen: () => void;
}

export const WordDocViewer: React.FC<WordDocViewerProps> = ({ onExternalOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <File className="h-16 w-16 mb-4 text-blue-500" />
      <p className="text-center mb-2">Microsoft Word Document</p>
      <p className="text-center text-sm mb-6">Word documents cannot be previewed directly in the browser.</p>
      <Button 
        variant="outline" 
        onClick={onExternalOpen}
        className="flex items-center"
      >
        Download Document <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

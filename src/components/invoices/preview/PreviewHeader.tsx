
import React from 'react';
import { ExternalLink, FileText, File, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewHeaderProps {
  isPdf: boolean;
  isWordDocument: boolean;
  pdfUrl?: string;
  onExternalOpen: () => void;
  onToggleFullscreen: () => void;
  showActions: boolean;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  isPdf,
  isWordDocument,
  pdfUrl,
  onExternalOpen,
  onToggleFullscreen,
  showActions
}) => {
  return (
    <div className="bg-gray-50 px-4 py-3 border-b font-medium flex items-center justify-between">
      <div className="flex items-center">
        {isPdf ? (
          <FileText className="h-4 w-4 mr-2 text-red-500" />
        ) : isWordDocument ? (
          <File className="h-4 w-4 mr-2 text-blue-500" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Invoice Preview
      </div>
      {showActions && (
        <div className="flex gap-2">
          {pdfUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={onExternalOpen}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8"
            onClick={onToggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

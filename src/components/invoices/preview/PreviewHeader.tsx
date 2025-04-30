
import React from 'react';
import { ExternalLink, FileText, File, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PreviewHeaderProps {
  isPdf: boolean;
  isWordDocument: boolean;
  pdfUrl?: string;
  onExternalOpen: () => void;
  onToggleFullscreen: () => void;
  showActions: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  hasEmail: boolean;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  isPdf,
  isWordDocument,
  pdfUrl,
  onExternalOpen,
  onToggleFullscreen,
  showActions,
  activeTab,
  onTabChange,
  hasEmail
}) => {
  return (
    <div className="bg-gray-50 px-4 py-2 border-b font-medium flex items-center justify-between">
      <div className="flex items-center gap-4">
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
        
        {hasEmail && (
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="email">Original Email</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
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

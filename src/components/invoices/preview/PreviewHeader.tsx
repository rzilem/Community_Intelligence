
import React from 'react';
import { ExternalLink, FileText, File, Maximize2, Mail } from 'lucide-react';
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
    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {isPdf ? (
            <FileText className="h-4 w-4 mr-2 text-red-500" />
          ) : isWordDocument ? (
            <File className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          <span className="font-medium">Invoice Preview</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {hasEmail && (
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="document" className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>Document</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                <span>Original Email</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
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
              title="Toggle fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

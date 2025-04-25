
import React from 'react';
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink, Maximize, Minimize, RefreshCcw } from "lucide-react";

interface PreviewHeaderProps {
  isPdf: boolean;
  isWordDocument: boolean;
  pdfUrl?: string;
  onExternalOpen: () => void;
  onToggleFullscreen: () => void;
  showActions: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  hasEmail?: boolean;
  isFullscreen?: boolean;
  onRefresh?: () => void;
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
  hasEmail = false,
  isFullscreen = false,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-muted/40">
      <TabsList>
        <TabsTrigger 
          value="document" 
          onClick={() => onTabChange('document')}
          className={activeTab === 'document' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
        >
          Document
        </TabsTrigger>
        {hasEmail && (
          <TabsTrigger 
            value="email" 
            onClick={() => onTabChange('email')}
            className={activeTab === 'email' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
          >
            Email
          </TabsTrigger>
        )}
      </TabsList>
      
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh} 
            title="Refresh preview"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
        
        {showActions && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onExternalOpen} 
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            {isPdf && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleFullscreen} 
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ExternalLink, 
  Maximize2, 
  Settings, 
  Eye, 
  RefreshCw,
  FileText,
  Mail,
  Code
} from 'lucide-react';

interface ConsolidatedPreviewToolbarProps {
  // View mode
  currentView: 'pdf' | 'html' | 'email';
  onViewChange: (view: 'pdf' | 'html' | 'email') => void;
  hasEmail: boolean;
  hasPdf: boolean;
  hasHtml: boolean;
  
  // Actions
  onExternalOpen?: () => void;
  onToggleFullscreen?: () => void;
  onShowSettings?: () => void;
  onValidate?: () => void;
  onRetry?: () => void;
  
  // State
  isValidating?: boolean;
  canRetry?: boolean;
}

export const ConsolidatedPreviewToolbar: React.FC<ConsolidatedPreviewToolbarProps> = ({
  currentView,
  onViewChange,
  hasEmail,
  hasPdf,
  hasHtml,
  onExternalOpen,
  onToggleFullscreen,
  onShowSettings,
  onValidate,
  onRetry,
  isValidating = false,
  canRetry = false
}) => {
  const getViewLabel = (view: string) => {
    switch (view) {
      case 'pdf': return 'PDF View';
      case 'html': return 'Processed View';
      case 'email': return 'Email View';
      default: return 'Document View';
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'html': return <Code className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
      {/* Left: View Switcher */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getViewIcon(currentView)}
              <span>{getViewLabel(currentView)}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {hasPdf && (
              <DropdownMenuItem onClick={() => onViewChange('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF View
              </DropdownMenuItem>
            )}
            {hasHtml && (
              <DropdownMenuItem onClick={() => onViewChange('html')}>
                <Code className="h-4 w-4 mr-2" />
                Processed View
              </DropdownMenuItem>
            )}
            {hasEmail && (
              <DropdownMenuItem onClick={() => onViewChange('email')}>
                <Mail className="h-4 w-4 mr-2" />
                Original Email
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              <span>Actions</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onValidate && (
              <DropdownMenuItem onClick={onValidate} disabled={isValidating}>
                <Eye className="h-4 w-4 mr-2" />
                {isValidating ? 'Validating...' : 'Validate Content'}
              </DropdownMenuItem>
            )}
            {canRetry && onRetry && (
              <DropdownMenuItem onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </DropdownMenuItem>
            )}
            {onShowSettings && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onShowSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Actions */}
        {onExternalOpen && (
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
        
        {onToggleFullscreen && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8"
            onClick={onToggleFullscreen}
            title="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

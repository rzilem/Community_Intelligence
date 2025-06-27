
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
  Code,
  CheckCircle,
  Bug
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
  onShowStorageDebug?: () => void;
  
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
  onShowStorageDebug,
  isValidating = false,
  canRetry = false
}) => {
  const getViewLabel = (view: string) => {
    switch (view) {
      case 'pdf': return 'PDF Document';
      case 'html': return 'Processed Content';
      case 'email': return 'Original Email';
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

  const getViewDescription = (view: string) => {
    switch (view) {
      case 'pdf': return 'Original PDF file';
      case 'html': return 'Structured, accessible format (recommended)';
      case 'email': return 'Original email submission';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between">
      {/* Left: View Switcher */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getViewIcon(currentView)}
              <span className="hidden sm:inline">{getViewLabel(currentView)}</span>
              <span className="sm:hidden">View</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {hasHtml && (
              <DropdownMenuItem onClick={() => onViewChange('html')} className="flex flex-col items-start">
                <div className="flex items-center w-full">
                  <Code className="h-4 w-4 mr-2" />
                  <span className="flex-1">Processed Content</span>
                  {currentView === 'html' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <span className="text-xs text-muted-foreground ml-6">Structured, accessible format (recommended)</span>
              </DropdownMenuItem>
            )}
            {hasPdf && (
              <DropdownMenuItem onClick={() => onViewChange('pdf')} className="flex flex-col items-start">
                <div className="flex items-center w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="flex-1">PDF Document</span>
                  {currentView === 'pdf' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <span className="text-xs text-muted-foreground ml-6">Original PDF file</span>
              </DropdownMenuItem>
            )}
            {hasEmail && (
              <DropdownMenuItem onClick={() => onViewChange('email')} className="flex flex-col items-start">
                <div className="flex items-center w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="flex-1">Original Email</span>
                  {currentView === 'email' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <span className="text-xs text-muted-foreground ml-6">Original email submission</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Content quality indicator */}
        {hasHtml && (
          <div className="hidden md:flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <CheckCircle className="h-3 w-3 mr-1" />
            AI Processed
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick External PDF Access */}
        {hasPdf && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExternalOpen}
            className="hidden sm:flex items-center gap-1 text-xs"
            title="Open PDF in new tab"
          >
            <ExternalLink className="h-3 w-3" />
            <span>PDF</span>
          </Button>
        )}

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Actions</span>
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
            {onExternalOpen && (
              <DropdownMenuItem onClick={onExternalOpen}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open PDF Externally
              </DropdownMenuItem>
            )}
            {hasPdf && onShowStorageDebug && (
              <DropdownMenuItem onClick={onShowStorageDebug}>
                <Bug className="h-4 w-4 mr-2" />
                Storage Debug Info
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
        
        {/* Fullscreen toggle */}
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

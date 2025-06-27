
import React, { useMemo } from 'react';
import { ToolbarBuilder } from './ToolbarBuilder';
import { ViewSelector } from './components/ViewSelector';
import { ActionGroup } from './components/ActionGroup';
import { ToolbarBuilderConfig, ViewType } from './types';
import { TOOLBAR_ACCESSIBILITY } from './config';

interface ConsolidatedPreviewToolbarProps {
  // View mode
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
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
  hasErrors?: boolean;
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
  canRetry = false,
  hasErrors = false
}) => {
  const toolbarState = useMemo(() => {
    const config: ToolbarBuilderConfig = {
      views: {
        pdf: hasPdf,
        html: hasHtml,
        email: hasEmail
      },
      actions: {
        external: !!onExternalOpen && hasPdf,
        fullscreen: !!onToggleFullscreen,
        settings: !!onShowSettings,
        validate: !!onValidate,
        retry: !!onRetry,
        debug: !!onShowStorageDebug && hasPdf
      },
      state: {
        isValidating,
        canRetry,
        hasErrors
      },
      callbacks: {
        onViewChange,
        onExternalOpen,
        onToggleFullscreen,
        onShowSettings,
        onValidate,
        onRetry,
        onShowStorageDebug
      }
    };

    return ToolbarBuilder.createDefault(config).build();
  }, [
    currentView, hasEmail, hasPdf, hasHtml,
    onExternalOpen, onToggleFullscreen, onShowSettings, onValidate, onRetry, onShowStorageDebug,
    isValidating, canRetry, hasErrors
  ]);

  const availableViews = toolbarState.views.filter(v => v.available);
  
  if (availableViews.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex items-center justify-between"
      {...TOOLBAR_ACCESSIBILITY}
    >
      {/* Left: View Switcher */}
      <ViewSelector
        views={toolbarState.views}
        currentView={toolbarState.currentView}
        onViewChange={onViewChange}
        isCompact={toolbarState.isCompact}
      />

      {/* Right: Actions */}
      <ActionGroup
        actions={toolbarState.actions}
        isCompact={toolbarState.isCompact}
        maxQuickActions={toolbarState.isCompact ? 1 : 2}
      />
    </div>
  );
};

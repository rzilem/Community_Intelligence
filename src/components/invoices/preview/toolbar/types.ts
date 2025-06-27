
/**
 * Types for the preview toolbar system
 */

export type ViewType = 'pdf' | 'html' | 'email';

export interface ViewConfig {
  id: ViewType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  recommended?: boolean;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showInQuickActions?: boolean;
}

export interface ToolbarState {
  currentView: ViewType;
  views: ViewConfig[];
  actions: ActionConfig[];
  isCompact: boolean;
  showAdvanced: boolean;
}

export interface ToolbarBuilderConfig {
  views: {
    pdf?: boolean;
    html?: boolean;
    email?: boolean;
  };
  actions: {
    external?: boolean;
    fullscreen?: boolean;
    settings?: boolean;
    validate?: boolean;
    retry?: boolean;
    debug?: boolean;
  };
  state: {
    isValidating?: boolean;
    canRetry?: boolean;
    hasErrors?: boolean;
  };
  callbacks: {
    onViewChange?: (view: ViewType) => void;
    onExternalOpen?: () => void;
    onToggleFullscreen?: () => void;
    onShowSettings?: () => void;
    onValidate?: () => void;
    onRetry?: () => void;
    onShowStorageDebug?: () => void;
  };
}


import { FileText, Code, Mail, ExternalLink, Maximize2, Settings, Eye, RefreshCw, Bug } from 'lucide-react';
import { ViewConfig, ActionConfig, ViewType } from './types';

/**
 * Configuration constants for the preview toolbar
 */

export const VIEW_CONFIGS: Record<ViewType, Omit<ViewConfig, 'available'>> = {
  pdf: {
    id: 'pdf',
    label: 'PDF Document',
    description: 'Original PDF file',
    icon: FileText
  },
  html: {
    id: 'html',
    label: 'Processed Content',
    description: 'Structured, accessible format (recommended)',
    icon: Code,
    recommended: true
  },
  email: {
    id: 'email',
    label: 'Original Email',
    description: 'Original email submission',
    icon: Mail
  }
};

export const ACTION_CONFIGS = {
  external: {
    id: 'external',
    label: 'Open PDF Externally',
    icon: ExternalLink,
    variant: 'ghost' as const,
    size: 'sm' as const,
    showInQuickActions: true
  },
  fullscreen: {
    id: 'fullscreen',
    label: 'Toggle Fullscreen',
    icon: Maximize2,
    variant: 'ghost' as const,
    size: 'sm' as const,
    showInQuickActions: true
  },
  settings: {
    id: 'settings',
    label: 'Preferences',
    icon: Settings,
    variant: 'outline' as const,
    size: 'sm' as const
  },
  validate: {
    id: 'validate',
    label: 'Validate Content',
    icon: Eye,
    variant: 'default' as const,
    size: 'sm' as const
  },
  retry: {
    id: 'retry',
    label: 'Retry Loading',
    icon: RefreshCw,
    variant: 'outline' as const,
    size: 'sm' as const
  },
  debug: {
    id: 'debug',
    label: 'Storage Debug Info',
    icon: Bug,
    variant: 'outline' as const,
    size: 'sm' as const
  }
} as const;

export const TOOLBAR_ACCESSIBILITY = {
  role: 'toolbar',
  'aria-label': 'Document preview controls',
  'aria-orientation': 'horizontal' as const
};

export const VIEW_SELECTOR_ACCESSIBILITY = {
  role: 'tablist',
  'aria-label': 'View selection'
};

export const ACTION_GROUP_ACCESSIBILITY = {
  role: 'group',
  'aria-label': 'Document actions'
};

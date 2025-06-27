
import { useState, useCallback } from 'react';

export interface InvoicePreviewState {
  showSettings: boolean;
  showValidation: boolean;
  showStorageDebug: boolean;
  isFullscreen: boolean;
  currentView: 'pdf' | 'html' | 'email';
}

export interface InvoicePreviewActions {
  setShowSettings: (show: boolean) => void;
  setShowValidation: (show: boolean) => void;
  setShowStorageDebug: (show: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setCurrentView: (view: 'pdf' | 'html' | 'email') => void;
  handleViewChange: (view: 'pdf' | 'html' | 'email') => void;
  handleToggleFullscreen: () => void;
  handleValidate: () => void;
  handleShowStorageDebug: () => void;
}

interface UseInvoicePreviewStateProps {
  hasPdf: boolean;
  hasHtml: boolean;
  hasEmail: boolean;
}

export const useInvoicePreviewState = ({ 
  hasPdf, 
  hasHtml, 
  hasEmail 
}: UseInvoicePreviewStateProps): InvoicePreviewState & InvoicePreviewActions => {
  // Smart default view selection - prioritize HTML over PDF for reliability
  const getDefaultView = (): 'pdf' | 'html' | 'email' => {
    if (hasHtml) return 'html';
    if (hasPdf) return 'pdf';
    if (hasEmail) return 'email';
    return 'html';
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showStorageDebug, setShowStorageDebug] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState<'pdf' | 'html' | 'email'>(getDefaultView());

  const handleViewChange = useCallback((view: 'pdf' | 'html' | 'email') => {
    setCurrentView(view);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleValidate = useCallback(() => {
    setShowValidation(prev => !prev);
  }, []);

  const handleShowStorageDebug = useCallback(() => {
    setShowStorageDebug(prev => !prev);
  }, []);

  return {
    showSettings,
    showValidation,
    showStorageDebug,
    isFullscreen,
    currentView,
    setShowSettings,
    setShowValidation,
    setShowStorageDebug,
    setIsFullscreen,
    setCurrentView,
    handleViewChange,
    handleToggleFullscreen,
    handleValidate,
    handleShowStorageDebug,
  };
};


export interface InvoicePreviewPreferences {
  preferredViewMode: 'pdf' | 'html' | 'auto';
  enableAutoFallback: boolean;
  enablePdfThumbnails: boolean;
  showValidationTools: boolean;
  autoValidation: boolean;
  progressiveEnhancement: boolean;
  maxRetryAttempts: number;
  cachePreferences: boolean;
}

export interface UserPreferences {
  invoicePreview: InvoicePreviewPreferences;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    categories: string[];
  };
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

export const defaultInvoicePreferences: InvoicePreviewPreferences = {
  preferredViewMode: 'auto',
  enableAutoFallback: true,
  enablePdfThumbnails: false,
  showValidationTools: true,
  autoValidation: false,
  progressiveEnhancement: true,
  maxRetryAttempts: 3,
  cachePreferences: true
};

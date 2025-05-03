
/**
 * Interface for PDF preview functionality
 */
export interface PDFPreviewOptions {
  /**
   * URL to PDF document
   */
  pdfUrl?: string;
  
  /**
   * HTML content as fallback when PDF is unavailable
   */
  htmlContent?: string;
  
  /**
   * Email content as additional context
   */
  emailContent?: string;
  
  /**
   * Whether to enable fullscreen mode by default
   */
  defaultFullscreen?: boolean;
  
  /**
   * Whether to show actions (download, open, etc)
   */
  showActions?: boolean;
}

/**
 * Types of content that can be displayed in the preview
 */
export type PreviewContentType = 'pdf' | 'html' | 'email' | 'none';

/**
 * Status of PDF loading
 */
export type PDFLoadStatus = 'loading' | 'loaded' | 'error' | 'not-started';


import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoPreviewState } from './preview/NoPreviewState';
import { DocumentViewer } from './preview/DocumentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { PreviewHeader } from './preview/PreviewHeader';
import { isValidUrl, normalizeUrl, isValidHtml, sanitizeHtml, isPdf, isImage, getFileExtension } from './preview/previewUtils';
import { Button } from "@/components/ui/button";

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
  emailContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  htmlContent, 
  pdfUrl,
  emailContent
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPdfUrl, setNormalizedPdfUrl] = useState<string>('');
  const [hasContent, setHasContent] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('document');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  
  // Determine if the document is a Word document based on file extension
  const isWordDocument = getFileExtension(pdfUrl || '') === 'doc' || 
                          getFileExtension(pdfUrl || '') === 'docx';
  
  // Check if we have valid email content to show the email tab
  const hasEmailContent = !!emailContent && emailContent.trim().length > 0;
  
  // Handle opening the document in a new tab
  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
    }
  };
  
  // Handle toggling fullscreen mode
  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Handle refresh action
  const handleRefresh = () => {
    setError(null);
    setLoading(true);
    setRefreshKey(Date.now());
  };
  
  // Thorough URL normalization function to fix double slashes
  const normalizeUrlPath = (url: string): string => {
    if (!url) return '';
    
    try {
      console.log('InvoicePreview: Original URL before normalization:', url);
      
      // For URLs with protocol, use URL parsing for thorough normalization
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        
        // Check for double slashes in pathname
        if (parsed.pathname.includes('//')) {
          console.warn('⚠️ InvoicePreview: Double slash detected in pathname that needs fixing:', parsed.pathname);
        }
        
        // Clean the pathname by:
        // 1. Split by slashes
        // 2. Filter out empty segments (which cause double slashes)
        // 3. Join with single slashes
        const pathParts = parsed.pathname.split('/')
          .filter(segment => segment !== '');
        
        // Reconstruct pathname with a single leading slash
        parsed.pathname = '/' + pathParts.join('/');
        
        const normalized = parsed.toString();
        console.log('InvoicePreview: Normalized URL result:', normalized);
        return normalized;
      }
      
      // For relative paths, handle more carefully
      // First remove leading slashes
      let normalized = url.replace(/^\/+/, '');
      // Then replace multiple consecutive slashes with a single one
      normalized = normalized.replace(/\/+/g, '/');
      
      console.log('InvoicePreview: Normalized relative path result:', normalized);
      return normalized;
    } catch (e) {
      console.error('Error normalizing URL in InvoicePreview:', e);
      return url; // Return original if parsing fails
    }
  };
  
  useEffect(() => {
    // Reset states
    setLoading(true);
    setError(null);
    
    // Validate PDF URL
    if (pdfUrl) {
      try {
        // For debugging, log the original URL
        console.log("Original PDF URL:", pdfUrl);
        
        // Check for and log any double slashes which might cause issues
        if (pdfUrl.includes('//') && !pdfUrl.includes('://')) {
          console.warn('⚠️ Double slash detected in PDF URL that needs fixing:', pdfUrl);
        }
        
        // Normalize URL by ensuring it has a protocol and fixing double slashes
        let normalizedUrl = pdfUrl;
        
        // Fix double slashes in the path part using our thorough normalization
        normalizedUrl = normalizeUrlPath(normalizedUrl);
        
        // Add protocol if missing
        if (!normalizedUrl.startsWith('http')) {
          // Ensure we don't have leading slashes before appending to the base URL
          const cleanPath = normalizedUrl.replace(/^\/+/, '');
          normalizedUrl = `https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/invoices/${cleanPath}`;
        }
        
        setNormalizedPdfUrl(normalizedUrl);
        setHasContent(true);
        console.log("Normalized PDF URL:", normalizedUrl);
      } catch (e) {
        console.error("Invalid PDF URL:", pdfUrl, e);
        setError("Invalid PDF URL format");
        setLoading(false);
      }
    } else {
      setNormalizedPdfUrl('');
    }
    
    // Check if we have HTML content
    const validHtml = htmlContent && isValidHtml(htmlContent);
    
    // Update has content state
    setHasContent(!!normalizedPdfUrl || !!validHtml);
    
    // Log for debugging
    console.log("Invoice Preview Data:", {
      hasPdfUrl: !!pdfUrl,
      normalizedPdfUrl: normalizedPdfUrl || "none",
      hasHtmlContent: !!htmlContent,
      htmlContentLength: htmlContent?.length || 0,
      hasEmailContent: !!emailContent,
      emailContentLength: emailContent?.length || 0,
      hasContent: hasContent,
      isPdfFile: isPdf(pdfUrl || '')
    });
  }, [htmlContent, pdfUrl, emailContent, refreshKey]);

  // If no content and no email, show no preview state
  if (!hasContent && !hasEmailContent && !loading && !error) {
    return <NoPreviewState />;
  }

  // If there's an error, show error state with retry option
  if (error) {
    return (
      <PreviewErrorState 
        error={error} 
        pdfUrl={normalizedPdfUrl}
        onExternalOpen={handleExternalOpen}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PreviewHeader
        isPdf={isPdf(normalizedPdfUrl)}
        isWordDocument={isWordDocument}
        pdfUrl={normalizedPdfUrl}
        onExternalOpen={handleExternalOpen}
        onToggleFullscreen={handleToggleFullscreen}
        showActions={!!normalizedPdfUrl}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasEmail={hasEmailContent}
        onRefresh={handleRefresh}
      />
      
      <Tabs value={activeTab} className="flex-1 overflow-hidden">
        <TabsContent value="document" className="h-full m-0">
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
            {normalizedPdfUrl ? (
              <DocumentViewer 
                pdfUrl={normalizedPdfUrl}
                htmlContent={undefined}
                isPdf={isPdf(normalizedPdfUrl)}
                isWordDocument={isWordDocument}
                onIframeError={() => setError("Failed to load document")}
                onIframeLoad={() => setLoading(false)}
                onExternalOpen={handleExternalOpen}
              />
            ) : htmlContent && isValidHtml(htmlContent) ? (
              <div className="h-full">
                <div 
                  className="invoice-html-content h-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }} 
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No preview available</AlertTitle>
                  <AlertDescription>
                    No valid PDF or HTML content is available for this invoice.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="email" className="h-full m-0">
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
            <EmailPreview emailContent={emailContent} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

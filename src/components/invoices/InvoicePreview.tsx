
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnhancedPdfPreview } from '@/hooks/invoices/useEnhancedPdfPreview';
import { useUserPreferences } from '@/hooks/invoices/useUserPreferences';
import { PreviewHeader } from './preview/PreviewHeader';
import { PreviewErrorState } from './preview/PreviewErrorState';
import { NoPreviewState } from './preview/NoPreviewState';
import { EnhancedPdfViewer } from './preview/viewers/EnhancedPdfViewer';
import { HtmlContentViewer } from './preview/viewers/HtmlContentViewer';
import { EmailPreview } from './preview/EmailPreview';
import { PreferenceSettings } from './preview/PreferenceSettings';
import { AIValidationTools } from './preview/validators/AIValidationTools';
import { EnhancedPdfProcessor } from './preview/enhanced/EnhancedPdfProcessor';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Settings, BarChart3, Wrench } from 'lucide-react';

interface InvoicePreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
  invoice?: any;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  pdfUrl,
  htmlContent,
  emailContent,
  invoice
}) => {
  const { preferences } = useUserPreferences();
  const [showSettings, setShowSettings] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showProcessor, setShowProcessor] = useState(false);
  
  const {
    contentType,
    isLoading,
    error,
    pdfUrl: normalizedPdfUrl,
    hasHtmlContent,
    hasEmailContent,
    retryPdfLoad,
    switchToHtml,
    switchToPdf
  } = useEnhancedPdfPreview({ 
    pdfUrl, 
    htmlContent, 
    emailContent,
    userPreferences: preferences
  });

  const [activeTab, setActiveTab] = React.useState('document');
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Auto-switch content type when switching tabs based on user preferences
    if (value === 'document') {
      if (preferences.preferredViewMode === 'pdf' && normalizedPdfUrl) {
        switchToPdf();
      } else if (preferences.preferredViewMode === 'html' && hasHtmlContent) {
        switchToHtml();
      }
    }
  };

  const handleExternalOpen = () => {
    if (normalizedPdfUrl) {
      window.open(normalizedPdfUrl, '_blank');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-background p-4'
    : 'h-[600px]';

  return (
    <>
      <div className={`flex flex-col border rounded-lg overflow-hidden ${fullscreenClass}`}>
        <PreviewHeader
          isPdf={contentType === 'pdf'}
          isWordDocument={false}
          pdfUrl={normalizedPdfUrl}
          onExternalOpen={handleExternalOpen}
          onToggleFullscreen={toggleFullscreen}
          showActions={true}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasEmail={hasEmailContent}
        />
        
        {/* Enhanced action bar with new tools */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            {normalizedPdfUrl && (
              <Button
                size="sm"
                variant={contentType === 'pdf' ? 'default' : 'outline'}
                onClick={switchToPdf}
              >
                PDF
              </Button>
            )}
            {hasHtmlContent && (
              <Button
                size="sm"
                variant={contentType === 'html' ? 'default' : 'outline'}
                onClick={switchToHtml}
              >
                Processed
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {preferences.showValidationTools && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowValidation(!showValidation)}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                Validate
              </Button>
            )}
            
            {normalizedPdfUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowProcessor(!showProcessor)}
                className="flex items-center gap-1"
              >
                <Wrench className="h-3 w-3" />
                Tools
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Settings
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
          <TabsContent value="document" className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading document...
                    {preferences.enableAutoFallback && ' (Auto-fallback enabled)'}
                  </p>
                </div>
              </div>
            ) : error && !preferences.enableAutoFallback ? (
              <PreviewErrorState
                error={error}
                pdfUrl={normalizedPdfUrl}
                onExternalOpen={handleExternalOpen}
                onRetry={retryPdfLoad}
              />
            ) : contentType === 'none' ? (
              <NoPreviewState />
            ) : contentType === 'pdf' ? (
              <EnhancedPdfViewer
                pdfUrl={normalizedPdfUrl}
                onError={() => {
                  if (hasHtmlContent && preferences.enableAutoFallback) {
                    switchToHtml();
                  }
                }}
                onLoad={() => console.log('PDF loaded successfully')}
                onFallbackToHtml={hasHtmlContent ? switchToHtml : undefined}
                hasHtmlFallback={hasHtmlContent}
              />
            ) : contentType === 'html' ? (
              <HtmlContentViewer
                htmlContent={htmlContent}
                onError={() => console.error('HTML content error')}
                onLoad={() => console.log('HTML content loaded')}
              />
            ) : null}
          </TabsContent>
          
          <TabsContent value="email" className="h-full">
            <EmailPreview 
              emailContent={emailContent} 
              htmlContent={htmlContent} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced side panels */}
      {showValidation && (
        <div className="mt-4">
          <AIValidationTools
            pdfUrl={normalizedPdfUrl}
            htmlContent={htmlContent}
            invoice={invoice}
          />
        </div>
      )}

      {showProcessor && normalizedPdfUrl && (
        <div className="mt-4">
          <EnhancedPdfProcessor
            pdfUrl={normalizedPdfUrl}
            onMetadataExtracted={(metadata) => console.log('PDF metadata:', metadata)}
            onTextExtracted={(text) => console.log('Extracted text:', text)}
          />
        </div>
      )}

      <PreferenceSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};


import React from 'react';
import { PreferenceSettings } from './PreferenceSettings';
import { AIValidationTools } from './validators/AIValidationTools';
import { EnhancedPdfProcessor } from './enhanced/EnhancedPdfProcessor';
import { SupabaseStorageDebugger } from './viewers/SupabaseStorageDebugger';

interface InvoicePreviewModalsProps {
  showSettings: boolean;
  showValidation: boolean;
  showStorageDebug: boolean;
  onCloseSettings: () => void;
  pdfUrl?: string;
  htmlContent?: string;
  hasPdf: boolean;
}

export const InvoicePreviewModals: React.FC<InvoicePreviewModalsProps> = React.memo(({
  showSettings,
  showValidation,
  showStorageDebug,
  onCloseSettings,
  pdfUrl,
  htmlContent,
  hasPdf
}) => {
  return (
    <>
      {/* Enhanced Tools */}
      {showValidation && (
        <div className="border-t p-4 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AIValidationTools 
              pdfUrl={pdfUrl}
              htmlContent={htmlContent}
            />
            {hasPdf && (
              <EnhancedPdfProcessor 
                pdfUrl={pdfUrl}
              />
            )}
          </div>
        </div>
      )}

      {/* Storage Debug Information */}
      {showStorageDebug && hasPdf && (
        <div className="border-t p-4 bg-gray-50">
          <SupabaseStorageDebugger pdfUrl={pdfUrl} />
        </div>
      )}

      {/* Settings Modal */}
      <PreferenceSettings 
        isOpen={showSettings}
        onClose={onCloseSettings}
      />
    </>
  );
});

InvoicePreviewModals.displayName = 'InvoicePreviewModals';

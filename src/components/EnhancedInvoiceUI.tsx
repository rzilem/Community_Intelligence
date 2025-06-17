
import React, { useMemo } from 'react';
import { Invoice } from '@/types/invoice-types';
import { EnhancedInvoiceHeader } from './invoices/enhanced/EnhancedInvoiceHeader';
import { EnhancedInvoicePreview } from './invoices/enhanced/EnhancedInvoicePreview';
import { EnhancedInvoiceDetails } from './invoices/enhanced/EnhancedInvoiceDetails';
import { EnhancedInvoiceActions } from './invoices/enhanced/EnhancedInvoiceActions';
import { useEnhancedInvoiceData } from './invoices/enhanced/hooks/useEnhancedInvoiceData';
import { useEnhancedInvoiceActions } from './invoices/enhanced/hooks/useEnhancedInvoiceActions';

interface EnhancedInvoiceUIProps {
  invoice: Invoice;
  onInvoiceUpdate?: (updatedInvoice: Invoice) => void;
  onEdit?: () => void;
  showPreview?: boolean;
}

const EnhancedInvoiceUI: React.FC<EnhancedInvoiceUIProps> = React.memo(({
  invoice,
  onInvoiceUpdate,
  onEdit,
  showPreview = true
}) => {
  const { invoiceMetadata, isLoading } = useEnhancedInvoiceData({ invoice });
  
  const {
    isActionLoading,
    handleApprove,
    handleReject,
    handleDownload,
    handleSend
  } = useEnhancedInvoiceActions({ invoice, onInvoiceUpdate });

  // Memoize the layout to prevent unnecessary re-renders
  const layout = useMemo(() => {
    if (showPreview) {
      return {
        leftColumn: "lg:col-span-2",
        rightColumn: "lg:col-span-1"
      };
    }
    return {
      leftColumn: "lg:col-span-3",
      rightColumn: "lg:col-span-1"
    };
  }, [showPreview]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <EnhancedInvoiceHeader 
        invoice={invoice} 
        onEdit={onEdit}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={layout.leftColumn}>
          <div className="space-y-6">
            <EnhancedInvoiceDetails invoice={invoice} />
            
            {showPreview && (
              <EnhancedInvoicePreview
                pdfUrl={invoice.pdf_url}
                htmlContent={invoice.html_content}
                emailContent={invoice.email_content}
              />
            )}
          </div>
        </div>
        
        <div className={layout.rightColumn}>
          <EnhancedInvoiceActions
            invoice={invoice}
            onApprove={handleApprove}
            onReject={handleReject}
            onDownload={handleDownload}
            onSend={handleSend}
            isLoading={isActionLoading || isLoading}
          />
        </div>
      </div>
    </div>
  );
});

EnhancedInvoiceUI.displayName = 'EnhancedInvoiceUI';

export default EnhancedInvoiceUI;

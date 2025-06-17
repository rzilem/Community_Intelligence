
import React from 'react';
import { Invoice } from '@/types/invoice-types';
import { EnhancedInvoiceHeader } from './invoices/enhanced/EnhancedInvoiceHeader';
import { InvoiceLayoutManager } from './invoices/enhanced/components/InvoiceLayoutManager';
import { InvoiceContentSection } from './invoices/enhanced/components/InvoiceContentSection';
import { InvoicePreviewSection } from './invoices/enhanced/components/InvoicePreviewSection';
import { InvoiceActionsSection } from './invoices/enhanced/components/InvoiceActionsSection';
import { useInvoiceUIState } from './invoices/enhanced/hooks/useInvoiceUIState';
import { useInvoiceActions } from './invoices/enhanced/hooks/useInvoiceActions';

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
  const { layoutConfig } = useInvoiceUIState({ invoice, showPreview });
  
  const {
    isLoading,
    handleApprove,
    handleReject,
    handleDownload,
    handleSend
  } = useInvoiceActions({ invoice, onInvoiceUpdate });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <EnhancedInvoiceHeader 
        invoice={invoice} 
        onEdit={onEdit}
      />
      
      <InvoiceLayoutManager
        showPreview={layoutConfig.showPreview && layoutConfig.hasPreview}
        leftContent={<InvoiceContentSection invoice={invoice} />}
        rightContent={
          <InvoiceActionsSection
            invoice={invoice}
            onApprove={handleApprove}
            onReject={handleReject}
            onDownload={handleDownload}
            onSend={handleSend}
            isLoading={isLoading}
          />
        }
        previewContent={
          layoutConfig.showPreview && layoutConfig.hasPreview ? (
            <InvoicePreviewSection invoice={invoice} />
          ) : undefined
        }
      />
    </div>
  );
});

EnhancedInvoiceUI.displayName = 'EnhancedInvoiceUI';

export default EnhancedInvoiceUI;

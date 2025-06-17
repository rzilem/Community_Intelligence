
import React from 'react';
import { Invoice } from '@/types/invoice-types';
import { EnhancedInvoiceActions } from '../EnhancedInvoiceActions';

interface InvoiceActionsSectionProps {
  invoice: Invoice;
  onApprove?: () => void;
  onReject?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  isLoading?: boolean;
}

export const InvoiceActionsSection: React.FC<InvoiceActionsSectionProps> = React.memo(({
  invoice,
  onApprove,
  onReject,
  onDownload,
  onSend,
  isLoading
}) => {
  return (
    <EnhancedInvoiceActions
      invoice={invoice}
      onApprove={onApprove}
      onReject={onReject}
      onDownload={onDownload}
      onSend={onSend}
      isLoading={isLoading}
    />
  );
});

InvoiceActionsSection.displayName = 'InvoiceActionsSection';

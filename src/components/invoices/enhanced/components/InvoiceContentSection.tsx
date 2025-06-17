
import React from 'react';
import { Invoice } from '@/types/invoice-types';
import { EnhancedInvoiceDetails } from '../EnhancedInvoiceDetails';

interface InvoiceContentSectionProps {
  invoice: Invoice;
}

export const InvoiceContentSection: React.FC<InvoiceContentSectionProps> = React.memo(({
  invoice
}) => {
  return <EnhancedInvoiceDetails invoice={invoice} />;
});

InvoiceContentSection.displayName = 'InvoiceContentSection';


import { useState } from 'react';
import { useUserColumns } from '@/hooks/useUserColumns';

export type InvoiceColumn = {
  id: string;
  label: string;
  defaultVisible?: boolean;
};

export const useInvoiceColumns = (viewId: string = 'invoice-columns') => {
  const defaultColumns: InvoiceColumn[] = [
    { id: 'invoice_number', label: 'Invoice #', defaultVisible: true },
    { id: 'vendor', label: 'Vendor', defaultVisible: true },
    { id: 'association_name', label: 'HOA', defaultVisible: true },
    { id: 'invoice_date', label: 'Invoice Date', defaultVisible: true },
    { id: 'amount', label: 'Amount', defaultVisible: true },
    { id: 'due_date', label: 'Due Date', defaultVisible: true },
    { id: 'status', label: 'Status', defaultVisible: true },
    { id: 'description', label: 'Description', defaultVisible: false },
    { id: 'payment_method', label: 'Payment Method', defaultVisible: false },
    { id: 'payment_status', label: 'Payment Status', defaultVisible: false }
  ];
  
  const [columns] = useState<InvoiceColumn[]>(defaultColumns);
  
  const { 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults,
    loading 
  } = useUserColumns(
    defaultColumns, 
    viewId
  );

  return {
    columns,
    visibleColumnIds,
    loading,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
  };
};

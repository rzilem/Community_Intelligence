
import { useState, useEffect } from 'react';

// Export the InvoiceColumn type so it can be imported elsewhere
export interface InvoiceColumn {
  id: string;
  label: string;
  accessorKey: string;
  sortable: boolean;
}

export function useInvoiceColumns(storageKey: string = 'invoiceColumnsVisible') {
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    JSON.parse(localStorage.getItem(storageKey) || 'null') || 
    ['invoice_number', 'vendor', 'association_name', 'invoice_date', 'amount', 'due_date', 'status']
  );

  // Define columns for the invoices table
  const columns: InvoiceColumn[] = [
    { id: 'invoice_number', label: 'Invoice #', accessorKey: 'invoice_number', sortable: true },
    { id: 'vendor', label: 'Vendor', accessorKey: 'vendor', sortable: true },
    { id: 'association_name', label: 'HOA', accessorKey: 'association_name', sortable: true },
    { id: 'invoice_date', label: 'Invoice Date', accessorKey: 'invoice_date', sortable: true },
    { id: 'amount', label: 'Amount', accessorKey: 'amount', sortable: true },
    { id: 'due_date', label: 'Due Date', accessorKey: 'due_date', sortable: true },
    { id: 'status', label: 'Status', accessorKey: 'status', sortable: true },
    { id: 'description', label: 'Description', accessorKey: 'description', sortable: false },
  ];

  // Update visible columns in local storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds, storageKey]);

  // Handler to update visible columns
  const updateVisibleColumns = (selectedColumns: string[]) => {
    setVisibleColumnIds(selectedColumns);
  };

  // Handler to reorder columns
  const reorderColumns = (startIndex: number, endIndex: number) => {
    const result = Array.from(visibleColumnIds);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setVisibleColumnIds(result);
  };

  // Handler to reset columns to defaults
  const resetToDefaults = () => {
    setVisibleColumnIds([
      'invoice_number', 'vendor', 'association_name', 'invoice_date', 'amount', 'due_date', 'status'
    ]);
  };

  return {
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults
  };
}

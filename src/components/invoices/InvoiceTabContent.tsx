
import React from 'react';
import InvoiceToolbar from './InvoiceToolbar';
import InvoiceTable from './InvoiceTable';

interface InvoiceTabContentProps {
  tabKey: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddInvoice: () => void;
  onRefresh: () => void;
  onFilterChange: (key: string) => void;
  invoices: any[];
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
}

const InvoiceTabContent: React.FC<InvoiceTabContentProps> = ({
  tabKey,
  searchTerm,
  onSearchChange,
  onAddInvoice,
  onRefresh,
  onFilterChange,
  invoices,
  isLoading,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
}) => (
  <>
    <InvoiceToolbar 
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onAddInvoice={onAddInvoice}
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
    />
    <div className="mt-4">
      <InvoiceTable 
        invoices={invoices}
        isLoading={isLoading}
        onViewInvoice={onViewInvoice}
        onApproveInvoice={onApproveInvoice}
        onRejectInvoice={onRejectInvoice}
      />
    </div>
  </>
);

export default InvoiceTabContent;

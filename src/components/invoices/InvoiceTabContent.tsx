
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import InvoiceTable from './InvoiceTable';
import { Invoice } from '@/types/invoice-types';
import { InvoiceColumn } from '@/hooks/invoices/useInvoiceColumns';

interface InvoiceTabContentProps {
  tabKey: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddInvoice: () => void;
  onRefresh: () => void;
  onFilterChange: (value: string) => void;
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
  columns: InvoiceColumn[];
  visibleColumnIds: string[];
}

const InvoiceTabContent: React.FC<InvoiceTabContentProps> = ({
  tabKey,
  searchTerm,
  onSearchChange,
  onAddInvoice,
  onRefresh,
  invoices,
  isLoading,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
  columns,
  visibleColumnIds,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onRefresh} variant="outline" size="icon">
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button onClick={onAddInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        onViewInvoice={onViewInvoice}
        onApproveInvoice={onApproveInvoice}
        onRejectInvoice={onRejectInvoice}
        columns={columns}
        visibleColumnIds={visibleColumnIds}
      />
    </div>
  );
};

export default InvoiceTabContent;

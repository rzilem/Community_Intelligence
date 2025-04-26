
import React from 'react';
import { Receipt, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceQueueEmptyStateProps {
  onAddInvoice: () => void;
  invoicesExist: boolean;
  statusFilter: string;
}

export const InvoiceQueueEmptyState: React.FC<InvoiceQueueEmptyStateProps> = ({
  onAddInvoice,
  invoicesExist,
  statusFilter,
}) => {
  if (!invoicesExist) {
    return (
      <div className="flex flex-col items-center justify-center py-8 bg-muted/40 rounded-md">
        <Receipt className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-muted-foreground mb-4">
          {statusFilter !== 'all' 
            ? `There are no ${statusFilter} invoices to display.`
            : 'Start by creating a new invoice or wait for emails to be processed.'}
        </p>
        <Button onClick={onAddInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice Manually
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 bg-muted/40 rounded-md">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
      <h3 className="text-lg font-medium">No matches found</h3>
      <p className="text-muted-foreground">
        No invoices match your search criteria. Try adjusting your filters.
      </p>
    </div>
  );
};


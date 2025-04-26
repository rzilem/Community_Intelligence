
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, FileDown } from 'lucide-react';

interface BulkActionBarProps {
  selectedInvoices: string[];
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedInvoices,
  onBulkApprove,
  onBulkReject,
  onBulkExport,
  onClearSelection,
}) => {
  if (selectedInvoices.length === 0) return null;

  return (
    <div className="bg-muted/50 border rounded-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedInvoices.length} invoices selected</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBulkExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Export Selected
        </Button>
        <Button variant="outline" size="sm" className="text-green-600" onClick={onBulkApprove}>
          <Check className="h-4 w-4 mr-2" />
          Approve Selected
        </Button>
        <Button variant="outline" size="sm" className="text-red-600" onClick={onBulkReject}>
          <X className="h-4 w-4 mr-2" />
          Reject Selected
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;

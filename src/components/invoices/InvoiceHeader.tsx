import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import VendorSelector from '@/components/vendors/VendorSelector';

interface InvoiceHeaderProps {
  invoice: {
    vendor: string;
    association: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paymentType: string;
    description?: string;
  };
  onInvoiceChange: (field: string, value: string | number) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onInvoiceChange,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssociationSelector
          initialAssociationId={invoice.association}
          onAssociationChange={(value) => onInvoiceChange('association', value)}
          label="Association"
        />

        <VendorSelector
          onVendorChange={(value) => onInvoiceChange('vendor', value)}
          initialVendorName={invoice.vendor}
          className="w-full"
        />

        <Input
          value={invoice.invoiceNumber}
          onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)}
          placeholder="Enter invoice number"
          className="w-full"
          label="Invoice Number"
        />

        <Input
          type="date"
          value={invoice.invoiceDate}
          onChange={(e) => onInvoiceChange('invoiceDate', e.target.value)}
          className="w-full"
          label="Invoice Date"
        />

        <Input
          type="date"
          value={invoice.dueDate}
          onChange={(e) => onInvoiceChange('dueDate', e.target.value)}
          className="w-full"
          label="Due Date"
        />

        <Input
          type="number"
          value={invoice.totalAmount}
          onChange={(e) => onInvoiceChange('totalAmount', parseFloat(e.target.value) || 0)}
          className="w-full"
          label="Total Amount"
          step="0.01"
        />

        <Select
          value={invoice.paymentType}
          onValueChange={(value) => onInvoiceChange('paymentType', value)}
          className="w-full"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-2">
        <Label>Description</Label>
        <Textarea
          value={invoice.description}
          onChange={(e) => onInvoiceChange('description', e.target.value)}
          placeholder="Enter description"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default InvoiceHeader;

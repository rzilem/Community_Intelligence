
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import VendorSelector from '@/components/vendors/VendorSelector';
import AIDataIndicator from '@/components/invoices/detail/AIDataIndicator';

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
  aiConfidence?: Record<string, number> | null;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onInvoiceChange,
  aiConfidence
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* First row with Association and Vendor */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2 relative">
          <AssociationSelector
            initialAssociationId={invoice.association}
            onAssociationChange={(value) => onInvoiceChange('association', value)}
            label="Association"
          />
          <AIDataIndicator field="association_id" confidenceData={aiConfidence || undefined} />
        </div>

        <div className="md:col-span-4 relative">
          <VendorSelector
            onVendorChange={(value) => onInvoiceChange('vendor', value)}
            initialVendorName={invoice.vendor}
            className="w-full"
            label="Vendor"
          />
          <AIDataIndicator field="vendor" confidenceData={aiConfidence || undefined} />
        </div>
      </div>

      {/* Date and Invoice Number row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2 relative">
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => onInvoiceChange('invoiceDate', e.target.value)}
              className="w-full"
            />
            <AIDataIndicator field="invoice_date" confidenceData={aiConfidence || undefined} />
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={invoice.dueDate}
              onChange={(e) => onInvoiceChange('dueDate', e.target.value)}
              className="w-full"
            />
            <AIDataIndicator field="due_date" confidenceData={aiConfidence || undefined} />
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoice.invoiceNumber}
              onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
              className="w-full"
            />
            <AIDataIndicator field="invoice_number" confidenceData={aiConfidence || undefined} />
          </div>
        </div>
      </div>

      {/* Payment type and Total row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2 relative">
          <div className="space-y-2">
            <Label>Payment Type</Label>
            <Select
              value={invoice.paymentType}
              onValueChange={(value) => onInvoiceChange('paymentType', value)}
            >
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AIDataIndicator field="payment_method" confidenceData={aiConfidence || undefined} />
        </div>

        <div className="md:col-span-2 md:col-start-5 relative">
          <div className="space-y-2">
            <Label htmlFor="invoiceTotal">Total</Label>
            <Input
              id="invoiceTotal"
              type="number"
              value={invoice.totalAmount}
              onChange={(e) => onInvoiceChange('totalAmount', parseFloat(e.target.value) || 0)}
              step="0.01"
              className="w-full"
            />
          </div>
          <AIDataIndicator field="amount" confidenceData={aiConfidence || undefined} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;

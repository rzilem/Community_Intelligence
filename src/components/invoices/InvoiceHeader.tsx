
import React from 'react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AssociationSelector from '@/components/associations/AssociationSelector';

interface InvoiceHeaderProps {
  invoice: {
    vendor: string;
    association: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
  };
  onInvoiceChange: (field: string, value: string | number) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onInvoiceChange,
}) => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Association</label>
          <AssociationSelector
            onAssociationChange={(id) => onInvoiceChange('association', id)}
            initialAssociationId={invoice.association}
            label={false}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Invoice Number</label>
          <Input 
            value={invoice.invoiceNumber} 
            onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)} 
            placeholder="Enter invoice number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Vendor</label>
          <Input 
            value={invoice.vendor} 
            onChange={(e) => onInvoiceChange('vendor', e.target.value)} 
            placeholder="Enter vendor name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Invoice Date</label>
          <Input 
            type="date" 
            value={invoice.invoiceDate} 
            onChange={(e) => onInvoiceChange('invoiceDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Input 
            type="date" 
            value={invoice.dueDate} 
            onChange={(e) => onInvoiceChange('dueDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Invoice Total</label>
          <Input 
            type="number" 
            step="0.01" 
            value={invoice.totalAmount} 
            onChange={(e) => onInvoiceChange('totalAmount', parseFloat(e.target.value))}
            className="text-right"
          />
        </div>
      </div>
    </Card>
  );
};

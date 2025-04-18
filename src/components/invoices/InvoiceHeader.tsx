
import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { Invoice } from '@/types/invoice-types';

interface InvoiceHeaderProps {
  invoice: {
    id: string;
    vendor: string;
    association: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    description: string;
  };
  onInvoiceChange: (field: string, value: string | number) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, onInvoiceChange }) => {
  // Log the association ID to help with debugging
  console.log("InvoiceHeader component - association ID:", invoice.association);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-1">Vendor</h3>
            <Input
              value={invoice.vendor}
              onChange={(e) => onInvoiceChange('vendor', e.target.value)}
              placeholder="Enter vendor name"
              className="mb-4"
            />
            
            <h3 className="font-medium mb-1">Invoice Number</h3>
            <Input
              value={invoice.invoiceNumber}
              onChange={(e) => onInvoiceChange('invoiceNumber', e.target.value)}
              placeholder="Enter invoice number"
              className="mb-4"
            />
            
            <h3 className="font-medium mb-1">Description</h3>
            <Input
              value={invoice.description || ''}
              onChange={(e) => onInvoiceChange('description', e.target.value)}
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <AssociationSelector
              onAssociationChange={(id) => {
                console.log('Association selected:', id);
                onInvoiceChange('association', id);
              }}
              initialAssociationId={invoice.association}
              label="Association"
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-1">Invoice Date</h3>
                <Input
                  type="date"
                  value={invoice.invoiceDate}
                  onChange={(e) => onInvoiceChange('invoiceDate', e.target.value)}
                  className="mb-4"
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Due Date</h3>
                <Input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => onInvoiceChange('dueDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHeader;

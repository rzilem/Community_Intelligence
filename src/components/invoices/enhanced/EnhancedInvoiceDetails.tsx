
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Calendar, CreditCard } from 'lucide-react';
import { Invoice } from '@/types/invoice-types';

interface EnhancedInvoiceDetailsProps {
  invoice: Invoice;
}

export const EnhancedInvoiceDetails: React.FC<EnhancedInvoiceDetailsProps> = React.memo(({
  invoice
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Invoice Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Invoice Date</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(invoice.invoice_date)}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <div className="flex items-center gap-2 mt-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{invoice.payment_method || 'Not specified'}</span>
            </div>
          </div>
        </div>
        
        {invoice.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="mt-1 text-sm">{invoice.description}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Status:</label>
          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
            {invoice.status}
          </Badge>
        </div>
        
        {invoice.tracking_number && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
            <p className="mt-1 text-sm font-mono">{invoice.tracking_number}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EnhancedInvoiceDetails.displayName = 'EnhancedInvoiceDetails';

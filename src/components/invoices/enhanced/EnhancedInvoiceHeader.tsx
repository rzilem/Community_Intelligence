
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, DollarSign, Building, User } from 'lucide-react';
import { Invoice } from '@/types/invoice-types';

interface EnhancedInvoiceHeaderProps {
  invoice: Invoice;
  onEdit?: () => void;
}

export const EnhancedInvoiceHeader: React.FC<EnhancedInvoiceHeaderProps> = React.memo(({
  invoice,
  onEdit
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Invoice #{invoice.invoice_number}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
            {invoice.status}
          </Badge>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Vendor</p>
              <p className="text-sm text-muted-foreground">{invoice.vendor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Association</p>
              <p className="text-sm text-muted-foreground">{invoice.association_name || 'Not assigned'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(invoice.due_date)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm font-semibold">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedInvoiceHeader.displayName = 'EnhancedInvoiceHeader';

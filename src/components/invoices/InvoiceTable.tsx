
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types/invoice-types';
import AIProcessingControls from './AIProcessingControls';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
  onRefreshInvoices?: () => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
  onRefreshInvoices
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      paid: { label: 'Paid', variant: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No invoices found</p>
          <p className="text-sm text-gray-500">Invoices will appear here once they are received or created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI Processing</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoice_number || 'N/A'}
              </TableCell>
              <TableCell>{invoice.vendor || 'Unknown Vendor'}</TableCell>
              <TableCell>{formatCurrency(invoice.amount || 0)}</TableCell>
              <TableCell>
                {invoice.due_date ? formatDate(invoice.due_date) : 'Not specified'}
              </TableCell>
              <TableCell>
                {getStatusBadge(invoice.status)}
              </TableCell>
              <TableCell>
                <AIProcessingControls
                  invoice={invoice}
                  onProcessingComplete={() => onRefreshInvoices?.()}
                  compact={true}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewInvoice(invoice.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {invoice.status === 'pending' && onApproveInvoice && (
                      <DropdownMenuItem onClick={() => onApproveInvoice(invoice.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                    )}
                    {invoice.status === 'pending' && onRejectInvoice && (
                      <DropdownMenuItem onClick={() => onRejectInvoice(invoice.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;

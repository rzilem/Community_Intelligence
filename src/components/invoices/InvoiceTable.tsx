
import React from 'react';
import { Eye, CheckSquare, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Skeleton } from '@/components/ui/skeleton';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Invoice } from '@/types/invoice-types';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>HOA</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              </TableRow>
            ))
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium" onClick={() => onViewInvoice(invoice.id)}>
                  {invoice.invoice_number}
                </TableCell>
                <TableCell onClick={() => onViewInvoice(invoice.id)}>{invoice.vendor}</TableCell>
                <TableCell onClick={() => onViewInvoice(invoice.id)}>{invoice.association_name || 'N/A'}</TableCell>
                <TableCell onClick={() => onViewInvoice(invoice.id)}>{invoice.invoice_date}</TableCell>
                <TableCell className="text-right" onClick={() => onViewInvoice(invoice.id)}>
                  ${Number(invoice.amount).toFixed(2)}
                </TableCell>
                <TableCell onClick={() => onViewInvoice(invoice.id)}>{invoice.due_date}</TableCell>
                <TableCell onClick={() => onViewInvoice(invoice.id)}>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipButton 
                      size="sm" 
                      variant="ghost" 
                      tooltip="View invoice details"
                      onClick={() => onViewInvoice(invoice.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </TooltipButton>
                    {invoice.status === 'pending' && onApproveInvoice && onRejectInvoice && (
                      <>
                        <TooltipButton 
                          size="sm" 
                          variant="outline" 
                          className="border-green-500 text-green-500 hover:bg-green-50" 
                          tooltip="Approve this invoice"
                          onClick={() => onApproveInvoice(invoice.id)}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </TooltipButton>
                        <TooltipButton 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-500 hover:bg-red-50" 
                          tooltip="Reject this invoice"
                          onClick={() => onRejectInvoice(invoice.id)}
                        >
                          <X className="h-4 w-4" />
                        </TooltipButton>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                No invoices found that match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Invoice } from '@/types/invoice-types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DocumentViewer } from './preview/DocumentViewer';
import { InvoiceColumn } from '@/hooks/invoices/useInvoiceColumns';

interface InvoiceTableProps {
  invoices: Invoice[];
  columns: InvoiceColumn[];
  visibleColumnIds: string[];
  isLoading?: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  columns,
  visibleColumnIds,
  isLoading = false,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
}) => {
  // Function to extract just the filename from a PDF URL
  const getFilenameFromUrl = (pdfUrl: string): string => {
    if (!pdfUrl) return '';
    
    if (pdfUrl.includes('://')) {
      try {
        const parsedUrl = new URL(pdfUrl);
        return parsedUrl.pathname.split('/').pop() || pdfUrl;
      } catch (e) {
        return pdfUrl.split('/').pop() || pdfUrl;
      }
    }
    return pdfUrl.split('/').pop() || pdfUrl;
  };

  if (isLoading) {
    return (
      <div className="w-full py-10 text-center text-gray-500">
        Loading invoices...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="w-full py-10 text-center text-gray-500">
        No invoices found. Add invoices or adjust your filters.
      </div>
    );
  }

  const isAIAssisted = (invoice: Invoice, field: keyof Invoice) => {
    if (!invoice.html_content) return false;
    
    return !!invoice[field] && field !== 'html_content';
  };

  const getCellContent = (invoice: Invoice, columnId: string) => {
    switch (columnId) {
      case 'invoice_number':
        return invoice.invoice_number;
      case 'vendor':
        return invoice.vendor;
      case 'association_name':
        return invoice.association_name || 'Not assigned';
      case 'invoice_date':
        return new Date(invoice.invoice_date).toLocaleDateString();
      case 'amount':
        return formatCurrency(invoice.amount);
      case 'due_date':
        return new Date(invoice.due_date).toLocaleDateString();
      case 'status':
        return <InvoiceStatusBadge status={invoice.status} />;
      case 'description':
        return invoice.description || '—';
      case 'payment_method':
        return invoice.payment_method || '—';
      case 'payment_status':
        return invoice.payment_status || '—';
      default:
        return '—';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumnIds.map((columnId) => {
              const column = columns.find(col => col.id === columnId);
              return column && (
                <TableHead key={columnId}>{column.label}</TableHead>
              );
            })}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnIds.length + 1} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                {visibleColumnIds.map((columnId) => (
                  <TableCell key={`${invoice.id}-${columnId}`}>
                    {getCellContent(invoice, columnId)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onViewInvoice(invoice.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {invoice.status === 'pending' && onApproveInvoice && (
                      <Button variant="ghost" size="icon" onClick={() => onApproveInvoice(invoice.id)}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {invoice.status === 'pending' && onRejectInvoice && (
                      <Button variant="ghost" size="icon" onClick={() => onRejectInvoice(invoice.id)}>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;

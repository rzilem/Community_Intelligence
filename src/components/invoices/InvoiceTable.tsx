import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Invoice } from '@/types/invoice-types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { InvoiceColumn } from '@/hooks/invoices/useInvoiceColumns';
import { InvoiceHoverPreview } from './preview/InvoiceHoverPreview';

interface InvoiceTableProps {
  invoices: Invoice[];
  columns: InvoiceColumn[];
  visibleColumnIds: string[];
  isLoading?: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
  selectedInvoiceIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  columns,
  visibleColumnIds,
  isLoading = false,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
  selectedInvoiceIds = [],
  onSelectionChange = () => {},
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(invoices.map(inv => inv.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (invoiceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedInvoiceIds, invoiceId]);
    } else {
      onSelectionChange(selectedInvoiceIds.filter(id => id !== invoiceId));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-10 text-center text-gray-500">
        Loading invoices...
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
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
    const content = (() => {
      switch (columnId) {
        case 'invoice_number':
          return (
            <InvoiceHoverPreview invoice={invoice}>
              <span className="cursor-pointer hover:text-primary">
                {invoice.invoice_number}
              </span>
            </InvoiceHoverPreview>
          );
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
    })();

    return content;
  };

  console.log("Rendering InvoiceTable with invoices:", invoices.length);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedInvoiceIds.length === invoices.length && invoices.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
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
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Checkbox
                  checked={selectedInvoiceIds.includes(invoice.id)}
                  onCheckedChange={(checked) => handleSelectRow(invoice.id, checked as boolean)}
                />
              </TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;

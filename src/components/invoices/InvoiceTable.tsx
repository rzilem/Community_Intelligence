import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Invoice } from '@/types/invoice-types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { InvoiceHoverPreview } from './preview/InvoiceHoverPreview';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading = false,
  onViewInvoice,
  onApproveInvoice,
  onRejectInvoice,
}) => {
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

  // Helper to check if a field was extracted by AI
  const isAIAssisted = (invoice: Invoice, field: keyof Invoice) => {
    if (!invoice.html_content) return false;
    
    return !!invoice[field] && field !== 'html_content';
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>HOA</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="flex items-center">
                  {invoice.invoice_number}
                  {isAIAssisted(invoice, 'invoice_number') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                            AI
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This field was extracted using AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {invoice.vendor}
                  {isAIAssisted(invoice, 'vendor') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                            AI
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This field was extracted using AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>{invoice.association_name || 'Not assigned'}</TableCell>
              <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  {formatCurrency(invoice.amount)}
                  {isAIAssisted(invoice, 'amount') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                            AI
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This field was extracted using AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {new Date(invoice.due_date).toLocaleDateString()}
                  {isAIAssisted(invoice, 'due_date') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                            AI
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This field was extracted using AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <HoverCard openDelay={100} closeDelay={300}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HoverCardTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onViewInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View invoice details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <HoverCardContent className="w-[600px] h-[400px] p-0 shadow-lg" side="left">
                      <InvoiceHoverPreview invoice={invoice} />
                    </HoverCardContent>
                  </HoverCard>

                  {invoice.status === 'pending' && onApproveInvoice && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onApproveInvoice(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Approve invoice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {invoice.status === 'pending' && onRejectInvoice && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onRejectInvoice(invoice.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reject invoice</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

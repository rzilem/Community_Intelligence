
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

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onViewInvoice: (id: string) => void;
  onApproveInvoice?: (id: string) => void;
  onRejectInvoice?: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
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
                  <HoverCard openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onViewInvoice(invoice.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[600px] h-[400px] p-0" side="left" align="end">
                      {(invoice.pdf_url || invoice.html_content) ? (
                        <div className="w-full h-full flex flex-col">
                          <div className="flex items-center justify-between bg-muted p-2 border-b">
                            <div className="text-sm font-medium">Document Preview</div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onViewInvoice(invoice.id)}
                              className="flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Full View
                            </Button>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <DocumentViewer
                              pdfUrl={invoice.pdf_url || ''}
                              htmlContent={invoice.html_content}
                              isPdf={!!invoice.pdf_url}
                              isWordDocument={false}
                              onIframeError={() => {}}
                              onIframeLoad={() => {}}
                              onExternalOpen={() => onViewInvoice(invoice.id)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No preview available
                        </div>
                      )}
                    </HoverCardContent>
                  </HoverCard>
                  
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

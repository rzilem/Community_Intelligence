
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected';
  hoaName: string;
}

const mockInvoices: Invoice[] = [
  { 
    id: 'INV-001', 
    vendor: 'Landscaping Services Inc.', 
    amount: 1250.00, 
    dueDate: '2025-04-15', 
    status: 'pending',
    hoaName: 'Oakridge Estates'
  },
  { 
    id: 'INV-002', 
    vendor: 'Pool Maintenance Co.', 
    amount: 850.00, 
    dueDate: '2025-04-18', 
    status: 'pending',
    hoaName: 'Lakeside Community'
  },
  { 
    id: 'INV-003', 
    vendor: 'Security Systems Ltd.', 
    amount: 2100.00, 
    dueDate: '2025-04-22', 
    status: 'approved',
    hoaName: 'Highland Towers'
  },
  { 
    id: 'INV-004', 
    vendor: 'Professional Cleaning', 
    amount: 650.00, 
    dueDate: '2025-04-25', 
    status: 'rejected',
    hoaName: 'Oakridge Estates'
  },
  { 
    id: 'INV-005', 
    vendor: 'Electrical Repairs', 
    amount: 1800.00, 
    dueDate: '2025-04-30', 
    status: 'pending',
    hoaName: 'Highland Towers'
  },
];

const getStatusBadge = (status: Invoice['status']) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

const InvoiceQueue = () => {
  return (
    <PageTemplate 
      title="Invoice Queue" 
      icon={<Receipt className="h-8 w-8" />}
      description="Process and approve incoming vendor invoices for payment."
    >
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <TooltipButton tooltip="Add a new invoice">
              Add Invoice
            </TooltipButton>
            <TooltipButton variant="outline" tooltip="Import invoices from a CSV">
              Import
            </TooltipButton>
          </div>
          <div className="flex gap-2">
            <TooltipButton variant="outline" tooltip="View invoice approval history">
              History
            </TooltipButton>
            <TooltipButton variant="outline" tooltip="Export the invoice queue as CSV">
              Export
            </TooltipButton>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>HOA</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell>{invoice.hoaName}</TableCell>
                  <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipButton size="sm" variant="ghost" tooltip="View invoice details">
                        View
                      </TooltipButton>
                      {invoice.status === 'pending' && (
                        <>
                          <TooltipButton size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50" tooltip="Approve this invoice">
                            Approve
                          </TooltipButton>
                          <TooltipButton size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" tooltip="Reject this invoice">
                            Reject
                          </TooltipButton>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageTemplate>
  );
};

export default InvoiceQueue;
